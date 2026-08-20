import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Compass, ChevronRight } from 'lucide-react';

const POPULAR = [
  { to: '/', label: 'DMB Calculator', desc: 'Compare food labels fairly' },
  { to: '/feeding-calculator', label: 'How Much Should I Feed?', desc: 'Daily portions by weight & body condition' },
  { to: '/food-search', label: 'Food Search', desc: 'Look up a food by name' },
  { to: '/what-is-dmb', label: 'What is Dry Matter Basis?', desc: 'The idea behind the numbers' },
];

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 space-y-8 text-center">
      <Helmet>
        <title>Page Not Found | Atlas Veterinary Hospital</title>
        {/* A SPA can't return a real 404 status, so keep these out of the index */}
        <meta name="robots" content="noindex" />
      </Helmet>

      <div>
        <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 rounded-2xl mb-4">
          <Compass className="w-7 h-7 text-teal-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">We couldn't find that page</h1>
        <p className="text-gray-500 leading-relaxed">
          The link may be out of date, or the address may have a typo in it. Here's where most people are headed:
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-left">
        {POPULAR.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-start justify-between gap-3 bg-white border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 rounded-2xl p-4 shadow-sm transition-colors"
          >
            <span>
              <span className="block font-bold text-sm text-gray-900">{item.label}</span>
              <span className="block text-xs text-gray-500 mt-0.5">{item.desc}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
          </Link>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        Still stuck? Call Atlas Veterinary Hospital at{' '}
        <a href="tel:9092226682" className="text-teal-600 font-semibold hover:underline">909-222-6682</a>.
      </p>
    </div>
  );
}
