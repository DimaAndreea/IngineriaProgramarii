import "./missions.css";

function rewardLabel(mission) {
  return (
    mission?.reward?.label ||
    (typeof mission.reward_points === "number" ? `${mission.reward_points} pts` : "Voucher")
  );
}

function statusChip(status) {
  const s = status || "not_joined";
  if (s === "not_joined") return "NOT JOINED";
  return s.toUpperCase();
}

export default function MissionCard({ mission, canParticipate, onJoin }) {
  const myStatus = mission.my_status || "not_joined";
  const alreadyJoined = myStatus !== "not_joined";

  const role = (mission.role || "—").toUpperCase();
  const deadline = mission.deadline || "—";
  const reward = rewardLabel(mission);

  return (
    <div className="ms-card2">
      <div className="ms-card2-top">
        <div className="ms-card2-title">{mission.title}</div>
        <span className={`ms-chip ms-${myStatus}`}>{statusChip(myStatus)}</span>
      </div>

      <div className="ms-card2-meta">
        <span><b>Role:</b> {role}</span>
        <span><b>Deadline:</b> {deadline}</span>
      </div>

      <div className="ms-card2-reward">
        <span className="ms-card2-reward-label">Reward</span>
        <span className="ms-card2-reward-value">{reward}</span>
      </div>

      {canParticipate && !alreadyJoined && (
        <button className="ms-join-btn" onClick={() => onJoin?.(mission.id)}>
          Join
        </button>
      )}

      {alreadyJoined && (
        <div className="ms-card2-joined">
          You are enrolled ✅
        </div>
      )}
    </div>
  );
}
