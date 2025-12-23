import "./missions.css";

function statusLabel(status) {
  if (!status || status === "not_joined") return "Not joined";
  return status;
}

export default function MissionDetails({ mission, canParticipate, onJoin }) {
  if (!mission) {
    return (
      <div className="ms-details-empty">
        <h3 className="ms-details-title">Mission details</h3>
        <p>Select a mission to see its full description.</p>
      </div>
    );
  }

  const myStatus = mission.my_status || "not_joined";
  const alreadyJoined = myStatus !== "not_joined";

  const target = mission.target || 0;
  const progress = typeof mission.my_progress === "number" ? mission.my_progress : 0;
  const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;

  return (
    <div>
      <div className="ms-details-header">
        <h3 className="ms-details-title">Mission details</h3>
        <span className={`ms-status ms-${myStatus.toLowerCase()}`}>
          {statusLabel(myStatus).toUpperCase()}
        </span>
      </div>

      <h4 className="ms-details-name">{mission.title}</h4>
      <p className="ms-details-desc">{mission.description}</p>

      <div className="ms-kv-grid">
        <div className="ms-kv">
          <div className="ms-k">Deadline</div>
          <div className="ms-v">{mission.deadline}</div>
        </div>

        <div className="ms-kv">
          <div className="ms-k">Reward</div>
          <div className="ms-v">{mission.reward_points} pts</div>
        </div>

        <div className="ms-kv">
          <div className="ms-k">Progress</div>
          <div className="ms-v">
            {progress}/{target} ({pct}%)
          </div>
        </div>
      </div>

      {/* ✅ Join button: ONLY for tourist/guide, ONLY if not joined */}
      {canParticipate && !alreadyJoined && (
        <button className="ms-cta" onClick={() => onJoin(mission.id)}>
          Join mission
        </button>
      )}

      {/* Optional info when already joined (does not violate requirements) */}
      {canParticipate && alreadyJoined && (
        <div className="ms-hint">
          You are already enrolled. Status: <b>{statusLabel(myStatus)}</b>
        </div>
      )}
    </div>
  );
}
