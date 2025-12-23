import "./missions.css";

function statusLabel(status) {
  if (!status || status === "not_joined") return "NOT JOINED";
  return status.toUpperCase();
}

export default function MissionCard({ mission, selected, onClick }) {
  const target = mission.target || 0;
  const progress = typeof mission.my_progress === "number" ? mission.my_progress : 0;
  const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;

  const myStatus = mission.my_status || "not_joined";

  return (
    <button
      type="button"
      className={`ms-card ${selected ? "is-selected" : ""}`}
      onClick={onClick}
    >
      <div className="ms-card-top">
        <div className="ms-title">{mission.title}</div>

        <span className={`ms-status ms-${myStatus.toLowerCase()}`}>
          {statusLabel(myStatus)}
        </span>
      </div>

      <div className="ms-meta">
        <span>Deadline: {mission.deadline}</span>
        <span>Reward: {mission.reward_points} pts</span>
      </div>

      <div className="ms-progress">
        <div className="ms-progress-track">
          <div className="ms-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="ms-progress-label">
          {progress}/{target} • {pct}%
        </div>
      </div>
    </button>
  );
}
