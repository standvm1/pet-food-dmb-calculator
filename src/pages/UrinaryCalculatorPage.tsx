import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Droplet, Info, Phone, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import FoodRecommendations from '../components/FoodRecommendations';
import type { RecommendedFood } from '../data/dietRecommendations';
import LabelScanner, { type ScanResult } from '../components/LabelScanner';

type Species = 'dog' | 'cat';
type WeightUnit = 'lbs' | 'kg';
type StoneType = 'struvite' | 'oxalate' | 'urate' | 'cystine' | 'unknown';

type CaloriesUnit = 'kcal/cup' | 'kcal/can' | 'kcal/kg';

interface FormState {
  petName: string;
  species: Species;
  weight: number | '';
  weightUnit: WeightUnit;
  stoneType: StoneType;
  wetFoodPercent: number;
  calories: number | '';
  caloriesUnit: CaloriesUnit;
}

const STONE_INFO: Record<StoneType, { label: string; phTarget: string; diet: string; avoid: string }> = {
  struvite: {
    label: 'Struvite (magnesium ammonium phosphate)',
    phTarget: 'Acidic urine: target pH 5.9–6.3',
    diet: 'Acidifying prescription diet (Hill\'s s/d or c/d, Royal Canin Urinary SO). Dissolution possible with diet alone (cats) or diet + antibiotics (dogs).',
    avoid: 'Avoid alkalinizing foods (fruits, vegetables high in potassium). No home diets — must be balanced and acidifying.',
  },
  oxalate: {
    label: 'Calcium oxalate',
    phTarget: 'Neutral urine: target pH 6.5–7.0',
    diet: 'Low oxalate, moderate protein, increase water dramatically. Hill\'s u/d or c/d Stress, Royal Canin Urinary SO/Urinary Calm.',
    avoid: 'Avoid high-oxalate foods (spinach, sweet potatoes, organ meats, peanuts). Avoid acidifying diets — they promote calcium oxalate.',
  },
  urate: {
    label: 'Urate (uric acid / ammonium urate)',
    phTarget: 'Alkaline urine: target pH 7.0–7.5',
    diet: 'Low purine diet. Hill\'s u/d (very low protein/purine). Allopurinol often prescribed alongside diet.',
    avoid: 'Avoid high-purine foods: organ meats (liver, kidney), anchovies, sardines, herring, red meat. Dalmatians, English Bulldogs, Black Russian Terriers are predisposed.',
  },
  cystine: {
    label: 'Cystine (rare, breed-related)',
    phTarget: 'Alkaline urine: target pH 7.1–7.5',
    diet: 'Low methionine/cystine diet. Increase water intake dramatically. Alkalinizing diet or potassium citrate supplementation.',
    avoid: 'Avoid high methionine/cystine foods: eggs, meat (especially poultry/red meat), fish. Newfoundlands, Mastiffs, and Rottweilers are predisposed.',
  },
  unknown: {
    label: 'Unknown / not yet analyzed',
    phTarget: 'Have stones analyzed first — pH target depends on stone type',
    diet: 'Increase water intake with wet food and a urinary diet. Stone analysis is needed for targeted treatment.',
    avoid: 'Avoid all-dry diets and excess dietary protein until stone type is identified. Prompt stone analysis (urinalysis + imaging) is essential.',
  },
};

const sl = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-gray-900';

function rer(kg: number) { return 70 * Math.pow(kg, 0.75); }

const TIPS = [
  { title: 'Water is the most powerful urinary protectant', body: 'Every stone type benefits from dilute urine. A target urine specific gravity of <1.020 (cats) / <1.015 (dogs) reduces crystal saturation and stone growth.' },
  { title: 'Wet food is not optional for cats with urinary disease', body: 'Cats have a low thirst drive and will not voluntarily drink enough water. Wet food (78% moisture) dramatically increases urine volume and dilution compared to dry food.' },
  { title: 'Stone type determines diet — analyze before treating', body: 'Struvite and calcium oxalate require opposite dietary pH strategies. Treating for the wrong stone type can worsen the problem. Always have stones analyzed.' },
  { title: 'Urine pH monitoring at home', body: 'Dipstick pH tests (available at pharmacies) let you monitor whether dietary changes are achieving the target pH. Test first morning urine for best accuracy.' },
  { title: 'Stress worsens feline idiopathic cystitis', body: 'In cats without stones, interstitial cystitis (FIC) is stress-related. Environmental enrichment, multiple litter boxes, and cat-specific pheromones (Feliway) are part of treatment alongside diet.' },
];

export default function UrinaryCalculatorPage() {
  const [form, setForm] = useState<FormState>({
    petName: '', species: 'cat', weight: '', weightUnit: 'lbs',
    stoneType: 'struvite', wetFoodPercent: 0, calories: '', caloriesUnit: 'kcal/cup',
  });
  const [loadedFood, setLoadedFood] = useState<string | null>(null);
  const up = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  function handleScan(r: ScanResult) {
    setForm(f => ({
      ...f,
      ...(r.kcalPerCup !== null ? { calories: r.kcalPerCup, caloriesUnit: 'kcal/cup' as CaloriesUnit } :
          r.kcalPerCan !== null ? { calories: r.kcalPerCan, caloriesUnit: 'kcal/can' as CaloriesUnit } :
          r.kcalPerKg  !== null ? { calories: r.kcalPerKg,  caloriesUnit: 'kcal/kg'  as CaloriesUnit } : {}),
    }));
  }

  function handleUseFood(food: RecommendedFood) {
    if (food.kcalPerCup) { up('calories', food.kcalPerCup); up('caloriesUnit', 'kcal/cup'); }
    else if (food.kcalPerCan) { up('calories', food.kcalPerCan); up('caloriesUnit', 'kcal/can'); }
    else { up('calories', food.kcalPerKg); up('caloriesUnit', 'kcal/kg'); }
    setLoadedFood(`${food.brand} ${food.name}`);
    setTimeout(() => setLoadedFood(null), 4000);
  }

  const hasWeight = form.weight !== '' && Number(form.weight) > 0;
  const weightKg = hasWeight ? (form.weightUnit === 'kg' ? Number(form.weight) : Number(form.weight) / 2.205) : 0;

  const waterTargetMl = weightKg > 0 ? Math.round(weightKg * 50) : 0;
  const dailyKcal = weightKg > 0 ? Math.round(rer(weightKg) * (form.species === 'cat' ? 1.2 : 1.6)) : 0;

  const calorieInput = form.calories !== '' ? Number(form.calories) : null;
  let feedAmt: number | null = null;
  let feedUnit = '';
  let feedLabel = '';
  if (calorieInput && calorieInput > 0 && hasWeight && dailyKcal > 0) {
    if (form.caloriesUnit === 'kcal/kg') {
      feedAmt = Math.round((dailyKcal / calorieInput) * 1000);
      feedUnit = 'g'; feedLabel = 'grams/day';
    } else if (form.caloriesUnit === 'kcal/cup') {
      feedAmt = dailyKcal / calorieInput;
      feedUnit = 'cups'; feedLabel = 'cups/day';
    } else {
      feedAmt = dailyKcal / calorieInput;
      feedUnit = 'cans'; feedLabel = 'cans/day';
    }
  }

  const avgKcalPerGWet = 1.0;
  const avgKcalPerGDry = 3.5;
  const wetGrams = dailyKcal > 0
    ? (form.wetFoodPercent / 100) * dailyKcal / avgKcalPerGWet
    : 0;
  const dryGrams = dailyKcal > 0
    ? ((100 - form.wetFoodPercent) / 100) * dailyKcal / avgKcalPerGDry
    : 0;
  const waterFromFood = Math.round(wetGrams * 0.78 + dryGrams * 0.08);
  const additionalWater = Math.max(0, waterTargetMl - waterFromFood);

  const stoneInfo = STONE_INFO[form.stoneType];
  const petName = form.petName.trim() || (form.species === 'dog' ? 'your dog' : 'your cat');

  const hydrationOk = waterFromFood >= waterTargetMl * 0.7;

  return (
    <>
      <Helmet>
        <title>Urinary Stone Prevention Calculator | Atlas Veterinary Hospital</title>
        <meta name="description" content="Calculate daily water intake targets for dogs and cats with urinary stones. pH targets and dietary guidance by stone type." />
      </Helmet>

      <div className="bg-cyan-50 border-b border-cyan-100">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-cyan-100">
              <Droplet className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Urinary Stone Prevention Calculator</h1>
              <p className="text-sm text-gray-500 mt-0.5">Water intake targets &amp; dietary guidance by stone type</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <LabelScanner onApply={handleScan} accentClass="focus:ring-cyan-500" />

        {/* Patient */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Patient</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pet name (optional)</label>
              <input className={sl} value={form.petName} onChange={e => up('petName', e.target.value)} placeholder="e.g. Mochi" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Species</label>
              <select className={sl} value={form.species} onChange={e => up('species', e.target.value as Species)}>
                <option value="cat">Cat</option>
                <option value="dog">Dog</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Current weight</label>
              <input type="number" min="0" className={sl} value={form.weight} onChange={e => up('weight', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 10" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
              <select className={sl} value={form.weightUnit} onChange={e => up('weightUnit', e.target.value as WeightUnit)}>
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Stone type</label>
            <div className="space-y-1.5">
              {(['struvite','oxalate','urate','cystine','unknown'] as StoneType[]).map(s => (
                <label key={s} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.stoneType === s ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 hover:border-cyan-300'}`}>
                  <input type="radio" name="stone" checked={form.stoneType === s} onChange={() => up('stoneType', s)} className="accent-cyan-600" />
                  <span className="text-sm text-gray-800">{STONE_INFO[s].label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Current wet food percentage: <span className="font-bold text-cyan-700">{form.wetFoodPercent}%</span>
            </label>
            <input
              type="range" min="0" max="100" step="10"
              value={form.wetFoodPercent}
              onChange={e => up('wetFoodPercent', Number(e.target.value))}
              className="w-full accent-cyan-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0% (all dry)</span>
              <span>50% mixed</span>
              <span>100% wet</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Calories <span className="text-gray-400">optional — for daily food amount in cups/grams</span></label>
            <div className="flex gap-1.5">
              <input type="number" min="0" className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-gray-900" value={form.calories} onChange={e => up('calories', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 350" />
              <select className="w-20 px-2 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-gray-700 shrink-0" value={form.caloriesUnit} onChange={e => up('caloriesUnit', e.target.value as CaloriesUnit)}>
                <option value="kcal/cup">/ cup</option>
                <option value="kcal/can">/ can</option>
                <option value="kcal/kg">/ kg</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stone guidance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Dietary Guidance — {form.stoneType !== 'unknown' ? form.stoneType.charAt(0).toUpperCase() + form.stoneType.slice(1) : 'Unknown Stone Type'}</h2>
          <div className="space-y-3">
            <div className="bg-cyan-50 rounded-xl p-3">
              <div className="text-xs font-semibold text-cyan-800 mb-1">Urine pH Target</div>
              <div className="text-sm text-cyan-900">{stoneInfo.phTarget}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Recommended approach</div>
              <p className="text-sm text-gray-700 leading-relaxed">{stoneInfo.diet}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <div className="text-xs font-semibold text-red-700 mb-1">Avoid</div>
              <p className="text-sm text-red-800 leading-relaxed">{stoneInfo.avoid}</p>
            </div>
          </div>
        </div>

        {/* Water results */}
        {hasWeight && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">Water Intake for {petName}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-cyan-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-cyan-700">{waterTargetMl} mL</div>
                <div className="text-xs text-cyan-600 mt-0.5">water/day target</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-700">{waterFromFood} mL</div>
                <div className="text-xs text-gray-500 mt-0.5">water from food ({form.wetFoodPercent}% wet)</div>
              </div>
              <div className={`rounded-xl p-4 text-center ${hydrationOk ? 'bg-green-50' : 'bg-orange-50'}`}>
                <div className={`text-2xl font-bold ${hydrationOk ? 'text-green-700' : 'text-orange-700'}`}>{additionalWater} mL</div>
                <div className={`text-xs mt-0.5 ${hydrationOk ? 'text-green-600' : 'text-orange-600'}`}>additional drinking needed</div>
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${hydrationOk ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-start gap-3">
                {hydrationOk
                  ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                }
                <div>
                  <div className="font-semibold text-sm text-gray-800">
                    {hydrationOk
                      ? 'Good hydration from food — encourage additional water sources'
                      : `Increase wet food to reduce stone risk`}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    {hydrationOk
                      ? `At ${form.wetFoodPercent}% wet food, ${petName} gets a reasonable amount of dietary moisture. Multiple fresh water bowls and a water fountain can help meet the remaining target.`
                      : `At ${form.wetFoodPercent}% wet food, ${petName} needs ${additionalWater} mL of additional drinking water daily. Consider increasing wet food to 50–100% of the diet.`}
                  </div>
                </div>
              </div>
            </div>

            {loadedFood && (
              <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 rounded-xl px-4 py-2.5">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Loaded: {loadedFood}
              </div>
            )}

            <div className="flex items-start gap-3 bg-cyan-50 rounded-xl p-4">
              <Info className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-cyan-800 leading-relaxed">
                Water target = 50 mL/kg body weight/day. Estimates are based on average wet food moisture (78%) and dry food moisture (8%). Actual intake depends on the specific food. A water fountain often doubles feline water intake.
              </p>
            </div>

            {feedAmt !== null && (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-xs font-medium text-gray-500 mb-1">Daily feeding amount</div>
                <div className="text-2xl font-bold text-gray-700">{feedUnit === 'g' ? feedAmt : feedAmt.toFixed(1)} {feedUnit}</div>
                <div className="text-xs text-gray-400 mt-0.5">{feedLabel} · {dailyKcal} kcal/day</div>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Urinary Health Tips</h2>
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
          species={form.species}
          goals={['urinary']}
          onUse={handleUseFood}
          heading="Recommended urinary diets"
        />

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>Urinary blockages in male cats are life-threatening emergencies. <a href="tel:9092226682" className="font-semibold underline">Call Atlas Veterinary (909-222-6682)</a> immediately if your pet is straining to urinate or crying in the litter box.</span>
        </div>

        <div className="flex justify-end no-print">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Save as PDF
          </button>
        </div>

        <div className="pt-2 border-t border-gray-100 text-sm text-gray-400 text-center">
          <Link to="/renal-calculator" className="text-cyan-600 hover:underline">Renal Calculator</Link>
          {' · '}
          <Link to="/omega3-calculator" className="text-cyan-600 hover:underline">Omega-3 Calculator</Link>
          {' · '}
          <Link to="/feeding-calculator" className="text-cyan-600 hover:underline">General Feeding Calculator</Link>
        </div>
      </div>
    </>
  );
}
