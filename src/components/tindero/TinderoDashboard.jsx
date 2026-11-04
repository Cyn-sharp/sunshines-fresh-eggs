import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTindahanStock, toTotalPieces } from "../../hooks/useInventory";
import { useTodayAudit } from "../../hooks/useAudit";
import { useDailyReset } from "../../hooks/useDailyReset";
import Navbar from "../shared/Navbar";
import AuditCalendar from "../shared/AuditCalendar";
import { ArrowRightLeft, LogOut, Package, ClipboardCheck, Eye, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EGG_SIZES, EGGS_PER_TRAY } from "../../utils/constants";

const TinderoDashboard = () => {
  const { userProfile, logout } = useAuth();
  const { stock } = useTindahanStock();
  const { audit } = useTodayAudit();
  const { justReset } = useDailyReset();
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  let totalPieces = 0;
  EGG_SIZES.forEach((s) => {
    if (stock[s.id]) totalPieces += toTotalPieces(stock[s.id].trays, stock[s.id].pieces);
  });

  const totalTrays = Math.floor(totalPieces / EGGS_PER_TRAY);

  const timeStr = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="min-h-screen bg-sunshine-50 pb-24">
      <header className="bg-sunshine-600 text-white px-4 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sunshine-100 text-sm">Hi,</p>
            <h1 className="text-xl font-extrabold">{userProfile?.name || "Tindero"} 👋</h1>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-sunshine-200" />
              <p className="text-sunshine-200 text-xs">{dateStr} • {timeStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCalendar(true)} className="p-2 bg-sunshine-500 rounded-full">
              <Calendar className="w-5 h-5" />
            </button>
            <button onClick={logout} className="p-2 bg-sunshine-700 rounded-full"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      {/* Reset Notification */}
      {justReset && (
        <div className="mx-4 mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2 animate-pulse">
          <span className="text-sm">🔄 Stock reset — new shift started (5 PM)</span>
        </div>
      )}

      {/* Tindahan Stock */}
      <div className="px-4 mt-6">
        <button onClick={() => navigate("/tindero/stock")}
          className="w-full bg-sunshine-50 border-2 border-sunshine-200 rounded-2xl p-4 text-center active:scale-[0.97]">
          <Package className="w-6 h-6 text-sunshine-500 mx-auto mb-1" />
          <p className="text-3xl font-extrabold text-sunshine-900">{totalTrays}</p>
          <p className="text-[10px] text-sunshine-500">trays in tindahan</p>
        </button>
      </div>

      {/* Actions */}
      <div className="px-4 mt-6 space-y-3">
        <h2 className="text-sm font-bold text-sunshine-700 uppercase tracking-wide">Actions</h2>

        <button onClick={() => navigate("/tindero/closing")}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-2xl p-4 shadow-md flex items-center gap-4 active:scale-[0.98]">
          <div className="p-3 rounded-xl bg-orange-500"><ClipboardCheck className="w-6 h-6" /></div>
          <div className="text-left">
            <p className="font-bold text-lg">Closing Count</p>
            <p className="text-xs text-orange-100">
              {audit ? "✅ Already submitted — tap to view" : "End of shift audit"}
            </p>
          </div>
        </button>

        <button onClick={() => navigate("/tindero/transfer")}
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 active:scale-[0.98]">
          <div className="p-3 rounded-xl bg-blue-500 text-white"><ArrowRightLeft className="w-6 h-6" /></div>
          <div className="text-left">
            <p className="font-bold text-sunshine-900">Get Eggs from Bodega</p>
            <p className="text-xs text-sunshine-500">Transfer stock to tindahan</p>
          </div>
        </button>

        <button onClick={() => navigate("/tindero/bodega")}
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 active:scale-[0.98]">
          <div className="p-3 rounded-xl bg-sunshine-100 text-sunshine-600"><Eye className="w-6 h-6" /></div>
          <div className="text-left">
            <p className="font-bold text-sunshine-900">View Bodega Stock</p>
            <p className="text-xs text-sunshine-500">Check what's available (read-only)</p>
          </div>
        </button>
      </div>

      {/* Calendar Modal */}
      {showCalendar && <AuditCalendar onClose={() => setShowCalendar(false)} />}

      <Navbar role="tindero" />
    </div>
  );
};

export default TinderoDashboard;