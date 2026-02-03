import Loader from "../common/Loader";

export default function RewardsList({ rewards, loading }) {
  if (loading) return <Loader label="Loading rewards..." />;
  if (!rewards?.length) return <p className="mr-muted">No claimed rewards yet.</p>;

  return (
    <div className="mr-rewards-grid">
      {rewards.map((r) => (
        <div key={r.id || `${r.title}-${r.claimed_at || ""}`} className="mr-reward-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16 }}>
          <div className="mr-reward-icon">
            <img src="/coupon.png" alt="Coupon" className="mr-ticket-img" />
          </div>
          <div className="mr-reward-title" style={{ textAlign: 'center', fontWeight: 900, fontSize: 16, marginTop: 8 }}>{r.title}</div>
          {r.real_reward_description && (
            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: '#74eca8', textAlign: 'left', width: '100%' }}>
              <span style={{ color: '#b5b5b5', fontWeight: 600 }}>About:</span> {r.real_reward_description}
            </div>
          )}
          {r.fromMissionTitle ? (
            <div className="mr-reward-sub" style={{ marginTop: 10, fontSize: 14, color: '#a298ef', textAlign: 'center', fontWeight: 700 }}>
              From: <b style={{ color: 'inherit' }}>{r.fromMissionTitle}</b>
            </div>
          ) : null}
          {r.claimed_at ? (
            <div className="mr-reward-date">Claimed: {String(r.claimed_at).slice(0, 10)}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
