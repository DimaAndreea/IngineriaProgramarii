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

  const xp =
    Number(
      summary?.currentXp ??
        summary?.xp ??
        summary?.currentPoints ??
        summary?.points ??
        0
    ) || 0;

  const xpForNext =
    summary?.xpForNextLevel ??
    summary?.requiredXp ??
    summary?.xpRequired ??
    summary?.pointsForNextLevel ??
    summary?.nextLevelPoints ??
    null;

  const progressPct = useMemo(() => {
    const nextN = Number(xpForNext);
    if (!xpForNext || !Number.isFinite(nextN) || nextN <= 0) return 0;
    const pct = (xp / nextN) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [xp, xpForNext]);

  return (
    <div className={`gami-card ${variant === "embedded" ? "gami-embedded" : ""}`}>
      {/* TOP: ONLY LEVEL (no XP box on the right) */}
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

      {/* PROGRESS: bar + fraction on the right (no "XP progress" text) */}
      <div className="gami-progress">
        <div className="gami-bar">
            <div
            className="gami-bar-fill"
            style={{ width: `${loading ? 0 : progressPct}%` }}
            />

            <div className="gami-bar-text">
            {loading
                ? "…"
                : xpForNext
                ? `${xp} / ${Number(xpForNext)}`
                : "—"}
            </div>
        </div>

        {error ? <div className="gami-err">{error}</div> : null}
        </div>


    </div>
  );
}
