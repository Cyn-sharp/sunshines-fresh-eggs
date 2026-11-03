import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useBodegaStock, adjustBodegaStock } from "../../hooks/useInventory";
import Navbar from "../shared/Navbar";
import LoadingSpinner from "../shared/LoadingSpinner";
import { ArrowLeft, Save, CheckCircle, AlertCircle } from "lucide-react";
import { EGG_SIZES, EGGS_PER_TRAY } from "../../utils/constants";

const REASONS = [
  { id: "correction", label: "✏️ Correction (wrong entry)" },
  { id: "breakage", label: "🥚 Breakage / Spoilage" },
  { id: "initial", label: "📦 Initial Setup" },
  { id: "other", label: "📝 Other" },
];

const AdjustStock = () => {
  const { sizeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { stock, loading } = useBodegaStock();

  const sizeInfo = EGG_SIZES.find((s) => s.id === sizeId);
  const current = stock[sizeId] || { trays: 0, pieces: 0 };

  const [newTrays, setNewTrays] = useState(current.trays);
  const [newPieces, setNewPieces] = useState(current.pieces);
  const [reason, setReason] = useState("correction");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (loading) return <LoadingSpinner />;
  if (!sizeInfo) return <div className="p-8 text-center">Size not found.</div>;

  const oldTotal = current.trays * EGGS_PER_TRAY + current.pieces;
  const newTotal = newTrays * EGGS_PER_TRAY + newPieces;
  const diff = newTotal - oldTotal;

  const handleSave = async () => {
    setError("");
    setIsSaving(true);
    try {
      await adjustBodegaStock(sizeId, newTrays, newPieces, reason, currentUser.uid);
      setSuccess(true);
      setTimeout(() => navigate("/admin/bodega"), 1500);
    } catch (err) {
      setError(err.message || "Failed to adjust.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-sunshine-50 pb-28">
      <header className="bg-sunshine-600 text-white px-4 py-5 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/bodega")} className="p-2 bg-sunshine-500 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold">Adjust {sizeInfo.name}</h1>
            <p className="text-sunshine-100 text-xs">Edit bodega stock directly</p>
          </div>
        </div>
      </header>

      {success && (
        <div className="mx-4 mt-4 flex items-center gap-2 bg-green-50 border-2 border-green-300 text-green-700 rounded-xl px-4 py-3">
          <CheckCircle className="w-5 h-5" />
          <span className="font-bold text-sm">Stock adjusted! Redirecting...</span>
        </div>
      )}
      {error && (
        <div className="mx-4 mt-4 flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="px-4 mt-6 space-y-5">
        {/* Current Stock */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-sunshine-200">
          <p className="text-xs font-semibold text-sunshine-500 uppercase mb-2">Current Stock</p>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-sunshine-900">{current.trays}</p>
              <p className="text-[10px] text-sunshine-500">trays</p>
            </div>
            <p className="text-sunshine-300 font-bold">+</p>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-sunshine-900">{current.pieces}</p>
              <p className="text-[10px] text-sunshine-500">pieces</p>
            </div>
            <p className="text-sunshine-300 font-bold">=</p>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-sunshine-900">{oldTotal}</p>
              <p className="text-[10px] text-sunshine-500">total pcs</p>
            </div>
          </div>
        </div>

        {/* New Stock Input */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-sunshine-500 uppercase mb-3">Set New Stock</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-sunshine-700">Trays</label>
              <input type="number" value={newTrays}
                onChange={(e) => setNewTrays(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full mt-1 px-3 py-3 text-xl font-extrabold text-center rounded-xl border-2 border-sunshine-200 focus:border-sunshine-500 focus:outline-none"
                min="0" />
            </div>
            <div>
              <label className="text-xs font-bold text-sunshine-700">Pieces</label>
              <input type="number" value={newPieces}
                onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0 && v < EGGS_PER_TRAY) setNewPieces(v); }}
                className="w-full mt-1 px-3 py-3 text-xl font-extrabold text-center rounded-xl border-2 border-sunshine-200 focus:border-sunshine-500 focus:outline-none"
                min="0" max={EGGS_PER_TRAY - 1} />
            </div>
          </div>

          {/* Difference */}
          <div className={`mt-3 rounded-xl p-3 text-center ${diff === 0 ? "bg-gray-50" : diff > 0 ? "bg-green-50" : "bg-red-50"}`}>
            <p className="text-xs text-sunshine-500">Change</p>
            <p className={`text-lg font-extrabold ${diff === 0 ? "text-gray-500" : diff > 0 ? "text-green-700" : "text-red-700"}`}>
              {diff === 0 ? "No change" : diff > 0 ? `+${diff} pieces` : `${diff} pieces`}
            </p>
            <p className="text-[10px] text-sunshine-400">{newTotal} total pieces</p>
          </div>
        </div>

        {/* Reason */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-sunshine-500 uppercase mb-3">Reason</p>
          <div className="space-y-2">
            {REASONS.map((r) => (
              <button key={r.id} type="button" onClick={() => setReason(r.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all
                  ${reason === r.id ? "border-sunshine-500 bg-sunshine-50 text-sunshine-800" : "border-sunshine-100 text-sunshine-600"}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={isSaving || diff === 0}
          className="w-full flex items-center justify-center gap-2 bg-sunshine-600 hover:bg-sunshine-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-xl shadow-md active:scale-[0.98] text-lg">
          {isSaving ? "Saving..." : <><Save className="w-5 h-5" />Save Adjustment</>}
        </button>
      </div>

      <Navbar role="admin" />
    </div>
  );
};

export default AdjustStock;