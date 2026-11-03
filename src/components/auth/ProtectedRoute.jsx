// src/components/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../shared/LoadingSpinner";
import { AlertTriangle, ShieldAlert, WifiOff } from "lucide-react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading, dbError } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // NEW: Show database error if Firestore is blocked
  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sunshine-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center max-w-sm">
          <WifiOff className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-red-600 mb-2">
            Connection Blocked
          </h2>
          <p className="text-sunshine-700 text-sm mb-4">{dbError}</p>
          <div className="bg-sunshine-50 rounded-xl p-3 text-left text-xs text-sunshine-600 space-y-1">
            <p className="font-bold">How to fix:</p>
            <p>1. Disable your ad blocker for this site</p>
            <p>2. Make sure you're connected to the internet</p>
            <p>3. Refresh the page</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-sunshine-500 hover:bg-sunshine-600 text-white 
                       font-bold py-2 px-6 rounded-xl transition-colors"
          >
            🔄 Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sunshine-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center max-w-sm">
          <ShieldAlert className="w-12 h-12 text-orange-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-orange-600 mb-2">
            No Role Assigned
          </h2>
          <p className="text-sunshine-700 text-sm">
            Your account doesn't have a role assigned. 
            Please contact the admin.
          </p>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <Navigate
        to={userRole === "admin" ? "/admin" : "/tindero"}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;