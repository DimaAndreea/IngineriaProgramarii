const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

export async function uploadSubmission(itineraryId, objectiveId, file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("objectiveId", objectiveId); // trebuie să fie exact ce backend așteaptă

    const response = await fetch(`${API_BASE_URL}/api/itineraries/${itineraryId}/submit-photo`, {
        method: "POST",
        body: formData,
        credentials: "include"
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to upload submission");
    }

    return await response.json();
}
