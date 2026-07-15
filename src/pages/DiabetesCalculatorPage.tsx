import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Activity, CheckCircle, AlertTriangle, XCircle, Phone, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import FoodRecommendations from '../components/FoodRecommendations';
import type { RecommendedFood } from '../data/dietRecommendations';
import LabelScanner, { type ScanResult } from '../components/LabelScanner';

type Species = 'dog' | 'cat';
type WeightUnit = 'lbs' | 'kg';
type CaloriesUnit = 'kcal/cup' | 'kcal/can' | 'kcal/kg';

interface FormState {
  petName: string;
  species: Species;
  weight: number | '';
  weightUnit: WeightUnit;
  bcs: number;
  protein: number | '';
  fat: number | '';
  fiber: number | '';
  ash: number | '';
  moisture: number | '';
  calories: number | '';
  caloriesUnit: CaloriesUnit;
}

const sl = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white text-gray-900';

function idealKg(weightKg: number, bcs: number) { return weightKg / (1 + (bcs - 5) * 0.1); }
function rer(kg: number) { return 70 * Math.pow(kg, 0.75); }

const TIPS = [
  { title: 'Low carbohydrate is the key for diabetic cats', body: 'Cats are obligate carnivores with limited carbohydrate metabolism. A diet under 10% carbs DMB can lead to diabetic remission in 50–100% of cats within months of starting insulin.' },
  { title: 'Consistency matters more for dogs', body: 'Diabetic dogs benefit most from consistent carbohydrate intake at consistent meal times. Feed twice daily, synchronized with insulin injections.' },
  { title: 'High fiber slows glucose absorption', body: 'Soluble fiber slows carbohydrate digestion, blunting post-meal blood glucose spikes. Royal Canin Diabetic and Hill\'s m/d use fiber strategically.' },
  { title: 'Concurrent weight loss accelerates remission in cats', body: 'Obese diabetic cats that lose weight alongside dietary change are far more likely to achieve remission. Address weight and diet simultaneously.' },
  { title: 'Wet food preferred for cats', body: 'Most wet foods are naturally low in carbohydrates — even non-prescription varieties. Switching a diabetic cat from dry to grain-free wet food often dramatically reduces insulin requirements.' },
];

export default function DiabetesCalculatorPage() {
  const [form, setForm] = useState<FormState>({
    petName: '', species: 'cat', weight: '', weightUnit: 'lbs', bcs: 6,
    protein: '', fat: '', fiber: '', ash: '', moisture: '', calories: '', caloriesUnit: 'kcal/cup',
  });
  const [loadedFood, setLoadedFood] = useState<string | null>(null);
  const up = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  function handleScan(r: ScanResult) {
    setForm(f => ({
      ...f,
      ...(r.protein !== null ? { protein: r.protein } : {}),
      ...(r.fat !== null ? { fat: r.fat } : {}),
      ...(r.fiber !== null ? { fiber: r.fiber } : {}),
      ...(r.moisture !== null ? { moisture: r.moisture } : {}),
      ...(r.ash !== null ? { ash: r.ash } : {}),
      ...(r.kcalPerCup !== null ? { calories: r.kcalPerCup, caloriesUnit: 'kcal/cup' as CaloriesUnit } :
          r.kcalPerCan !== null ? { calories: r.kcalPerCan, caloriesUnit: 'kcal/can' as CaloriesUnit } :
          r.kcalPerKg  !== null ? { calories: r.kcalPerKg,  caloriesUnit: 'kcal/kg'  as CaloriesUnit } : {}),
    }));
  }

  function handleUseFood(food: RecommendedFood) {
    if (food.kcalPerCup) { up('calories', food.kcalPerCup); up('caloriesUnit', 'kcal/cup'); }
    else if (food.kcalPerCan) { up('calories', food.kcalPerCan); up('caloriesUnit', 'kcal/can'); }
    else { up('calories', food.kcalPerKg); up('caloriesUnit', 'kcal/kg'); }
    up('moisture', food.moisture);
    up('protein', food.protein);
    up('fat', food.fat);
    up('fiber', food.fiber);
    setLoadedFood(`${food.brand} ${food.name}`);
    setTimeout(() => setLoadedFood(null), 4000);
  }

  const hasWeight = form.weight !== '' && Number(form.weight) > 0;
  const hasNutrition = form.protein !== '' && form.fat !== '' && form.fiber !== '' && form.moisture !== '';

  const weightKg = hasWeight ? (form.weightUnit === 'kg' ? Number(form.weight) : Number(form.weight) / 2.205) : 0;
  const ibwKg = weightKg > 0 ? idealKg(weightKg, form.bcs) : 0;
  const rerKcal = ibwKg > 0 ? rer(ibwKg) : 0;
  const multiplier = form.species === 'cat' ? 1.0 : 1.4;
  const dailyKcal = Math.round(rerKcal * multiplier);

  let carbsDMB: number | null = null;
  let carbsAF: number | null = null;
  let catRating: 'ideal' | 'good' | 'high' | null = null;
  let dogRating: 'ideal' | 'moderate' | 'high' | null = null;

  if (hasNutrition) {
    const p = Number(form.protein), f = Number(form.fat), fi = Number(form.fiber);
    const ash = form.ash !== '' ? Number(form.ash) : 6;
    const m = Number(form.moisture);
    carbsAF = Math.max(0, 100 - p - f - fi - ash - m);
    const dm = 100 - m;
    carbsDMB = (carbsAF / dm) * 100;

    if (form.species === 'cat') {
      catRating = carbsDMB < 10 ? 'ideal' : carbsDMB < 15 ? 'good' : 'high';
    } else {
      dogRating = carbsDMB < 25 ? 'ideal' : carbsDMB < 35 ? 'moderate' : 'high';
    }
  }

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

  const petName = form.petName.trim() || (form.species === 'dog' ? 'your dog' : 'your cat');

  return (
    <>
      <Helmet>
        <title>Diabetes Diet Calculator | Atlas Veterinary Hospital</title>
        <meta name="description" content="Calculate carbohydrate % DMB and daily feeding amounts for diabetic dogs and cats. Low-carb diet guidance for diabetic remission in cats." />
      </Helmet>

      <div className="bg-violet-50 border-b border-violet-100">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-violet-100">
              <Activity className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Diabetes Diet Calculator</h1>
              <p className="text-sm text-gray-500 mt-0.5">Carbohydrate DMB assessment &amp; feeding amounts for diabetic pets</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <LabelScanner onApply={handleScan} accentClass="focus:ring-violet-500" />

        {/* Patient */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Patient</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pet name (optional)</label>
              <input className={sl} value={form.petName} onChange={e => up('petName', e.target.value)} placeholder="e.g. Whiskers" />
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
              <input type="number" min="0" className={sl} value={form.weight} onChange={e => up('weight', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 14" />
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
            <label className="block text-xs font-medium text-gray-600 mb-1">BCS (1–9, ideal = 5)</label>
            <div className="flex gap-1.5 flex-wrap">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => up('bcs', n)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-colors ${form.bcs === n ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-700 border-gray-200 hover:border-violet-400'}`}
                >{n}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Food label */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Food Label (Guaranteed Analysis)</h2>
          <p className="text-xs text-gray-500">Enter as-fed values below. Carbohydrates are calculated automatically.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Protein (%)</label>
              <input type="number" min="0" className={sl} value={form.protein} onChange={e => up('protein', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 12" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fat (%)</label>
              <input type="number" min="0" className={sl} value={form.fat} onChange={e => up('fat', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fiber (%)</label>
              <input type="number" min="0" className={sl} value={form.fiber} onChange={e => up('fiber', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 1" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ash (%) <span className="text-gray-400">optional</span></label>
              <input type="number" min="0" className={sl} value={form.ash} onChange={e => up('ash', e.target.value === '' ? '' : Number(e.target.value))} placeholder="def. 6" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Moisture (%)</label>
              <input type="number" min="0" max="99" className={sl} value={form.moisture} onChange={e => up('moisture', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 78" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Calories <span className="text-gray-400">optional — for food amount</span></label>
              <div className="flex gap-1.5">
                <input type="number" min="0" className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white text-gray-900" value={form.calories} onChange={e => up('calories', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 350" />
                <select className="w-20 px-2 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white text-gray-700 shrink-0" value={form.caloriesUnit} onChange={e => up('caloriesUnit', e.target.value as CaloriesUnit)}>
                  <option value="kcal/cup">/ cup</option>
                  <option value="kcal/can">/ can</option>
                  <option value="kcal/kg">/ kg</option>
                </select>
              </div>
            </div>
          </div>
          {loadedFood && (
            <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 rounded-xl px-4 py-2.5">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Loaded: {loadedFood}
            </div>
          )}
        </div>

        {/* Results */}
        {hasNutrition && carbsDMB !== null && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">Results for {petName}</h2>

            {/* Carb assessment */}
            <div className={`rounded-xl p-5 border ${
              (form.species === 'cat' ? catRating === 'ideal' : dogRating === 'ideal')
                ? 'bg-green-50 border-green-200'
                : (form.species === 'cat' ? catRating === 'good' : dogRating === 'moderate')
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {(form.species === 'cat' ? catRating === 'ideal' : dogRating === 'ideal')
                  ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  : (form.species === 'cat' ? catRating === 'good' : dogRating === 'moderate')
                  ? <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                }
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{carbsDMB.toFixed(1)}%</span>
                    <span className="text-sm text-gray-500">carbohydrates DMB</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{carbsAF!.toFixed(1)}% as-fed (estimated)</div>
                  <div className="mt-2 text-sm text-gray-700">
                    {form.species === 'cat'
                      ? catRating === 'ideal'
                        ? '✓ Excellent for diabetic cats — under 10% carbs DMB supports diabetic remission'
                        : catRating === 'good'
                        ? '⚠️ Acceptable but not ideal — target under 10% DMB for best remission chances'
                        : '✗ High carbohydrate for a diabetic cat — switch to a low-carb diet (wet food or prescription diabetic diet)'
                      : dogRating === 'ideal'
                      ? '✓ Good carbohydrate level for a diabetic dog'
                      : dogRating === 'moderate'
                      ? '⚠️ Moderate carbs — consistent feeding times are essential'
                      : '✗ High carbohydrate — consider a lower-carb option with high fiber'
                    }
                  </div>
                </div>
              </div>
            </div>

            {hasWeight && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-violet-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-violet-700">{ibwKg.toFixed(1)} kg</div>
                  <div className="text-xs text-violet-600 mt-0.5">Ideal body weight</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">{dailyKcal}</div>
                  <div className="text-xs text-gray-500 mt-0.5">kcal/day target</div>
                </div>
                {feedAmt !== null && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-gray-700">{feedUnit === 'g' ? feedAmt : feedAmt.toFixed(1)} {feedUnit}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{feedLabel}</div>
                    {feedUnit !== 'g' && <div className="text-xs text-gray-400 mt-0.5">{dailyKcal} kcal/day</div>}
                  </div>
                )}
              </div>
            )}

            {form.species === 'cat' && (
              <div className="flex items-start gap-3 bg-violet-50 rounded-xl p-4">
                <Info className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-violet-800 leading-relaxed">
                  <strong>Diabetic remission in cats:</strong> Up to 84% of cats on insulin + a &lt;10% carb DMB diet achieve remission (no longer need insulin) within 6 months. Never stop insulin without veterinary guidance.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Diabetes Dietary Management</h2>
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
          goals={['diabetic', 'weight-loss']}
          onUse={handleUseFood}
          heading="Recommended diabetic management diets"
        />

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>Never adjust insulin without veterinary supervision. <a href="tel:9092226682" className="font-semibold underline">Call Atlas Veterinary (909-222-6682)</a> to discuss your pet's diabetes management plan.</span>
        </div>

        <div className="flex justify-end no-print">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Save as PDF
          </button>
        </div>

        <div className="pt-2 border-t border-gray-100 text-sm text-gray-400 text-center">
          <Link to="/renal-calculator" className="text-violet-600 hover:underline">Renal Calculator</Link>
          {' · '}
          <Link to="/low-fat-calculator" className="text-violet-600 hover:underline">Low-Fat/Pancreatitis Calculator</Link>
          {' · '}
          <Link to="/feeding-calculator" className="text-violet-600 hover:underline">General Feeding Calculator</Link>
        </div>
      </div>
    </>
  );
}
