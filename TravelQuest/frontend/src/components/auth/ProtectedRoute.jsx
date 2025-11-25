import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole, allowedRoles }) {
    const { token, role } = useAuth();

    // if not logged in → redirect to login
    if (!token) return <Navigate to="/login" />;

    // allowedRoles takes priority if provided
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/home" />;
    }

    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/home" />;
    }

    return children;
}