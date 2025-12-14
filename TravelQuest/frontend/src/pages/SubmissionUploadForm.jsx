import { useState, useRef } from "react";
import { uploadSubmission } from "../services/submissionService";

export default function SubmissionUploadForm({ itineraryId, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError("");
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setUploading(true);
        setError("");

        try {
            const submission = await uploadSubmission(itineraryId, file);

            // callback către părinte (ActiveItineraryPage)
            if (onUploadSuccess) onUploadSuccess(submission);

            // reset input
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            setError(err.message || "Failed to upload submission.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ marginTop: "20px" }}>
            <h3>Upload Photo Submission</h3>

            <div>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                <button onClick={handleUpload} disabled={!file || uploading}>
                    {uploading ? "Uploading..." : "Submit Photo"}
                </button>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
