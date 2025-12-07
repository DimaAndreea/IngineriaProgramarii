import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
    const { role } = useAuth();
    const navigate = useNavigate();

    function handleCreateClick() {
        try {
            if (!navigate) {
                console.error("Navigation function is undefined! Cannot navigate to /itineraries.");
                return;
            }

            navigate("/itineraries");
        } catch (err) {
            console.error("Navigation to /itineraries failed:", err);
        }
    }

    return (
        <div className="home-container">
            <h1 className="home-title">TravelQuest</h1>
            <p className="home-subtitle">Work in progress...</p>

            {role === "guide" && (
                <button
                    className="create-itinerary-btn"
                    onClick={handleCreateClick}
                >
                    Create Itinerary
                </button>
            )}
        </div>
    );
}
