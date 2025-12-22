import AdminRoute from "./routes/AdminRoute";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import HazardMap from "./pages/HazardMap";
import ReportHazard from "./pages/ReportHazard";
import IoTDashboard from "./pages/IoTDashboard";
import EmergencyAlerts from "./pages/EmergencyAlerts";
import Community from "./pages/Community";
import Education from "./pages/Education";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

/* ================= PRIVATE ROUTE ================= */

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/* ================= HOME REDIRECT ================= */

const HomeRedirect = () => {
  const { loading } = useAuth();

  if (loading) return null;

  // Allow all users (including admins) to view Home page
  return <Home />;
};

/* ================= APP ================= */

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
            <Header />

            <main className="pt-16">
              <AdminLoginRedirect />
              <Routes>

                {/* AUTO REDIRECT ROOT */}
                <Route path="/" element={<HomeRedirect />} />

                {/* PUBLIC */}
                <Route
                  path="/map"
                  element={
                    <PrivateRoute>
                      <HazardMap />
                    </PrivateRoute>
                  }
                />
                <Route path="/report" element={<ReportHazard />} />
                <Route path="/alerts" element={<EmergencyAlerts />} />
                <Route
                  path="/community"
                  element={
                    <PrivateRoute>
                      <Community />
                    </PrivateRoute>
                  }
                />
                <Route path="/education" element={<Education />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* USER */}
                <Route path="/profile/admin" element={<Navigate to="/admin" replace />} />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/iot"
                  element={
                    <PrivateRoute>
                      <IoTDashboard />
                    </PrivateRoute>
                  }
                />

                {/* ADMIN */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

/* ================= ADMIN LOGIN REDIRECT ================= */
const AdminLoginRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user) return;

    // Redirect admin to /admin immediately after login (when on /login)
    if (user.role === "admin" && location.pathname === "/login") {
      navigate("/admin", { replace: true });
    }
  }, [user, loading, navigate, location.pathname]);

  return null;
};

export default App;