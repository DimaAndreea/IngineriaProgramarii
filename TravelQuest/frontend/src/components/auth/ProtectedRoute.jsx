import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole, allowedRoles }) {
    const { role } = useAuth();

    // If user not logged in → redirect to login
    if (!role) return <Navigate to="/login" />;

    // If allowedRoles is defined, user must be in allowedRoles
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/home" />;
    }

    // If requiredRole is defined, user must match that role exactly
    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/home" />;
    }

    return children;
}
