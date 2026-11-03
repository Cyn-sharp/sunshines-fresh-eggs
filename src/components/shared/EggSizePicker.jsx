// src/components/shared/EggSizePicker.jsx
import { EGG_SIZES } from "../../utils/constants";

const EggSizePicker = ({ selectedSize, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {EGG_SIZES.map((size) => (
        <button
          key={size.id}
          onClick={() => onSelect(size.id)}
          className={`py-3 px-2 rounded-xl text-xs font-bold transition-all
            active:scale-95
            ${
              selectedSize === size.id
                ? "bg-sunshine-500 text-white shadow-md scale-105"
                : "bg-white text-sunshine-700 border-2 border-sunshine-200 hover:border-sunshine-400"
            }
          `}
        >
          {size.short}
        </button>
      ))}
    </div>
  );
};

export default EggSizePicker;