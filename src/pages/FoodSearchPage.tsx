import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FoodSearch from '../components/FoodSearch';
import AdSlot from '../components/AdSlot';
import Disclaimer from '../components/Disclaimer';

export default function FoodSearchPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Helmet>
        <title>Pet Food Database & Search | Atlas Veterinary Hospital</title>
        <meta name="description" content="Browse and filter our pet food database by species, food type, and diet goal. See dry matter basis values for popular dog and cat foods." />
        <link rel="canonical" href="https://petfooddmb.atlasveterinaryhospital.com/food-search" />
      </Helmet>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Calculator
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Food Search & Browse</h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
          Search our curated database of veterinarian-recommended diets, all available on Chewy.
          Filter by species, goal (weight loss, kidney, senior, etc.), or brand.
          Click <strong>Use in Calculator</strong> to pre-fill the DMB calculator, or <strong>Shop on Chewy</strong> to purchase with auto-ship discounts.
        </p>
      </div>

      <AdSlot id="ad-search-top" size="banner" />

      <FoodSearch />

      <Disclaimer />
    </div>
  );
}
