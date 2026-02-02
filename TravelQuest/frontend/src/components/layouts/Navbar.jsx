import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserMenu from "./UserMenu";
import "./Navbar.css";

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
        <div className="search-wrapper">
          <svg
            className="search-bar-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <line x1="16.65" y1="16.65" x2="22" y2="22" stroke="currentColor" strokeWidth="2" />
          </svg>
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
        </div>

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
        <Link to="/home" className="nav-btn">
          <span className="nav-btn-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 11.5L12 4l9 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 10.5V20h14v-9.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="nav-btn-text">Home</span>
        </Link>
        <Link to="/itineraries" className="nav-btn">
          <span className="nav-btn-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21s6-6.2 6-11a6 6 0 1 0-12 0c0 4.8 6 11 6 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <span className="nav-btn-text">Itineraries</span>
        </Link>

        {role === "guide" && (
          <Link to="/active" className="nav-btn">
            <span className="nav-btn-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 18l6-6 4 4 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="4" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="20" cy="8" r="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <span className="nav-btn-text">Active Itinerary</span>
          </Link>
        )}

        {role === "tourist" && (
          <Link to="/tourist/active" className="nav-btn">
            <span className="nav-btn-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 18l6-6 4 4 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="4" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="20" cy="8" r="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <span className="nav-btn-text">Active Itinerary</span>
          </Link>
        )}

        <Link to="/missions" className="nav-btn">
          <span className="nav-btn-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 4h10v3a5 5 0 0 1-10 0V4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M5 7H3a3 3 0 0 0 3 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M19 7h2a3 3 0 0 1-3 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 12v4M9 20h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="nav-btn-text">Missions & Rewards</span>
        </Link>

        {role === "admin" && (
          <Link to="/admin" className="nav-btn">
            <span className="nav-btn-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="nav-btn-text">Admin Panel</span>
          </Link>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="navbar-right">
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
