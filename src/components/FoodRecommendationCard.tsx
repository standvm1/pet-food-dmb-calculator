import { ExternalLink, FlaskConical } from 'lucide-react';
import { chewyLink } from '../config/affiliates';
import type { RecommendedFood } from '../data/dietRecommendations';

interface Props {
  food: RecommendedFood;
  onUse?: (food: RecommendedFood) => void;
}

const NUTRIENT_COLOR: Record<string, string> = {
  protein: 'text-teal-700',
  fat: 'text-orange-600',
  fiber: 'text-emerald-600',
};

export default function FoodRecommendationCard({ food, onUse }: Props) {
  const kcalLabel = food.foodType === 'canned' && food.kcalPerCan
    ? `${food.kcalPerCan} kcal/can`
    : food.kcalPerCup
    ? `${food.kcalPerCup} kcal/cup`
    : `${food.kcalPerKg.toLocaleString()} kcal/kg`;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      {/* Brand bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 truncate">
              {food.brand}
            </div>
            <h3 className="text-sm font-bold text-gray-900 leading-snug">{food.name}</h3>
          </div>
          {food.isRx && (
            <span className="flex-shrink-0 text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full border border-purple-200">
              Rx
            </span>
          )}
        </div>
      </div>

      {/* Highlight reason */}
      <div className="px-4 pb-3">
        <p className="text-xs text-gray-500 leading-relaxed">{food.highlight}</p>
      </div>

      {/* Nutrient grid */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'Protein', value: food.proteinDMB, key: 'protein' },
            { label: 'Fat', value: food.fatDMB, key: 'fat' },
            { label: 'Fiber', value: food.fiberDMB, key: 'fiber' },
          ].map(n => (
            <div key={n.key} className="bg-gray-50 rounded-lg px-2 py-2 text-center">
              <div className={`text-xs font-bold ${NUTRIENT_COLOR[n.key]}`}>{n.value}%</div>
              <div className="text-xs text-gray-400 leading-tight">{n.label} DMB</div>
            </div>
          ))}
          <div className="bg-gray-50 rounded-lg px-2 py-2 text-center">
            <div className="text-xs font-bold text-gray-700">{food.kcalPerKg.toLocaleString()}</div>
            <div className="text-xs text-gray-400 leading-tight">kcal/kg</div>
          </div>
        </div>
        {kcalLabel !== `${food.kcalPerKg.toLocaleString()} kcal/kg` && (
          <p className="text-xs text-gray-400 mt-1 text-center">{kcalLabel}</p>
        )}
      </div>

      {/* Rx notice */}
      {food.isRx && (
        <div className="px-4 pb-2">
          <p className="text-xs text-purple-600 bg-purple-50 border border-purple-100 rounded-lg px-2.5 py-1.5 leading-relaxed">
            Prescription required — ask your veterinarian at Atlas Vet.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto px-4 pb-4 pt-1 flex flex-col gap-2">
        <a
          href={chewyLink(food.chewyPath)}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center justify-center gap-1.5 w-full bg-[#00457c] hover:bg-[#003a6b] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          Shop on Chewy
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {onUse && (
          <button
            type="button"
            onClick={() => onUse(food)}
            className="flex items-center justify-center gap-1.5 w-full bg-teal-50 hover:bg-teal-100 text-teal-700 text-sm font-semibold px-4 py-2 rounded-xl border border-teal-200 transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Use in Calculator
          </button>
        )}
      </div>
    </div>
  );
}
