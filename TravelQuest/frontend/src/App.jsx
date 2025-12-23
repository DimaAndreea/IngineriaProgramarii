import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import Navbar from "./components/layouts/Navbar";

import ItinerariesPage from "./pages/ItinerariesPage";
import ActiveGuidePage from "./pages/ActiveItineraryPage";
import MissionsPage from "./pages/MissionsPage.jsx";
import AdminPanelPage from "./pages/AdminPanelPage";
import ItineraryDetailsPage from "./pages/ItineraryDetailsPage";

import ActiveItineraryTouristPage from "./components/itineraries/tourist/active/ActiveItineraryTouristPage.jsx";
import GuideProfilePage from "./pages/GuideProfilePage";
import TouristProfilePage from "./pages/TouristProfilePage";

function ProtectedLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function SmartCatchAll() {
  const { role } = useAuth();
  return <Navigate to={role ? "/home" : "/login"} replace />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* PUBLIC: Itinerary details (dar cu Navbar) */}
          <Route
            path="/itineraries/:id"
            element={
              <ProtectedLayout>
                <ItineraryDetailsPage />
              </ProtectedLayout>
            }
          />

          {/* PUBLIC: Guide profile (dar cu Navbar) */}
          <Route
            path="/guides/:id"
            element={
              <ProtectedLayout>
                <GuideProfilePage />
              </ProtectedLayout>
            }
          />

          {/* PUBLIC: Tourist profile (dar cu Navbar) */}
          <Route
            path="/tourists/:id"
            element={
              <ProtectedLayout>
                <TouristProfilePage />
              </ProtectedLayout>
            }
          />

          {/* PRIVATE ROUTES */}
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

          {/* Guide active itinerary */}
          <Route
            path="/active"
            element={
              <ProtectedRoute allowedRoles={["guide"]}>
                <ProtectedLayout>
                  <ActiveGuidePage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* Tourist active itinerary */}
          <Route
            path="/tourist/active"
            element={
              <ProtectedRoute allowedRoles={["tourist"]}>
                <ProtectedLayout>
                  <ActiveItineraryTouristPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* Missions: aceeași rută pentru toți, UI se schimbă în pagină după role */}
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

          {/* Admin panel */}
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

          {/* OWNER: Guide */}
          <Route
            path="/profile/guide"
            element={
              <ProtectedRoute allowedRoles={["guide"]}>
                <ProtectedLayout>
                  <GuideProfilePage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* OWNER: Tourist */}
          <Route
            path="/profile/tourist"
            element={
              <ProtectedRoute allowedRoles={["tourist"]}>
                <ProtectedLayout>
                  <TouristProfilePage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<SmartCatchAll />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
