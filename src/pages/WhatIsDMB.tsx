import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Disclaimer from '../components/Disclaimer';

export default function WhatIsDMB() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Helmet>
        <title>What is Dry Matter Basis? | Pet Food Nutrition Guide | Atlas Veterinary Hospital</title>
        <meta name="description" content="Learn what dry matter basis (DMB) means in pet food nutrition, why it matters when comparing wet and dry foods, and how to calculate it for your dog or cat." />
        <link rel="canonical" href="https://petfooddmb.atlasveterinaryhospital.com/what-is-dmb" />
      </Helmet>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Calculator
      </Link>

      <div>
        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-teal-100">
          <BookOpen className="w-3.5 h-3.5" /> Learn
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">What is Dry Matter Basis?</h1>
        <p className="text-gray-500">An educational guide for pet owners</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-6">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">The water problem</h2>
          <p className="text-gray-600 leading-relaxed">
            When you compare a dry kibble with a canned wet food, the numbers on the label can look very different —
            even if the foods have similar nutrition. The reason is simple: <strong>water doesn't have nutrients</strong>,
            but it makes up most of the weight in wet food.
          </p>
          <p className="text-gray-600 leading-relaxed">
            A typical canned food is 75–82% water. A typical dry food is only about 8–12% water.
            That means there's much less "room" for nutrients in a canned food on a weight-for-weight basis.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">What dry matter basis does</h2>
          <p className="text-gray-600 leading-relaxed">
            Dry Matter Basis (DMB) is a calculation that removes the water from both foods so you can compare
            them on equal terms — as if both foods had zero moisture.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-700 space-y-2">
            <div><strong>Step 1:</strong> Dry Matter % = 100 − Moisture %</div>
            <div><strong>Step 2:</strong> Nutrient (DMB) = (Nutrient as-fed % ÷ Dry Matter %) × 100</div>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 space-y-1 text-sm">
            <div className="font-semibold text-teal-800 mb-2">Example: Canned food with 10% protein, 78% moisture</div>
            <div className="text-teal-700">Dry Matter = 100 − 78 = <strong>22%</strong></div>
            <div className="text-teal-700">Protein DMB = (10 ÷ 22) × 100 = <strong>45.5%</strong></div>
            <div className="text-xs text-teal-600 mt-2">The label says 10% protein, but the real protein content (minus water) is 45.5%.</div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Why does this matter?</h2>
          <p className="text-gray-600 leading-relaxed">
            Without this conversion, a canned food with 10% protein label looks lower than a dry food with 25% protein.
            But after converting to dry matter basis, the canned food may actually have <em>more</em> protein per unit of nutrition.
          </p>
          <p className="text-gray-600 leading-relaxed">
            This is especially important when:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
            <li>Comparing dry and wet foods for the same pet</li>
            <li>Evaluating a food for a medical condition (kidney disease, diabetes, etc.)</li>
            <li>Trying to choose a lower-fat or higher-protein food</li>
            <li>Understanding a veterinary dietary recommendation</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">What about carbohydrates?</h2>
          <p className="text-gray-600 leading-relaxed">
            Carbohydrates are almost never listed on pet food labels in the US. They can be estimated using a method
            called the Nitrogen-Free Extract (NFE):
          </p>
          <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-700">
            Carbs (as-fed) = 100 − protein − fat − fiber − moisture − ash
          </div>
          <p className="text-gray-600 leading-relaxed text-sm">
            Ash (the mineral content) is also often not listed. Our calculator uses a default estimate of 2.5% for
            canned foods and 7% for dry foods, but you can enter the actual value if your food label includes it.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Try the Calculator
        </Link>
      </div>

      <Disclaimer />
    </div>
  );
}
