import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { mockFoods, DIET_TAGS } from '../data/mockFoodDatabase';
import FoodCard from './FoodCard';
import type { Species, FoodType } from '../types';

// This component is designed to connect to a live food database API in the future.
// Currently uses mockFoods from src/data/mockFoodDatabase.ts.
// To connect live data: replace mockFoods with a fetched dataset and wire up the
// search query to a backend search endpoint or Google Custom Search API.

interface Filters {
  query: string;
  species: Species | 'both' | '';
  foodType: FoodType | '';
  tags: string[];
  prescriptionOnly: boolean;
  nonPrescriptionOnly: boolean;
}

const defaultFilters = (): Filters => ({
  query: '',
  species: '',
  foodType: '',
  tags: [],
  prescriptionOnly: false,
  nonPrescriptionOnly: false,
});

export default function FoodSearch() {
  const [filters, setFilters] = useState<Filters>(defaultFilters());
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    return mockFoods.filter(food => {
      if (filters.query) {
        const q = filters.query.toLowerCase();
        if (!food.brand.toLowerCase().includes(q) && !food.productName.toLowerCase().includes(q)) return false;
      }
      if (filters.species && filters.species !== 'both') {
        if (food.species !== filters.species && food.species !== 'both') return false;
      }
      if (filters.foodType) {
        if (food.foodType !== filters.foodType) return false;
      }
      if (filters.tags.length > 0) {
        if (!filters.tags.some(tag => food.dietTags.some(t => t.toLowerCase().includes(tag.toLowerCase())))) return false;
      }
      if (filters.prescriptionOnly && !food.isPrescription) return false;
      if (filters.nonPrescriptionOnly && food.isPrescription) return false;
      return true;
    });
  }, [filters]);

  const sponsored = results.filter(f => f.sponsored);
  const regular = results.filter(f => !f.sponsored);

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  const hasActiveFilters =
    filters.species || filters.foodType || filters.tags.length > 0 || filters.prescriptionOnly || filters.nonPrescriptionOnly;

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
        <span className="font-semibold">Sample food database</span> — These are example foods for demonstration purposes only.
        Nutritional values are approximate. This is not a recommendation or endorsement. Always consult your veterinarian before changing your pet's diet.
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.query}
            onChange={e => setFilters(prev => ({ ...prev, query: e.target.value }))}
            placeholder="Search brand or product name…"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-teal-50 border-teal-300 text-teal-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-teal-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {[filters.species, filters.foodType, ...filters.tags, filters.prescriptionOnly, filters.nonPrescriptionOnly].filter(Boolean).length}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={() => setFilters(defaultFilters())}
            className="flex items-center gap-1 px-3 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm"
          >
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Species</label>
              <select
                value={filters.species}
                onChange={e => setFilters(prev => ({ ...prev, species: e.target.value as Filters['species'] }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">All</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Food Type</label>
              <select
                value={filters.foodType}
                onChange={e => setFilters(prev => ({ ...prev, foodType: e.target.value as Filters['foodType'] }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">All</option>
                <option value="dry">Dry</option>
                <option value="canned">Canned</option>
                <option value="semi-moist">Semi-Moist</option>
                <option value="treat">Treat</option>
              </select>
            </div>
            <div className="sm:col-span-1 col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Prescription Status</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, prescriptionOnly: !prev.prescriptionOnly, nonPrescriptionOnly: false }))}
                  className={`flex-1 text-xs font-medium px-3 py-2.5 rounded-xl border transition-colors ${
                    filters.prescriptionOnly ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Rx Only
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, nonPrescriptionOnly: !prev.nonPrescriptionOnly, prescriptionOnly: false }))}
                  className={`flex-1 text-xs font-medium px-3 py-2.5 rounded-xl border transition-colors ${
                    filters.nonPrescriptionOnly ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  OTC Only
                </button>
              </div>
            </div>
          </div>

          {/* Diet tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Diet Tags</label>
            <div className="flex flex-wrap gap-2">
              {DIET_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    filters.tags.includes(tag)
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-500">
        {results.length === 0 ? 'No foods match your filters.' : `${results.length} food${results.length !== 1 ? 's' : ''} found`}
      </div>

      {/* Sponsored listings first */}
      {sponsored.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sponsored</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsored.map(food => <FoodCard key={food.id} food={food} />)}
          </div>
        </div>
      )}

      {/* Regular results */}
      {regular.length > 0 && (
        <div>
          {sponsored.length > 0 && (
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Results</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regular.map(food => <FoodCard key={food.id} food={food} />)}
          </div>
        </div>
      )}
    </div>
  );
}
