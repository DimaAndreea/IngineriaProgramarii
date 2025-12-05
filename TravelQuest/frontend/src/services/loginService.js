export async function loginUser(data) {
  const response = await fetch("http://localhost:8088/api/auth/login", {
    method: "POST",
    credentials: "include",   // 🔥 OBLIGATORIU
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Login failed");
  }

  return result;
}
