import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { usernameToEmail } from "../../utils/constants";
import { Egg, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, currentUser, userRole, loading } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect after successful login
  useEffect(() => {
    if (!loading && currentUser && userRole) {
      if (userRole === "admin") {
        navigate("/admin", { replace: true });
      } else if (userRole === "tindero") {
        navigate("/tindero", { replace: true });
      }
    }
  }, [currentUser, userRole, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setIsSubmitting(true);
    try {
      // Convert username to email format
      // "juan" → "juan@sunshine.local"
      // "admin@gmail.com" → "admin@gmail.com" (unchanged)
      const email = usernameToEmail(identifier);
      await login(email, password);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading profile state
  if (currentUser && !userRole && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sunshine-50">
        <div className="w-10 h-10 border-4 border-sunshine-300 border-t-sunshine-600 rounded-full animate-spin" />
        <p className="mt-4 text-sunshine-600 font-medium text-sm">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sunshine-100 to-sunshine-50 px-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-sunshine-400 rounded-full shadow-lg mb-4">
          <Egg className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-sunshine-900">Sunshine's Fresh Eggs</h1>
        <p className="text-sunshine-600 mt-1 text-sm">Inventory Management System</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-bold text-sunshine-800 mb-6 text-center">Sign In</h2>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username or Email */}
          <div>
            <label className="block text-sm font-semibold text-sunshine-700 mb-1">
              Username or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="juan or admin@gmail.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-sunshine-200 
                         focus:border-sunshine-500 focus:outline-none 
                         bg-sunshine-50 text-sunshine-900 transition-colors"
              required
              autoComplete="username"
            />
            <p className="text-[10px] text-sunshine-400 mt-1">
              Tindero: enter your username • Admin: enter your email
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-sunshine-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-sunshine-200 
                           focus:border-sunshine-500 focus:outline-none 
                           bg-sunshine-50 text-sunshine-900 pr-12 transition-colors"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sunshine-400 hover:text-sunshine-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 
                       bg-sunshine-500 hover:bg-sunshine-600 disabled:bg-sunshine-300
                       text-white font-bold py-3 px-4 rounded-xl
                       shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-8 text-xs text-sunshine-400">
        v1.0 • Sunshine's Fresh Eggs © {new Date().getFullYear()}
      </p>
    </div>
  );
};

export default Login;