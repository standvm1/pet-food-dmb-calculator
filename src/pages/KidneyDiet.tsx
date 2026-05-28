import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Disclaimer from '../components/Disclaimer';

export default function KidneyDiet() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Helmet>
        <title>Kidney Diet for Dogs & Cats: What to Look for on the Label | Atlas Veterinary Hospital</title>
        <meta name="description" content="Learn what makes a renal diet different, what nutrients matter most in kidney disease, and how to evaluate pet food labels for dogs and cats with CKD." />
        <link rel="canonical" href="https://petfooddmb.atlasveterinaryhospital.com/kidney-diet" />
      </Helmet>

      <Link to="/" className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Calculator
      </Link>

      {/* Hero */}
      <div>
        <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-purple-100">
          Educational Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
          Kidney Diet for Dogs & Cats:<br className="hidden sm:block" /> What to Look for on the Label
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Chronic kidney disease (CKD) is one of the most common conditions in older pets. Diet plays a central role in slowing progression and keeping your pet comfortable — but renal nutrition is more complex than simply reducing protein. Here's what you need to know.
        </p>
      </div>

      {/* Key nutrients */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Key Nutrients in Kidney Disease</h2>
        <div className="space-y-4">
          {[
            {
              nutrient: 'Phosphorus',
              color: 'bg-purple-600',
              body: 'Phosphorus restriction is the single most important dietary intervention for pets with CKD. High phosphorus accelerates kidney damage. Renal diets restrict phosphorus to 0.2–0.5% on a dry matter basis. Unfortunately, phosphorus is rarely listed on standard pet food labels — you must check the manufacturer\'s nutritional information or use a prescription diet.',
            },
            {
              nutrient: 'Protein',
              color: 'bg-blue-600',
              body: 'The protein debate in renal disease is nuanced. Severely restricting protein can cause muscle wasting and malnutrition — especially in cats, who are obligate carnivores with high protein requirements. Most current guidelines emphasize high-quality, easily digestible protein at moderate levels rather than severe restriction. The goal is minimizing nitrogenous waste while maintaining muscle mass.',
            },
            {
              nutrient: 'Sodium',
              color: 'bg-teal-600',
              body: 'Sodium restriction helps manage hypertension, a common complication of CKD. Avoid high-sodium foods and treats. Mild restriction (0.2–0.4% DMB) is appropriate for most renal patients.',
            },
            {
              nutrient: 'Omega-3 Fatty Acids',
              color: 'bg-green-600',
              body: 'Marine-sourced omega-3 fatty acids (EPA and DHA) have anti-inflammatory effects that may slow CKD progression and reduce proteinuria. Many prescription renal diets are supplemented with fish oil. Look for foods with omega-3 content or add a veterinarian-recommended fish oil supplement.',
            },
            {
              nutrient: 'Potassium',
              color: 'bg-orange-600',
              body: 'Cats with CKD often develop hypokalemia (low potassium). Renal diets for cats are typically potassium-supplemented. Dogs may experience hyperkalemia (high potassium) in later stages. Monitoring bloodwork is essential.',
            },
            {
              nutrient: 'Calories & Palatability',
              color: 'bg-pink-600',
              body: 'Maintaining caloric intake is critical. Nausea, reduced appetite, and uremic toxins all reduce food intake in CKD patients. If a pet refuses a renal diet, they lose the therapeutic benefit. Work with your veterinarian to find a palatable formulation.',
            },
          ].map(item => (
            <div key={item.nutrient} className="flex gap-4">
              <div className={`w-1.5 rounded-full flex-shrink-0 ${item.color}`} />
              <div>
                <div className="font-bold text-gray-900 text-sm mb-0.5">{item.nutrient}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stages of CKD */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">CKD Staging & Dietary Goals</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Stage (IRIS)</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Creatinine (mg/dL)</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Dietary Priority</th>
              </tr>
            </thead>
            <tbody>
              {[
                { stage: 'Stage 1', creat: '< 1.6 (dog) / < 1.6 (cat)', goal: 'Phosphorus monitoring, fresh water access, avoid high-sodium foods' },
                { stage: 'Stage 2', creat: '1.6–2.8 (dog) / 1.6–2.8 (cat)', goal: 'Consider renal diet, restrict phosphorus, maintain caloric intake' },
                { stage: 'Stage 3', creat: '2.9–5.0 (dog) / 2.9–5.0 (cat)', goal: 'Prescription renal diet strongly recommended, potassium monitoring' },
                { stage: 'Stage 4', creat: '> 5.0', goal: 'Prescription renal diet, appetite stimulation, consider phosphate binders' },
              ].map((row, i) => (
                <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-3 font-semibold text-purple-700">{row.stage}</td>
                  <td className="px-4 py-3 text-gray-600">{row.creat}</td>
                  <td className="px-4 py-3 text-gray-700">{row.goal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">IRIS = International Renal Interest Society. Staging also considers UPC ratio, blood pressure, and clinical signs. Always stage with your veterinarian.</p>
      </div>

      {/* Prescription vs OTC */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Can I Use an Over-the-Counter Food?</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          Standard pet foods — even those marketed as "low phosphorus" or "senior" — do not consistently meet the therapeutic phosphorus thresholds needed for CKD management. Only prescription renal diets from companies like Hill's, Royal Canin, and Purina Pro Plan (Veterinary Diets) are formulated and tested specifically for kidney disease.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Our calculator can help you compare the dry matter basis values of foods, but phosphorus content is not routinely listed on labels. Always discuss food selection with your veterinarian, who can access detailed nutritional analyses from manufacturers.
        </p>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white text-center">
        <div className="text-2xl mb-2">🏥</div>
        <h3 className="text-lg font-bold mb-2">Has your pet been diagnosed with kidney disease?</h3>
        <p className="text-teal-100 text-sm mb-4 max-w-md mx-auto">
          Our team at Atlas Veterinary Hospital can help interpret your pet's bloodwork, recommend an appropriate renal diet, and set up a monitoring plan.
        </p>
        <a
          href="tel:9092226682"
          className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-5 py-2.5 rounded-xl hover:bg-teal-50 transition-colors text-sm"
        >
          <BookOpen className="w-4 h-4" />
          Call Atlas Veterinary: 909-222-6682
        </a>
      </div>

      {/* Related links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { to: '/what-is-dmb', label: 'What is Dry Matter Basis?' },
          { to: '/low-fat-dog', label: 'Low-Fat Dog Food Guide' },
          { to: '/food-search', label: 'Browse Food Database' },
          { to: '/', label: 'Use the Calculator' },
        ].map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:text-teal-700 hover:border-teal-200 hover:bg-teal-50 transition-colors"
          >
            {link.label}
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        ))}
      </div>

      <Disclaimer />
    </div>
  );
}
