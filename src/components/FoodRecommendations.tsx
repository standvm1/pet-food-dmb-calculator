import { ShoppingCart } from 'lucide-react';
import { getRecommendations, type DietGoal, type RecommendedFood } from '../data/dietRecommendations';
import FoodRecommendationCard from './FoodRecommendationCard';

interface Props {
  species: 'dog' | 'cat';
  goals: DietGoal[];
  /** Called when the user clicks "Use in Calculator" on a food card */
  onUse?: (food: RecommendedFood) => void;
  /** Section heading */
  heading?: string;
}

const GOAL_LABELS: Record<DietGoal, string> = {
  'weight-loss': 'weight loss',
  'weight-gain': 'weight gain',
  'maintenance': 'maintenance',
  'kidney': 'kidney support',
  'puppy': 'growth',
  'senior': 'senior care',
  'urinary': 'urinary health',
  'low-fat': 'low-fat diets',
};

export default function FoodRecommendations({ species, goals, onUse, heading }: Props) {
  const foods = getRecommendations(species, goals, 3);
  if (foods.length === 0) return null;

  const goalText = goals.map(g => GOAL_LABELS[g]).join(' & ');
  const title = heading ?? `Recommended foods for ${goalText}`;

  return (
    <div className="mt-8 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 bg-[#00457c]/10 rounded-xl flex-shrink-0">
          <ShoppingCart className="w-4 h-4 text-[#00457c]" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
          <p className="text-xs text-gray-400">
            Based on {species} · {species === 'dog' ? 'canine' : 'feline'} clinical nutrition guidelines
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {foods.map(food => (
          <FoodRecommendationCard key={food.id} food={food} onUse={onUse} />
        ))}
      </div>

      {/* Disclaimers */}
      <div className="text-xs text-gray-400 leading-relaxed space-y-1">
        <p>
          <span className="font-semibold">Rx diets</span> require a veterinarian prescription.{' '}
          <a href="tel:9092226682" className="text-teal-600 hover:underline font-medium">Call Atlas Vet (909-222-6682)</a>{' '}
          to discuss whether any of these are appropriate for your pet.
        </p>
        <p>
          Atlas Veterinary Hospital may earn a commission from qualifying purchases through Chewy affiliate links,
          at no extra cost to you. Nutrient values are from product labels and may change — verify with your vet.
        </p>
      </div>
    </div>
  );
}
