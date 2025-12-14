const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

function fileToBase64DataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // => "data:image/png;base64,...."
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadSubmission(itineraryId, objectiveId, file) {
  const submissionBase64 = await fileToBase64DataUrl(file);

  const response = await fetch(
    `${API_BASE_URL}/api/itineraries/${itineraryId}/submit-photo`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        objectiveId,
        submissionBase64,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to upload submission");
  }

  return await response.json();
}
