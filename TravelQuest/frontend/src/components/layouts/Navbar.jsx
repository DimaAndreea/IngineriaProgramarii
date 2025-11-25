import { useAuth } from "../../context/AuthContext";
import UserMenu from "./UserMenu";
import "./Navbar.css";
import { Link } from "react-router-dom";

export default function Navbar() {
    const { role } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="logo">TravelQuest</div>

                {/* search bar */}
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search itineraries..."
                />

                {/* navigation buttons */}
                <Link to="/home" className="nav-btn">
                    Home
                </Link>
                <Link to="/itineraries" className="nav-btn">
                    Itineraries
                </Link>
                {/* active itinerary – only visible to guide and tourist */}
                {(role === "guide" || role === "tourist") && (
                    <Link to="/active" className="nav-btn">
                        Active Itinerary
                    </Link>
                )}
                <Link to="/missions" className="nav-btn">
                    Missions & Rewards
                </Link>

                {/* admin panel button – only visible to admin */}
                {role === "admin" && (
                    <Link to="/admin" className="nav-btn admin-btn">
                        Admin Panel
                    </Link>
                )}
            </div>

            <div className="navbar-right">
                <UserMenu />
            </div>
        </nav>
    );
}
