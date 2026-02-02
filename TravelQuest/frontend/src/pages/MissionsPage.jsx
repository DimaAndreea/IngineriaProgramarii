import { useEffect, useMemo, useState } from "react";
import "./MissionsPage.css";

import Toast from "../components/missions/Toast";
import MissionCardList from "../components/missions/MissionCardList";
import RewardsList from "../components/missions/RewardsList";
import MissionCreateForm from "../components/missions/MissionCreateForm";
import { IconGift, IconTarget } from "../components/missions/MissionIcons";

import { useAuth } from "../context/AuthContext";
import {
  claimMission,
  createMission,
  joinMission,
  listMissions,
  listMyRewards,
} from "../services/missionService";

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
  const [rewards, setRewards] = useState([]); // optional endpoint
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showCreateInfo, setShowCreateInfo] = useState(false);
  const [missionFilter, setMissionFilter] = useState("ALL"); // Filter state
  const [rewardsScrollPos, setRewardsScrollPos] = useState(0);

  const visibleMissions = useMemo(() => {
    let filtered = missions;
    
    // Filter by role (non-admin only see their role's missions)
    if (!isAdmin) {
      filtered = filtered.filter((m) => (m.role || "").toUpperCase() === role);
    }
    
    // Filter by state
    if (missionFilter !== "ALL") {
      filtered = filtered.filter((m) => {
        const state = (m.my_state || m.state || "NOT_JOINED").toUpperCase();
        return state === missionFilter;
      });
    }
    
    return filtered;
  }, [missions, isAdmin, role, missionFilter]);

  // fallback rewards from claimed missions (still REAL backend data)
  const derivedRewards = useMemo(() => {
    const claimed = missions
      .filter((m) => (m.my_state || m.state || "").toUpperCase() === "CLAIMED")
      .map((m) => ({
        id: m.mission_id ?? m.id,
        title: m?.reward?.real_reward_title || "Voucher",
        fromMissionTitle: m?.title || "Mission",
        claimed_at: m?.claimed_at || m?.my_claimed_at || null,
      }));
    return claimed;
  }, [missions]);

  async function loadAll() {
    try {
      const data = await listMissions();
      const newData = Array.isArray(data) ? data : [];
      
      // Smart update: only update state if meaningful data changed
      // Avoid unnecessary re-renders for unchanged missions
      setMissions(prev => {
        // Check if any mission data actually changed (not just object reference)
        const hasChanges = prev.length !== newData.length ||
          prev.some((p, i) => {
            const n = newData[i];
            return !n || 
              p.mission_id !== n.mission_id ||
              p.progress_value !== n.progress_value ||
              p.my_state !== n.my_state ||
              p.title !== n.title;
          });
        
        return hasChanges ? newData : prev;
      });

      // OPTIONAL endpoint: if not available, ignore silently
      try {
        const r = await listMyRewards();
        setRewards(Array.isArray(r) ? r : []);
      } catch (e) {
        // endpoint not available yet -> fallback to derived rewards
        setRewards([]);
      }
    } catch (e) {
      setToast({ type: "error", message: e?.message || "Failed to load missions." });
      setMissions([]);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    
    // 🔄 Poll pentru actualizări la fiecare 2 secunde (mai responsive)
    const interval = setInterval(() => {
      loadAll();
    }, 2000);
    
    // 📡 Listen for submission evaluation events from Active Itinerary page
    const handleSubmissionEvaluated = () => {
      loadAll(); // Refresh missions immediately
    };
    
    window.addEventListener("submissionEvaluated", handleSubmissionEvaluated);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("submissionEvaluated", handleSubmissionEvaluated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoin = async (missionId) => {
    if (!canParticipate) return;

    try {
      await joinMission(missionId);
      setToast({ type: "success", message: "Joined mission." });
      await loadAll(); // ✅ refresh from backend (no mock)
    } catch (e) {
      setToast({ type: "error", message: e?.message || "Join failed." });
    }
  };

  const handleClaim = async (missionId) => {
    try {
      await claimMission(missionId);
      setToast({ type: "success", message: "Reward claimed." });
      await loadAll(); // ✅ refresh from backend
    } catch (e) {
      setToast({ type: "error", message: e?.message || "Claim failed." });
    }
  };

  const handleCreate = async (payload) => {
    if (!isAdmin) return { ok: false, message: "Forbidden" };

    try {
      await createMission(payload);
      setToast({ type: "success", message: "Mission created." });
      await loadAll(); // ✅ refresh from backend
      return { ok: true };
    } catch (e) {
      setToast({ type: "error", message: e?.message || "Create failed." });
      return { ok: false, message: e?.message || "Create failed." };
    }
  };

  // ✅ show rewards from endpoint if present, else derived
  const rewardsToShow = rewards?.length ? rewards : derivedRewards;

  const scrollRewards = (direction) => {
    const container = document.querySelector(".mr-rewards-scroll");
    if (!container) return;
    const scrollAmount = 320;
    const newPos = direction === "left" 
      ? Math.max(0, rewardsScrollPos - scrollAmount)
      : rewardsScrollPos + scrollAmount;
    container.scrollTo({ left: newPos, behavior: "smooth" });
    setRewardsScrollPos(newPos);
  };

  return (
    <div className="mr-page">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="mr-container">
        <div className="mr-header">
          <div>
            <h2 className="mr-title">Missions & Rewards</h2>
          </div>
        </div>

        {isAdmin ? (
          <div className="mr-admin-layout">
          <div className="mr-admin-left">
            <section className="mr-card mr-card-form">
              <div className="mr-card-header mr-card-header-info">
                <h3 className="mr-section-title">Create a mission</h3>
                <button
                  type="button"
                  className="mr-info-btn"
                  onClick={() => setShowCreateInfo(true)}
                  aria-label="Mission info"
                >
                  <img src="/info.png" alt="Info" />
                </button>
              </div>
              <hr className="mr-divider" />
              <MissionCreateForm onCreate={handleCreate} />
            </section>
          </div>

          <div className="mr-admin-right">
            <section className="mr-card mr-card-missions">
              <div className="mr-card-header">
                <h3 className="mr-section-title">All missions</h3>
              </div>

              <div className="mr-scroll">
                <MissionCardList
                  missions={visibleMissions}
                  loading={loading}
                  canParticipate={false}
                  onJoin={null}
                  onClaim={handleClaim}
                  isAdmin
                />
              </div>
            </section>
          </div>
        </div>
      ) : (
        <>
          <section className="mr-card mr-rewards-section">
            <div className="mr-card-header">
              <div className="mr-title-with-icon">
                <h3 className="mr-section-title">My rewards</h3>
                <IconGift size={24} color="#9ad65c" />
              </div>
              <p className="mr-section-hint">Your claimed vouchers appear here.</p>
            </div>

            <div className="mr-rewards-carousel-wrapper">
              <button className="mr-rewards-arrow mr-rewards-arrow-left" onClick={() => scrollRewards("left")}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="mr-rewards-arrow mr-rewards-arrow-right" onClick={() => scrollRewards("right")}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="mr-rewards-scroll">
                <RewardsList rewards={rewardsToShow} loading={loading} />
              </div>
            </div>
          </section>

          <section className="mr-card">
            <div className="mr-card-header">
              <div className="mr-title-with-icon">
                <h3 className="mr-section-title">Missions</h3>
                <IconTarget size={24} color="#9ad65c" />
              </div>
              <p className="mr-section-hint">Only missions for your role are shown.</p>
            </div>

            {/* Filter buttons */}
            <div className="mr-filter-bar">
              <button 
                className={`mr-filter-btn ${missionFilter === "ALL" ? "mr-filter-active" : ""}`}
                onClick={() => setMissionFilter("ALL")}
              >
                All
              </button>
              <button 
                className={`mr-filter-btn ${missionFilter === "NOT_JOINED" ? "mr-filter-active" : ""}`}
                onClick={() => setMissionFilter("NOT_JOINED")}
              >
                Available
              </button>
              <button 
                className={`mr-filter-btn ${missionFilter === "IN_PROGRESS" ? "mr-filter-active" : ""}`}
                onClick={() => setMissionFilter("IN_PROGRESS")}
              >
                In Progress
              </button>
              <button 
                className={`mr-filter-btn ${missionFilter === "COMPLETED" ? "mr-filter-active" : ""}`}
                onClick={() => setMissionFilter("COMPLETED")}
              >
                Completed
              </button>
              <button 
                className={`mr-filter-btn ${missionFilter === "CLAIMED" ? "mr-filter-active" : ""}`}
                onClick={() => setMissionFilter("CLAIMED")}
              >
                Claimed
              </button>
            </div>

            <div className="mr-scroll">
              <MissionCardList
                missions={visibleMissions}
                loading={loading}
                canParticipate={canParticipate}
                onJoin={handleJoin}
                onClaim={handleClaim}
              />
            </div>
          </section>
        </>
      )}
      {showCreateInfo && (
        <div className="mr-info-overlay" onClick={() => setShowCreateInfo(false)}>
          <div className="mr-info-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="mr-info-close"
              onClick={() => setShowCreateInfo(false)}
              aria-label="Close info"
            >
              ×
            </button>
            <h4 className="mr-info-title">About missions</h4>
            <p className="mr-info-text">
              These are missions that tourists or guides can join to earn rewards. Each mission
              defines a role, an objective type, a target, and a time window.
            </p>
            <ul className="mr-info-list">
              <li>Set the role and objective type to control eligibility.</li>
              <li>Target value is required and must be greater than 0.</li>
              <li>End date is required; start date is optional.</li>
              <li>Rewards include XP and real-life benefits, like discounts or special access.</li>
            </ul>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
