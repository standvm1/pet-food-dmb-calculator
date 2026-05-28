import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Disclaimer from '../components/Disclaimer';

export default function CatProtein() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Helmet>
        <title>Protein in Cat Food: As-Fed vs Dry Matter Basis | Atlas Veterinary Hospital</title>
        <meta name="description" content="Why does cat food protein percentage look different on a dry matter basis? Learn how to accurately compare protein levels in wet and dry cat food using DMB calculations." />
        <link rel="canonical" href="https://petfooddmb.atlasveterinaryhospital.com/cat-protein" />
      </Helmet>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Calculator
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Protein in Cat Food: As-Fed vs Dry Matter Basis</h1>
        <p className="text-gray-500">Why cat food protein percentages can look much lower than they really are</p>
      </div>

      <div className="space-y-5">
        {[
          {
            title: 'Cats are obligate carnivores',
            body: 'Cats have higher protein requirements than dogs and most other mammals. They must consume animal-based protein to obtain certain essential amino acids like taurine and arginine. Understanding the true protein content of cat food — not just the label value — helps you make more informed choices.',
          },
          {
            title: 'Why canned cat food labels look low in protein',
            body: 'A typical canned cat food might list 10–12% crude protein on the label. This low-looking number is because wet food is 75–82% water. After converting to dry matter basis, that same food often has 45–55% protein — which is actually quite high and appropriate for cats.',
          },
          {
            title: 'Example calculation',
            body: '',
            example: {
              label: 'Canned cat food: 11% protein, 78% moisture',
              steps: ['Dry Matter = 100 − 78 = 22%', 'Protein DMB = (11 ÷ 22) × 100 = 50%'],
              note: 'The label says 11% protein, but the dry matter protein is 50% — appropriate for a carnivore.',
            },
          },
          {
            title: 'Dry food vs. canned food for cats',
            body: 'Dry cat food typically has 30–45% protein on a dry matter basis, while quality canned foods often have 45–55% DMB protein. Some veterinarians recommend canned food for cats partly because of the added hydration — cats naturally have a low thirst drive and may not drink enough on a dry food diet.',
          },
        ].map((section, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h2>
            {section.body && <p className="text-gray-600 text-sm leading-relaxed">{section.body}</p>}
            {section.example && (
              <div className="space-y-2">
                <div className="font-semibold text-sm text-teal-700">{section.example.label}</div>
                <div className="bg-gray-50 rounded-xl p-3 font-mono text-sm space-y-1 text-gray-700">
                  {section.example.steps.map((s, j) => <div key={j}>{s}</div>)}
                </div>
                <p className="text-xs text-gray-500 italic">{section.example.note}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Link to="/" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          Calculate Your Cat Food's DMB
        </Link>
      </div>

      <Disclaimer />
    </div>
  );
}
