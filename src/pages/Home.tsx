import { useState } from 'react';
import { ArrowLeftRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import CalculatorForm, { defaultFood } from '../components/CalculatorForm';
import ResultsTable from '../components/ResultsTable';
import FoodComparisonExample from '../components/FoodComparisonExample';
import ComparisonSummary from '../components/ComparisonSummary';
import Disclaimer from '../components/Disclaimer';
import AdSlot from '../components/AdSlot';
import EmailCapture from '../components/EmailCapture';
import { calculateDryMatterBasis } from '../utils/calculations';
import type { FoodInput, DMBResult } from '../types';

export default function Home() {
  const [foodA, setFoodA] = useState<FoodInput>(defaultFood());
  const [foodB, setFoodB] = useState<FoodInput>(defaultFood());
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

        {/* Feeding calculator cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { to: '/feeding-calculator', emoji: '🍽️', title: 'How Much Should I Feed?', desc: 'Get a personalized daily portion based on your pet\'s weight and body condition.', color: 'border-teal-200 hover:border-teal-400 hover:bg-teal-50' },
            { to: '/weight-loss-calculator', emoji: '📉', title: 'Weight Loss Calculator', desc: 'Safe feeding plan for overweight pets — includes a timeline to reach ideal weight.', color: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50' },
            { to: '/weight-gain-calculator', emoji: '📈', title: 'Weight Gain Calculator', desc: 'Help underweight pets reach a healthy body condition safely and gradually.', color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' },
          ].map(card => (
            <Link key={card.to} to={card.to}
              className={`bg-white rounded-2xl border-2 p-5 transition-all group ${card.color}`}>
              <div className="text-3xl mb-3">{card.emoji}</div>
              <h3 className="font-bold text-gray-900 text-sm mb-1.5 group-hover:text-teal-700 transition-colors">{card.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
            </Link>
          ))}
        </div>

        {/* Quick example */}
        <FoodComparisonExample />

        {/* Learn more links */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { to: '/what-is-dmb', label: 'What is Dry Matter Basis?' },
            { to: '/how-to-compare', label: 'How to Compare Foods' },
            { to: '/cat-protein', label: 'Protein in Cat Food' },
            { to: '/low-fat-dog', label: 'Low-Fat Dog Food' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium border border-teal-200 hover:border-teal-300 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-colors"
            >
              {link.label} <ChevronRight className="w-4 h-4" />
            </Link>
          ))}
        </div>

        {/* Ad slot */}
        <AdSlot id="ad-top" size="banner" />

        {/* Compare mode toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Calculator</h2>
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors ${
              compareMode
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            {compareMode ? 'Side-by-Side Active' : 'Compare Two Foods'}
          </button>
        </div>

        {/* Forms */}
        <div className={`grid gap-6 ${compareMode ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto w-full'}`}>
          <div>
            <CalculatorForm
              food={foodA}
              onChange={setFoodA}
              onCalculate={calcA}
              label={compareMode ? 'Food A' : 'Enter Food Label Values'}
            />
          </div>
          {compareMode && (
            <div>
              <CalculatorForm
                food={foodB}
                onChange={setFoodB}
                onCalculate={calcB}
                label="Food B"
              />
            </div>
          )}
        </div>

        {/* Results */}
        {(resultA || resultB) && (
          <div className={`grid gap-6 ${compareMode && resultA && resultB ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto w-full'}`}>
            {resultA && (
              <div id="results-a">
                <ResultsTable result={resultA} food={foodA} label={compareMode ? 'Food A Results' : 'Results'} />
              </div>
            )}
            {compareMode && resultB && (
              <div id="results-b">
                <ResultsTable result={resultB} food={foodB} label="Food B Results" />
              </div>
            )}
          </div>
        )}

        {/* Comparison summary */}
        {showComparison && (
          <div className="max-w-2xl mx-auto w-full">
            <ComparisonSummary
              foodA={foodA}
              foodB={foodB}
              resultA={resultA!}
              resultB={resultB!}
            />
          </div>
        )}

        {/* Disclaimer */}
        <Disclaimer />

        {/* Nutrition consult CTA */}
        <div id="nutrition-consult" className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white text-center">
          <div className="text-3xl mb-3">🏥</div>
          <h3 className="text-xl font-bold mb-2">Have questions about your pet's diet?</h3>
          <p className="text-teal-100 text-sm mb-5 max-w-md mx-auto leading-relaxed">
            The team at Atlas Veterinary Hospital can provide personalized nutrition guidance based on your pet's health history, body condition, and specific needs.
          </p>
          <a
            href="tel:9092226682"
            className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors"
          >
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
