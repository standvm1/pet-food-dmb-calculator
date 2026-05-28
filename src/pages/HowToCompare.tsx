import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Disclaimer from '../components/Disclaimer';

const steps = [
  {
    number: '1',
    title: 'Find the Guaranteed Analysis',
    body: 'On any pet food package, look for the "Guaranteed Analysis" section. It must list Crude Protein (min), Crude Fat (min), Crude Fiber (max), and Moisture (max) by law.',
  },
  {
    number: '2',
    title: 'Note the moisture percentage',
    body: 'The moisture % is the key value. Wet/canned foods are typically 75–82%. Dry foods are typically 8–12%. This number tells you how much of the food is water.',
  },
  {
    number: '3',
    title: 'Enter the values into the calculator',
    body: 'Enter moisture, protein, fat, fiber, and optionally ash and carbohydrates. If ash is not listed on the label, the calculator will estimate it automatically.',
  },
  {
    number: '4',
    title: 'Read the dry matter basis results',
    body: 'The calculator shows each nutrient converted to dry matter basis — what the nutrient percentage would be if all the water were removed. Now you can compare any two foods fairly.',
  },
];

export default function HowToCompare() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Helmet>
        <title>How to Compare Wet and Dry Pet Food | Atlas Veterinary Hospital</title>
        <meta name="description" content="Step-by-step guide to comparing wet and dry pet food using dry matter basis. Learn how to read a pet food label and convert as-fed values to dry matter basis." />
        <link rel="canonical" href="https://petfooddmb.atlasveterinaryhospital.com/how-to-compare" />
      </Helmet>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Calculator
      </Link>

      <div>
        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-teal-100">
          <BookOpen className="w-3.5 h-3.5" /> Learn
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">How to Compare Wet and Dry Pet Food</h1>
        <p className="text-gray-500">A step-by-step guide for pet owners</p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex gap-4">
            <div className="w-9 h-9 bg-teal-600 text-white rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
              {step.number}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Example */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Real comparison example</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
            <div className="font-bold text-amber-800 mb-2">🥣 Dry Kibble</div>
            <div className="space-y-1 text-amber-700">
              <div>Moisture: <strong>10%</strong></div>
              <div>Protein (label): <strong>25%</strong></div>
              <div>Protein (DMB): <strong className="text-amber-900">27.8%</strong></div>
            </div>
          </div>
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-gray-300 rotate-90 sm:rotate-0" />
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm">
            <div className="font-bold text-teal-800 mb-2">🥫 Canned Food</div>
            <div className="space-y-1 text-teal-700">
              <div>Moisture: <strong>78%</strong></div>
              <div>Protein (label): <strong>10%</strong></div>
              <div>Protein (DMB): <strong className="text-teal-900">45.5%</strong></div>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          The canned food's label protein (10%) looks much lower than the dry food's (25%). But after removing water,
          the canned food actually has significantly more protein per unit of dry nutrition (45.5% vs 27.8%).
          This is why dry matter basis comparison is so valuable.
        </p>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Common questions</h2>
        {[
          {
            q: 'Does DMB tell me which food is better?',
            a: 'Not on its own. DMB tells you the relative nutrient content, but which food is better depends on your pet\'s species, age, weight, health conditions, and overall nutritional balance. Your veterinarian can help interpret results for your specific pet.',
          },
          {
            q: 'What if ash isn\'t on the label?',
            a: 'Ash is often not listed on commercial pet food labels. Our calculator uses a standard estimate (2.5% for canned, 7% for dry) to calculate carbohydrates. You can enter the actual ash percentage if your food label includes it under "Guaranteed Analysis" or the manufacturer\'s website.',
          },
          {
            q: 'Why aren\'t carbohydrates listed on pet food labels?',
            a: 'In the US, pet food labels are not required to list carbohydrate content. However, carbs can be estimated using the NFE (nitrogen-free extract) method: 100 minus all other nutrients. This is an approximation because it includes errors from the other measurements.',
          },
          {
            q: 'Can I use this for prescription diets?',
            a: 'Yes — the DMB calculation works the same way. However, prescription diets are formulated for specific medical conditions and involve nutrients not always on the label (like phosphorus for kidney disease). Always follow your veterinarian\'s guidance for medical diets.',
          },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-1.5">{item.q}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
          </div>
        ))}
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
