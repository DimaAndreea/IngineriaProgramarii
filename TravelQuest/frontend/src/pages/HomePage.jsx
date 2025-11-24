import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

export default function HomePage() {
  const { role } = useAuth();

  return (
    <div className="home-container">
      <h1 className="home-title">TravelQuest</h1>
      <p className="home-subtitle">Work in progress...</p>

      {role === "guide" && (
        <button className="create-itinerary-btn">
          Create Itinerary
        </button>
      )}
    </div>
  );
}
