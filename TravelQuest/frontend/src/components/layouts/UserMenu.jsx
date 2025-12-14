import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

export default function UserMenu() {
  const { role, logout } = useAuth(); // ✅ role e direct în context
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
        className="user-avatar"
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          className="profile-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.2c-3.2 0-9.8 1.6-9.8 4.9V22h19.6v-2.9c0-3.3-6.6-4.9-9.8-4.9z" />
        </svg>

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
          <button type="button" className="dropdown-item" onClick={goProfile}>
            View Profile
          </button>

          <button
            type="button"
            className="dropdown-item logout-btn"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
