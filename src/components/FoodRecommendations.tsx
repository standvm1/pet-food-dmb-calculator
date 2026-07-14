import { ShoppingBag } from 'lucide-react';
import { getRecommendations, type DietGoal, type RecommendedFood } from '../data/dietRecommendations';
import FoodRecommendationCard from './FoodRecommendationCard';

interface Props {
  species: 'dog' | 'cat';
  goals: DietGoal[];
  onUse?: (food: RecommendedFood) => void;
  heading?: string;
}

export default function FoodRecommendations({ species, goals, onUse, heading }: Props) {
  const foods = getRecommendations(species, goals, 3);
  if (foods.length === 0) return null;

  return (
    <div className="mt-8 rounded-2xl border-2 border-teal-100 bg-teal-50 p-5">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-teal-600 rounded-xl flex-shrink-0">
          <ShoppingBag className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base">
            {heading ?? 'Recommended Diets'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Vet-curated for {species}s · Available on Chewy
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {foods.map((food, i) => (
          <FoodRecommendationCard key={food.id} food={food} rank={i + 1} onUse={onUse} />
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 mt-4 leading-relaxed">
        Atlas Veterinary Hospital may earn a commission from qualifying Chewy purchases at no extra cost to you.
        Rx diets require a prescription —{' '}
        <a href="tel:9092226682" className="text-teal-600 hover:underline">call us at 909-222-6682</a> to discuss.
      </p>
    </div>
  );
}
