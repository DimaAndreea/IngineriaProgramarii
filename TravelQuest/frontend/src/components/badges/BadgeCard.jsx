import "./Badges.css";

export default function BadgeCard({ badge, unlocked, selected, onSelect }) {
  return (
    <div className={`badge-card ${unlocked ? "unlocked" : "locked"}`}>
      <div className="badge-head">
        <div className="badge-name">{badge.name}</div>

        {selected && <span className="badge-chip">Selected</span>}
        {!unlocked && <span className="badge-chip locked">Locked</span>}
      </div>

      <div className="badge-desc">{badge.description}</div>

      <div className="badge-meta">
        <span>Min level: {badge.minLevel}</span>
      </div>

      <div className="badge-actions">
        {unlocked ? (
          <button
            className="tourist-blue-btn"
            disabled={selected}
            onClick={() => onSelect?.(badge.id)}
            style={{ width: "100%" }}
          >
            {selected ? "Visible" : "Set as visible"}
          </button>
        ) : (
          <button
            className="tourist-viewall-btn"
            disabled
            style={{ width: "100%", opacity: 0.75 }}
          >
            Reach level {badge.minLevel}
          </button>
        )}
      </div>
    </div>
  );
}
