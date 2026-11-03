// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Login from "./components/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminDashboard from "./components/admin/AdminDashboard";
import TinderoDashboard from "./components/tindero/TinderoDashboard";
import LoadingSpinner from "./components/shared/LoadingSpinner";
import { ROLES } from "./utils/constants";

// Smart redirect based on role
const SmartRedirect = () => {
  const { userRole, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (userRole === ROLES.ADMIN) return <Navigate to="/admin" replace />;
  if (userRole === ROLES.TINDERO) return <Navigate to="/tindero" replace />;

  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default: redirect based on auth state */}
      <Route path="/" element={<SmartRedirect />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Tindero Routes */}
      <Route
        path="/tindero"
        element={
          <ProtectedRoute allowedRoles={[ROLES.TINDERO]}>
            <TinderoDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
      
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;