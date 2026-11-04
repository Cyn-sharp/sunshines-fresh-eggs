import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { EGG_SIZES, EGGS_PER_TRAY, DISCREPANCY_THRESHOLD } from "../../utils/constants";
import { toTotalPieces } from "../../hooks/useInventory";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

const AuditCalendar = ({ onClose }) => {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchAudit = async () => {
      setLoading(true);
      setNotFound(false);
      setAudit(null);
      try {
        const snap = await getDoc(doc(db, "dailyAudits", selectedDate));
        if (snap.exists()) {
          setAudit({ id: snap.id, ...snap.data() });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, [selectedDate]);

  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-3xl max-h-[85vh] overflow-y-auto pb-8">
        {/* Header */}
        <div className="sticky top-0 bg-white px-4 pt-5 pb-3 border-b flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sunshine-600" />
            <h2 className="text-lg font-extrabold text-sunshine-900">Past Audits</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Date Picker */}
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between bg-sunshine-50 rounded-2xl p-3">
            <button onClick={() => shiftDate(-1)} className="p-2 bg-white rounded-full shadow-sm">
              <ChevronLeft className="w-5 h-5 text-sunshine-700" />
            </button>
            <div className="text-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={today}
                className="bg-transparent text-center font-extrabold text-sunshine-900 text-lg border-none outline-none cursor-pointer"
              />
              <p className="text-[10px] text-sunshine-500">{formatDate(selectedDate)}</p>
            </div>
            <button onClick={() => shiftDate(1)} className="p-2 bg-white rounded-full shadow-sm"
              disabled={selectedDate >= today}>
              <ChevronRight className="w-5 h-5 text-sunshine-700" />
            </button>
          </div>
        </div>

        {/* Audit Data */}
        <div className="px-4 mt-4">
          {loading && (
            <div className="text-center py-8 text-sunshine-400">Loading...</div>
          )}

          {notFound && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-400 font-medium">No audit for this date</p>
              <p className="text-xs text-gray-300 mt-1">Try another date</p>
            </div>
          )}

          {audit && !loading && (
            <div className="space-y-3">
              {/* Status + Discrepancy */}
              <div className={`rounded-2xl p-4 text-center border-2 ${
                audit.discrepancyPct <= DISCREPANCY_THRESHOLD
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}>
                <p className="text-xs font-medium text-sunshine-600">Discrepancy</p>
                <p className={`text-3xl font-extrabold ${
                  audit.discrepancyPct <= DISCREPANCY_THRESHOLD ? "text-green-700" : "text-red-700"
                }`}>
                  {audit.discrepancyPct}%
                </p>
                <p className={`text-[10px] mt-1 ${
                  audit.status === "approved" ? "text-green-600 font-bold" :
                  audit.status === "flagged" ? "text-red-600 font-bold" :
                  "text-sunshine-500"
                }`}>
                  {audit.status === "approved" ? "✅ Approved" :
                   audit.status === "flagged" ? "🔴 Flagged" : "⏳ Pending"}
                </p>
              </div>

              {/* Halin */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                  <p className="text-[10px] text-sunshine-500">Expected</p>
                  <p className="text-lg font-extrabold text-sunshine-900">₱{audit.totalExpectedHalin?.toFixed(0)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                  <p className="text-[10px] text-sunshine-500">Actual Halin</p>
                  <p className="text-lg font-extrabold text-green-700">₱{audit.actualHalin?.toFixed(0)}</p>
                </div>
              </div>

              {/* Per Size */}
              <div>
                <h3 className="text-xs font-bold text-sunshine-700 uppercase tracking-wide mb-2">Per Size</h3>
                <div className="space-y-1">
                  {EGG_SIZES.map((size) => {
                    const data = audit.perSize?.[size.id];
                    if (!data || data.soldPieces === 0) return null;
                    const soldTrays = Math.floor(data.soldPieces / EGGS_PER_TRAY);
                    return (
                      <div key={size.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-sunshine-600 bg-sunshine-100 px-1.5 py-0.5 rounded">{size.short}</span>
                          <span className="text-sm font-bold text-sunshine-900">{size.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-green-700">₱{data.expectedHalin?.toFixed(0)}</p>
                          <p className="text-[10px] text-sunshine-400">{soldTrays} trays sold</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-sunshine-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-sunshine-500">Total Sold</p>
                <p className="text-lg font-extrabold text-sunshine-900">
                  {Math.floor((audit.totalSoldPieces || 0) / EGGS_PER_TRAY)} trays
                </p>
              </div>

              {audit.adminNotes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-amber-600">Admin Notes</p>
                  <p className="text-xs text-amber-800 mt-1">{audit.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditCalendar;