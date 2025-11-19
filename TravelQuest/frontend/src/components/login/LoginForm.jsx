import { useState } from "react";
import "./LoginForm.css";

export default function LoginForm() {
  const [userType, setUserType] = useState("tourist");
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const err = {};

    if (!form.email.trim()) err.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      err.email = "Invalid email.";

    if (!form.password.trim()) err.password = "Password required.";
    else if (form.password.length < 6)
      err.password = "Min. 6 characters.";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userType }),
      });

      if (!response.ok) throw new Error("Invalid credentials.");

      alert("Logged in!");
    } catch (err) {
      setErrors({ general: err.message });
    }

    setLoading(false);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {/* user type selector */}
      <div className="user-type-selector">
        {["tourist", "guide", "admin"].map((type) => (
          <button
            type="button"
            key={type}
            className={`user-type-btn ${
              userType === type ? "active" : ""
            }`}
            onClick={() => setUserType(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* errors */}
      {errors.general && <p className="error general-error">{errors.general}</p>}

      {/* email */}
      <label>Email</label>
      <input
        type="email"
        placeholder="your@email.com"
        className={errors.email ? "input error-input" : "input"}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      {errors.email && <p className="error">{errors.email}</p>}

      {/* password */}
      <label>Password</label>
      <input
        type="password"
        placeholder="••••••"
        className={errors.password ? "input error-input" : "input"}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      {errors.password && <p className="error">{errors.password}</p>}

      <button className="login-btn" disabled={loading}>
        {loading ? "Loading..." : "LOGIN"}
      </button>
      
    </form>
  );
}
