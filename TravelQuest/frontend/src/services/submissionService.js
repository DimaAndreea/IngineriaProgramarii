const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

export async function uploadSubmission(itineraryId, objectiveId, file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("objectiveId", String(objectiveId));

  const response = await fetch(
    `${API_BASE_URL}/api/itineraries/${itineraryId}/submit-photo`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to upload submission");
  }

  // backend-ul tău pare că întoarce JSON (fie listă, fie un obiect)
  return await response.json();
}
