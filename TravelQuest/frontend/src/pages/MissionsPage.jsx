import { useEffect, useMemo, useState } from "react";
import "./MissionsPage.css";

import MissionList from "../components/missions/MissionList";
import MissionDetails from "../components/missions/MissionDetails";
import MissionCreateForm from "../components/missions/MissionCreateForm";

import { useAuth } from "../context/AuthContext";
import { createMission, listMissions } from "../services/missionService";

function normalizeRole(role) {
  const r = (role || "").toString().trim().toLowerCase();
  if (r === "admin") return "ADMIN";
  if (r === "guide") return "GUIDE";
  if (r === "tourist") return "TOURIST";
  return null;
}

export default function MissionsPage() {
  const authCtx = useAuth();
  const role = normalizeRole(authCtx?.role ?? authCtx?.auth?.role) || "TOURIST";
  const isAdmin = role === "ADMIN";

  const [missions, setMissions] = useState([]);
  const [selectedMissionId, setSelectedMissionId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadMissions() {
    setLoading(true);
    setError(null);
    setSelectedMissionId(null);

    try {
      const data = await listMissions();

      // dacă backend returnează wrapper {success, data} vs list direct:
      // -> încearcă să fii tolerant:
      const missionsList = Array.isArray(data) ? data : data?.data ?? [];
      setMissions(missionsList);
    } catch (e) {
      setError(e?.message || "Failed to load missions.");
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleMissions = useMemo(() => {
    if (isAdmin) return missions;
    return missions.filter((m) => m.scope === "BOTH" || m.scope === role);
  }, [missions, isAdmin, role]);

  const selectedMission = useMemo(() => {
    return visibleMissions.find((m) => m.id === selectedMissionId) || null;
  }, [visibleMissions, selectedMissionId]);

  const handleCreate = async (formValues) => {
    try {
      const created = await createMission(formValues);

      // la fel, tolerant la wrapper:
      const createdMission = created?.data ?? created;

      // update instant UI
      setMissions((prev) => [createdMission, ...prev]);
      setSelectedMissionId(createdMission.id);
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e?.message || "Create failed." };
    }
  };

  return (
    <div className="mp-page">
      <div className="mp-header">
        <div>
          <h2 className="mp-title">Missions</h2>
          <p className="mp-subtitle">
            Rol curent: <span className="mp-role">{role}</span> •{" "}
            {isAdmin ? "Poți crea misiuni." : "Poți vizualiza misiunile."}
          </p>
        </div>

        <button className="mp-refresh" onClick={loadMissions}>
          Refresh
        </button>
      </div>

      <div className={`mp-grid ${isAdmin ? "mp-grid-admin" : ""}`}>
        <section className="mp-card">
          <h3 className="mp-section-title">All missions</h3>
          <MissionList
            missions={visibleMissions}
            loading={loading}
            error={error}
            selectedMissionId={selectedMissionId}
            onSelect={setSelectedMissionId}
          />
        </section>

        <aside className="mp-card">
          <MissionDetails mission={selectedMission} />
        </aside>

        {isAdmin && (
          <aside className="mp-card">
            <h3 className="mp-section-title">Create mission</h3>
            <MissionCreateForm onCreate={handleCreate} />
          </aside>
        )}
      </div>
    </div>
  );
}
