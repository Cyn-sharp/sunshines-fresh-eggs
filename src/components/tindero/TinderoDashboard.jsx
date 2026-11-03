// src/components/tindero/TinderoDashboard.jsx
import { useAuth } from "../../hooks/useAuth";
import {
  ShoppingCart,
  ArrowRightLeft,
  ClipboardList,
  LogOut,
  Egg,
} from "lucide-react";

const TinderoDashboard = () => {
  const { userProfile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-sunshine-50 pb-20">
      {/* Header */}
      <header className="bg-sunshine-500 text-white px-4 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sunshine-100 text-sm">Hi,</p>
            <h1 className="text-xl font-extrabold">
              {userProfile?.name || "Tindero"} 👋
            </h1>
          </div>
          <button
            onClick={logout}
            className="p-2 bg-sunshine-600 rounded-full hover:bg-sunshine-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-2 text-sunshine-100 text-xs">
          Sunshine's Fresh Eggs • Tindahan
        </p>
      </header>

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold text-sunshine-700 mb-3 uppercase tracking-wide">
          Quick Actions
        </h2>
        <div className="space-y-3">
          {[
            {
              icon: ShoppingCart,
              label: "New Sale",
              desc: "Log an egg sale",
              color: "bg-green-500",
            },
            {
              icon: ArrowRightLeft,
              label: "Get Eggs from Bodega",
              desc: "Request stock transfer",
              color: "bg-blue-500",
            },
            {
              icon: ClipboardList,
              label: "Closing Count",
              desc: "End-of-day inventory count",
              color: "bg-orange-500",
            },
          ].map(({ icon: Icon, label, desc, color }) => (
            <button
              key={label}
              className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 
                         hover:shadow-md transition-shadow active:scale-[0.98]"
            >
              <div className={`p-3 rounded-xl ${color} text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sunshine-900">{label}</p>
                <p className="text-xs text-sunshine-500">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Summary (Placeholder) */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold text-sunshine-700 mb-3 uppercase tracking-wide">
          Today
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-xs text-sunshine-500">Sales</p>
            <p className="text-2xl font-extrabold text-sunshine-900">₱0</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-xs text-sunshine-500">Trays Sold</p>
            <p className="text-2xl font-extrabold text-sunshine-900">0</p>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="px-4 mt-8">
        <div className="bg-sunshine-100 border-2 border-dashed border-sunshine-300 rounded-2xl p-6 text-center">
          <Egg className="w-8 h-8 text-sunshine-400 mx-auto mb-2" />
          <p className="text-sunshine-600 font-semibold text-sm">
            🚧 Phase 1 Complete!
          </p>
          <p className="text-sunshine-500 text-xs mt-1">
            Sales & inventory features coming in Phase 2
          </p>
        </div>
      </div>
    </div>
  );
};

export default TinderoDashboard;