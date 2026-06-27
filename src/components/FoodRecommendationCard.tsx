import { ExternalLink, Calculator } from 'lucide-react';
import { chewyLink } from '../config/affiliates';
import type { RecommendedFood } from '../data/dietRecommendations';

interface Props {
  food: RecommendedFood;
  onUse?: (food: RecommendedFood) => void;
}

export default function FoodRecommendationCard({ food, onUse }: Props) {
  const kcalLabel = food.foodType === 'canned' && food.kcalPerCan
    ? `${food.kcalPerCan} kcal/can`
    : food.kcalPerCup
    ? `${food.kcalPerCup} kcal/cup`
    : `${food.kcalPerKg.toLocaleString()} kcal/kg`;

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      {/* Brand */}
      <div className="text-xs text-gray-400 mb-0.5">{food.brand}</div>

      {/* Name + Rx badge */}
      <div className="flex items-center gap-2 mb-1">
        <a
          href={chewyLink(food.chewyPath)}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="text-[#00457c] hover:underline font-medium text-sm leading-snug"
        >
          {food.name}
        </a>
        {food.isRx && (
          <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-1.5 py-0.5 rounded flex-shrink-0">
            Rx
          </span>
        )}
      </div>

      {/* Key stats */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mb-1">
        <span>{food.proteinDMB}% protein DMB</span>
        <span className="text-gray-300">·</span>
        <span>{food.fatDMB}% fat DMB</span>
        <span className="text-gray-300">·</span>
        <span>{kcalLabel}</span>
      </div>

      {/* Highlight */}
      <p className="text-xs text-gray-500 leading-relaxed mb-2">{food.highlight}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 text-xs">
        <a
          href={chewyLink(food.chewyPath)}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center gap-1 text-[#00457c] hover:underline font-medium"
        >
          Shop on Chewy <ExternalLink className="w-3 h-3" />
        </a>
        {onUse && (
          <button
            type="button"
            onClick={() => onUse(food)}
            className="flex items-center gap-1 text-teal-600 hover:underline font-medium"
          >
            <Calculator className="w-3 h-3" />
            Use in Calculator
          </button>
        )}
        {food.isRx && (
          <span className="text-purple-500">Prescription required</span>
        )}
      </div>
    </div>
  );
}
