import { useEffect, useState, useRef } from "react";
import {
  getActiveItineraryForTourist,
  uploadSubmission
} from "../services/submissionService";

export default function ActiveItinerarySubmission() {
  const [itinerary, setItinerary] = useState(null);
  const [file, setFile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadItinerary() {
      try {
        const data = await getActiveItineraryForTourist();
        setItinerary(data);
        setSubmissions(data.submissions || []); // dacă backend-ul trimite lista
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadItinerary();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !itinerary) return;

    try {
      const submission = await uploadSubmission(itinerary.id, file);
      setSubmissions(prev => [...prev, submission]);

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading active itinerary...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!itinerary) return <p>No active itinerary found.</p>;

  return (
      <div>
        <h2>Active Itinerary: {itinerary.title}</h2>
        <p>{itinerary.description}</p>

        <div>
          <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
          />

          <button onClick={handleUpload} disabled={!file}>
            Upload Submission
          </button>
        </div>

        <h3>Submissions:</h3>

        {submissions.length === 0 && (
            <p>No submissions yet.</p>
        )}

        <ul>
          {submissions.map((s, index) => (
              <li key={index}>
                <img
                    src={s.imageUrl || s.photoUrl || s.image || ""}
                    alt={`submission-${index}`}
                    width={200}
                />
                <p>Status: {s.status || "Pending"}</p>
              </li>
          ))}
        </ul>
      </div>
  );
}
