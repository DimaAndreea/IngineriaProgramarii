import "./missions.css";

export default function MissionDetails({ mission }) {
  if (!mission) {
    return (
      <div className="ms-details-empty">
        <h3 className="ms-details-title">Mission details</h3>
        <p>Select a mission to see its full description.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="ms-details-header">
        <h3 className="ms-details-title">Mission details</h3>
        <span className={`ms-status ms-${(mission.status || "").toLowerCase()}`}>
          {mission.status}
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
          <div className="ms-k">Scope</div>
          <div className="ms-v">{mission.scope}</div>
        </div>
      </div>
    </div>
  );
}
