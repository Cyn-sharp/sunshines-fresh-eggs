// src/components/shared/LoadingSpinner.jsx
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sunshine-50">
      <Loader2 className="w-12 h-12 text-sunshine-500 animate-spin" />
      <p className="mt-4 text-sunshine-700 font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;