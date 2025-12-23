import { useEffect, useMemo, useState } from "react";
import "./MissionsPage.css";

import MissionList from "../components/missions/MissionList";
import MissionDetails from "../components/missions/MissionDetails";
import MissionCreateForm from "../components/missions/MissionCreateForm";
import Toast from "../components/missions/Toast";

import { useAuth } from "../context/AuthContext";
import { createMission, joinMission, listMissions } from "../services/missionService";

function normalizeRole(role) {
  const r = (role || "").toString().trim().toLowerCase();
  if (r === "admin") return "ADMIN";
  if (r === "guide") return "GUIDE";
  if (r === "tourist") return "TOURIST";
  return "TOURIST";
}

export default function MissionsPage() {
  const authCtx = useAuth();
  const role = normalizeRole(authCtx?.role ?? authCtx?.auth?.role);

  const isAdmin = role === "ADMIN";
  const canParticipate = role === "TOURIST" || role === "GUIDE";

  const [missions, setMissions] = useState([]);
  const [selectedMissionId, setSelectedMissionId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toast, setToast] = useState(null);

  async function loadMissions() {
    setLoading(true);
    setError(null);

    try {
      const data = await listMissions();
      setMissions(data || []);
    } catch (e) {
      setError(e?.message || "Failed to load missions.");
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMissions();
  }, []);

  const selectedMission = useMemo(() => {
    return missions.find((m) => m.id === selectedMissionId) || null;
  }, [missions, selectedMissionId]);

  // ✅ JOIN (optimistic) — tourist/guide only
  const handleJoin = async (missionId) => {
    if (!canParticipate) return;

    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId
          ? { ...m, my_status: "pending", my_progress: typeof m.my_progress === "number" ? m.my_progress : 0 }
          : m
      )
    );

    try {
      const res = await joinMission(missionId);

      const newStatus =
        res?.my_status ?? res?.status ?? res?.participation_status ?? "pending";
      const newProgress =
        res?.my_progress ?? res?.progress ?? res?.current_progress;

      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId
            ? {
                ...m,
                my_status: newStatus,
                my_progress:
                  typeof newProgress === "number" ? newProgress : (typeof m.my_progress === "number" ? m.my_progress : 0),
              }
            : m
        )
      );

      setToast({ type: "success", message: "You have joined the mission!" });
    } catch (e) {
      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId
            ? { ...m, my_status: "not_joined" }
            : m
        )
      );
      setToast({ type: "error", message: e?.message || "Join failed." });
    }
  };

  // ✅ ADMIN create (kept separate, no interference with join task)
  const handleCreate = async (payload) => {
    if (!isAdmin) return { ok: false, message: "Forbidden" };

    try {
      const created = await createMission(payload);
      const createdMission = created?.data ?? created;

      setMissions((prev) => [createdMission, ...prev]);
      if (createdMission?.id) setSelectedMissionId(createdMission.id);

      setToast({ type: "success", message: "Mission created." });
      return { ok: true };
    } catch (e) {
      setToast({ type: "error", message: e?.message || "Create failed." });
      return { ok: false, message: e?.message || "Create failed." };
    }
  };

  return (
    <div className="mp-page">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="mp-header">
        <div>
          <h2 className="mp-title">Missions</h2>
          <p className="mp-subtitle">
            Current role: <span className="mp-role">{role}</span> •{" "}
            {isAdmin ? "Create and view missions." : canParticipate ? "You can join missions." : "View only."}
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
            missions={missions}
            loading={loading}
            error={error}
            selectedMissionId={selectedMissionId}
            onSelect={setSelectedMissionId}
          />
        </section>

        <aside className="mp-card">
          <MissionDetails
            mission={selectedMission}
            canParticipate={canParticipate}
            onJoin={handleJoin}
          />
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
