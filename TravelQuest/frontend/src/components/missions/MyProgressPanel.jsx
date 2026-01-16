import "./missions.css";

function rewardLabel(mission) {
  return mission?.reward?.label || "Voucher";
}

export default function MyProgressPanel({ missions, rewards, onClaim, onSimulateProgress }) {
  return (
    <div>
      <div className="mp-right-head">
        <h3 className="mp-right-title">My progress</h3>
        <p className="mp-right-sub">Only missions you joined appear here.</p>
      </div>

      {!missions || missions.length === 0 ? (
        <div className="mp-empty">
          You haven’t joined any missions yet.
        </div>
      ) : (
        <div className="mp-progress-list">
          {missions.map((m) => {
            const target = Number(m?.objective?.target ?? m.target ?? 0);
            const progress = typeof m.my_progress === "number" ? m.my_progress : 0;
            const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;

            const status = m.my_status || "pending";
            const isCompleted = status === "completed";
            const isClaimed = status === "claimed";

            return (
              <div key={m.id} className="mp-progress-card">
                <div className="mp-progress-top">
                  <div className="mp-progress-title">{m.title}</div>
                  <span className={`ms-chip ms-${status}`}>
                    {status === "pending" ? "IN PROGRESS" : status.toUpperCase()}
                  </span>
                </div>

                <div className="mp-progress-reward">
                  Reward: <b>{rewardLabel(m)}</b>
                </div>

                <div className="mp-bar">
                  <div className="mp-bar-track">
                    <div className="mp-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mp-bar-label">
                    {progress}/{target} • {pct}%
                  </div>
                </div>

                <div className="mp-progress-actions">
                  {/* dev-only mock buttons */}
                  {!isClaimed && (
                    <>
                      <button
                        type="button"
                        className="mp-mock-btn"
                        onClick={() => onSimulateProgress?.(m.id, 1)}
                      >
                        Mock +1
                      </button>
                      <button
                        type="button"
                        className="mp-mock-btn"
                        onClick={() => onSimulateProgress?.(m.id, 2)}
                      >
                        Mock +2
                      </button>
                    </>
                  )}

                  {isCompleted && !isClaimed && (
                    <button className="mp-claim-btn" onClick={() => onClaim?.(m.id)}>
                      Claim reward
                    </button>
                  )}

                  {isClaimed && (
                    <div className="mp-claimed">Reward claimed ✅</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mp-rewards-box">
        <div className="mp-rewards-title">Claimed rewards</div>
        {!rewards || rewards.length === 0 ? (
          <div className="mp-rewards-empty">No claimed rewards yet.</div>
        ) : (
          <div className="mp-rewards-list">
            {rewards.slice(0, 5).map((r) => (
              <div key={r.id} className="mp-reward-item">
                <div className="mp-reward-name">{r.reward_label}</div>
                <div className="mp-reward-sub">
                  From: <b>{r.mission_title}</b>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
