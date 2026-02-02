import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useGamification } from "../../context/GamificationContext";
import "./Navbar.css";

export default function UserMenu() {
  const { role, logout } = useAuth();
  const { summary, loading } = useGamification();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Get gamification data for non-admin users
  const isNonAdmin = role && role !== "admin";
  const lvl = summary?.level ?? summary?.lvl ?? summary?.currentLevel ?? summary?.levelNumber ?? null;
  const xp = summary?.xp ?? summary?.currentXp ?? 0;
  const maxXp = summary?.maxXp ?? summary?.xpToNextLevel ?? 100;
  const xpProgress = maxXp > 0 ? (xp / maxXp) * 100 : 0;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const goProfile = () => {
    setOpen(false);

    const r = (role || "").toLowerCase();

    if (r === "guide") return navigate("/profile/guide");
    if (r === "tourist") return navigate("/profile/tourist");
    if (r === "admin") return navigate("/admin");

    return navigate("/home");
  };

  const handleLogout = () => {
    setOpen(false);
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  return (
    <div className="user-menu-container" ref={ref}>
      <button
        type="button"
        className={isNonAdmin ? "user-avatar-with-stats" : "user-avatar"}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          className="profile-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.2c-3.2 0-9.8 1.6-9.8 4.9V22h19.6v-2.9c0-3.3-6.6-4.9-9.8-4.9z" />
        </svg>

        {isNonAdmin && (
          <div className="user-stats-container">
            <div className="user-stats-top">
              <span className="user-stat-label">LVL {loading ? "…" : lvl ?? "—"}</span>
              <span className="user-stat-xp">{loading ? "…" : xp} XP</span>
            </div>
            <div className="user-progress-bar">
              <div className="user-progress-fill" style={{ width: `${xpProgress}%` }}></div>
            </div>
          </div>
        )}

        <svg
          className={`arrow-icon ${open ? "rotate" : ""}`}
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 7L10 12L15 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="user-dropdown">
          {role !== "admin" && (
            <button type="button" className="dropdown-item" onClick={goProfile}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              View Profile
            </button>
          )}

          <button
            type="button"
            className="dropdown-item logout-btn"
            onClick={handleLogout}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            >
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
            </svg>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
