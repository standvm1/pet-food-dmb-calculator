import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, AlertCircle, ExternalLink, ShoppingCart } from 'lucide-react';

interface FoodResult {
  id: string;
  name: string;
  snippet: string;
  imageUrl: string | null;
  price: string | null;
  chewyUrl: string;
}

const QUICK_SEARCHES = [
  "Hill's Prescription Diet k/d kidney",
  "Royal Canin Renal Support",
  "Purina Pro Plan Veterinary NF kidney",
  "Hill's Prescription Diet r/d weight loss",
  "Hill's Prescription Diet w/d weight",
  "Purina Pro Plan Veterinary OM obesity",
  "Royal Canin Gastrointestinal",
  "Hill's Prescription Diet i/d digestive",
  "Purina Pro Plan Veterinary EN gastroenteric",
  "Hill's Prescription Diet c/d urinary",
];

function ProductCard({ item }: { item: FoodResult }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex gap-3 p-3 hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-contain p-1"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <ShoppingCart className="w-7 h-7 text-gray-200" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{item.name}</h3>
          {item.snippet && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{item.snippet}</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {item.price && (
            <span className="text-sm font-bold text-gray-700">${item.price}</span>
          )}
          <a
            href={item.chewyUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center gap-1.5 bg-[#00457c] hover:bg-[#003a6b] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ml-auto"
          >
            <ShoppingCart className="w-3 h-3" />
            Buy on Chewy
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function FoodSearch() {
  const [query, setQuery]         = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults]     = useState<FoodResult[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [searched, setSearched]   = useState('');
  const abortRef = useRef<AbortController | null>(null);

  // Debounce 500 ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 500);
    return () => clearTimeout(t);
  }, [query]);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setResults([]);
      setSearched('');
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError('');
    setSearched(q.trim());

    try {
      const res  = await fetch(
        `/.netlify/functions/food-search?q=${encodeURIComponent(q.trim())}`,
        { signal: abortRef.current.signal }
      );
      const data = await res.json();

      if (data.error) { setError(data.error); setResults([]); return; }
      setResults(data.items ?? []);
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError') return;
      setError('Search failed — please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { doSearch(debounced); }, [debounced, doSearch]);

  function clear() {
    setQuery('');
    setResults([]);
    setSearched('');
    setError('');
  }

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500 animate-spin" />
        )}
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search Chewy — e.g. Hill's k/d kidney, Royal Canin renal, Purina OM…"
          className="w-full pl-11 pr-10 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm shadow-sm"
          autoFocus
        />
        {query && !loading && (
          <button onClick={clear} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick search chips */}
      {!searched && !loading && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Popular veterinary diets</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.map(q => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="flex items-center gap-1 text-xs font-medium bg-white border border-gray-200 hover:border-teal-400 hover:text-teal-700 text-gray-600 px-3 py-1.5 rounded-full transition-colors shadow-sm"
              >
                <Search className="w-3 h-3 opacity-50" />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div>
          <p className="text-xs text-gray-400 mb-3">
            {results.length === 0
              ? `No Chewy products found for "${searched}"`
              : `${results.length} results for "${searched}" — click Buy on Chewy to purchase`}
          </p>
          <div className="space-y-3">
            {results.map(item => <ProductCard key={item.id} item={item} />)}
          </div>
        </div>
      )}

      {/* No results helper */}
      {searched && !loading && results.length === 0 && !error && (
        <div className="bg-gray-50 rounded-2xl p-5 text-center">
          <p className="text-sm font-medium text-gray-700 mb-1">No products found</p>
          <p className="text-xs text-gray-500">Try a shorter term or just the brand name — e.g. "Hill's k/d" or "Royal Canin renal"</p>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pt-1">
        Atlas Veterinary Hospital may earn a commission from qualifying Chewy purchases at no extra cost to you.
      </p>
    </div>
  );
}
