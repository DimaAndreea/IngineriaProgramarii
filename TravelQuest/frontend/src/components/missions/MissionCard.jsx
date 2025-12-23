import "./missions.css";

export default function MissionCard({ mission, selected, onClick }) {
  return (
    <button
      type="button"
      className={`ms-card ${selected ? "is-selected" : ""}`}
      onClick={onClick}
    >
      <div className="ms-card-top">
        <div className="ms-title">{mission.title}</div>
        <span className={`ms-status ms-${(mission.status || "").toLowerCase()}`}>
          {mission.status}
        </span>
      </div>

      <div className="ms-meta">
        <span>Deadline: {mission.deadline}</span>
        <span>Reward: {mission.reward_points} pts</span>
      </div>
    </button>
  );
}
