import { useAuth } from "../context/AuthContext";
import { useGamification } from "../context/GamificationContext";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
    const { role } = useAuth();
    const { triggerTestLevelUp } = useGamification();
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

            {/* TEST BUTTON - Remove later */}
            <button
                className="create-itinerary-btn"
                onClick={() => triggerTestLevelUp?.(5)}
                style={{ marginTop: "20px", background: "#7a5aa7" }}
            >
                🎉 Test Level Up Notification
            </button>
        </div>
    );
}
