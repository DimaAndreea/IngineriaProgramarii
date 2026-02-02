import "./Badges.css";

export default function BadgeCard({ badge, unlocked, selected, onSelect }) {
  // Map badge ID to icon (1.png, 2.png, 3.png, 4.png)
  const iconNumber = ((badge.id - 1) % 4) + 1;
  const iconSrc = `/${iconNumber}.png`;
  
  return (
    <div className={`badge-card ${unlocked ? "unlocked" : "locked"}`}>
      {!unlocked && (
        <div className="badge-locked-stamp">
          <div>LOCKED</div>
          <div className="badge-stamp-level">Reach lvl {badge.minLevel}</div>
        </div>
      )}
      
      <div className="badge-head">
        <img src={iconSrc} alt="badge icon" className="badge-icon-img" />
        
        <div className="badge-name">{badge.name}</div>

        {selected && <span className="badge-chip">Selected</span>}
      </div>

      {unlocked && (
        <div className="badge-actions">
          <button
            className="tourist-blue-btn"
            disabled={selected}
            onClick={() => onSelect?.(badge.id)}
            style={{ width: "100%" }}
          >
            {selected ? "Visible" : "Set as visible"}
          </button>
        </div>
      )}
    </div>
  );
}
