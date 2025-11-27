export async function registerUser(data) {
  const response = await fetch("http://localhost:8088/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: data.username,
      email: data.email,
      password: data.password,
      phone_number: data.phone_number,
      role: data.role,
    }),
  });

  if (!response.ok) {
    throw new Error("Register failed");
  }

  return await response.json();
}
