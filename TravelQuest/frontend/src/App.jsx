import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* DETAILS PAGE */}
          <Route
            path="/itineraries/:id"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ItineraryDetailsPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* HOME */}
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

          {/* ITINERARIES LIST */}
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

          {/* ACTIVE ITINERARY FOR GUIDE */}
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

          {/* ACTIVE ITINERARY FOR TOURIST */}
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

          {/* MISSIONS */}
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

          {/* ADMIN */}
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

          {/* GUIDE PROFILE */}
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

          {/* TOURIST PROFILE */}
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


          {/* CATCH-ALL -> LOGIN */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
