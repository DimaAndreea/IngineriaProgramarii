import React from "react";
import "./missions.css";
import { IconTrophy, IconCalendar, IconCheckmark, IconClock, IconVoucher } from "./MissionIcons";

function getRewardLabel(m) {
  return m?.reward?.real_reward_title || "Voucher";
}

function getRewardDescription(m) {
  return m?.reward?.real_reward_description || "Special reward";
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
        <div className="mr-mission-top">
          <div className="mr-mission-title">{mission?.title || "Mission"}</div>
          {state === "CLAIMED" && (
            <div className="mr-status mr-status-claimed">
              <IconCheckmark size={16} color="#22c55e" />
              Claimed
            </div>
          )}
          {state === "IN_PROGRESS" && (
            <div className="mr-status mr-status-progress">
              <IconClock size={16} color="#f59e0b" />
              In Progress
            </div>
          )}
        </div>

        {state !== "NOT_JOINED" && (
          <div className="mr-progress-wrap">
            <div className="mr-progress-top">
              <span className="mr-progress-text">
                Progress: {count}/{target}
              </span>
              <span className="mr-progress-text">{pct}%</span>
            </div>
            <div className="mr-progress-bar">
              <div className="mr-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="mr-reward">
          <div className="mr-reward-header">
            <IconVoucher size={18} color="#8b5cf6" />
            <span className="mr-reward-label">Reward</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: '900' }}>
            {getRewardLabel(mission)}
          </div>
          {getRewardDescription(mission) && getRewardDescription(mission) !== "Special reward" && (
            <div style={{ marginTop: '4px', fontSize: '12px', fontWeight: '700', color: 'rgba(17, 24, 39, 0.65)' }}>
              {getRewardDescription(mission)}
            </div>
          )}
        </div>
      </div>

      <div className="mr-mission-actions">
        {state === "NOT_JOINED" && (
          <button className="mr-btn mr-btn-primary" disabled={!canParticipate} onClick={() => onJoin?.(id)}>
            Join Mission
          </button>
        )}

        {state === "COMPLETED" && (
          <button className="mr-btn mr-btn-success" onClick={() => onClaim?.(id)}>
            Claim Reward
          </button>
        )}
      </div>
    </div>
  );
}

// Memoize to prevent re-renders when props haven't changed
export default React.memo(MissionMiniCardComponent);

