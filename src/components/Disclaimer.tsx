import { ShieldAlert } from 'lucide-react';

interface DisclaimerProps {
  compact?: boolean;
}

export default function Disclaimer({ compact = false }: DisclaimerProps) {
  if (compact) {
    return (
      <p className="text-xs text-gray-400 italic text-center px-4">
        For educational purposes only. Does not replace veterinary nutritional advice.
      </p>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
      <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-sm font-semibold text-amber-800 mb-1">Educational Purposes Only</div>
        <p className="text-sm text-amber-700 leading-relaxed">
          This calculator is for educational purposes only and does not replace veterinary nutritional advice.
          Pet foods vary by formulation, calories, digestibility, mineral content, and medical suitability.
          Pets with medical conditions should have diet recommendations made by a veterinarian.
        </p>
      </div>
    </div>
  );
}
