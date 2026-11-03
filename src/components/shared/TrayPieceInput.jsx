import { useState } from "react";
import { Minus, Plus, Layers } from "lucide-react";
import { EGGS_PER_TRAY } from "../../utils/constants";

const TRAYS_PER_PILE = 10;

const TrayPieceInput = ({ trays, pieces, onTraysChange, onPiecesChange }) => {
  const [usePiles, setUsePiles] = useState(false);
  const totalPieces = trays * EGGS_PER_TRAY + pieces;

  // Convert between piles and trays for display
  const displayTrays = usePiles ? Math.floor(trays / TRAYS_PER_PILE) : trays;
  const remainderTrays = usePiles ? trays % TRAYS_PER_PILE : 0;

  const adjustTrays = (delta) => {
    const actualDelta = usePiles ? delta * TRAYS_PER_PILE : delta;
    const newVal = trays + actualDelta;
    if (newVal < 0) return;
    onTraysChange(newVal);
  };

  const adjustPieces = (delta) => {
    const newVal = pieces + delta;
    if (newVal < 0 || newVal >= EGGS_PER_TRAY) return;
    onPiecesChange(newVal);
  };

  const handleTrayInput = (value) => {
    const num = Math.max(0, parseInt(value) || 0);
    if (usePiles) {
      onTraysChange(num * TRAYS_PER_PILE + remainderTrays);
    } else {
      onTraysChange(num);
    }
  };

  return (
    <div className="space-y-4">
      {/* Piles Toggle */}
      <button
        type="button"
        onClick={() => setUsePiles(!usePiles)}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-bold text-sm transition-all
          ${usePiles
            ? "bg-blue-50 border-blue-300 text-blue-700"
            : "bg-sunshine-50 border-sunshine-200 text-sunshine-600"
          }`}
      >
        <Layers className="w-4 h-4" />
        {usePiles
          ? "📦 Piles Mode ON (1 pile = 10 trays)"
          : "🥚 Tray Mode (tap to switch to Piles)"
        }
      </button>

      {usePiles && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 text-center">
          <p className="text-xs text-blue-600">
            Type <strong>5</strong> = 50 trays • Type <strong>3</strong> = 30 trays
          </p>
          {remainderTrays > 0 && (
            <p className="text-[10px] text-blue-500 mt-1">
              + {remainderTrays} extra trays (from tray mode)
            </p>
          )}
        </div>
      )}

      {/* Trays / Piles */}
      <div>
        <label className="block text-sm font-bold text-sunshine-700 mb-2">
          {usePiles ? "Piles" : "Trays"}
          <span className="text-sunshine-400 font-normal text-xs ml-1">
            {usePiles ? `(${TRAYS_PER_PILE} trays each)` : `(${EGGS_PER_TRAY} eggs each)`}
          </span>
        </label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => adjustTrays(-1)} disabled={displayTrays === 0}
            className="w-12 h-12 rounded-xl bg-sunshine-100 text-sunshine-700 flex items-center justify-center disabled:opacity-30 active:scale-95">
            <Minus className="w-5 h-5" />
          </button>
          <input type="number" value={displayTrays}
            onChange={(e) => handleTrayInput(e.target.value)}
            className="flex-1 text-center text-2xl font-extrabold text-sunshine-900 bg-sunshine-50 border-2 border-sunshine-200 rounded-xl py-2 focus:border-sunshine-500 focus:outline-none"
            min="0" />
          <button type="button" onClick={() => adjustTrays(1)}
            className="w-12 h-12 rounded-xl bg-sunshine-500 text-white flex items-center justify-center active:scale-95">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {usePiles && (
          <p className="text-xs text-sunshine-500 text-center mt-1">
            = <strong>{trays}</strong> trays total
          </p>
        )}
      </div>

      {/* Pieces */}
      <div>
        <label className="block text-sm font-bold text-sunshine-700 mb-2">
          Pieces <span className="text-sunshine-400 font-normal text-xs">(menudo, 0-{EGGS_PER_TRAY - 1})</span>
        </label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => adjustPieces(-1)} disabled={pieces === 0}
            className="w-12 h-12 rounded-xl bg-sunshine-100 text-sunshine-700 flex items-center justify-center disabled:opacity-30 active:scale-95">
            <Minus className="w-5 h-5" />
          </button>
          <input type="number" value={pieces}
            onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0 && v < EGGS_PER_TRAY) onPiecesChange(v); }}
            className="flex-1 text-center text-2xl font-extrabold text-sunshine-900 bg-sunshine-50 border-2 border-sunshine-200 rounded-xl py-2 focus:border-sunshine-500 focus:outline-none"
            min="0" max={EGGS_PER_TRAY - 1} />
          <button type="button" onClick={() => adjustPieces(1)} disabled={pieces >= EGGS_PER_TRAY - 1}
            className="w-12 h-12 rounded-xl bg-sunshine-500 text-white flex items-center justify-center disabled:opacity-30 active:scale-95">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="bg-sunshine-100 rounded-xl p-3 text-center">
        <p className="text-sm text-sunshine-700">
          Total: <span className="text-lg font-extrabold text-sunshine-900">{totalPieces}</span> pieces
          <span className="text-xs text-sunshine-500 ml-1">({trays}T + {pieces}p)</span>
        </p>
      </div>
    </div>
  );
};

export default TrayPieceInput;