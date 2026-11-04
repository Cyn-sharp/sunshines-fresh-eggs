import { useBodegaStock, toTotalPieces } from "../../hooks/useInventory";
import StockCard from "../shared/StockCard";
import Navbar from "../shared/Navbar";
import LoadingSpinner from "../shared/LoadingSpinner";
import { EGG_SIZES, EGGS_PER_TRAY } from "../../utils/constants";
import { ArrowLeft, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BodegaView = () => {
  const { stock, loading } = useBodegaStock();
  const navigate = useNavigate();

  if (loading) return <LoadingSpinner message="Loading bodega..." />;

  let totalPieces = 0;
  EGG_SIZES.forEach((s) => {
    if (stock[s.id]) totalPieces += toTotalPieces(stock[s.id].trays, stock[s.id].pieces);
  });

  return (
    <div className="min-h-screen bg-sunshine-50 pb-28">
      <header className="bg-blue-600 text-white px-4 py-5 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/tindero")} className="p-2 bg-blue-500 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold">Bodega Stock</h1>
            <p className="text-blue-100 text-xs">View only — check available stock</p>
          </div>
        </div>
      </header>

      <div className="px-4 mt-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-center">
          <Package className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <p className="text-xs text-blue-600 font-medium">Total in Bodega</p>
          <p className="text-3xl font-extrabold text-blue-900">{Math.floor(totalPieces / EGGS_PER_TRAY)}</p>
          <p className="text-[10px] text-blue-400">trays available</p>
        </div>
      </div>

      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold text-sunshine-700 mb-3 uppercase tracking-wide">Per Size</h2>
        <div className="grid grid-cols-2 gap-3">
          {EGG_SIZES.map((size) => {
            const data = stock[size.id] || { trays: 0, pieces: 0 };
            return (
              <StockCard key={size.id} sizeName={size.name} short={size.short} trays={data.trays} pieces={data.pieces} />
            );
          })}
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-600">
            💡 Tap <strong>"Transfer"</strong> in the navbar to get eggs from bodega
          </p>
        </div>
      </div>

      <Navbar role="tindero" />
    </div>
  );
};

export default BodegaView;