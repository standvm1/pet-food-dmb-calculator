import { useState, useEffect } from 'react';
import { Search, X, ExternalLink, ShoppingCart } from 'lucide-react';
import { chewySearchLink } from '../config/affiliates';

const QUICK_SEARCHES = [
  { label: 'Hill\'s Prescription Diet', q: 'Hills Prescription Diet' },
  { label: 'Royal Canin Veterinary', q: 'Royal Canin Veterinary' },
  { label: 'Purina Pro Plan Veterinary', q: 'Purina Pro Plan Veterinary' },
  { label: 'Hill\'s k/d Kidney', q: 'Hills kd kidney dog' },
  { label: 'Royal Canin Renal', q: 'Royal Canin renal' },
  { label: 'Hill\'s w/d Weight', q: 'Hills wd weight management' },
  { label: 'Purina OM Obesity', q: 'Purina OM obesity management' },
  { label: 'Hill\'s r/d Weight Loss', q: 'Hills rd weight reduction' },
  { label: 'Blue Buffalo Wilderness', q: 'Blue Buffalo Wilderness' },
  { label: 'Orijen Senior', q: 'Orijen senior' },
];

export default function FoodSearch() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  // Reset "submitted" when the user edits the query
  useEffect(() => {
    if (query !== submitted) setSubmitted('');
  }, [query, submitted]);

  function handleSearch(q: string) {
    const term = q.trim();
    if (!term) return;
    setSubmitted(term);
    window.open(chewySearchLink(term), '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
          placeholder="Search Chewy — e.g. Hill's Prescription Diet k/d, Royal Canin renal, Purina OM…"
          className="w-full pl-11 pr-28 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm shadow-sm"
          autoFocus
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSubmitted(''); }}
            className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => handleSearch(query)}
          disabled={!query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00457c] hover:bg-[#003a6b] disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Search
        </button>
      </div>

      {/* After search: result panel */}
      {submitted && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Searching Chewy for <span className="italic">"{submitted}"</span>
            </p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Chewy's full catalog opened in a new tab with your results.
              Any purchase you make supports Atlas Veterinary Hospital through our affiliate program.
            </p>
          </div>
          <a
            href={chewySearchLink(submitted)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center gap-2 bg-[#00457c] hover:bg-[#003a6b] text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors flex-shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
            Open on Chewy
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      )}

      {/* Idle: quick search chips */}
      {!submitted && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Popular veterinary diets
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.map(({ label, q }) => (
              <button
                key={q}
                onClick={() => { setQuery(label); handleSearch(q); }}
                className="flex items-center gap-1.5 text-xs font-medium bg-white border border-gray-200 hover:border-teal-400 hover:text-teal-700 text-gray-600 px-3 py-2 rounded-full transition-colors shadow-sm"
              >
                <Search className="w-3 h-3 opacity-60" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      {!submitted && (
        <div className="bg-gray-50 rounded-2xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">How food search works</p>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li className="flex gap-2"><span className="text-teal-500 font-bold">1.</span> Type any pet food name, brand, or diet type above</li>
            <li className="flex gap-2"><span className="text-teal-500 font-bold">2.</span> Press Enter or click Search — Chewy's full catalog opens in a new tab</li>
            <li className="flex gap-2"><span className="text-teal-500 font-bold">3.</span> Any purchase supports Atlas Veterinary Hospital via our Chewy affiliate program</li>
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        Atlas Veterinary Hospital may earn a commission from qualifying Chewy purchases at no extra cost to you.
      </p>
    </div>
  );
}
