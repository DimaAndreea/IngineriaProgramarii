import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole, allowedRoles }) {
    const { role } = useAuth();

    // if user not logged in -> redirect to login
    if (!role) return <Navigate to="/login" />;

    // if allowedRoles is defined, user must be in allowedRoles
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/home" />;
    }

    // user must match that role exactly
    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/home" />;
    }

    return children;
}
