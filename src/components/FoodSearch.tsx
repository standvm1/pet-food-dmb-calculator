import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, AlertCircle, ExternalLink, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

interface ChewyProduct {
  id: string;
  name: string;
  brand: string;
  price: string | null;
  imageUrl: string | null;
  chewyUrl: string;
  category: string;
  inStock: boolean;
}

interface SearchResponse {
  configured: boolean;
  items: ChewyProduct[];
  total: number;
  page?: number;
  error?: string;
}

function ProductCard({ product }: { product: ChewyProduct }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-32 max-w-full object-contain p-3"
            onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
          />
        ) : (
          <ShoppingCart className="w-8 h-8 text-gray-200" />
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 gap-2">
        {product.brand && (
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider truncate">{product.brand}</div>
        )}
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">{product.name}</h3>

        {product.price && (
          <div className="text-sm font-bold text-gray-700">${product.price}</div>
        )}

        <a
          href={product.chewyUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center justify-center gap-1.5 w-full bg-[#00457c] hover:bg-[#003a6b] text-white text-xs font-semibold py-2 rounded-lg transition-colors mt-auto"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Shop on Chewy
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      </div>
    </div>
  );
}

export default function FoodSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<ChewyProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const PAGE_SIZE = 24;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Debounce query
  useEffect(() => {
    setPage(1);
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const doSearch = useCallback(async (q: string, p: number) => {
    if (q.trim().length < 2) {
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
      const res = await fetch(
        `/.netlify/functions/chewy-search?q=${encodeURIComponent(q.trim())}&page=${p}`,
        { signal: abortRef.current.signal }
      );

      const data: SearchResponse = await res.json();

      if (data.configured === false) {
        setConfigured(false);
        setResults([]);
        return;
      }

      setConfigured(true);

      if (data.error) {
        setError(data.error);
        return;
      }

      setResults(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError') return;
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doSearch(debouncedQuery, page);
  }, [debouncedQuery, page, doSearch]);

  function changePage(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500 animate-spin" />
        )}
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search Chewy — e.g. Hill's Prescription Diet, Royal Canin kidney, Purina OM…"
          className="w-full pl-11 pr-10 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm shadow-sm"
          autoFocus
        />
        {query && !loading && (
          <button onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Not yet configured */}
      {configured === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-amber-800 mb-2">Chewy catalog API not connected yet</p>
          <p className="text-sm text-amber-700 mb-3">
            To enable live Chewy product search, add these three environment variables in your Netlify dashboard
            (Site settings → Environment variables):
          </p>
          <ul className="text-xs font-mono bg-white border border-amber-200 rounded-lg p-3 space-y-1 text-gray-700">
            <li><span className="text-teal-700 font-bold">IMPACT_ACCOUNT_SID</span> — Settings → API in your Impact dashboard</li>
            <li><span className="text-teal-700 font-bold">IMPACT_AUTH_TOKEN</span> — Settings → API in your Impact dashboard</li>
            <li><span className="text-teal-700 font-bold">IMPACT_CHEWY_CATALOG_ID</span> — Content → Data Feeds → Chewy (number in the URL)</li>
          </ul>
          <p className="text-xs text-amber-600 mt-3">After adding the variables, trigger a redeploy in Netlify for them to take effect.</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Idle state */}
      {!hasSearched && !loading && configured !== false && (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Start typing to search Chewy's catalog</p>
          <p className="text-xs mt-1">Try "Hill's r/d", "Royal Canin kidney", "Purina Overweight", "Blue Buffalo senior"…</p>
        </div>
      )}

      {/* Result count */}
      {hasSearched && !loading && configured !== false && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {results.length === 0
              ? `No results for "${debouncedQuery}"`
              : `${total.toLocaleString()} results for "${debouncedQuery}" — showing page ${page} of ${totalPages}`}
          </p>
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* No results */}
      {hasSearched && !loading && results.length === 0 && !error && configured !== false && (
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <p className="text-sm font-medium text-gray-700 mb-2">No products found</p>
          <p className="text-xs text-gray-500">Try a shorter search term or just the brand name.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => changePage(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => changePage(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center leading-relaxed pt-2">
        Atlas Veterinary Hospital may earn a commission from qualifying Chewy purchases at no extra cost to you.
      </p>
    </div>
  );
}
