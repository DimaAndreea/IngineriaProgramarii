import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import Navbar from "./components/layouts/Navbar";

import ItinerariesPage from "./pages/ItinerariesPage"; 
import ActivePage from "./pages/ActiveItineraryPage";
import MissionsPage from "./pages/MissionsPage";
import AdminPanelPage from "./pages/AdminPanelPage";

function ProtectedLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* pages visible to everyone */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Home – visible to anyone logged in */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <HomePage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* Itineraries – visible to anyone logged in */}
          <Route
            path="/itineraries"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ItinerariesPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* Active Itinerary – visible to tourist/guide */}
          <Route
            path="/active"
            element={
              <ProtectedRoute allowedRoles={["guide", "tourist"]}>
                <ProtectedLayout>
                  <ActivePage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* Missions & Rewards – visible to anyone logged in */}
          <Route
            path="/missions"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <MissionsPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Panel – visible only to admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <ProtectedLayout>
                  <AdminPanelPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
