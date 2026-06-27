import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, SlidersHorizontal, X, Loader2, AlertCircle, ExternalLink, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchPetFoods, type LiveFoodItem } from '../utils/openPetFoodFacts';
import { chewyLink } from '../config/affiliates';

interface Filters {
  query: string;
  species: 'dog' | 'cat' | '';
  foodType: 'dry' | 'canned' | 'semi-moist' | 'treat' | '';
}

const defaultFilters = (): Filters => ({ query: '', species: '', foodType: '' });

const NUM = (v: number | null, suffix = '%') =>
  v !== null ? `${v.toFixed(1)}${suffix}` : '—';

function FoodResultCard({ food }: { food: LiveFoodItem }) {
  const navigate = useNavigate();

  const hasNutrients = food.proteinDMB !== null || food.fatDMB !== null;

  function useInCalculator() {
    const params = new URLSearchParams();
    if (food.proteinAsFed !== null) params.set('protein', String(food.proteinAsFed));
    if (food.fatAsFed !== null) params.set('fat', String(food.fatAsFed));
    if (food.fiberAsFed !== null) params.set('fiber', String(food.fiberAsFed));
    params.set('moisture', String(food.moisture));
    if (food.moistureEstimated) params.set('moistureEst', '1');
    if (food.kcalPerKg !== null) params.set('kcalPerKg', String(food.kcalPerKg));
    params.set('foodType', food.foodType === 'unknown' ? 'dry' : food.foodType);
    if (food.species === 'dog' || food.species === 'cat') params.set('species', food.species);
    params.set('name', `${food.brand} ${food.productName}`);
    navigate(`/?${params}`);
  }

  const speciesLabel = food.species === 'dog' ? '🐕 Dog' : food.species === 'cat' ? '🐈 Cat' : food.species === 'both' ? '🐾 Dog & Cat' : null;
  const typeLabel = food.foodType === 'dry' ? '🥣 Dry' : food.foodType === 'canned' ? '🥫 Canned' : food.foodType === 'treat' ? '🦴 Treat' : food.foodType === 'semi-moist' ? '📦 Semi-Moist' : null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Image strip */}
      {food.imageUrl && (
        <div className="h-24 bg-gray-50 flex items-center justify-center overflow-hidden">
          <img
            src={food.imageUrl}
            alt={food.productName}
            className="max-h-24 max-w-full object-contain p-2"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Brand + name */}
        <div>
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{food.brand}</div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{food.productName}</h3>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {speciesLabel && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${food.species === 'dog' ? 'bg-amber-100 text-amber-700' : food.species === 'cat' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
              {speciesLabel}
            </span>
          )}
          {typeLabel && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${food.foodType === 'dry' ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'}`}>
              {typeLabel}
            </span>
          )}
        </div>

        {/* DMB nutrients */}
        {hasNutrients ? (
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'Protein DMB', value: food.proteinDMB, color: 'text-teal-700' },
              { label: 'Fat DMB', value: food.fatDMB, color: 'text-orange-600' },
              { label: 'Fiber DMB', value: food.fiberDMB, color: 'text-emerald-600' },
            ].map(n => (
              <div key={n.label} className="bg-gray-50 rounded-xl p-2 text-center">
                <div className={`text-sm font-bold ${n.color}`}>{NUM(n.value)}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-tight">{n.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            <p className="text-xs text-amber-700">Nutritional data not yet in database. Use "View on OPFF" to check the product page.</p>
          </div>
        )}

        {/* Moisture + calories */}
        <div className="text-xs text-gray-400 flex flex-wrap gap-x-3">
          <span>
            Moisture: {food.moisture}%{food.moistureEstimated && ' (est.)'}
          </span>
          {food.kcalPerKg !== null && <span>{food.kcalPerKg.toLocaleString()} kcal/kg</span>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={useInCalculator}
            disabled={!hasNutrients}
            title={hasNutrients ? 'Pre-fill the DMB calculator with these values' : 'No nutritional data available'}
            className="flex-1 text-xs font-semibold py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Use in Calculator
          </button>
          <a
            href={chewyLink(`/s?query=${encodeURIComponent(`${food.brand} ${food.productName}`)}`)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            title="Search for this food on Chewy"
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-[#00457c] hover:bg-[#003a6b] text-white text-xs transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </a>
          {food.sourceUrl && (
            <a
              href={food.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs transition-colors"
              title="View on Open Pet Food Facts"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FoodSearch() {
  const [filters, setFilters] = useState<Filters>(defaultFilters());
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<LiveFoodItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(filters.query), 500);
    return () => clearTimeout(timer);
  }, [filters.query]);

  // Fetch when debounced query or species changes
  const doSearch = useCallback(async (query: string, species: 'dog' | 'cat' | '') => {
    if (query.trim().length < 2) {
      setResults([]);
      setTotal(0);
      setHasSearched(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const { items, total } = await searchPetFoods(query.trim(), species || '', abortRef.current.signal);

      // Client-side food type filter (server-side doesn't support it cleanly)
      const filtered = filters.foodType
        ? items.filter(f => f.foodType === filters.foodType)
        : items;

      setResults(filtered);
      setTotal(total);
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError') return;
      setError('Search failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [filters.foodType]);

  useEffect(() => {
    doSearch(debouncedQuery, filters.species);
  }, [debouncedQuery, filters.species, doSearch]);

  const clearAll = () => {
    setFilters(defaultFilters());
    setResults([]);
    setHasSearched(false);
    setError('');
  };

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <p className="text-sm text-blue-700">
          Search 100,000+ pet foods from the Open Pet Food Facts database.
          Click <strong>Use in Calculator</strong> to pre-fill the DMB calculator, or the{' '}
          <span className="inline-flex items-center gap-1 font-semibold text-[#00457c]"><ShoppingCart className="w-3 h-3" /> Chewy</span>{' '}
          button to shop for that food on Chewy with your affiliate link.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500 animate-spin" />}
          <input
            type="text"
            value={filters.query}
            onChange={e => setFilters(prev => ({ ...prev, query: e.target.value }))}
            placeholder="Search brand or product name… (e.g. Royal Canin, Hill's, Purina)"
            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
            showFilters || filters.species || filters.foodType
              ? 'bg-teal-50 border-teal-300 text-teal-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </button>
        {(filters.query || filters.species || filters.foodType) && (
          <button onClick={clearAll} className="flex items-center gap-1 px-3 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Species</label>
              <div className="flex gap-2">
                {(['', 'dog', 'cat'] as const).map(s => (
                  <button key={s} onClick={() => setFilters(prev => ({ ...prev, species: s }))}
                    className={`flex-1 text-xs font-medium py-2 rounded-xl border transition-colors ${
                      filters.species === s ? 'bg-teal-50 border-teal-400 text-teal-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}>
                    {s === '' ? 'All' : s === 'dog' ? '🐕 Dog' : '🐈 Cat'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Food Type</label>
              <select
                value={filters.foodType}
                onChange={e => setFilters(prev => ({ ...prev, foodType: e.target.value as Filters['foodType'] }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">All types</option>
                <option value="dry">Dry / Kibble</option>
                <option value="canned">Wet / Canned</option>
                <option value="treat">Treats</option>
                <option value="semi-moist">Semi-Moist</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* State messages */}
      {!hasSearched && !loading && (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Start typing to search the database</p>
          <p className="text-xs mt-1">Try "Royal Canin", "Purina Pro Plan", "Blue Buffalo", "Hill's Science Diet"…</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {hasSearched && !loading && !error && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {results.length === 0
              ? `No results for "${debouncedQuery}"`
              : `Showing ${results.length} result${results.length !== 1 ? 's' : ''}${total > results.length ? ` of ${total.toLocaleString()} in database` : ''}`}
          </p>
          {filters.query.length > 0 && filters.query.length < 2 && (
            <p className="text-xs text-gray-400">Type at least 2 characters</p>
          )}
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(food => (
            <FoodResultCard key={food.id} food={food} />
          ))}
        </div>
      )}

      {/* No results help */}
      {hasSearched && !loading && results.length === 0 && !error && (
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <p className="text-sm font-medium text-gray-700 mb-2">No products found</p>
          <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
            Try a shorter search term or just the brand name. Open Pet Food Facts has better coverage for major brands (Royal Canin, Purina, Hill's, Blue Buffalo, Iams, Orijen).
          </p>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pt-2">
        Data sourced from{' '}
        <a href="https://world.openpetfoodfacts.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
          Open Pet Food Facts
        </a>
        {' '}(ODbL license). Nutritional values may be incomplete. Always verify with the product label.
      </p>
    </div>
  );
}
