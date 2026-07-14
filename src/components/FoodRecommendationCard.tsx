import { ExternalLink, Calculator, ShoppingCart } from 'lucide-react';
import { chewyLink } from '../config/affiliates';
import type { RecommendedFood } from '../data/dietRecommendations';

interface Props {
  food: RecommendedFood;
  rank: number;
  onUse?: (food: RecommendedFood) => void;
}

export default function FoodRecommendationCard({ food, rank, onUse }: Props) {
  const kcalLabel = food.foodType === 'canned' && food.kcalPerCan
    ? `${food.kcalPerCan} kcal/can`
    : food.kcalPerCup
    ? `${food.kcalPerCup} kcal/cup`
    : `${food.kcalPerKg.toLocaleString()} kcal/kg`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Rank badge */}
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center mt-0.5">
          {rank}
        </div>

        <div className="flex-1 min-w-0">
          {/* Brand */}
          <div className="text-xs text-gray-400 mb-0.5">{food.brand}</div>

          {/* Name + badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900 leading-snug">{food.name}</span>
            {food.isRx && (
              <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-1.5 py-0.5 rounded flex-shrink-0">
                Rx
              </span>
            )}
          </div>

          {/* Highlight */}
          <p className="text-xs text-gray-600 leading-relaxed mb-3">{food.highlight}</p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400 mb-3">
            <span className="bg-gray-50 rounded px-1.5 py-0.5">{food.proteinDMB}% protein DMB</span>
            <span className="bg-gray-50 rounded px-1.5 py-0.5">{food.fatDMB}% fat DMB</span>
            <span className="bg-gray-50 rounded px-1.5 py-0.5">{kcalLabel}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={chewyLink(food.chewyPath)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center gap-1.5 bg-[#00457c] hover:bg-[#003a6b] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-3 h-3" />
              Shop on Chewy
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
            {onUse && (
              <button
                type="button"
                onClick={() => onUse(food)}
                className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-teal-200"
              >
                <Calculator className="w-3 h-3" />
                Use in Calculator
              </button>
            )}
            {food.isRx && (
              <span className="text-xs text-purple-500 italic">Prescription required</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
