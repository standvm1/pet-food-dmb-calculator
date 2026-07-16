import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Leaf, AlertTriangle, CheckCircle, Info, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import FoodRecommendations from '../components/FoodRecommendations';
import type { RecommendedFood } from '../data/dietRecommendations';
import LabelScanner from '../components/LabelScanner';

type Species = 'dog' | 'cat';
type Approach = 'novel' | 'hydrolyzed';

const PROTEINS = ['chicken', 'turkey', 'beef', 'lamb', 'pork', 'fish/salmon', 'duck', 'rabbit', 'venison', 'bison', 'egg', 'whitefish'];
const GRAINS = ['rice', 'corn', 'wheat', 'potato', 'pea', 'oat', 'soy', 'barley', 'tapioca', 'lentil'];

const ALL_PROTEINS_RANKED = ['rabbit', 'venison', 'duck', 'bison', 'fish/salmon', 'pork', 'lamb', 'turkey', 'chicken', 'beef', 'egg', 'whitefish'];

const SYMPTOMS: { id: string; label: string }[] = [
  { id: 'vomiting', label: 'Vomiting / regurgitation' },
  { id: 'diarrhea', label: 'Diarrhea / loose stools' },
  { id: 'skin', label: 'Itchy skin / redness / hot spots' },
  { id: 'ears', label: 'Chronic ear infections' },
  { id: 'paws', label: 'Licking paws / face rubbing' },
  { id: 'gas', label: 'Excessive gas / bloating' },
];

export default function EliminationDietPage() {
  const [species, setSpecies] = useState<Species>('dog');
  const [approach, setApproach] = useState<Approach>('novel');
  const [proteinsEaten, setProteinsEaten] = useState<Set<string>>(new Set(['chicken', 'beef']));
  const [grainsEaten, setGrainsEaten] = useState<Set<string>>(new Set(['rice', 'corn']));
  const [symptoms, setSymptoms] = useState<Set<string>>(new Set());
  const [loadedFood, setLoadedFood] = useState<string | null>(null);

  function toggleSet<T extends string>(set: Set<T>, val: T): Set<T> {
    const next = new Set(set);
    if (next.has(val)) next.delete(val); else next.add(val);
    return next;
  }

  function handleUseFood(food: RecommendedFood) {
    setLoadedFood(`${food.brand} ${food.name}`);
    setTimeout(() => setLoadedFood(null), 4000);
  }

  const novelProteins = ALL_PROTEINS_RANKED.filter(p => !proteinsEaten.has(p));
  const novelGrains = GRAINS.filter(g => !grainsEaten.has(g));

  const hasSkinSigns = symptoms.has('skin') || symptoms.has('ears') || symptoms.has('paws');
  const trialWeeks = hasSkinSigns ? 12 : 8;

  const sl = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900';

  const TIPS = [
    { title: 'Strict means strict — zero exceptions', body: 'Any exposure to the old food, treats, flavored medications, or even flavored toothpaste can restart the trial. Every household member must know the rules.' },
    { title: 'Skin reactions take longest to clear', body: 'GI signs may improve within 2–3 weeks. Skin lesions can take 8–12 weeks to fully resolve. Do not give up at 4 weeks if skin is the primary concern.' },
    { title: 'Confirm with a challenge', body: 'After the trial, re-expose to the original food (food challenge). If symptoms return within days, this confirms food allergy and validates the elimination diet result.' },
    { title: 'Flavored medications count', body: 'Chicken-flavored chewable tablets, beef-flavored heartworm prevention, and meat-flavored dental treats can all break the elimination diet. Use unflavored medications where possible.' },
    { title: 'One new ingredient at a time', body: 'After the trial, reintroduce one food ingredient every 2 weeks to identify the specific trigger. This is how you build a long-term ingredient-safe diet.' },
  ];

  return (
    <>
      <Helmet>
        <title>Elimination Diet Planner | Atlas Veterinary Hospital</title>
        <meta name="description" content="Plan a proper food elimination diet trial for dogs and cats with food allergies. Novel protein selection, trial duration, and hypoallergenic diet recommendations." />
      </Helmet>

      <div className="bg-green-50 border-b border-green-100">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-green-100">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Elimination Diet Planner</h1>
              <p className="text-sm text-gray-500 mt-0.5">Novel protein selection &amp; trial guidance for food allergies</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <LabelScanner accentClass="focus:ring-green-500" />

        {/* Species + symptoms */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Patient &amp; Symptoms</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Species</label>
            <select className={sl} value={species} onChange={e => setSpecies(e.target.value as Species)}>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Current symptoms (select all that apply)</label>
            <div className="grid grid-cols-2 gap-2">
              {SYMPTOMS.map(s => (
                <label key={s.id} className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${symptoms.has(s.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                  <input type="checkbox" checked={symptoms.has(s.id)} onChange={() => setSymptoms(prev => toggleSet(prev, s.id))} className="w-4 h-4 accent-green-600" />
                  <span className="text-sm text-gray-700">{s.label}</span>
                </label>
              ))}
            </div>
          </div>
          {symptoms.size > 0 && (
            <div className={`rounded-xl p-3 text-sm ${hasSkinSigns ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}`}>
              <strong>Recommended trial duration: {trialWeeks} weeks.</strong>
              {hasSkinSigns
                ? ' Skin signs take 8–12 weeks to fully resolve — do not stop the trial early.'
                : ' GI signs often improve within 3–4 weeks, but continue for 8 weeks to confirm.'}
            </div>
          )}
        </div>

        {/* Diet approach */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Diet Approach</h2>
          <div className="space-y-2">
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer ${approach === 'novel' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
              <input type="radio" name="approach" checked={approach === 'novel'} onChange={() => setApproach('novel')} className="accent-green-600 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800">Novel protein diet</div>
                <div className="text-xs text-gray-600 mt-0.5">Use a protein source the pet has never eaten before (rabbit, venison, duck). Less expensive, but requires careful ingredient checking — many commercial foods contain hidden proteins (e.g. "natural flavors" often means chicken).</div>
              </div>
            </label>
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer ${approach === 'hydrolyzed' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
              <input type="radio" name="approach" checked={approach === 'hydrolyzed'} onChange={() => setApproach('hydrolyzed')} className="accent-green-600 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800">Hydrolyzed protein diet (Rx)</div>
                <div className="text-xs text-gray-600 mt-0.5">Prescription diets (Hill's z/d, Purina HA, Royal Canin HP) use proteins broken into peptides too small for the immune system to react to. More reliable but requires a prescription and costs more.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Novel protein — ingredients history */}
        {approach === 'novel' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">Ingredients Previously Fed</h2>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Protein sources ever eaten (check all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {PROTEINS.map(p => (
                  <button key={p} onClick={() => setProteinsEaten(prev => toggleSet(prev, p))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${proteinsEaten.has(p) ? 'bg-red-100 border-red-400 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'}`}>
                    {proteinsEaten.has(p) ? '✓ ' : ''}{p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Carbohydrate/grain sources ever eaten</label>
              <div className="flex flex-wrap gap-2">
                {GRAINS.map(g => (
                  <button key={g} onClick={() => setGrainsEaten(prev => toggleSet(prev, g))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${grainsEaten.has(g) ? 'bg-red-100 border-red-400 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'}`}>
                    {grainsEaten.has(g) ? '✓ ' : ''}{g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Elimination Diet Plan</h2>

          {approach === 'novel' ? (
            <>
              {novelProteins.length > 0 ? (
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-3">Novel proteins available (not previously fed):</div>
                  <div className="space-y-2">
                    {novelProteins.map((p, i) => (
                      <div key={p} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        {i === 0 ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" /> : <span className="w-4 h-4 flex-shrink-0 text-gray-300 text-center text-xs">{i + 1}.</span>}
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-800 capitalize">{p}</span>
                          {i === 0 && <span className="ml-2 text-xs text-green-600 font-medium">— top recommendation</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">Your pet has eaten all common proteins! A hydrolyzed protein diet (z/d, HA, HP) is strongly recommended in this case — it works regardless of prior exposure.</p>
                </div>
              )}
              {novelGrains.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-2">Novel carbohydrate sources (not previously fed):</div>
                  <div className="flex flex-wrap gap-2">
                    {novelGrains.map(g => (
                      <span key={g} className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium capitalize">{g}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm text-gray-800 mb-1">Hydrolyzed protein approach selected</div>
                <div className="text-xs text-gray-700 leading-relaxed">With hydrolyzed diets (Hill's z/d, Purina HA, Royal Canin HP), prior protein exposure does not matter — the proteins are broken down below the threshold of immune recognition. Pick the option your pet accepts best.</div>
              </div>
            </div>
          )}

          {/* Trial timeline */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="font-semibold text-sm text-gray-800 mb-3">Trial Timeline</div>
            <div className="space-y-2">
              {[
                { week: 'Week 0', label: 'Begin strict elimination diet. Remove all old food, treats, flavored supplements.' },
                { week: 'Week 2–3', label: 'GI signs should start improving if food allergy. No change in skin yet.' },
                { week: 'Week 4–6', label: 'Mid-check: if no improvement at all, consult your vet — may need to consider non-dietary causes.' },
                { week: `Week ${trialWeeks}`, label: 'End of trial. If improved: do a food challenge with old food to confirm. If not: food allergy is less likely.' },
              ].map(item => (
                <div key={item.week} className="flex gap-3">
                  <div className="text-xs font-bold text-green-700 w-20 flex-shrink-0 pt-0.5">{item.week}</div>
                  <div className="text-xs text-gray-600 leading-relaxed">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {loadedFood && (
            <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 rounded-xl px-4 py-2.5">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Loaded: {loadedFood}
            </div>
          )}
        </div>

        {/* Important warning */}
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
          <div className="text-sm text-red-800 leading-relaxed">
            <strong>Home-cooked diets for elimination trials must be nutritionally balanced.</strong> A 6–12 week trial on an unbalanced home-cooked diet can cause nutritional deficiencies. Use a commercially prepared, balanced novel protein or hydrolyzed diet, or consult a veterinary nutritionist for a balanced home-cooked recipe.
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Elimination Diet Rules</h2>
          <div className="space-y-3">
            {TIPS.map(t => (
              <div key={t.title}>
                <div className="text-sm font-medium text-gray-800">{t.title}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.body}</div>
              </div>
            ))}
          </div>
        </div>

        <FoodRecommendations
          species={species}
          goals={['hypoallergenic']}
          onUse={handleUseFood}
          heading="Recommended hypoallergenic / hydrolyzed diets"
        />

        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">Skin allergies in dogs and cats have multiple causes (environmental allergens, flea allergy, food). An elimination diet rules out food as a cause but does not address other triggers. <a href="tel:9092226682" className="font-semibold underline">Call Atlas Veterinary (909-222-6682)</a> for a full allergy workup.</p>
        </div>

        <div className="no-print">
          <button type="button" onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 px-4 py-3 rounded-xl transition-colors">
            <Printer className="w-4 h-4" />
            Save as PDF
          </button>
        </div>

        <div className="pt-2 border-t border-gray-100 text-sm text-gray-400 text-center">
          <Link to="/feeding-calculator" className="text-green-600 hover:underline">General Feeding Calculator</Link>
          {' · '}
          <Link to="/omega3-calculator" className="text-green-600 hover:underline">Omega-3 Calculator</Link>
          {' · '}
          <Link to="/" className="text-green-600 hover:underline">Food Label Comparison</Link>
        </div>
      </div>
    </>
  );
}
