import { useTindahanStock, toTotalPieces } from "../../hooks/useInventory";
import StockCard from "../shared/StockCard";
import Navbar from "../shared/Navbar";
import LoadingSpinner from "../shared/LoadingSpinner";
import { EGG_SIZES } from "../../utils/constants";
import { ArrowLeft, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TinderoStock = () => {
  const { stock, loading } = useTindahanStock();
  const navigate = useNavigate();

  if (loading) return <LoadingSpinner message="Loading stock..." />;

  let totalPieces = 0;
  EGG_SIZES.forEach((size) => {
    const data = stock[size.id];
    if (data) totalPieces += toTotalPieces(data.trays, data.pieces);
  });

  return (
    <div className="min-h-screen bg-sunshine-50 pb-24">
      <header className="bg-sunshine-500 text-white px-4 py-5 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/tindero")} className="p-2 bg-sunshine-400 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold">Tindahan Stock</h1>
            <p className="text-sunshine-100 text-xs">Current selling inventory</p>
          </div>
        </div>
      </header>

      <div className="px-4 mt-4">
        <div className="bg-sunshine-100 border-2 border-sunshine-300 rounded-2xl p-4 text-center">
          <Store className="w-6 h-6 text-sunshine-600 mx-auto mb-1" />
          <p className="text-xs text-sunshine-600 font-medium">Total at Tindahan</p>
          <p className="text-3xl font-extrabold text-sunshine-900">{totalPieces.toLocaleString()}</p>
          <p className="text-[10px] text-sunshine-500">pieces</p>
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

      <Navbar role="tindero" />
    </div>
  );
};

export default TinderoStock;