import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // token from localStorage
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);

  // login
  const login = (newToken) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
    navigate("/home");
  };

  // logout
  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    navigate("/login");
  };

  const value = { token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
