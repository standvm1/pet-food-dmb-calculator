import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, AlertTriangle, Info, Phone, CheckCircle } from 'lucide-react';
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
  breed: string;
  heRisk: boolean;
  calories: number | '';
  caloriesUnit: CaloriesUnit;
}

const COPPER_BREEDS = [
  'bedlington terrier', 'west highland white terrier', 'westie', 'dalmatian',
  'doberman pinscher', 'doberman', 'labrador retriever', 'labrador',
  'skye terrier', 'english springer spaniel',
];

const sl = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-gray-900';

function idealKg(weightKg: number, bcs: number) { return weightKg / (1 + (bcs - 5) * 0.1); }
function rer(kg: number) { return 70 * Math.pow(kg, 0.75); }

const PROTEIN_TARGETS: Record<Species, Record<'he' | 'noHe', [number, number]>> = {
  dog: {
    noHe: [3.3, 3.5],
    he:   [2.0, 2.5],
  },
  cat: {
    noHe: [4.0, 5.5],
    he:   [3.5, 4.5],
  },
};

const TIPS = [
  { title: 'Never severely restrict protein in cats', body: 'Cats that eat too little protein rapidly develop hepatic lipidosis (fatty liver disease). Even with hepatic encephalopathy, protein restriction in cats should be modest and only under close monitoring.' },
  { title: 'Hepatic encephalopathy (HE) requires protein restriction', body: 'HE occurs when the diseased liver cannot convert ammonia to urea. Excess dietary protein raises blood ammonia. Vegetable/dairy protein sources produce less ammonia than meat protein.' },
  { title: 'Antioxidants are beneficial', body: 'Vitamins E and C, zinc, and SAMe support hepatocyte function and help mitigate oxidative damage in liver disease.' },
  { title: 'Copper restriction for certain breeds', body: 'Copper storage hepatopathy is an inherited condition in Bedlingtons, Westies, Dalmatians, Dobermans, and Labradors. These breeds need low-copper prescription diets.' },
  { title: 'Encourage eating', body: 'Anorexia worsens hepatic lipidosis in cats. If your cat stops eating for more than 24–48 hours, seek veterinary care — assisted feeding (feeding tube) may be needed.' },
];

export default function HepaticCalculatorPage() {
  const [form, setForm] = useState<FormState>({
    petName: '', species: 'dog', weight: '', weightUnit: 'lbs', bcs: 5,
    breed: '', heRisk: false, calories: '', caloriesUnit: 'kcal/cup',
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
    up('heRisk', false);
    setLoadedFood(`${food.brand} ${food.name}`);
    setTimeout(() => setLoadedFood(null), 4000);
  }

  const hasWeight = form.weight !== '' && Number(form.weight) > 0;
  const weightKg = hasWeight ? (form.weightUnit === 'kg' ? Number(form.weight) : Number(form.weight) / 2.205) : 0;
  const ibwKg = weightKg > 0 ? idealKg(weightKg, form.bcs) : 0;
  const dailyKcal = ibwKg > 0 ? Math.round(rer(ibwKg) * 1.2) : 0;

  const proteinRange = PROTEIN_TARGETS[form.species][form.heRisk ? 'he' : 'noHe'];
  const minProtein = ibwKg > 0 ? Math.round(proteinRange[0] * ibwKg) : null;
  const maxProtein = ibwKg > 0 ? Math.round(proteinRange[1] * ibwKg) : null;

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

  const isCopperBreed = form.breed.trim().length > 0 &&
    COPPER_BREEDS.some(b => form.breed.toLowerCase().includes(b));

  const petName = form.petName.trim() || (form.species === 'dog' ? 'your dog' : 'your cat');

  return (
    <>
      <Helmet>
        <title>Hepatic / Liver Disease Diet Calculator | Atlas Veterinary Hospital</title>
        <meta name="description" content="Calculate daily protein and calorie targets for dogs and cats with liver disease. Includes hepatic encephalopathy protein restriction and copper breed flags." />
      </Helmet>

      <div className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-amber-100">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hepatic / Liver Disease Calculator</h1>
              <p className="text-sm text-gray-500 mt-0.5">Protein &amp; calorie targets for pets with liver disease</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <LabelScanner onApply={handleScan} accentClass="focus:ring-amber-500" />

        {/* Patient */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Patient</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pet name (optional)</label>
              <input className={sl} value={form.petName} onChange={e => up('petName', e.target.value)} placeholder="e.g. Luna" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Species</label>
              <select className={sl} value={form.species} onChange={e => up('species', e.target.value as Species)}>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Current weight</label>
              <input type="number" min="0" className={sl} value={form.weight} onChange={e => up('weight', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 30" />
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
                  className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-colors ${form.bcs === n ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-200 hover:border-amber-400'}`}
                >{n}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Breed (for copper-associated hepatopathy flag)</label>
            <input className={sl} value={form.breed} onChange={e => up('breed', e.target.value)} placeholder="e.g. Labrador Retriever, Bedlington Terrier" />
          </div>
          <div>
            <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${form.heRisk ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-amber-300'}`}>
              <input type="checkbox" checked={form.heRisk} onChange={e => up('heRisk', e.target.checked)} className="w-4 h-4 accent-red-600" />
              <div>
                <div className="text-sm font-medium text-gray-800">Hepatic encephalopathy (HE) signs present</div>
                <div className="text-xs text-gray-500 mt-0.5">Confusion, circling, seizures, stupor — requires stricter protein restriction</div>
              </div>
            </label>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Calories <span className="text-gray-400">optional — for daily food amount in cups/grams</span></label>
            <div className="flex gap-1.5">
              <input type="number" min="0" className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-gray-900" value={form.calories} onChange={e => up('calories', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 350" />
              <select className="w-20 px-2 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-gray-700 shrink-0" value={form.caloriesUnit} onChange={e => up('caloriesUnit', e.target.value as CaloriesUnit)}>
                <option value="kcal/cup">/ cup</option>
                <option value="kcal/can">/ can</option>
                <option value="kcal/kg">/ kg</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {hasWeight && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">Results for {petName}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-700">{ibwKg.toFixed(1)} kg</div>
                <div className="text-xs text-amber-600 mt-0.5">Ideal body weight</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-700">{dailyKcal}</div>
                <div className="text-xs text-gray-500 mt-0.5">kcal/day target (RER×1.2)</div>
              </div>
              {minProtein !== null && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">{minProtein}–{maxProtein} g</div>
                  <div className="text-xs text-gray-500 mt-0.5">protein/day target</div>
                </div>
              )}
              {feedAmt !== null && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">{feedUnit === 'g' ? feedAmt : feedAmt.toFixed(1)} {feedUnit}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{feedLabel}</div>
                  {feedUnit !== 'g' && <div className="text-xs text-gray-400 mt-0.5">{dailyKcal} kcal/day</div>}
                </div>
              )}
            </div>

            <div className={`rounded-xl p-4 border ${form.heRisk ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-start gap-3">
                {form.heRisk
                  ? <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  : <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                }
                <div>
                  <div className="font-semibold text-sm text-gray-800">
                    Protein target: {proteinRange[0]}–{proteinRange[1]} g/kg IBW/day
                    {form.heRisk ? ' (HE restriction)' : ' (standard hepatic)'}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    {form.heRisk
                      ? 'Ammonia-producing protein is restricted to reduce neurological signs. Use vegetable or dairy protein sources when possible. Frequent small meals help spread the protein load.'
                      : 'Standard hepatic diet — moderate protein quality, not severely restricted. High biological value protein (eggs, poultry) is preferred to minimize ammonia production.'
                    }
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

            {isCopperBreed && (
              <div className="rounded-xl p-4 border bg-purple-50 border-purple-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm text-gray-900">Copper-associated hepatopathy risk detected</div>
                    <div className="text-xs text-gray-700 mt-0.5 leading-relaxed">
                      {form.breed} is a breed predisposed to copper storage hepatopathy. Avoid foods with organ meats, shellfish, or copper supplementation. Ask your vet about liver biopsy and copper quantification if not already done.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Daily calorie target uses RER × 1.2 (illness factor for hepatic disease). If your pet is losing weight, increase to RER × 1.4. If overweight, stay at RER × 1.0.
              </p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Liver Disease Dietary Tips</h2>
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
          goals={['hepatic']}
          onUse={handleUseFood}
          heading="Recommended hepatic diets"
        />

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>Hepatic encephalopathy is a medical emergency. <a href="tel:9092226682" className="font-semibold underline">Call Atlas Veterinary (909-222-6682)</a> if your pet shows neurological signs.</span>
        </div>

        <div className="flex justify-end no-print">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Save as PDF
          </button>
        </div>

        <div className="pt-2 border-t border-gray-100 text-sm text-gray-400 text-center">
          <Link to="/low-fat-calculator" className="text-amber-600 hover:underline">Low-Fat/Pancreatitis Calculator</Link>
          {' · '}
          <Link to="/cardiac-calculator" className="text-amber-600 hover:underline">Cardiac Calculator</Link>
          {' · '}
          <Link to="/feeding-calculator" className="text-amber-600 hover:underline">General Feeding Calculator</Link>
        </div>
      </div>
    </>
  );
}
