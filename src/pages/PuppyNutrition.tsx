import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Disclaimer from '../components/Disclaimer';

export default function PuppyNutrition() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Helmet>
        <title>Puppy & Kitten Nutrition: What to Look for in a Growth Diet | Atlas Veterinary Hospital</title>
        <meta name="description" content="Everything you need to know about feeding puppies and kittens — protein levels, calcium-to-phosphorus ratios, caloric density, and when to switch to adult food." />
        <link rel="canonical" href="https://petfooddmb.atlasveterinaryhospital.com/puppy-nutrition" />
      </Helmet>

      <Link to="/" className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Calculator
      </Link>

      {/* Hero */}
      <div>
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-emerald-100">
          Educational Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
          Puppy & Kitten Nutrition:<br className="hidden sm:block" /> What to Look for in a Growth Diet
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Growing animals have dramatically different nutritional needs than adults. Getting nutrition right during the first year (or two, for large breeds) sets the foundation for a lifetime of health. Here's what the science says.
        </p>
      </div>

      {/* Why growth diets are different */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Why Growth Diets Are Different</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          Puppies and kittens are not simply small adults. Their rapid growth requires more protein, more calories, different calcium-to-phosphorus ratios, and specific micronutrients not needed at the same levels in adult maintenance. An adult maintenance food fed exclusively to a growing puppy or kitten can lead to nutritional deficiencies or imbalances.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Look for the AAFCO nutritional adequacy statement: <strong>"formulated to meet the nutritional levels established by AAFCO for growth"</strong> or <strong>"all life stages."</strong> This ensures the food meets growth requirements.
        </p>
      </div>

      {/* Key nutrients */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Key Nutrients for Growing Pets</h2>
        <div className="space-y-4">
          {[
            {
              nutrient: 'Protein',
              icon: '🥩',
              body: 'Growing animals need more protein than adults. Puppies need at least 22% protein on a dry matter basis (AAFCO minimum); kittens need 30% or more. High-quality animal-sourced protein provides essential amino acids like taurine (critical for cats) and arginine. Dry matter basis comparison is especially important here — a canned food with 10% as-fed protein may actually have 45%+ protein on a DMB basis.',
            },
            {
              nutrient: 'Calcium & Phosphorus',
              icon: '🦴',
              body: 'These minerals are critical for skeletal development. The Ca:P ratio should be approximately 1.2:1 to 1.4:1 for puppies and kittens. Excess calcium — particularly a problem when owners add calcium supplements to a complete food — can cause skeletal deformities, especially in large-breed puppies. Never supplement calcium without veterinary guidance.',
            },
            {
              nutrient: 'Calories (Energy Density)',
              icon: '⚡',
              body: 'Growing pets have much higher caloric needs than adults per kilogram of body weight. Puppies may need 2–3× the calories of an adult dog of the same size. Kittens have similarly elevated needs. Caloric density matters — a lower-calorie food means the puppy must eat a larger volume to meet energy needs, which can cause GI upset.',
            },
            {
              nutrient: 'DHA (Omega-3)',
              icon: '🐟',
              body: 'DHA is essential for brain and retinal development. Most quality puppy and kitten foods are supplemented with DHA from fish oil or microalgae. Look for it in the ingredient list or guaranteed analysis.',
            },
            {
              nutrient: 'Fat',
              icon: '💧',
              body: 'Fat provides essential fatty acids and fat-soluble vitamins (A, D, E, K). Growing pets need adequate fat — typically 8–20% on a dry matter basis. Avoid extremely low-fat diets in puppies and kittens unless directed by a veterinarian.',
            },
          ].map(item => (
            <div key={item.nutrient} className="flex gap-4 bg-gray-50 rounded-xl p-4">
              <div className="text-2xl flex-shrink-0">{item.icon}</div>
              <div>
                <div className="font-bold text-gray-900 text-sm mb-1">{item.nutrient}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Large breed puppies */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Special Considerations: Large Breed Puppies</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          Large and giant breed puppies (adult weight &gt; 50 lbs) are at risk of developmental orthopedic disease (DOD) if fed incorrectly. Key differences:
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          {[
            'Use a food specifically formulated for large-breed puppies — these have lower calcium and phosphorus than small-breed puppy foods',
            'Avoid over-supplementation with calcium, vitamin D, or phosphorus',
            'Avoid overfeeding — excess caloric intake promotes rapid growth that stresses developing joints',
            'Switch to adult large-breed food at 12–18 months (varies by breed)',
            'Many large-breed dogs benefit from staying on growth food until they reach ~80% of expected adult weight',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* When to switch */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">When to Switch to Adult Food</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Animal</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Typical switch age</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                { animal: 'Small breed dog (< 20 lbs)', age: '9–12 months', note: 'Earlier maturity; can switch once skeletal growth complete' },
                { animal: 'Medium breed dog (20–50 lbs)', age: '12 months', note: 'Standard guideline for most medium breeds' },
                { animal: 'Large breed dog (50–90 lbs)', age: '12–18 months', note: 'Growth plates close later; use large-breed puppy food' },
                { animal: 'Giant breed dog (> 90 lbs)', age: '18–24 months', note: 'Longest growing period; consult your vet' },
                { animal: 'Cat (all breeds)', age: '10–12 months', note: 'Cats reach near-adult size faster than large breed dogs' },
              ].map((row, i) => (
                <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.animal}</td>
                  <td className="px-4 py-3 text-emerald-700 font-semibold">{row.age}</td>
                  <td className="px-4 py-3 text-gray-600">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white text-center">
        <div className="text-2xl mb-2">🐾</div>
        <h3 className="text-lg font-bold mb-2">New puppy or kitten? Let us help.</h3>
        <p className="text-teal-100 text-sm mb-4 max-w-md mx-auto">
          Atlas Veterinary Hospital offers new puppy and kitten wellness visits with personalized nutrition guidance. We'll help you choose the right food and feeding schedule.
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
          { to: '/cat-protein', label: 'Protein in Cat Food' },
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
