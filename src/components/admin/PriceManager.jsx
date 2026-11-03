import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useEggPrices } from "../../hooks/useAudit";
import Navbar from "../shared/Navbar";
import LoadingSpinner from "../shared/LoadingSpinner";
import { ArrowLeft, Save, CheckCircle, PhilippinePeso } from "lucide-react";
import { EGG_SIZES } from "../../utils/constants";

const PriceManager = () => {
  const navigate = useNavigate();
  const { prices, loading } = useEggPrices();
  const [edited, setEdited] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      const init = {};
      EGG_SIZES.forEach((s) => {
        const p = prices[s.id];
        init[s.id] = { pricePerTray: p?.pricePerTray || 0, pricePerPiece: p?.pricePerPiece || 0 };
      });
      setEdited(init);
    }
  }, [prices]);

  const handleChange = (sizeId, field, value) => {
    setEdited((prev) => ({ ...prev, [sizeId]: { ...prev[sizeId], [field]: Math.max(0, parseFloat(value) || 0) } }));
    setHasChanges(true);
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const s of EGG_SIZES) {
        const p = edited[s.id];
        if (p) await updateDoc(doc(db, "eggSizes", s.id), { pricePerTray: p.pricePerTray, pricePerPiece: p.pricePerPiece });
      }
      setSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner message="Loading prices..." />;

  return (
    <div className="min-h-screen bg-sunshine-50 pb-28">
      <header className="bg-sunshine-600 text-white px-4 py-5 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin")} className="p-2 bg-sunshine-500 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-lg font-extrabold">Price Manager</h1>
            <p className="text-sunshine-100 text-xs">Set prices for halin calculation</p>
          </div>
        </div>
      </header>

      {success && (
        <div className="mx-4 mt-4 flex items-center gap-2 bg-green-50 border-2 border-green-300 text-green-700 rounded-xl px-4 py-3">
          <CheckCircle className="w-5 h-5" /><span className="font-bold text-sm">Prices saved!</span>
        </div>
      )}

      <div className="px-4 mt-6 space-y-3">
        {EGG_SIZES.map((size) => {
          const p = edited[size.id] || { pricePerTray: 0, pricePerPiece: 0 };
          return (
            <div key={size.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-sunshine-100 text-sunshine-700 flex items-center justify-center text-xs font-bold">{size.short}</div>
                <h3 className="font-bold text-sunshine-900">{size.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-sunshine-500 uppercase">Per Tray (30)</label>
                  <div className="flex items-center gap-1 mt-1">
                    <PhilippinePeso className="w-4 h-4 text-sunshine-400" />
                    <input type="number" value={p.pricePerTray} onChange={(e) => handleChange(size.id, "pricePerTray", e.target.value)}
                      className="w-full px-2 py-2 rounded-lg border-2 border-sunshine-200 focus:border-sunshine-500 focus:outline-none text-sm font-bold" min="0" step="0.5" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-sunshine-500 uppercase">Per Piece</label>
                  <div className="flex items-center gap-1 mt-1">
                    <PhilippinePeso className="w-4 h-4 text-sunshine-400" />
                    <input type="number" value={p.pricePerPiece} onChange={(e) => handleChange(size.id, "pricePerPiece", e.target.value)}
                      className="w-full px-2 py-2 rounded-lg border-2 border-sunshine-200 focus:border-sunshine-500 focus:outline-none text-sm font-bold" min="0" step="0.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button — extra margin so navbar doesn't cover it */}
      <div className="px-4 mt-6 mb-4">
        <button onClick={handleSave} disabled={saving || !hasChanges}
          className="w-full flex items-center justify-center gap-2 bg-sunshine-600 hover:bg-sunshine-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-xl shadow-md active:scale-[0.98]">
          {saving ? "Saving..." : hasChanges ? "💾 Save Changes" : "No Changes"}
        </button>
      </div>

      <Navbar role="admin" />
    </div>
  );
};

export default PriceManager;