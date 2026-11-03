import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Login from "./components/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoadingSpinner from "./components/shared/LoadingSpinner";
import { ROLES } from "./utils/constants";

import AdminDashboard from "./components/admin/AdminDashboard";
import BodegaStock from "./components/admin/BodegaStock";
import AdjustStock from "./components/admin/AdjustStock";
import LogDelivery from "./components/admin/LogDelivery";
import TindahanStock from "./components/admin/TindahanStock";
import ManageEmployees from "./components/admin/ManageEmployees";
import PriceManager from "./components/admin/PriceManager";
import AuditReview from "./components/admin/AuditReview";

import TinderoDashboard from "./components/tindero/TinderoDashboard";
import LogTransfer from "./components/tindero/LogTransfer";
import TinderoStock from "./components/tindero/TinderoStock";
import BodegaView from "./components/tindero/BodegaView";
import ClosingCount from "./components/tindero/ClosingCount";

const SmartRedirect = () => {
  const { userRole, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (userRole === ROLES.ADMIN) return <Navigate to="/admin" replace />;
  if (userRole === ROLES.TINDERO) return <Navigate to="/tindero" replace />;
  return <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<SmartRedirect />} />
    <Route path="/login" element={<Login />} />

    {/* Admin */}
    <Route path="/admin" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/bodega" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><BodegaStock /></ProtectedRoute>} />
    <Route path="/admin/bodega/adjust/:sizeId" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdjustStock /></ProtectedRoute>} />
    <Route path="/admin/delivery" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><LogDelivery /></ProtectedRoute>} />
    <Route path="/admin/tindahan" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><TindahanStock /></ProtectedRoute>} />
    <Route path="/admin/employees" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><ManageEmployees /></ProtectedRoute>} />
    <Route path="/admin/prices" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><PriceManager /></ProtectedRoute>} />
    <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AuditReview /></ProtectedRoute>} />

    {/* Tindero */}
    <Route path="/tindero" element={<ProtectedRoute allowedRoles={[ROLES.TINDERO]}><TinderoDashboard /></ProtectedRoute>} />
    <Route path="/tindero/closing" element={<ProtectedRoute allowedRoles={[ROLES.TINDERO]}><ClosingCount /></ProtectedRoute>} />
    <Route path="/tindero/transfer" element={<ProtectedRoute allowedRoles={[ROLES.TINDERO]}><LogTransfer /></ProtectedRoute>} />
    <Route path="/tindero/stock" element={<ProtectedRoute allowedRoles={[ROLES.TINDERO]}><TinderoStock /></ProtectedRoute>} />
    <Route path="/tindero/bodega" element={<ProtectedRoute allowedRoles={[ROLES.TINDERO]}><BodegaView /></ProtectedRoute>} />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <Router><AppRoutes /></Router>
    </AuthProvider>
  );
}

export default App;