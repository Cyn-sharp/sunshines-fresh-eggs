import { useBodegaStock, useTindahanStock, toTotalPieces } from "../../hooks/useInventory";
import StockCard from "../shared/StockCard";
import Navbar from "../shared/Navbar";
import LoadingSpinner from "../shared/LoadingSpinner";
import { EGG_SIZES } from "../../utils/constants";
import { ArrowLeft, Package, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BodegaStock = () => {
  const { stock: bodega, loading: bLoading } = useBodegaStock();
  const { stock: tindahan, loading: tLoading } = useTindahanStock();
  const navigate = useNavigate();

  if (bLoading || tLoading) return <LoadingSpinner message="Loading inventory..." />;

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
      <header className="bg-sunshine-500 text-white px-4 py-5 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin")} className="p-2 bg-sunshine-400 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold">Bodega Stock</h1>
            <p className="text-sunshine-100 text-xs">Warehouse inventory</p>
          </div>
        </div>
      </header>

      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-center">
          <Package className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-xs text-blue-600 font-medium">Bodega</p>
          <p className="text-2xl font-extrabold text-blue-900">{totalBodega.toLocaleString()}</p>
          <p className="text-[10px] text-blue-400">total pieces</p>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
          <Store className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-xs text-green-600 font-medium">Tindahan</p>
          <p className="text-2xl font-extrabold text-green-900">{totalTindahan.toLocaleString()}</p>
          <p className="text-[10px] text-green-400">total pieces</p>
        </div>
      </div>

      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold text-sunshine-700 mb-3 uppercase tracking-wide">
          Per Size — Bodega
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {EGG_SIZES.map((size) => {
            const data = bodega[size.id] || { trays: 0, pieces: 0 };
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

export default BodegaStock;