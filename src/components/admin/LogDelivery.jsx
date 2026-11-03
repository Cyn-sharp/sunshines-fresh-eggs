import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { logDelivery } from "../../hooks/useInventory";
import EggSizePicker from "../shared/EggSizePicker";
import TrayPieceInput from "../shared/TrayPieceInput";
import Navbar from "../shared/Navbar";
import { ArrowLeft, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { EGG_SIZES } from "../../utils/constants";

const LogDelivery = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState("large");
  const [trays, setTrays] = useState(0);
  const [pieces, setPieces] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const sizeName = EGG_SIZES.find((s) => s.id === selectedSize)?.name || "";

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
      await logDelivery(selectedSize, trays, pieces, currentUser.uid);
      setSuccess(true);
      setTimeout(() => { setTrays(0); setPieces(0); setSuccess(false); }, 2000);
    } catch (err) {
      setError(err.message || "Failed to log delivery.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sunshine-50 pb-24">
      <header className="bg-green-600 text-white px-4 py-5 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin")} className="p-2 bg-green-500 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold">Log Delivery</h1>
            <p className="text-green-100 text-xs">Record new supply to bodega</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 mt-6 space-y-6">
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border-2 border-green-300 
                          text-green-700 rounded-xl px-4 py-3 animate-pulse">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold text-sm">Delivery logged! {sizeName} updated.</span>
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
          <p className="text-center text-sm text-sunshine-600 mt-2 font-semibold">
            Selected: {sizeName}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-sunshine-700 mb-3 uppercase tracking-wide">
            Step 2: Enter Quantity
          </h2>
          <TrayPieceInput trays={trays} pieces={pieces}
                          onTraysChange={setTrays} onPiecesChange={setPieces} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (trays === 0 && pieces === 0)}
          className="w-full flex items-center justify-center gap-2
                     bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500
                     text-white font-bold py-4 rounded-xl shadow-md active:scale-[0.98] text-lg"
        >
          {isSubmitting ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Logging...</>
          ) : (
            <><Truck className="w-6 h-6" />Log Delivery to Bodega</>
          )}
        </button>
      </form>

      <Navbar role="admin" />
    </div>
  );
};

export default LogDelivery;