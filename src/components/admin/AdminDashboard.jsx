import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useBodegaStock, useTindahanStock, toTotalPieces } from "../../hooks/useInventory";
import { useTodayAudit } from "../../hooks/useAudit";
import { useDailyReset } from "../../hooks/useDailyReset";
import Navbar from "../shared/Navbar";
import AuditCalendar from "../shared/AuditCalendar";
import { ShoppingCart, LogOut, Bell, Store, Warehouse, Users, Tag, ClipboardCheck, PhilippinePeso, AlertTriangle, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EGG_SIZES, DISCREPANCY_THRESHOLD, EGGS_PER_TRAY } from "../../utils/constants";

const AdminDashboard = () => {
  const { userProfile, logout } = useAuth();
  const { stock: bodega } = useBodegaStock();
  const { stock: tindahan } = useTindahanStock();
  const { audit } = useTodayAudit();
  const { justReset } = useDailyReset();
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [now, setNow] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  let totalBodega = 0;
  let totalTindahan = 0;
  EGG_SIZES.forEach((s) => {
    if (bodega[s.id]) totalBodega += toTotalPieces(bodega[s.id].trays, bodega[s.id].pieces);
    if (tindahan[s.id]) totalTindahan += toTotalPieces(tindahan[s.id].trays, tindahan[s.id].pieces);
  });

  const bodegaTrays = Math.floor(totalBodega / EGGS_PER_TRAY);
  const tindahanTrays = Math.floor(totalTindahan / EGGS_PER_TRAY);

  const hasFlaggedAudit = audit && audit.discrepancyPct > DISCREPANCY_THRESHOLD && audit.status !== "approved";

  const timeStr = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="min-h-screen bg-sunshine-50 pb-24">
      <header className="bg-sunshine-600 text-white px-4 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sunshine-100 text-sm">Welcome back,</p>
            <h1 className="text-xl font-extrabold">{userProfile?.name || "Admin"} 👋</h1>
            {/* Date + Time */}
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-sunshine-200" />
              <p className="text-sunshine-200 text-xs">{dateStr} • {timeStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowCalendar(true)} className="p-2 bg-sunshine-500 rounded-full">
              <Calendar className="w-5 h-5" />
            </button>
            <button className="relative p-2 bg-sunshine-500 rounded-full">
              <Bell className="w-5 h-5" />
              {hasFlaggedAudit && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />}
            </button>
            <button onClick={logout} className="p-2 bg-sunshine-700 rounded-full"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      {/* Reset Notification */}
      {justReset && (
        <div className="mx-4 mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2 animate-pulse">
          <span className="text-sm">🔄 Tindahan stock reset for new shift (5 PM)</span>
        </div>
      )}

      {/* Audit Alert */}
      {audit && (
        <div className="px-4 mt-4">
          <button onClick={() => navigate("/admin/audit")}
            className={`w-full rounded-2xl p-4 text-left active:scale-[0.97] border-2 ${audit.status === "approved" ? "bg-green-50 border-green-200" : audit.discrepancyPct > DISCREPANCY_THRESHOLD ? "bg-red-50 border-red-200" : "bg-sunshine-50 border-sunshine-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-sunshine-600" />
                <span className="font-bold text-sunshine-900 text-sm">Today's Audit</span>
              </div>
              <span className={`font-extrabold ${audit.discrepancyPct > DISCREPANCY_THRESHOLD ? "text-red-600" : "text-green-600"}`}>
                {audit.discrepancyPct}%
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-sunshine-500">
              <span>Expected: ₱{audit.totalExpectedHalin?.toFixed(0)}</span>
              <span>Actual: ₱{audit.actualHalin?.toFixed(0)}</span>
            </div>
          </button>
        </div>
      )}

      {/* Stock */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => navigate("/admin/bodega")} className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-left active:scale-[0.97]">
          <Warehouse className="w-5 h-5 text-blue-500 mb-1" />
          <p className="text-xs text-blue-600 font-medium">Bodega</p>
          <p className="text-2xl font-extrabold text-blue-900">{bodegaTrays} trays</p>
        </button>
        <button onClick={() => navigate("/admin/tindahan")} className="bg-sunshine-50 border-2 border-sunshine-200 rounded-2xl p-4 text-left active:scale-[0.97]">
          <Store className="w-5 h-5 text-sunshine-500 mb-1" />
          <p className="text-xs text-sunshine-600 font-medium">Tindahan</p>
          <p className="text-2xl font-extrabold text-sunshine-900">{tindahanTrays} trays</p>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold text-sunshine-700 mb-3 uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => navigate("/admin/delivery")} className="bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center gap-2 active:scale-[0.97]">
            <div className="p-2 rounded-xl bg-green-100 text-green-600"><ShoppingCart className="w-5 h-5" /></div>
            <span className="text-[10px] font-semibold">Delivery</span>
          </button>
          <button onClick={() => navigate("/admin/employees")} className="bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center gap-2 active:scale-[0.97]">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600"><Users className="w-5 h-5" /></div>
            <span className="text-[10px] font-semibold">Staff</span>
          </button>
          <button onClick={() => navigate("/admin/prices")} className="bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center gap-2 active:scale-[0.97]">
            <div className="p-2 rounded-xl bg-sunshine-100 text-sunshine-600"><Tag className="w-5 h-5" /></div>
            <span className="text-[10px] font-semibold">Prices</span>
          </button>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendar && <AuditCalendar onClose={() => setShowCalendar(false)} />}

      <Navbar role="admin" />
    </div>
  );
};

export default AdminDashboard;