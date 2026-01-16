import "./missions.css";

function statusLabel(status) {
  if (!status || status === "not_joined") return "Not joined";
  return status;
}

function objectiveLabel(type) {
  switch (type) {
    case "SUCCESSFUL_SUBMISSIONS_COUNT":
      return "Successful submissions (approved)";
    case "ITINERARY_PARTICIPATIONS_COUNT":
      return "Itinerary participations";
    case "ITINERARIES_CREATED_COUNT":
      return "Itineraries created";
    case "ITINERARIES_CREATED_APPROVED_COUNT":
      return "Itineraries created & approved";
    default:
      return type || "Objective";
  }
}

export default function MissionDetails({
  mission,
  canParticipate,
  onJoin,
  onClaim,
  onSimulateProgress,
}) {
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
  const isCompleted = myStatus === "completed";
  const isClaimed = myStatus === "claimed";

  const target = Number(mission?.objective?.target ?? mission.target ?? 0);
  const progress = typeof mission.my_progress === "number" ? mission.my_progress : 0;
  const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;

  const rewardLabel =
    mission?.reward?.label ||
    (typeof mission.reward_points === "number" ? `${mission.reward_points} pts` : "Voucher");

  const role = (mission.role || "").toUpperCase();

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
          <div className="ms-k">Role</div>
          <div className="ms-v">{role || "—"}</div>
        </div>

        <div className="ms-kv">
          <div className="ms-k">Deadline</div>
          <div className="ms-v">{mission.deadline || "—"}</div>
        </div>

        <div className="ms-kv">
          <div className="ms-k">Objective</div>
          <div className="ms-v">
            {objectiveLabel(mission?.objective?.type)} • target {target}
          </div>
        </div>

        <div className="ms-kv">
          <div className="ms-k">Reward</div>
          <div className="ms-v">{rewardLabel}</div>
        </div>

        <div className="ms-kv">
          <div className="ms-k">Progress</div>
          <div className="ms-v">
            {progress}/{target} ({pct}%)
          </div>
        </div>
      </div>

      {/* ✅ Join button */}
      {canParticipate && !alreadyJoined && (
        <button className="ms-cta" onClick={() => onJoin?.(mission.id)}>
          Join mission
        </button>
      )}

      {/* ✅ Claim reward when completed */}
      {canParticipate && alreadyJoined && isCompleted && !isClaimed && (
        <button className="ms-cta ms-cta-claim" onClick={() => onClaim?.(mission.id)}>
          Claim reward
        </button>
      )}

      {/* ✅ Claimed info */}
      {canParticipate && alreadyJoined && isClaimed && (
        <div className="ms-hint">
          Reward already claimed ✅
        </div>
      )}

      {/* ✅ MOCK controls (dev UI): simulate +1 */}
      {canParticipate && alreadyJoined && !isClaimed && (
        <div className="ms-mock-actions">
          <button
            type="button"
            className="ms-mock-btn"
            onClick={() => onSimulateProgress?.(mission.id, 1)}
          >
            Mock: +1 progress
          </button>
          <button
            type="button"
            className="ms-mock-btn"
            onClick={() => onSimulateProgress?.(mission.id, 2)}
          >
            Mock: +2 progress
          </button>
        </div>
      )}

      {canParticipate && alreadyJoined && (
        <div className="ms-hint">
          You are enrolled. Status: <b>{statusLabel(myStatus)}</b>
        </div>
      )}
    </div>
  );
}
