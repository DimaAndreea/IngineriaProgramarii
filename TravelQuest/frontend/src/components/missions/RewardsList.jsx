import Loader from "../common/Loader";

export default function RewardsList({ rewards, loading }) {
  if (loading) return <Loader label="Loading rewards..." />;
  if (!rewards?.length) return <p className="mr-muted">No claimed rewards yet.</p>;

  return (
    <div className="mr-rewards-grid">
      {rewards.map((r) => (
        <div key={r.id || `${r.title}-${r.claimed_at || ""}`} className="mr-reward-card">
          <div className="mr-reward-icon">
            <img src="/coupon.png" alt="Coupon" className="mr-ticket-img" />
          </div>
          <div className="mr-reward-title">{r.title}</div>
          {/* Show reward description if available */}
          {r.real_reward_description && (
            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: '#74eca8' }}>{r.real_reward_description}</div>
          )}
          {r.fromMissionTitle ? (
            <div className="mr-reward-sub">From: {r.fromMissionTitle}</div>
          ) : null}
          {r.claimed_at ? (
            <div className="mr-reward-date">Claimed: {String(r.claimed_at).slice(0, 10)}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
