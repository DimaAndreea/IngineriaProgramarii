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
            phoneNumber: data.phone_number,
            role: data.role,
            adminCode: data.adminCode,
        }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Register failed");
    }

    return result;
}
