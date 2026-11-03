// src/components/shared/StockCard.jsx
import { Egg } from "lucide-react";
import { toTotalPieces } from "../../hooks/useInventory";

const StockCard = ({ sizeName, short, trays, pieces, highlight }) => {
  const total = toTotalPieces(trays, pieces);
  const isLow = total > 0 && total <= 60; // 2 trays or less = low
  const isEmpty = total === 0;

  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all
        ${highlight ? "border-sunshine-400 shadow-md" : "border-transparent"}
        ${isEmpty ? "opacity-60" : ""}
        ${isLow ? "border-red-200 bg-red-50" : ""}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
              ${isEmpty ? "bg-gray-100 text-gray-400" : "bg-sunshine-100 text-sunshine-700"}
              ${isLow ? "bg-red-100 text-red-600" : ""}
            `}
          >
            {short}
          </div>
          <h3 className="font-bold text-sunshine-900 text-sm">{sizeName}</h3>
        </div>

        {isEmpty && (
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            EMPTY
          </span>
        )}
        {isLow && !isEmpty && (
          <span className="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
            LOW
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="bg-sunshine-50 rounded-xl p-2 text-center">
          <p className="text-[10px] text-sunshine-500 font-medium">Trays</p>
          <p className="text-xl font-extrabold text-sunshine-900">{trays}</p>
        </div>
        <div className="bg-sunshine-50 rounded-xl p-2 text-center">
          <p className="text-[10px] text-sunshine-500 font-medium">Pieces</p>
          <p className="text-xl font-extrabold text-sunshine-900">{pieces}</p>
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-[10px] text-sunshine-400">
          Total: <span className="font-bold text-sunshine-600">{total}</span> pcs
        </p>
      </div>
    </div>
  );
};

export default StockCard;