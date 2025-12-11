const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

const BASE = `${API_BASE_URL}/api/submissions`;

export async function uploadSubmission(itineraryId, missionId, file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("itineraryId", itineraryId);
  formData.append("missionId", missionId);

  const res = await fetch(`${BASE}`, {
    method: "POST",
    body: formData,
    credentials: "include", 
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to upload submission.");
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null;
  }

  const data = await res.json();

  return {
    ...data,
    image: data.image || data.imageUrl || data.photoUrl || null,
  };
}
