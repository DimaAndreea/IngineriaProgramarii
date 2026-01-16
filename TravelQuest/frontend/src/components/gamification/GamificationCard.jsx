// src/components/gamification/GamificationCard.jsx
import React, { useMemo } from "react";
import "./GamificationCard.css";

export default function GamificationCard({
  summary,
  loading,
  error,
  isMock,
  variant = "card",
}) {
  const level =
    summary?.level ??
    summary?.lvl ??
    summary?.currentLevel ??
    summary?.levelNumber ??
    null;

  // ✅ New backend: xp (total xp)
  const xp =
    Number(
      summary?.xp ??
        summary?.currentXp ??
        summary?.currentPoints ??
        summary?.points ??
        0
    ) || 0;

  // ✅ New backend: nextLevelMinXp (threshold for next level, total xp)
  const nextMin =
    summary?.nextLevelMinXp ??
    summary?.xpForNextLevel ??
    summary?.requiredXp ??
    summary?.xpRequired ??
    summary?.pointsForNextLevel ??
    summary?.nextLevelPoints ??
    null;

  // ✅ New backend: progress 0..1 (or null when max level)
  const progressPct = useMemo(() => {
    const p = summary?.progress;
    if (typeof p === "number" && Number.isFinite(p)) {
      return Math.max(0, Math.min(100, p * 100));
    }

    const nextN = Number(nextMin);
    if (!nextMin || !Number.isFinite(nextN) || nextN <= 0) {
      // dacă nu avem next threshold (ex: max level), considerăm complet
      return 100;
    }

    const pct = (xp / nextN) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [summary?.progress, xp, nextMin]);

  const fractionText = useMemo(() => {
    const nextN = Number(nextMin);
    if (!nextMin || !Number.isFinite(nextN) || nextN <= 0) return `${xp} / —`;
    return `${xp} / ${nextN}`;
  }, [xp, nextMin]);

  return (
    <div className={`gami-card ${variant === "embedded" ? "gami-embedded" : ""}`}>
      <div className="gami-top">
        <div>
          <div className="gami-kicker">
            Your level {isMock ? <span className="gami-mock-tag">MOCK</span> : null}
          </div>

          <div className="gami-level">
            LVL <span>{level ?? (loading ? "…" : "—")}</span>
          </div>
        </div>
      </div>

      <div className="gami-progress">
        <div className="gami-bar">
          <div
            className="gami-bar-fill"
            style={{ width: `${loading ? 0 : progressPct}%` }}
          />
          {/* ✅ text centrat în bară */}
          <div className="gami-bar-text">{loading ? "…" : fractionText}</div>
        </div>

        {error ? <div className="gami-err">{error}</div> : null}
      </div>
    </div>
  );
}
