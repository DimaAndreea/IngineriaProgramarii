import React from "react";
import "./missions.css";

function getRewardLabel(m) {
  return m?.reward?.real_reward_title || "Voucher";
}

function MissionMiniCardComponent({ mission, onJoin, onClaim, canParticipate }) {
  const id = mission?.mission_id ?? mission?.id;

  const state = mission?.my_state || "NOT_JOINED";
  const target = Number(mission?.target_value || 1);
  
  // progress_value from backend is already a percentage (0-100)
  const pct = Math.max(0, Math.min(100, Number(mission?.progress_value || 0)));
  
  // Calculate the actual count from percentage for display (e.g., "1/3")
  const count = Math.round((pct / 100) * target);

  return (
    <div className="mr-mission-card">
      <div className="mr-mission-main">
        <div className="mr-mission-title">{mission?.title || "Mission"}</div>

        {/* ✅ role pill removed */}
        <div className="mr-mission-meta">
          {mission?.end_at && <span className="mr-meta">Deadline: {String(mission.end_at).slice(0, 10)}</span>}
        </div>

        <div className="mr-reward">
          <span className="mr-reward-label">Reward:</span> {getRewardLabel(mission)}
        </div>

        {state !== "NOT_JOINED" && (
          <div className="mr-progress-wrap">
            <div className="mr-progress-top">
              <span className="mr-progress-text">
                {count}/{target}
              </span>
              <span className="mr-progress-text">{pct}%</span>
            </div>
            <div className="mr-progress-bar">
              <div className="mr-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="mr-mission-actions">
        {state === "NOT_JOINED" && (
          <button className="mr-btn mr-btn-primary" disabled={!canParticipate} onClick={() => onJoin?.(id)}>
            Join
          </button>
        )}

        {state === "COMPLETED" && (
          <button className="mr-btn mr-btn-success" onClick={() => onClaim?.(id)}>
            Claim reward
          </button>
        )}

        {state === "CLAIMED" && <div className="mr-status">Claimed ✅</div>}
        {state === "IN_PROGRESS" && <div className="mr-status">In progress…</div>}
      </div>
    </div>
  );
}

// Memoize to prevent re-renders when props haven't changed
export default React.memo(MissionMiniCardComponent);

