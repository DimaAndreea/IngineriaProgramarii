import MissionMiniCard from "./MissionMiniCard";

export default function MissionCardList({
  missions,
  loading,
  canParticipate,
  onJoin,
  onClaim,
  isAdmin = false,
}) {
  if (loading) return <p className="mr-muted">Loading...</p>;
  if (!missions?.length) return <p className="mr-muted">No missions available.</p>;

  return (
    <div className="mr-missions-grid">
      {missions.map((m) => {
        const id = m.mission_id ?? m.id;
        return (
          <MissionMiniCard
            key={id}
            mission={m}
            canParticipate={isAdmin ? false : canParticipate}
            onJoin={onJoin}
            onClaim={onClaim}
          />
        );
      })}
    </div>
  );
}
