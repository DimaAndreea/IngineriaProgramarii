import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem("auth");
    return stored
      ? JSON.parse(stored)
      : { role: null, userId: null, username: null };
  });

  const login = ({ role, userId, username }) => {
    const authData = {
      role: role.toLowerCase(),
      userId,
      username,
    };

    localStorage.setItem("auth", JSON.stringify(authData));
    setAuth(authData);

    navigate("/home");
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setAuth({ role: null, userId: null, username: null });
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
