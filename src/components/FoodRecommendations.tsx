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
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">
        {heading ?? 'Recommended diets'}
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        Filtered for {species}s · via Chewy
      </p>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5">
        {foods.map(food => (
          <FoodRecommendationCard key={food.id} food={food} onUse={onUse} />
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-2 leading-relaxed">
        Atlas Veterinary Hospital may earn a commission from qualifying Chewy purchases at no extra cost to you.
        Rx diets require a prescription —{' '}
        <a href="tel:9092226682" className="text-teal-600 hover:underline">call us</a> to discuss.
      </p>
    </div>
  );
}
