// src/components/shared/TrayPieceInput.jsx
import { Minus, Plus } from "lucide-react";
import { EGGS_PER_TRAY } from "../../utils/constants";

const TrayPieceInput = ({ trays, pieces, onTraysChange, onPiecesChange, maxTrays, maxPieces }) => {
  const totalPieces = trays * EGGS_PER_TRAY + pieces;

  const adjustTrays = (delta) => {
    const newVal = trays + delta;
    if (newVal < 0) return;
    if (maxTrays !== undefined && newVal > maxTrays) return;
    onTraysChange(newVal);
  };

  const adjustPieces = (delta) => {
    const newVal = pieces + delta;
    if (newVal < 0) return;
    if (maxPieces !== undefined && newVal > maxPieces) return;
    // Don't allow pieces >= 30 (should be a tray instead)
    if (newVal >= EGGS_PER_TRAY) return;
    onPiecesChange(newVal);
  };

  return (
    <div className="space-y-4">
      {/* Trays */}
      <div>
        <label className="block text-sm font-bold text-sunshine-700 mb-2">
          Trays <span className="text-sunshine-400 font-normal">({EGGS_PER_TRAY} pcs each)</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => adjustTrays(-1)}
            disabled={trays === 0}
            className="w-12 h-12 rounded-xl bg-sunshine-100 text-sunshine-700 
                       flex items-center justify-center
                       disabled:opacity-30 active:scale-95 transition-all"
          >
            <Minus className="w-5 h-5" />
          </button>

          <input
            type="number"
            value={trays}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              if (val >= 0 && (maxTrays === undefined || val <= maxTrays)) {
                onTraysChange(val);
              }
            }}
            className="flex-1 text-center text-2xl font-extrabold text-sunshine-900
                       bg-sunshine-50 border-2 border-sunshine-200 rounded-xl py-2
                       focus:border-sunshine-500 focus:outline-none"
            min="0"
            max={maxTrays}
          />

          <button
            type="button"
            onClick={() => adjustTrays(1)}
            disabled={maxTrays !== undefined && trays >= maxTrays}
            className="w-12 h-12 rounded-xl bg-sunshine-500 text-white 
                       flex items-center justify-center
                       disabled:opacity-30 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pieces (Menudo) */}
      <div>
        <label className="block text-sm font-bold text-sunshine-700 mb-2">
          Pieces <span className="text-sunshine-400 font-normal">(menudo, 0-{EGGS_PER_TRAY - 1})</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => adjustPieces(-1)}
            disabled={pieces === 0}
            className="w-12 h-12 rounded-xl bg-sunshine-100 text-sunshine-700 
                       flex items-center justify-center
                       disabled:opacity-30 active:scale-95 transition-all"
          >
            <Minus className="w-5 h-5" />
          </button>

          <input
            type="number"
            value={pieces}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              if (val >= 0 && val < EGGS_PER_TRAY) {
                onPiecesChange(val);
              }
            }}
            className="flex-1 text-center text-2xl font-extrabold text-sunshine-900
                       bg-sunshine-50 border-2 border-sunshine-200 rounded-xl py-2
                       focus:border-sunshine-500 focus:outline-none"
            min="0"
            max={EGGS_PER_TRAY - 1}
          />

          <button
            type="button"
            onClick={() => adjustPieces(1)}
            disabled={pieces >= EGGS_PER_TRAY - 1}
            className="w-12 h-12 rounded-xl bg-sunshine-500 text-white 
                       flex items-center justify-center
                       disabled:opacity-30 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Total Preview */}
      <div className="bg-sunshine-100 rounded-xl p-3 text-center">
        <p className="text-sm text-sunshine-700">
          Total: <span className="text-lg font-extrabold text-sunshine-900">{totalPieces}</span> pieces
        </p>
      </div>
    </div>
  );
};

export default TrayPieceInput;