export async function registerUser(data) {
  try {
    const response = await fetch("http://localhost:8088/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        phoneNumber: data.phone_number, 
        role: data.role,
        adminCode: data.role === "admin" ? data.adminCode : null, 
      }),
    });

    const text = await response.text();
    console.log("Raw response text:", text);
    console.log("HTTP status:", response.status);

    let result;
    try {
      result = JSON.parse(text); 
    } catch (err) {
      console.error("Failed to parse JSON:", err);
      throw new Error(`Invalid JSON response. Status: ${response.status}`);
    }

    if (!response.ok || !result.success) {
      throw new Error(result?.message || "Register failed");
    }

    return result;

  } catch (error) {
    console.error("Register request failed:", error);
    throw error; 
  }
}
