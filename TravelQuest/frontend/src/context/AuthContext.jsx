import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem("auth");
    return stored
      ? JSON.parse(stored)
      : { role: null, userId: null, username: null };
  });

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ✅ Verify session validity on app startup
  useEffect(() => {
    async function verifySession() {
      try {
        const response = await fetch("http://localhost:8088/api/itineraries/whoami", {
          credentials: "include",
        });

        if (!response.ok) {
          // Session is invalid - clear localStorage and set auth to null
          localStorage.removeItem("auth");
          setAuth({ role: null, userId: null, username: null });
        }
        // If response is OK, session is valid - keep auth from localStorage
      } catch (error) {
        console.error("Error verifying session:", error);
        // On error, also clear auth to be safe
        localStorage.removeItem("auth");
        setAuth({ role: null, userId: null, username: null });
      } finally {
        setIsCheckingAuth(false);
      }
    }

    verifySession();
  }, []);

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

  // Don't render children until we've verified the session
  if (isCheckingAuth) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Loader label="Loading session..." />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
