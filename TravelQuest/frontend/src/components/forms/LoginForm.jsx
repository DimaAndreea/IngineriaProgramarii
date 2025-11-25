import { useState } from "react";
import "./LoginForm.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
    const [userType, setUserType] = useState("tourist");
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const err = {};

        // email validation
        if (!form.email.trim()) {
            err.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            err.email = "Invalid email format.";
        }

        if (!form.password.trim()) {
            err.password = "Password is required.";
        }

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);

        try {
            /// request login to backend
            const response = await fetch("http://localhost:8088/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    role: userType,
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || "Invalid credentials.");
            }

            // backend should return token + role
            const data = await response.json();

            login(data.token, data.role);

            navigate("/home");

        } catch (err) {
            setErrors({ general: err.message });
        }

        setLoading(false);
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            {/* ROLE SELECTOR */}
            <div className="user-type-selector">
                {["tourist", "guide", "admin"].map((type) => (
                    <button
                        type="button"
                        key={type}
                        className={`user-type-btn ${userType === type ? "active" : ""}`}
                        onClick={() => setUserType(type)}
                    >
                        {type.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* GENERAL ERROR */}
            {errors.general && (
                <p className="error general-error">{errors.general}</p>
            )}

            {/* EMAIL */}
            <label>Email</label>
            <input
                type="email"
                placeholder="your@email.com"
                className={errors.email ? "input error-input" : "input"}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="error">{errors.email}</p>}

            {/* PASSWORD + EYE ICON */}
            <label>Password</label>
            <div className="password-field">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    className={errors.password ? "input error-input" : "input"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />

                <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                >
                    {showPassword ? (
                        <svg viewBox="0 0 24 24" className="icon-eye-off">
                            <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" />
                            <path
                                d="M9.53 9.53A4 4 0 0 0 12 16a4 4 0 0 0 2.47-7.47"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                            />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" className="icon-eye">
                            <path
                                d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                            />
                            <circle cx="12" cy="12" r="3" fill="currentColor" />
                        </svg>
                    )}
                </button>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}

            <button className="login-btn" disabled={loading}>
                {loading ? "Loading..." : "LOGIN"}
            </button>

            <p className="login-link">
                New here? <a href="/register">Register</a>
            </p>
        </form>
    );
}
