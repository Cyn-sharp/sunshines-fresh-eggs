import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTindahanStock } from "../../hooks/useInventory";
import {
  useEggPrices,
  useTodayTransfers,
  useTodayAudit,
  useLatestAudit,
  submitClosingAudit,
} from "../../hooks/useAudit";
import Navbar from "../shared/Navbar";
import LoadingSpinner from "../shared/LoadingSpinner";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  PhilippinePeso,
  ClipboardCheck,
  Package,
  ArrowDown,
} from "lucide-react";
import { EGG_SIZES, EGGS_PER_TRAY, DISCREPANCY_THRESHOLD } from "../../utils/constants";
import { toTotalPieces } from "../../hooks/useInventory";

const ClosingCount = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { stock: tindahan, loading: stockLoading } = useTindahanStock();
  const { prices, loading: pricesLoading } = useEggPrices();
  const { transfers, loading: transfersLoading } = useTodayTransfers();
  const { audit: todayAudit, loading: auditLoading } = useTodayAudit();
  const { latestAudit } = useLatestAudit();

  // Closing counts per size
  const [closing, setClosing] = useState({});
  const [halin, setHalin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Initialize closing counts
  useEffect(() => {
    const init = {};
    EGG_SIZES.forEach((s) => {
      init[s.id] = { trays: 0, pieces: 0 };
    });
    setClosing(init);
  }, []);

  const loading = stockLoading || pricesLoading || transfersLoading || auditLoading;
  if (loading) return <LoadingSpinner message="Loading audit data..." />;

  // If already submitted today, show the result
  if (todayAudit && !result) {
    setResult(todayAudit);
  }

  // Calculate opening stock
  // If there's a previous audit, opening = that audit's closing
  // Otherwise, opening = current tindahan stock (first day)
  const getOpening = (sizeId) => {
    if (latestAudit && latestAudit.perSize && latestAudit.perSize[sizeId]) {
      return latestAudit.perSize[sizeId].closing;
    }
    const t = tindahan[sizeId];
    return t ? { trays: t.trays, pieces: t.pieces } : { trays: 0, pieces: 0 };
  };

  const updateClosing = (sizeId, field, delta) => {
    setClosing((prev) => {
      const current = prev[sizeId] || { trays: 0, pieces: 0 };
      let newVal = current[field] + delta;
      if (newVal < 0) newVal = 0;
      if (field === "pieces" && newVal >= EGGS_PER_TRAY) newVal = EGGS_PER_TRAY - 1;
      return { ...prev, [sizeId]: { ...current, [field]: newVal } };
    });
  };

  const handleSubmit = async () => {
    setError("");
    setResult(null);

    const halinNum = parseFloat(halin);
    if (isNaN(halinNum) || halinNum < 0) {
      setError("Please enter a valid halin amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Build opening stock
      const openingStock = {};
      EGG_SIZES.forEach((s) => {
        openingStock[s.id] = getOpening(s.id);
      });

      const auditData = await submitClosingAudit(
        closing,
        halinNum,
        prices,
        openingStock,
        transfers,
        currentUser.uid
      );

      setResult(auditData);
    } catch (err) {
      setError(err.message || "Failed to submit audit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // RESULT VIEW (after submission)
  // ============================================
  if (result) {
    const isNormal = result.discrepancyPct <= DISCREPANCY_THRESHOLD;
    return (
      <div className="min-h-screen bg-sunshine-50 pb-24">
        <header className={`px-4 py-5 rounded-b-3xl shadow-lg text-white ${isNormal ? "bg-green-600" : "bg-red-600"}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/tindero")} className={`p-2 rounded-full ${isNormal ? "bg-green-500" : "bg-red-500"}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-extrabold">Audit Result</h1>
              <p className={`text-xs ${isNormal ? "text-green-100" : "text-red-100"}`}>
                {isNormal ? "Within normal range ✅" : "Discrepancy detected ⚠️"}
              </p>
            </div>
          </div>
        </header>

        {/* Big Discrepancy Display */}
        <div className="px-4 mt-6">
          <div className={`rounded-2xl p-6 text-center border-2 ${isNormal ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
            <p className="text-sm font-medium text-sunshine-600">Discrepancy</p>
            <p className={`text-4xl font-extrabold ${isNormal ? "text-green-700" : "text-red-700"}`}>
              {result.discrepancyPct}%
            </p>
            <p className={`text-xs mt-1 ${isNormal ? "text-green-500" : "text-red-500"}`}>
              {isNormal ? `Normal (≤${DISCREPANCY_THRESHOLD}%)` : `Above ${DISCREPANCY_THRESHOLD}% threshold!`}
            </p>
          </div>
        </div>

        {/* Halin Comparison */}
        <div className="px-4 mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-[10px] text-sunshine-500 font-medium">Expected Halin</p>
            <p className="text-xl font-extrabold text-sunshine-900">₱{result.totalExpectedHalin?.toFixed(0)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-[10px] text-sunshine-500 font-medium">Actual Halin</p>
            <p className="text-xl font-extrabold text-green-700">₱{result.actualHalin?.toFixed(0)}</p>
          </div>
        </div>

        {/* Per Size Breakdown */}
        <div className="px-4 mt-6">
          <h2 className="text-sm font-bold text-sunshine-700 mb-3 uppercase tracking-wide">Per Size Breakdown</h2>
          <div className="space-y-2">
            {EGG_SIZES.map((size) => {
              const data = result.perSize?.[size.id];
              if (!data || data.soldPieces === 0) return null;
              return (
                <div key={size.id} className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-sunshine-600 bg-sunshine-100 px-2 py-0.5 rounded">{size.short}</span>
                      <span className="text-sm font-bold text-sunshine-900">{size.name}</span>
                    </div>
                    <span className="text-sm font-extrabold text-green-700">₱{data.expectedHalin?.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-sunshine-500">
                    <span>Open: {data.opening?.trays}T</span>
                    <span>+ Transfer: {data.transfers?.trays}T</span>
                    <span>- Close: {data.closing?.trays}T</span>
                    <span>= Sold: {data.sold?.trays}T {data.sold?.pieces}pcs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-4 mt-6">
          <p className="text-xs text-sunshine-400 text-center">
            Status: {result.status === "pending" ? "⏳ Waiting for admin review" : result.status === "approved" ? "✅ Approved" : "🔴 Flagged"}
          </p>
        </div>

        <Navbar role="tindero" />
      </div>
    );
  }

  // ============================================
  // FORM VIEW (before submission)
  // ============================================
  return (
    <div className="min-h-screen bg-sunshine-50 pb-24">
      <header className="bg-orange-600 text-white px-4 py-5 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/tindero")} className="p-2 bg-orange-500 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold">Closing Count</h1>
            <p className="text-orange-100 text-xs">End of shift audit — count remaining eggs</p>
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-4 flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Instructions */}
      <div className="px-4 mt-4">
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3">
          <p className="text-xs text-orange-700 font-medium">
            📋 Count the eggs remaining in the <strong>tindahan only</strong>. Do NOT count the bodega.
          </p>
        </div>
      </div>

      {/* Per-Size Closing Count */}
      <div className="px-4 mt-4 space-y-3">
        <h2 className="text-sm font-bold text-sunshine-700 uppercase tracking-wide">
          Step 1: Count Remaining Eggs
        </h2>

        {EGG_SIZES.map((size) => {
          const opening = getOpening(size.id);
          const transfer = transfers[size.id] || { trays: 0, pieces: 0 };
          const c = closing[size.id] || { trays: 0, pieces: 0 };
          const openingPcs = toTotalPieces(opening.trays, opening.pieces);
          const transferPcs = toTotalPieces(transfer.trays, transfer.pieces);
          const available = openingPcs + transferPcs;

          return (
            <div key={size.id} className="bg-white rounded-2xl p-4 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sunshine-600 bg-sunshine-100 px-2 py-0.5 rounded">{size.short}</span>
                  <span className="font-bold text-sunshine-900 text-sm">{size.name}</span>
                </div>
                <span className="text-[10px] text-sunshine-400">
                  Avail: {opening.trays + transfer.trays}T
                </span>
              </div>

              {/* Opening + Transfers (read-only) */}
              <div className="flex items-center gap-1 text-[10px] text-sunshine-500 mb-3 bg-sunshine-50 rounded-lg p-2">
                <span>Open: {opening.trays}T {opening.pieces}p</span>
                <span className="text-sunshine-300">+</span>
                <span>Transfer: {transfer.trays}T {transfer.pieces}p</span>
                <span className="text-sunshine-300">=</span>
                <span className="font-bold text-sunshine-700">{available} pcs</span>
              </div>

              {/* Closing Input */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-sunshine-500">Closing Trays</label>
                  <div className="flex items-center gap-1 mt-1">
                    <button type="button" onClick={() => updateClosing(size.id, "trays", -1)}
                      disabled={c.trays === 0}
                      className="w-9 h-9 rounded-lg bg-sunshine-100 text-sunshine-700 flex items-center justify-center disabled:opacity-30 text-lg font-bold">−</button>
                    <span className="flex-1 text-center text-xl font-extrabold text-sunshine-900">{c.trays}</span>
                    <button type="button" onClick={() => updateClosing(size.id, "trays", 1)}
                      className="w-9 h-9 rounded-lg bg-sunshine-500 text-white flex items-center justify-center text-lg font-bold">+</button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-sunshine-500">Closing Pieces</label>
                  <div className="flex items-center gap-1 mt-1">
                    <button type="button" onClick={() => updateClosing(size.id, "pieces", -1)}
                      disabled={c.pieces === 0}
                      className="w-9 h-9 rounded-lg bg-sunshine-100 text-sunshine-700 flex items-center justify-center disabled:opacity-30 text-lg font-bold">−</button>
                    <span className="flex-1 text-center text-xl font-extrabold text-sunshine-900">{c.pieces}</span>
                    <button type="button" onClick={() => updateClosing(size.id, "pieces", 1)}
                      disabled={c.pieces >= EGGS_PER_TRAY - 1}
                      className="w-9 h-9 rounded-lg bg-sunshine-500 text-white flex items-center justify-center disabled:opacity-30 text-lg font-bold">+</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step 2: Halin */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold text-sunshine-700 uppercase tracking-wide mb-3">
          Step 2: Total Halin (Cash Collected)
        </h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-xs font-semibold text-sunshine-500">Total money collected tonight</label>
          <div className="flex items-center gap-2 mt-2">
            <PhilippinePeso className="w-6 h-6 text-green-600" />
            <input
              type="number"
              value={halin}
              onChange={(e) => setHalin(e.target.value)}
              placeholder="0.00"
              className="flex-1 text-2xl font-extrabold text-green-800 bg-green-50 border-2 border-green-200 
                         rounded-xl px-3 py-3 focus:border-green-500 focus:outline-none"
              min="0"
              step="0.01"
            />
          </div>
          <p className="text-[10px] text-sunshine-400 mt-2">
            Count all the cash — one total amount for the whole shift
          </p>
        </div>
      </div>

      {/* Submit */}
      <div className="px-4 mt-6">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !halin}
          className="w-full flex items-center justify-center gap-2
                     bg-orange-600 hover:bg-orange-700
                     disabled:bg-gray-300 disabled:text-gray-500
                     text-white font-bold py-4 rounded-xl shadow-md active:scale-[0.98] text-lg"
        >
          {isSubmitting ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
          ) : (
            <><ClipboardCheck className="w-6 h-6" />Submit Closing Audit</>
          )}
        </button>
      </div>

      <Navbar role="tindero" />
    </div>
  );
};

export default ClosingCount;