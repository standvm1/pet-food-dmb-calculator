import { useState, useEffect, useRef } from 'react';
import { ArrowLeftRight, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import CalculatorForm, { defaultFood } from '../components/CalculatorForm';
import LabelScanner, { type ScanResult } from '../components/LabelScanner';
import ResultsTable from '../components/ResultsTable';
import ComparisonSummary from '../components/ComparisonSummary';
import ComparisonPdfButton from '../components/ComparisonPdfButton';
import Disclaimer from '../components/Disclaimer';
import AdSlot from '../components/AdSlot';
import EmailCapture from '../components/EmailCapture';
import { calculateDryMatterBasis } from '../utils/calculations';
import type { FoodInput, DMBResult } from '../types';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foodA, setFoodA] = useState<FoodInput>(defaultFood());
  const loadedRef = useRef(false);

  // Pre-fill foodA from URL params when navigated from Food Search
  useEffect(() => {
    if (loadedRef.current) return;
    const protein = searchParams.get('protein');
    if (!protein) return;
    loadedRef.current = true;

    const get = (k: string) => searchParams.get(k);
    setFoodA(prev => ({
      ...prev,
      name: get('name') ?? '',
      protein: protein !== null ? Number(protein) : '',
      fat: get('fat') !== null ? Number(get('fat')) : '',
      fiber: get('fiber') !== null ? Number(get('fiber')) : '',
      moisture: get('moisture') !== null ? Number(get('moisture')) : '',
      kcalPerKg: get('kcalPerKg') !== null ? Number(get('kcalPerKg')) : '',
      foodType: (get('foodType') as FoodInput['foodType']) ?? 'canned',
      species: (get('species') as FoodInput['species']) ?? 'dog',
    }));
    setSearchParams({}, { replace: true }); // clean the URL
    setTimeout(() => {
      document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [searchParams, setSearchParams]);
  const [foodB, setFoodB] = useState<FoodInput>(defaultFood());

  function applyScan(r: ScanResult, setter: (update: (prev: FoodInput) => FoodInput) => void) {
    setter(f => ({
      ...f,
      ...(r.protein !== null ? { protein: r.protein } : {}),
      ...(r.fat !== null ? { fat: r.fat } : {}),
      ...(r.fiber !== null ? { fiber: r.fiber } : {}),
      ...(r.moisture !== null ? { moisture: r.moisture } : {}),
      ...(r.ash !== null ? { ash: r.ash } : {}),
      ...(r.kcalPerCan !== null ? { calories: r.kcalPerCan, caloriesUnit: 'kcal/can' as const } :
          r.kcalPerCup !== null ? { calories: r.kcalPerCup, caloriesUnit: 'kcal/cup' as const } :
          r.kcalPerKg !== null  ? { calories: r.kcalPerKg,  caloriesUnit: 'kcal/kg'  as const } : {}),
    }));
  }
  const handleScan  = (r: ScanResult) => applyScan(r, setFoodA);
  const handleScanB = (r: ScanResult) => applyScan(r, setFoodB);
  const [resultA, setResultA] = useState<DMBResult | null>(null);
  const [resultB, setResultB] = useState<DMBResult | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  const calcA = () => {
    const m = Number(foodA.moisture);
    const p = Number(foodA.protein);
    const f = Number(foodA.fat);
    const fi = Number(foodA.fiber);
    if (isNaN(m) || isNaN(p) || isNaN(f) || isNaN(fi)) return;
    setResultA(
      calculateDryMatterBasis({
        moisture: m,
        protein: p,
        fat: f,
        fiber: fi,
        ash: foodA.ash !== '' ? Number(foodA.ash) : undefined,
        carbs: foodA.carbs !== '' ? Number(foodA.carbs) : undefined,
        foodType: foodA.foodType,
      })
    );
    setTimeout(() => {
      document.getElementById('results-a')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const calcB = () => {
    const m = Number(foodB.moisture);
    const p = Number(foodB.protein);
    const f = Number(foodB.fat);
    const fi = Number(foodB.fiber);
    if (isNaN(m) || isNaN(p) || isNaN(f) || isNaN(fi)) return;
    setResultB(
      calculateDryMatterBasis({
        moisture: m,
        protein: p,
        fat: f,
        fiber: fi,
        ash: foodB.ash !== '' ? Number(foodB.ash) : undefined,
        carbs: foodB.carbs !== '' ? Number(foodB.carbs) : undefined,
        foodType: foodB.foodType,
      })
    );
    setTimeout(() => {
      document.getElementById('results-b')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const calcBoth = () => { calcA(); calcB(); };

  const showComparison = compareMode && resultA && resultB &&
    resultA.errors.length === 0 && resultB.errors.length === 0;

  return (
    <>
      <Helmet>
        <title>Pet Food Dry Matter Basis Calculator | Atlas Veterinary Hospital</title>
        <meta name="description" content="Free pet food dry matter basis (DMB) calculator for dogs and cats. Compare wet vs dry food, get personalized feeding recommendations, and download a PDF report for your vet." />
        <link rel="canonical" href="https://petfooddmb.atlasveterinaryhospital.com/" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-teal-100">
            <span>🐾</span> Veterinary Education Tool
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
            Pet Food Dry Matter<br className="hidden sm:block" /> Basis Calculator
          </h1>
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
            Pet food labels can be misleading because wet food contains much more water than dry food.
            Dry matter basis removes the water so foods can be compared more fairly — and our feeding calculator gives you personalized daily portion recommendations.
          </p>
        </div>

        {/* ── DMB Calculator ── */}
        <div id="calculator" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Enter values from the Guaranteed Analysis on the food label.{' '}
                <Link to="/what-is-dmb" className="text-teal-600 hover:underline">What is DMB?</Link>
              </p>
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors shrink-0 ml-4 ${
                  compareMode
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                {compareMode ? 'Comparing A & B' : 'Compare Two Foods'}
              </button>
            </div>

            {compareMode ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <LabelScanner onApply={handleScan} />
                  <CalculatorForm food={foodA} onChange={setFoodA} onCalculate={calcA} label="Food A" hideCalculate={true} />
                </div>
                <div className="space-y-4">
                  <LabelScanner onApply={handleScanB} />
                  <CalculatorForm food={foodB} onChange={setFoodB} onCalculate={calcB} label="Food B" hideCalculate={true} />
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto w-full space-y-4">
                <LabelScanner onApply={handleScan} />
                <CalculatorForm food={foodA} onChange={setFoodA} onCalculate={calcA} label="Enter Food Label Values" hideCalculate={false} />
              </div>
            )}

            {compareMode && (
              <div className="max-w-2xl mx-auto w-full lg:max-w-none">
                <button
                  type="button"
                  onClick={calcBoth}
                  className="w-full flex items-center justify-center gap-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-base py-4 px-6 rounded-2xl transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                  Compare Food A &amp; B
                </button>
              </div>
            )}

            {(resultA || resultB) && (
              <div className={`grid gap-6 ${compareMode && resultA && resultB ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto w-full'}`}>
                {resultA && <div id="results-a"><ResultsTable result={resultA} food={foodA} label={compareMode ? 'Food A Results' : 'Results'} hidePdf={!!showComparison} /></div>}
                {compareMode && resultB && <div id="results-b"><ResultsTable result={resultB} food={foodB} label="Food B Results" hidePdf={!!showComparison} /></div>}
              </div>
            )}

            {showComparison && (
              <div className="max-w-2xl mx-auto w-full space-y-3">
                <ComparisonSummary foodA={foodA} foodB={foodB} resultA={resultA!} resultB={resultB!} />
                <ComparisonPdfButton foodA={foodA} foodB={foodB} resultA={resultA!} resultB={resultB!} />
              </div>
            )}

            <Disclaimer />
          </div>
        </div>

        {/* Learn more links */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { to: '/what-is-dmb', label: 'What is Dry Matter Basis?' },
            { to: '/how-to-compare', label: 'How to Compare Foods' },
            { to: '/cat-protein', label: 'Protein in Cat Food' },
            { to: '/low-fat-dog', label: 'Low-Fat Dog Food' },
          ].map(link => (
            <Link key={link.to} to={link.to}
              className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium border border-teal-200 hover:border-teal-300 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-colors">
              {link.label} <ChevronRight className="w-4 h-4" />
            </Link>
          ))}
        </div>

        {/* Ad slot */}
        <AdSlot id="ad-top" size="banner" />

        {/* Nutrition consult CTA */}
        <div id="nutrition-consult" className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white text-center">
          <div className="text-3xl mb-3">🏥</div>
          <h3 className="text-xl font-bold mb-2">Have questions about your pet's diet?</h3>
          <p className="text-teal-100 text-sm mb-5 max-w-md mx-auto leading-relaxed">
            The team at Atlas Veterinary Hospital can provide personalized nutrition guidance based on your pet's health history, body condition, and specific needs.
          </p>
          <a href="tel:9092226682"
            className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors">
            Call Us: 909-222-6682
          </a>
        </div>

        {/* Email capture */}
        <EmailCapture />

        {/* Ad slot bottom */}
        <AdSlot id="ad-bottom" size="rectangle" label="Advertisement" />
      </div>
    </>
  );
}
