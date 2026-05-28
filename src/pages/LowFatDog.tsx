import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Disclaimer from '../components/Disclaimer';

export default function LowFatDog() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Helmet>
        <title>Low-Fat Dog Food: What Does Fat % Really Mean? | Atlas Veterinary Hospital</title>
        <meta name="description" content="Understanding fat percentage in dog food on a dry matter basis. Learn what qualifies as a low-fat dog food and when it's recommended for conditions like pancreatitis." />
        <link rel="canonical" href="https://petfooddmb.atlasveterinaryhospital.com/low-fat-dog" />
      </Helmet>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Calculator
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Low-Fat Dog Food: What Does Fat Percentage Really Mean?</h1>
        <p className="text-gray-500">Understanding fat content on dog food labels using dry matter basis</p>
      </div>

      <div className="space-y-5">
        {[
          {
            title: 'Why low-fat diets matter for some dogs',
            body: 'Low-fat diets are often recommended for dogs with pancreatitis, hyperlipidemia (high blood triglycerides or cholesterol), lymphangiectasia, or other fat-sensitive GI conditions. Fat restriction can also be part of a weight management plan. The appropriate fat level depends on the individual dog\'s condition — always work with your veterinarian.',
          },
          {
            title: 'What "low fat" means on a label',
            body: 'A common guideline used in veterinary nutrition is that a truly low-fat food has less than 10% fat on a dry matter basis. Some conditions require even lower (under 6–8% DMB fat). Knowing the label fat percentage isn\'t enough — you need to convert to DMB to meaningfully compare foods.',
          },
          {
            title: 'Example',
            body: '',
            example: {
              label: 'Canned dog food: 4% fat, 79% moisture',
              steps: ['Dry Matter = 100 − 79 = 21%', 'Fat DMB = (4 ÷ 21) × 100 = 19%'],
              note: 'This food has 4% fat on the label, but 19% fat DMB — not low-fat at all.',
            },
          },
          {
            title: 'How to find a truly low-fat food',
            body: 'Use our calculator to convert any canned or dry food\'s fat percentage to dry matter basis. Look for foods with less than 10% fat DMB for low-fat requirements. Remember: calories also matter. A lower-fat food that is very calorie-dense may still contribute to weight gain.',
          },
        ].map((section, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h2>
            {section.body && <p className="text-gray-600 text-sm leading-relaxed">{section.body}</p>}
            {section.example && (
              <div className="space-y-2">
                <div className="font-semibold text-sm text-orange-700">{section.example.label}</div>
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
          Calculate Your Dog Food's Fat DMB
        </Link>
      </div>

      <Disclaimer />
    </div>
  );
}
