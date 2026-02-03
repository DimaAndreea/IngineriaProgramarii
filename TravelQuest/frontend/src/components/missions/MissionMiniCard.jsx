import React from "react";
import "./missions.css";
import { IconXP, IconCalendar, IconCheckmark, IconClock } from "./MissionIcons";

function getRewardLabel(m) {
  return m?.reward?.real_reward_title || "Voucher";
}

function getRewardDescription(m) {
  return m?.reward?.real_reward_description || "Special reward";
}

function parseMissionDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatEndDate(value) {
  const d = parseMissionDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatStartDate(value) {
  const d = parseMissionDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MissionMiniCardComponent({ mission, onJoin, onClaim, canParticipate, isAdmin = true }) {
  const id = mission?.mission_id ?? mission?.id;

  const state = mission?.my_state || "NOT_JOINED";
  const target = Number(mission?.target_value || 1);
  
  // progress_value from backend is already a percentage (0-100)
  const pct = Math.max(0, Math.min(100, Number(mission?.progress_value || 0)));
  
  // Calculate the actual count from percentage for display (e.g., "1/3")
  const count = Math.round((pct / 100) * target);

  const endDateRaw =
    mission?.end_at || mission?.endDate || mission?.end_date || mission?.deadline;
  const endDateLabel = formatEndDate(endDateRaw);

  const startDateRaw =
    mission?.start_at || mission?.startDate || mission?.start_date || mission?.startAt;
  const startDateLabel = formatStartDate(startDateRaw);

  // Non-admin: horizontal layout
  if (!isAdmin) {
    return (
      <div className={`mr-mission-card-horizontal ${state === "CLAIMED" ? "mr-claimed-card" : ""}`}>
        {state === "CLAIMED" && (
          <div className="mr-claimed-overlay">
            <img src="/claimed-no-bg.png" alt="Claimed" className="mr-claimed-stamp" />
          </div>
        )}
        <div className="mr-mission-content-horizontal">
          <div className="mr-mission-title-horizontal">{mission?.title || "Mission"}</div>
          <div className="mr-mission-dates-horizontal">
            {startDateLabel && (
              <>
                <div className="mr-mission-date-item">
                  <IconCalendar size={14} color="#c7c0ff" />
                  <span>Starting on: {startDateLabel}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c7c0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
              </>
            )}
            <div className="mr-mission-date-item">
              <IconCalendar size={14} color="#c7c0ff" />
              <span>Ending on: {endDateLabel}</span>
            </div>
          </div>
          <div className={`mr-progress-wrap-horizontal ${state === "NOT_JOINED" ? "mr-progress-disabled" : ""}`}>
            <div className="mr-progress-top-horizontal">
              <span className="mr-progress-text-horizontal">
                {state === "NOT_JOINED" ? "Join to track progress" : `Progress: ${count}/${target}`}
              </span>
              {state !== "NOT_JOINED" && (
                <span className="mr-progress-pct-horizontal">{pct}%</span>
              )}
            </div>
            <div className="mr-progress-bar-horizontal">
              <div className="mr-progress-fill-horizontal" style={{ width: state === "NOT_JOINED" ? "0%" : `${pct}%` }} />
            </div>
          </div>
          <div className="mr-reward-horizontal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
              <div className="mr-reward-content" style={{ flex: 1 }}>
                <span className="mr-reward-label-horizontal">Reward</span>
                <div className="mr-reward-title-horizontal">
                  <span className="mr-reward-title-horizontal">{getRewardLabel(mission)}</span>
                </div>
                {/* Show reward description if available and not default */}
                {getRewardDescription(mission) && getRewardDescription(mission) !== "Special reward" && (
                  <div style={{ marginTop: '4px', fontSize: '12px', fontWeight: '700', color: '#9ad65c' }}>
                    {getRewardDescription(mission)}
                  </div>
                )}
                {mission?.reward?.xp_reward && (
                  <div className="mr-reward-xp-horizontal" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <IconXP size={16} color="#9ad65c" />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#9ad65c', textShadow: '0 0 6px rgba(154, 214, 92, 0.6), 0 1px 2px rgba(0,0,0,0.3)' }}>{mission.reward.xp_reward} XP</span>
                  </div>
                )}
              </div>
              <img
                src="/coupon.png"
                alt="Reward ticket"
                style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover" }}
              />
            </div>
          </div>
          {state === "NOT_JOINED" && canParticipate && (
            <button className="mr-btn mr-btn-primary mr-btn-join-horizontal" onClick={() => onJoin?.(id)}>
              Start Mission
            </button>
          )}
          {state === "COMPLETED" && (
            <button className="mr-btn-claim-horizontal" onClick={() => onClaim?.(id)}>
              Claim
            </button>
          )}
        </div>
      </div>
    );
  }

  // Admin: vertical layout (existing)
  return (
    <div className="mr-mission-card" style={{ position: 'relative' }}>
      <div className="mr-mission-main">
        <div className="mr-mission-top">
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
            <div className="mr-mission-title" style={{ flex: '1 1 auto' }}>{mission?.title || "Mission"}</div>
            {mission?.role && (
              <div className="mr-role-badge" data-role={mission.role} style={{ marginLeft: 'auto' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c2.5-4 13.5-4 16 0" />
                </svg>
                {mission.role === "TOURIST" && "Tourist"}
                {mission.role === "GUIDE" && "Guide"}
                {mission.role === "ADMIN" && "Admin"}
              </div>
            )}
          </div>
          <div className="mr-mission-status">
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
        </div>

        <div className="mr-mission-dates">
          {startDateLabel && (
            <div className="mr-mission-date-line">
              <IconCalendar size={14} color="#c7c0ff" />
              <span className="mr-mission-date-text">Starting on: {startDateLabel}</span>
            </div>
          )}
          {startDateLabel && (
            <span className="mr-mission-date-arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 6 19 12 13 18" />
              </svg>
            </span>
          )}
          <div className="mr-mission-date-line">
            <IconCalendar size={14} color="#c7c0ff" />
            <span className="mr-mission-date-text">Ending on: {endDateLabel}</span>
          </div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <span className="mr-reward-label">Reward</span>
              <div style={{ marginTop: 8, fontSize: 14, fontWeight: 900, color: '#9ad65c', textShadow: '0 0 6px rgba(154, 214, 92, 0.6), 0 1px 2px rgba(0,0,0,0.3)' }}>
                {getRewardLabel(mission)}
              </div>
              {getRewardDescription(mission) && getRewardDescription(mission) !== "Special reward" && (
                <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: '#9ad65c' }}>
                  {getRewardDescription(mission)}
                </div>
              )}
              {mission?.reward?.xp_reward && (
                <div className="mr-reward-xp-horizontal" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                  <IconXP size={16} color="#9ad65c" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#9ad65c', textShadow: '0 0 6px rgba(154, 214, 92, 0.6), 0 1px 2px rgba(0,0,0,0.3)' }}>{mission.reward.xp_reward} XP</span>
                </div>
              )}
            </div>
            <img
              src="/coupon.png"
              alt="Reward ticket"
              style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover" }}
            />
          </div>
        </div>
      </div>

      <div className="mr-mission-actions">
        {state === "NOT_JOINED" && canParticipate && (
          <button className="mr-btn mr-btn-primary" onClick={() => onJoin?.(id)}>
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

