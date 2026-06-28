import { useState } from 'react';
import { Search, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DIET_RECOMMENDATIONS, type RecommendedFood, type DietGoal } from '../data/dietRecommendations';
import { chewyLink } from '../config/affiliates';
import FoodRecommendationCard from './FoodRecommendationCard';

const GOAL_OPTIONS: { value: DietGoal | ''; label: string }[] = [
  { value: '', label: 'All goals' },
  { value: 'weight-loss', label: 'Weight loss' },
  { value: 'weight-gain', label: 'Weight gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'kidney', label: 'Kidney support' },
  { value: 'puppy', label: 'Puppy / Kitten' },
  { value: 'senior', label: 'Senior' },
  { value: 'urinary', label: 'Urinary health' },
];

function searchFoods(query: string, species: 'dog' | 'cat' | '', goal: DietGoal | ''): RecommendedFood[] {
  const q = query.toLowerCase().trim();
  return DIET_RECOMMENDATIONS.filter(f => {
    if (species && f.species !== species && f.species !== 'both') return false;
    if (goal && !f.goals.includes(goal)) return false;
    if (!q) return true;
    return (
      f.brand.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q) ||
      f.highlight.toLowerCase().includes(q) ||
      f.goals.some(g => g.includes(q))
    );
  });
}

export default function FoodSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [species, setSpecies] = useState<'dog' | 'cat' | ''>('');
  const [goal, setGoal] = useState<DietGoal | ''>('');

  const results = searchFoods(query, species, goal);
  const hasFilters = query || species || goal;

  function handleUse(food: RecommendedFood) {
    const params = new URLSearchParams();
    params.set('protein', String(food.protein));
    params.set('fat', String(food.fat));
    params.set('fiber', String(food.fiber));
    params.set('moisture', String(food.moisture));
    params.set('kcalPerKg', String(food.kcalPerKg));
    params.set('foodType', food.foodType);
    if (food.species !== 'both') params.set('species', food.species);
    params.set('name', `${food.brand} ${food.name}`);
    navigate(`/?${params}`);
  }

  const chewySearchUrl = chewyLink(`/s?query=${encodeURIComponent(query || 'prescription pet food')}`);

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by brand or diet type — e.g. Hill's, Royal Canin, kidney, weight loss…"
          className="w-full pl-11 pr-10 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm shadow-sm"
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1.5">
          {([['', 'All'], ['dog', '🐕 Dog'], ['cat', '🐈 Cat']] as const).map(([v, label]) => (
            <button key={v} onClick={() => setSpecies(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                species === v ? 'bg-teal-50 border-teal-400 text-teal-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}>
              {label}
            </button>
          ))}
        </div>
        <select
          value={goal}
          onChange={e => setGoal(e.target.value as DietGoal | '')}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {GOAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {hasFilters && (
          <button onClick={() => { setQuery(''); setSpecies(''); setGoal(''); }}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-400">
        {results.length} diet{results.length !== 1 ? 's' : ''} in our curated Chewy database
        {query && ` matching "${query}"`}
      </p>

      {/* Results */}
      {results.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5">
          {results.map(food => (
            <FoodRecommendationCard key={food.id} food={food} onUse={handleUse} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No matching diets found</p>
          <p className="text-xs mt-1">Try searching "Hill's", "Royal Canin", "kidney", or "weight loss"</p>
        </div>
      )}

      {/* Chewy CTA */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-700">
            {query ? `Search "${query}" on Chewy` : 'Browse all pet foods on Chewy'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Thousands of foods with reviews, prices, and auto-ship discounts
          </p>
        </div>
        <a
          href={chewySearchUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center gap-1.5 ml-4 flex-shrink-0 bg-[#00457c] hover:bg-[#003a6b] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          Chewy <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        Atlas Veterinary Hospital may earn a commission from qualifying Chewy purchases at no extra cost to you.
        Rx diets require a veterinarian prescription —{' '}
        <a href="tel:9092226682" className="text-teal-600 hover:underline">call us at 909-222-6682</a>.
      </p>
    </div>
  );
}
