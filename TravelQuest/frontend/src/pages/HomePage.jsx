import { useAuth } from "../context/AuthContext";
import { useGamification } from "../context/GamificationContext";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

// Icons
const CreateIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const AdminIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
  </svg>
);

const BadgesIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

export default function HomePage() {
    const { role } = useAuth();
    const { triggerTestLevelUp } = useGamification();
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        try {
            navigate(path);
        } catch (err) {
            console.error(`Navigation to ${path} failed:`, err);
        }
    };

    const getHeroSubtitle = () => {
        switch(role) {
            case "tourist":
                return "Explore amazing itineraries, complete missions, and collect exclusive badges";
            case "guide":
                return "Create itineraries, connect with travelers, and build your guide reputation";
            case "admin":
                return "Manage your platform, monitor activities, and ensure quality content";
            default:
                return "Discover amazing itineraries, earn badges, and become a legendary traveler";
        }
    };

    return (
        <div className="home-page">
            <div className="home-overlay" />
            <div className="home-wrapper">
                {/* HERO SECTION */}
                <div className="hero-section">
                    <div className="hero-title-wrapper">
                        <img src="/tour-guide.png" alt="TravelQuest" className="hero-icon" />
                        <h1 className="hero-title">TravelQuest</h1>
                    </div>
                    <p className="hero-subtitle">{getHeroSubtitle()}</p>
                </div>

                {/* FEATURES GRID */}
                <div className="features-grid">
                    {/* EXPLORE ITINERARIES - For all users */}
                    <div className="feature-card">
                        <div className="feature-icon explore">
                            <img src="/compass.png" alt="Explore" />
                        </div>
                        <h3>Explore Itineraries</h3>
                        <p>Discover amazing travel experiences curated by expert guides</p>
                        <button className={`feature-btn ${role === "guide" ? "guide-btn" : role === "admin" ? "admin-btn" : "tourist-btn"}`} onClick={() => handleNavigate("/itineraries")}>
                            Browse Tours
                        </button>
                    </div>

                    {/* CREATE ITINERARY - For guides only */}
                    {role === "guide" && (
                        <div className="feature-card">
                            <div className="feature-icon create">
                                <CreateIcon />
                            </div>
                            <h3>Create Itinerary</h3>
                            <p>Design your own itineraries and share them with travelers</p>
                            <button className="feature-btn guide-btn" onClick={() => handleNavigate("/itineraries/create")}>
                                Create Now
                            </button>
                        </div>
                    )}

                    {/* MANAGE - For guides */}
                    {role === "guide" && (
                        <div className="feature-card">
                            <div className="feature-icon manage">
                                <CreateIcon />
                            </div>
                            <h3>My Itineraries</h3>
                            <p>Manage and track your created itineraries</p>
                            <button className="feature-btn secondary" onClick={() => handleNavigate("/guide-profile")}>
                                View Dashboard
                            </button>
                        </div>
                    )}

                    {/* BADGES - For tourists */}
                    {role === "tourist" && (
                        <div className="feature-card">
                            <div className="feature-icon badges">
                                <BadgesIcon />
                            </div>
                            <h3>Collect Badges</h3>
                            <p>Complete missions and earn exclusive badges</p>
                            <button className="feature-btn secondary" onClick={() => handleNavigate("/my-badges")}>
                                View Badges
                            </button>
                        </div>
                    )}

                    {/* MISSIONS - For tourists */}
                    {role === "tourist" && (
                        <div className="feature-card">
                            <div className="feature-icon missions">
                                <BadgesIcon />
                            </div>
                            <h3>Active Missions</h3>
                            <p>Join missions on your itineraries to earn rewards</p>
                            <button className="feature-btn secondary" onClick={() => handleNavigate("/missions")}>
                                View Missions
                            </button>
                        </div>
                    )}

                    {/* ADMIN PANEL - For admins */}
                    {role === "admin" && (
                        <div className="feature-card">
                            <div className="feature-icon admin">
                                <img src="/shield.png" alt="Admin" />
                            </div>
                            <h3>Admin Panel</h3>
                            <p>Manage users, itineraries, and platform settings</p>
                            <button className="feature-btn admin-btn" onClick={() => handleNavigate("/admin")}>
                                Go to Panel
                            </button>
                        </div>
                    )}

                    {/* PROFILE - For tourists and guides only */}
                    {role !== "admin" && (
                        <div className="feature-card">
                            <div className="feature-icon profile">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                            </div>
                            <h3>My Profile</h3>
                            <p>View and manage your account settings</p>
                            <button className="feature-btn secondary" onClick={() => handleNavigate(role === "guide" ? "/guide-profile" : "/tourist-profile")}>
                                View Profile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
