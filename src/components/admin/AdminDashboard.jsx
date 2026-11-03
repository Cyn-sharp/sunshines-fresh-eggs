// src/components/admin/AdminDashboard.jsx
import { useAuth } from "../../hooks/useAuth";
import {
  Egg,
  Package,
  ShoppingCart,
  ClipboardCheck,
  TrendingUp,
  LogOut,
  Bell,
} from "lucide-react";

const AdminDashboard = () => {
  const { userProfile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-sunshine-50 pb-20">
      {/* Header */}
      <header className="bg-sunshine-500 text-white px-4 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sunshine-100 text-sm">Welcome back,</p>
            <h1 className="text-xl font-extrabold">
              {userProfile?.name || "Admin"} 👋
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 bg-sunshine-400 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                2
              </span>
            </button>
            <button
              onClick={logout}
              className="p-2 bg-sunshine-600 rounded-full hover:bg-sunshine-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="mt-2 text-sunshine-100 text-xs">
          Sunshine's Fresh Eggs • Admin Panel
        </p>
      </header>

      {/* Quick Stats (Placeholder) */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-sunshine-500 font-medium">Today's Sales</p>
            <p className="text-2xl font-extrabold text-sunshine-900 mt-1">₱0</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-sunshine-500 font-medium">Transactions</p>
            <p className="text-2xl font-extrabold text-sunshine-900 mt-1">0</p>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold text-sunshine-700 mb-3 uppercase tracking-wide">
          Management
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Package, label: "Bodega Stock", color: "bg-blue-100 text-blue-600" },
            { icon: ShoppingCart, label: "Log Delivery", color: "bg-green-100 text-green-600" },
            { icon: Egg, label: "Set Prices", color: "bg-purple-100 text-purple-600" },
            { icon: ClipboardCheck, label: "Review Audit", color: "bg-orange-100 text-orange-600" },
            { icon: TrendingUp, label: "Daily Report", color: "bg-pink-100 text-pink-600" },
            { icon: Bell, label: "Alerts", color: "bg-red-100 text-red-600" },
          ].map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 
                         hover:shadow-md transition-shadow active:scale-[0.97]"
            >
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-sunshine-800 text-center">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="px-4 mt-8">
        <div className="bg-sunshine-100 border-2 border-dashed border-sunshine-300 rounded-2xl p-6 text-center">
          <p className="text-sunshine-600 font-semibold text-sm">
            🚧 Phase 1 Complete!
          </p>
          <p className="text-sunshine-500 text-xs mt-1">
            Inventory features coming in Phase 2
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;