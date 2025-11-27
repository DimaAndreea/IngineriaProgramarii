import { useState } from "react";
import "./RegisterForm.css";
import { registerUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
    const navigate = useNavigate(); 
    
    const [role, setRole] = useState("tourist");

    const [form, setForm] = useState({
        username: "",
        email: "",
        phone_number: "",
        password: "",
        confirmPassword: "",
        adminCode: "",
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validate = () => {
        const err = {};

        if (!form.username.trim()) err.username = "Username is required.";
        if (!form.email.trim()) err.email = "Email is required.";
        else if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Invalid email.";

        if (!form.phone_number.trim())
            err.phone_number = "Phone number is required.";
        else if (!/^0\d{9}$/.test(form.phone_number))
            err.phone_number = "Invalid phone number. Example: 0722334455";

        if (!form.password.trim()) err.password = "Password is required.";
        else if (
            form.password.length < 8 ||
            !/[A-Z]/.test(form.password) ||
            !/[0-9]/.test(form.password)
        )
            err.password = "Min. 8 characters, 1 uppercase, 1 number.";

        if (!form.confirmPassword.trim())
            err.confirmPassword = "Please confirm your password.";
        else if (form.password !== form.confirmPassword)
            err.confirmPassword = "Passwords do not match.";

        if (role === "admin") {
            if (!form.adminCode.trim())
                err.adminCode = "Verification code is required for admin accounts.";
            else if (form.adminCode.length < 4)
                err.adminCode = "Invalid admin code.";
        }

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await registerUser({
                username: form.username,
                email: form.email,
                phone_number: form.phone_number,
                password: form.password,
                role,
                adminCode: role === "admin" ? form.adminCode : null,
            });

            setSuccess("Account created successfully!");
            setErrors({});

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err){
            console.error(err);
            setErrors({ general: "Registration failed." });
        }
    };

    return (
        <form className="register-form" onSubmit={handleSubmit}>
            <h2 className="title">Create Your Account</h2>
            <p className="subtitle">Select your role and fill in your details.</p>

            {/* ROLE SELECTOR */}
            <div className="user-type-selector">
                {["tourist", "guide", "admin"].map((type) => (
                    <button
                        type="button"
                        key={type}
                        className={`user-type-btn ${role === type ? "active" : ""}`}
                        onClick={() => setRole(type)}
                    >
                        {type.toUpperCase()}
                    </button>
                ))}
            </div>

            {errors.general && <p className="error general-error">{errors.general}</p>}
            {success && <p className="success-msg">{success}</p>}

            {/* USERNAME */}
            <label>Username</label>
            <input
                className={errors.username ? "input error-input" : "input"}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            {errors.username && <p className="error">{errors.username}</p>}

            {/* EMAIL */}
            <label>Email</label>
            <input
                className={errors.email ? "input error-input" : "input"}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="error">{errors.email}</p>}

            {/* PHONE */}
            <label>Phone Number</label>
            <input
                className={errors.phone_number ? "input error-input" : "input"}
                value={form.phone_number}
                onChange={(e) =>
                    setForm({ ...form, phone_number: e.target.value })
                }
            />
            {errors.phone_number && <p className="error">{errors.phone_number}</p>}


            {/* ADMIN CODE — ONLY WHEN ROLE IS ADMIN */}
            {role === "admin" && (
                <>
                    <label>Admin Verification Code</label>
                    <input
                        className={errors.adminCode ? "input error-input" : "input"}
                        value={form.adminCode}
                        onChange={(e) =>
                            setForm({ ...form, adminCode: e.target.value })
                        }
                    />
                    {errors.adminCode && (
                        <p className="error">{errors.adminCode}</p>
                    )}
                </>
            )}

            {/* PASSWORD */}
            <label>Password</label>
            <div className="password-field">
                <input
                    className={errors.password ? "input error-input" : "input"}
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? (
                        <svg viewBox="0 0 24 24" className="icon-eye-off">
                            <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2"/>
                            <path d="M9.53 9.53A4 4 0 0 0 12 16a4 4 0 0 0 2.47-7.47"
                                  stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" className="icon-eye">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
                                  stroke="currentColor" strokeWidth="2" fill="none"/>
                            <circle cx="12" cy="12" r="3" fill="currentColor"/>
                        </svg>
                    )}
                </button>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}

            {/* CONFIRM PASSWORD */}
            <label>Confirm Password</label>
            <div className="password-field">
                <input
                    className={errors.confirmPassword ? "input error-input" : "input"}
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                    }
                />
                <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                    {showConfirmPassword ? (
                        <svg viewBox="0 0 24 24" className="icon-eye-off">
                            <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2"/>
                            <path d="M9.53 9.53A4 4 0 0 0 12 16a4 4 0 0 0 2.47-7.47"
                                  stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" className="icon-eye">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
                                  stroke="currentColor" strokeWidth="2" fill="none"/>
                            <circle cx="12" cy="12" r="3" fill="currentColor"/>
                        </svg>
                    )}
                </button>
            </div>
            {errors.confirmPassword && (
                <p className="error">{errors.confirmPassword}</p>
            )}

            <button className="login-btn">REGISTER</button>

            <p className="login-link">
                Already have an account? <a href="/login">Login</a>
            </p>
        </form>
    );
}
