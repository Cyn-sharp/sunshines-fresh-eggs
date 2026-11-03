import { useAuth } from "../../hooks/useAuth";
import { useBodegaStock, useTindahanStock, toTotalPieces } from "../../hooks/useInventory";
import Navbar from "../shared/Navbar";
import {
  Package,
  ShoppingCart,
  LogOut,
  Bell,
  Store,
  Warehouse,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EGG_SIZES } from "../../utils/constants";

const AdminDashboard = () => {
  const { userProfile, logout } = useAuth();
  const { stock: bodega } = useBodegaStock();
  const { stock: tindahan } = useTindahanStock();
  const navigate = useNavigate();

  let totalBodega = 0;
  let totalTindahan = 0;
  EGG_SIZES.forEach((size) => {
    const b = bodega[size.id];
    const t = tindahan[size.id];
    if (b) totalBodega += toTotalPieces(b.trays, b.pieces);
    if (t) totalTindahan += toTotalPieces(t.trays, t.pieces);
  });

  return (
    <div className="min-h-screen bg-sunshine-50 pb-24">
      <header className="bg-sunshine-500 text-white px-4 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sunshine-100 text-sm">Welcome back,</p>
            <h1 className="text-xl font-extrabold">{userProfile?.name || "Admin"} 👋</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 bg-sunshine-400 rounded-full">
              <Bell className="w-5 h-5" />
            </button>
            <button onClick={logout} className="p-2 bg-sunshine-600 rounded-full">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Live Stats */}
      <div className="px-4 mt-6 grid grid-cols-2 gap-3">
        <button onClick={() => navigate("/admin/bodega")}
                className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-left active:scale-[0.97]">
          <Warehouse className="w-5 h-5 text-blue-500 mb-1" />
          <p className="text-xs text-blue-600 font-medium">Bodega</p>
          <p className="text-2xl font-extrabold text-blue-900">{totalBodega.toLocaleString()}</p>
          <p className="text-[10px] text-blue-400">pieces</p>
        </button>
        <button onClick={() => navigate("/admin/tindahan")}
                className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-left active:scale-[0.97]">
          <Store className="w-5 h-5 text-green-500 mb-1" />
          <p className="text-xs text-green-600 font-medium">Tindahan</p>
          <p className="text-2xl font-extrabold text-green-900">{totalTindahan.toLocaleString()}</p>
          <p className="text-[10px] text-green-400">pieces</p>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold text-sunshine-700 mb-3 uppercase tracking-wide">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/admin/delivery")}
                  className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-[0.97]">
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-sunshine-800">Log Delivery</span>
          </button>
          <button onClick={() => navigate("/admin/employees")}
                  className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-[0.97]">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-sunshine-800">Employees</span>
          </button>
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="bg-sunshine-100 border-2 border-dashed border-sunshine-300 rounded-2xl p-4 text-center">
          <p className="text-sunshine-600 font-semibold text-sm">✅ Phase 2 Complete!</p>
          <p className="text-sunshine-500 text-xs mt-1">Sales & auditing coming in Phase 3-4</p>
        </div>
      </div>

      <Navbar role="admin" />
    </div>
  );
};

export default AdminDashboard;