import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { transferStock, useBodegaStock, toTotalPieces } from "../../hooks/useInventory";
import EggSizePicker from "../shared/EggSizePicker";
import TrayPieceInput from "../shared/TrayPieceInput";
import Navbar from "../shared/Navbar";
import LoadingSpinner from "../shared/LoadingSpinner";
import { ArrowLeft, ArrowRightLeft, CheckCircle, AlertCircle, Package } from "lucide-react";
import { EGG_SIZES, EGGS_PER_TRAY } from "../../utils/constants";

const LogTransfer = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { stock: bodega, loading } = useBodegaStock();
  const [selectedSize, setSelectedSize] = useState("large");
  const [trays, setTrays] = useState(0);
  const [pieces, setPieces] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (loading) return <LoadingSpinner message="Loading bodega stock..." />;

  const sizeName = EGG_SIZES.find((s) => s.id === selectedSize)?.name || "";
  const bData = bodega[selectedSize] || { trays: 0, pieces: 0 };
  const bTotal = toTotalPieces(bData.trays, bData.pieces);
  const bTrays = Math.floor(bTotal / EGGS_PER_TRAY);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (trays === 0 && pieces === 0) {
      setError("Please enter at least 1 tray or 1 piece.");
      return;
    }
    setIsSubmitting(true);
    try {
      await transferStock(selectedSize, trays, pieces, currentUser.uid);
      setSuccess(true);
      setTimeout(() => { setTrays(0); setPieces(0); setSuccess(false); }, 2000);
    } catch (err) {
      setError(err.message || "Transfer failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sunshine-50 pb-24">
      <header className="bg-blue-600 text-white px-4 py-5 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/tindero")} className="p-2 bg-blue-500 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold">Get Eggs from Bodega</h1>
            <p className="text-blue-100 text-xs">Transfer stock to tindahan</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 mt-6 space-y-6">
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border-2 border-green-300 
                          text-green-700 rounded-xl px-4 py-3 animate-pulse">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold text-sm">Transferred! {sizeName} moved to tindahan.</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 
                          text-red-700 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold text-sunshine-700 mb-3 uppercase tracking-wide">
            Step 1: Select Egg Size
          </h2>
          <EggSizePicker selectedSize={selectedSize} onSelect={setSelectedSize} />
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-blue-800">Available in Bodega ({sizeName})</h3>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-blue-900">{bTrays}</p>
            <p className="text-[10px] text-blue-500">trays available</p>
          </div>
          {bTrays === 0 && (
            <p className="text-red-500 text-xs font-bold mt-2 text-center">
              ⚠️ Out of stock! Ask admin to order more.
            </p>
          )}
        </div>

        <div>
          <h2 className="text-sm font-bold text-sunshine-700 mb-3 uppercase tracking-wide">
            Step 2: How much to transfer?
          </h2>
          <TrayPieceInput trays={trays} pieces={pieces}
                          onTraysChange={setTrays} onPiecesChange={setPieces} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (trays === 0 && pieces === 0) || bTotal === 0}
          className="w-full flex items-center justify-center gap-2
                     bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500
                     text-white font-bold py-4 rounded-xl shadow-md active:scale-[0.98] text-lg"
        >
          {isSubmitting ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Transferring...</>
          ) : (
            <><ArrowRightLeft className="w-6 h-6" />Transfer to Tindahan</>
          )}
        </button>
      </form>

      <Navbar role="tindero" />
    </div>
  );
};

export default LogTransfer;