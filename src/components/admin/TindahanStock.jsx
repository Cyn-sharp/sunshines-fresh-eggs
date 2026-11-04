import { useTindahanStock, toTotalPieces } from "../../hooks/useInventory";
import StockCard from "../shared/StockCard";
import Navbar from "../shared/Navbar";
import LoadingSpinner from "../shared/LoadingSpinner";
import { EGG_SIZES, EGGS_PER_TRAY } from "../../utils/constants";
import { ArrowLeft, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TindahanStock = () => {
  const { stock, loading } = useTindahanStock();
  const navigate = useNavigate();

  if (loading) return <LoadingSpinner message="Loading tindahan stock..." />;

  let totalPieces = 0;
  EGG_SIZES.forEach((size) => {
    const data = stock[size.id];
    if (data) totalPieces += toTotalPieces(data.trays, data.pieces);
  });

  return (
    <div className="min-h-screen bg-sunshine-50 pb-24">
      <header className="bg-blue-600 text-white px-4 py-5 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin")} className="p-2 bg-blue-500 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold">Tindahan Stock</h1>
            <p className="text-blue-100 text-xs">Selling point inventory (read-only)</p>
          </div>
        </div>
      </header>

      <div className="px-4 mt-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-center">
          <Store className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <p className="text-xs text-blue-600 font-medium">Total at Tindahan</p>
          <p className="text-3xl font-extrabold text-blue-900">{Math.floor(totalPieces / EGGS_PER_TRAY)}</p>
          <p className="text-[10px] text-blue-400">trays</p>
        </div>
      </div>

      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold text-sunshine-700 mb-3 uppercase tracking-wide">Per Size</h2>
        <div className="grid grid-cols-2 gap-3">
          {EGG_SIZES.map((size) => {
            const data = stock[size.id] || { trays: 0, pieces: 0 };
            return (
              <StockCard key={size.id} sizeName={size.name} short={size.short}
                         trays={data.trays} pieces={data.pieces} />
            );
          })}
        </div>
      </div>

      <Navbar role="admin" />
    </div>
  );
};

export default TindahanStock;