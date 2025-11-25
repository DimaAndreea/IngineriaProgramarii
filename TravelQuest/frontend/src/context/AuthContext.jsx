import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const navigate = useNavigate();

    // token from localStorage
    const [token, setToken] = useState(localStorage.getItem("authToken") || null);

    // role from localStorage
    const [role, setRole] = useState(localStorage.getItem("role") || null);

    // login
    const login = (newToken, newRole) => {
        localStorage.setItem("authToken", newToken);
        localStorage.setItem("role", newRole);

        setToken(newToken);
        setRole(newRole);

        navigate("/home");
    };

    // logout
    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("role");

        setToken(null);
        setRole(null);

        navigate("/login");
    };

    const value = { token, role, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}