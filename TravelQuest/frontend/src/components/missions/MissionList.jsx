import MissionCard from "./MissionCard";
import "./missions.css";

export default function MissionList({
  missions,
  loading,
  error,
  selectedMissionId,
  onSelect,
}) {
  if (loading) return <p className="ms-state">Loading missions...</p>;
  if (error) return <p className="ms-state ms-error">{error}</p>;
  if (!missions || missions.length === 0)
    return <p className="ms-state">No missions available.</p>;

  return (
    <div className="ms-list">
      {missions.map((m) => (
        <MissionCard
          key={m.id}
          mission={m}
          selected={m.id === selectedMissionId}
          onClick={() => onSelect(m.id)}
        />
      ))}
    </div>
  );
}
