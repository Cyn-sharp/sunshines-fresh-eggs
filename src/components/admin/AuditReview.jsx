import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTodayAudit, reviewAudit } from "../../hooks/useAudit";
import Navbar from "../shared/Navbar";
import LoadingSpinner from "../shared/LoadingSpinner";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, PhilippinePeso } from "lucide-react";
import { EGG_SIZES, DISCREPANCY_THRESHOLD } from "../../utils/constants";

const AuditReview = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { audit, loading } = useTodayAudit();
  const [notes, setNotes] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  if (loading) return <LoadingSpinner message="Loading audit..." />;

  if (!audit) {
    return (
      <div className="min-h-screen bg-sunshine-50 pb-24">
        <header className="bg-sunshine-600 text-white px-4 py-5 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin")} className="p-2 bg-sunshine-500 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-extrabold">Audit Review</h1>
          </div>
        </header>
        <div className="px-4 mt-8 text-center">
          <AlertTriangle className="w-12 h-12 text-sunshine-300 mx-auto mb-3" />
          <p className="text-sunshine-600 font-semibold">No audit submitted yet</p>
          <p className="text-sunshine-400 text-sm mt-1">Waiting for tindero to do the closing count</p>
        </div>
        <Navbar role="admin" />
      </div>
    );
  }

  const isNormal = audit.discrepancyPct <= DISCREPANCY_THRESHOLD;
  const isApproved = audit.status === "approved";

  const handleReview = async (status) => {
    setIsReviewing(true);
    try {
      await reviewAudit(audit.date, status, currentUser.uid, notes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="min-h-screen bg-sunshine-50 pb-24">
      <header className={`px-4 py-5 rounded-b-3xl shadow-lg text-white ${isApproved ? "bg-green-600" : isNormal ? "bg-sunshine-600" : "bg-red-600"}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin")} className={`p-2 rounded-full ${isApproved ? "bg-green-500" : isNormal ? "bg-sunshine-500" : "bg-red-500"}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold">Audit — {audit.date}</h1>
            <p className="text-xs opacity-80">
              {isApproved ? "✅ Approved" : audit.status === "flagged" ? "🔴 Flagged" : "⏳ Pending Review"}
            </p>
          </div>
        </div>
      </header>

      {/* Discrepancy */}
      <div className="px-4 mt-4">
        <div className={`rounded-2xl p-5 text-center border-2 ${isNormal ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <p className="text-xs text-sunshine-500 font-medium">Discrepancy</p>
          <p className={`text-4xl font-extrabold ${isNormal ? "text-green-700" : "text-red-700"}`}>
            {audit.discrepancyPct}%
          </p>
          <p className={`text-xs ${isNormal ? "text-green-500" : "text-red-500"}`}>
            {isNormal ? `Normal (≤${DISCREPANCY_THRESHOLD}%)` : `Above ${DISCREPANCY_THRESHOLD}%!`}
          </p>
        </div>
      </div>

      {/* Halin */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="text-[10px] text-sunshine-500">Expected Halin</p>
          <p className="text-xl font-extrabold text-sunshine-900">₱{audit.totalExpectedHalin?.toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="text-[10px] text-sunshine-500">Actual Halin</p>
          <p className="text-xl font-extrabold text-green-700">₱{audit.actualHalin?.toFixed(0)}</p>
        </div>
      </div>

      {/* Difference */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-xs text-sunshine-500">Difference</p>
          <p className={`text-lg font-extrabold ${Math.abs(audit.totalExpectedHalin - audit.actualHalin) > 0 ? "text-red-600" : "text-green-600"}`}>
            ₱{Math.abs(audit.totalExpectedHalin - audit.actualHalin).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Per Size */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold text-sunshine-700 mb-3 uppercase tracking-wide">Per Size</h2>
        <div className="space-y-2">
          {EGG_SIZES.map((size) => {
            const d = audit.perSize?.[size.id];
            if (!d || d.soldPieces === 0) return null;
            return (
              <div key={size.id} className="bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-sunshine-600 bg-sunshine-100 px-2 py-0.5 rounded">{size.short}</span>
                    <span className="text-sm font-bold">{size.name}</span>
                  </div>
                  <span className="text-sm font-extrabold text-green-700">₱{d.expectedHalin?.toFixed(0)}</span>
                </div>
                <p className="text-[10px] text-sunshine-400 mt-1">
                  Open {d.opening?.trays}T → +{d.transfers?.trays}T → Close {d.closing?.trays}T = Sold {d.sold?.trays}T {d.sold?.pieces}p
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Actions */}
      {!isApproved && (
        <div className="px-4 mt-6 space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes (optional)..."
            className="w-full px-3 py-2 rounded-xl border-2 border-sunshine-200 focus:border-sunshine-500 focus:outline-none text-sm"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleReview("approved")} disabled={isReviewing}
              className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 rounded-xl active:scale-[0.97]">
              <CheckCircle className="w-5 h-5" /> Approve
            </button>
            <button onClick={() => handleReview("flagged")} disabled={isReviewing}
              className="flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-xl active:scale-[0.97]">
              <XCircle className="w-5 h-5" /> Flag
            </button>
          </div>
        </div>
      )}

      {audit.adminNotes && (
        <div className="px-4 mt-4">
          <p className="text-xs text-sunshine-500">Admin notes: {audit.adminNotes}</p>
        </div>
      )}

      <Navbar role="admin" />
    </div>
  );
};

export default AuditReview;