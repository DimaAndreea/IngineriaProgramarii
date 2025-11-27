import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const navigate = useNavigate();

    // role from localStorage (persisted login)
    const [role, setRole] = useState(localStorage.getItem("role") || null);

    // LOGIN (backend does not send token → only role is stored)
    const login = (newRole) => {
        const normalizedRole = newRole.toLowerCase();

        // save role in localStorage
        localStorage.setItem("role", normalizedRole);

        // update state
        setRole(normalizedRole);

        // redirect to homepage
        navigate("/home");
    };

    // LOGOUT
    const logout = () => {
        localStorage.removeItem("role");
        setRole(null);

        navigate("/login");
    };

    const value = { role, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
