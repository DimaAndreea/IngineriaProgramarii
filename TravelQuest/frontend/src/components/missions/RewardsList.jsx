import "./missions.css";

export default function RewardsList({ rewards }) {
  return (
    <div>
      <h3 className="mq-section-title">Rewards</h3>

      {!rewards || rewards.length === 0 ? (
        <p className="mq-state">No rewards available.</p>
      ) : (
        <div className="mq-rewards">
          {rewards.map((r) => (
            <div key={r.id} className="mq-reward">
              <div className="mq-reward-name">{r.name}</div>
              <div className="mq-reward-cost">{r.cost} pts</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
