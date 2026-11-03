import { useAuth } from "../../hooks/useAuth";
import { useTindahanStock, toTotalPieces } from "../../hooks/useInventory";
import Navbar from "../shared/Navbar";
import { ArrowRightLeft, ClipboardList, LogOut, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EGG_SIZES } from "../../utils/constants";

const TinderoDashboard = () => {
  const { userProfile, logout } = useAuth();
  const { stock } = useTindahanStock();
  const navigate = useNavigate();

  let totalPieces = 0;
  EGG_SIZES.forEach((size) => {
    const data = stock[size.id];
    if (data) totalPieces += toTotalPieces(data.trays, data.pieces);
  });

  return (
    <div className="min-h-screen bg-sunshine-50 pb-24">
      <header className="bg-sunshine-500 text-white px-4 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sunshine-100 text-sm">Hi,</p>
            <h1 className="text-xl font-extrabold">{userProfile?.name || "Tindero"} 👋</h1>
          </div>
          <button onClick={logout} className="p-2 bg-sunshine-600 rounded-full">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-4 mt-6">
        <button onClick={() => navigate("/tindero/stock")}
                className="w-full bg-sunshine-100 border-2 border-sunshine-300 rounded-2xl p-4 text-center active:scale-[0.97]">
          <Package className="w-6 h-6 text-sunshine-600 mx-auto mb-1" />
          <p className="text-xs text-sunshine-600 font-medium">Tindahan Stock</p>
          <p className="text-3xl font-extrabold text-sunshine-900">{totalPieces.toLocaleString()}</p>
          <p className="text-[10px] text-sunshine-500">total pieces available</p>
        </button>
      </div>

      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold text-sunshine-700 mb-3 uppercase tracking-wide">Quick Actions</h2>
        <div className="space-y-3">
          <button onClick={() => navigate("/tindero/transfer")}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 active:scale-[0.98]">
            <div className="p-3 rounded-xl bg-blue-500 text-white">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sunshine-900">Get Eggs from Bodega</p>
              <p className="text-xs text-sunshine-500">Transfer stock to tindahan</p>
            </div>
          </button>
          <button className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 opacity-50 cursor-not-allowed">
            <div className="p-3 rounded-xl bg-orange-500 text-white">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sunshine-900">Closing Count</p>
              <p className="text-xs text-sunshine-500">Coming in Phase 4</p>
            </div>
          </button>
        </div>
      </div>

      <Navbar role="tindero" />
    </div>
  );
};

export default TinderoDashboard;