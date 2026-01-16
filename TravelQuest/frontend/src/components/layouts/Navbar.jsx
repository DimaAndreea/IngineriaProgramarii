import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useGamification } from "../../context/GamificationContext";
import UserMenu from "./UserMenu";
import "./Navbar.css";

function GamificationHud() {
  const { role } = useAuth();
  const { summary, loading } = useGamification();

  // nu afișăm nimic dacă nu e logat sau e public
  if (!role) return null;

  const lvl = summary?.level ?? summary?.lvl ?? summary?.currentLevel ?? summary?.levelNumber ?? null;
  const xp = summary?.xp ?? summary?.currentXp ?? 0;

  return (
    <div className="nav-gami" aria-label="Gamification HUD">
      <span className="nav-gami-pill">
        LVL <b>{loading ? "…" : lvl ?? "—"}</b>
      </span>
      <span className="nav-gami-pill">
        XP <b>{loading ? "…" : xp}</b>
      </span>
    </div>
  );
}

export default function Navbar() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // helper pentru ruta corectă de "Active Itinerary"
  const activeItineraryPath =
    role === "guide" ? "/active" : role === "tourist" ? "/tourist/active" : null;

  return (
    <nav className="navbar">
      {/* LEFT SIDE */}
      <div className="navbar-left">
        <div className="logo">TravelQuest</div>

        {/* SEARCH BAR */}
        <input
          type="text"
          className="search-bar"
          placeholder="Search itineraries..."
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);
            navigate(`/itineraries?search=${encodeURIComponent(value)}`);
          }}
        />

        {/* search icon (mobile) */}
        <button className="search-icon-btn" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <line x1="16.65" y1="16.65" x2="22" y2="22" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* CENTER BUTTONS */}
      <div className="navbar-center">
        <Link to="/home" className="nav-btn">Home</Link>
        <Link to="/itineraries" className="nav-btn">Itineraries</Link>

        {role === "guide" && (
          <Link to="/active" className="nav-btn">Active Itinerary</Link>
        )}

        {role === "tourist" && (
          <Link to="/tourist/active" className="nav-btn">Active Itinerary</Link>
        )}

        <Link to="/missions" className="nav-btn">Missions & Rewards</Link>

        {role === "admin" && (
          <Link to="/admin" className="nav-btn admin-btn">Admin Panel</Link>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="navbar-right">
        {/* ✅ HUD (LVL + XP) */}
        <GamificationHud />

        <div className="hamburger-wrapper">
          <button
            className="hamburger"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Open menu"
          >
            <span></span><span></span><span></span>
          </button>

          {menuOpen && (
            <div className="hamburger-dropdown">
              <Link
                to="/home"
                className="dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>

              <Link
                to="/itineraries"
                className="dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                Itineraries
              </Link>

              {activeItineraryPath && (
                <Link
                  to={activeItineraryPath}
                  className="dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  Active Itinerary
                </Link>
              )}

              <Link
                to="/missions"
                className="dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                Missions & Rewards
              </Link>

              {role === "admin" && (
                <Link
                  to="/admin"
                  className="dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
            </div>
          )}
        </div>

        <UserMenu />
      </div>
    </nav>
  );
}
