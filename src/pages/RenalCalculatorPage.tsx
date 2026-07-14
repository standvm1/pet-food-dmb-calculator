import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Droplets, AlertTriangle, CheckCircle, XCircle, Info, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import FoodRecommendations from '../components/FoodRecommendations';
import type { RecommendedFood } from '../data/dietRecommendations';

type Species = 'dog' | 'cat';
type WeightUnit = 'lbs' | 'kg';
type IrisStage = 1 | 2 | 3 | 4;

interface FormState {
  petName: string;
  species: Species;
  weight: number | '';
  weightUnit: WeightUnit;
  bcs: number;
  irisStage: IrisStage;
  protein: number | '';
  moisture: number | '';
  phosphorus: number | '';
  kcalPerKg: number | '';
}

const IRIS_PHOS: Record<Species, Record<IrisStage, number>> = {
  dog: { 1: 45, 2: 35, 3: 25, 4: 20 },
  cat: { 1: 40, 2: 25, 3: 20, 4: 20 },
};
const IRIS_PROTEIN: Record<Species, Record<IrisStage, [number, number]>> = {
  dog: { 1: [3.3, 3.5], 2: [3.3, 3.5], 3: [2.5, 3.3], 4: [2.5, 3.3] },
  cat: { 1: [4.0, 5.0], 2: [4.0, 5.0], 3: [3.5, 4.0], 4: [3.5, 4.0] },
};

const STAGE_DESC: Record<IrisStage, string> = {
  1: 'Mild — creatinine <1.6 (dog) / <1.4 (cat) mg/dL',
  2: 'Mild–Moderate — creatinine 1.6–2.8 (dog) / 1.4–2.8 (cat) mg/dL',
  3: 'Moderate–Severe — creatinine 2.9–5.0 mg/dL',
  4: 'Severe — creatinine >5.0 mg/dL',
};

const sl = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900';

function idealKg(weightKg: number, bcs: number) {
  return weightKg / (1 + (bcs - 5) * 0.1);
}
function rer(kg: number) {
  return 70 * Math.pow(kg, 0.75);
}

const TIPS = [
  { title: 'Phosphorus restriction is the priority', body: 'Phosphorus is the #1 dietary driver of CKD progression. Even if protein is adequate, high-phosphorus foods can accelerate kidney damage.' },
  { title: 'Wet food is strongly preferred', body: 'Cats and dogs with CKD need high water intake. Wet food provides 70–80% moisture vs. ~10% in dry food, reducing the burden on failing kidneys.' },
  { title: 'Protein restriction is nuanced', body: 'Cats require more dietary protein than dogs. Excessive restriction causes muscle loss (sarcopenia) — the goal is adequate but not excess protein.' },
  { title: 'Phosphate binders can help', body: 'If diet alone cannot hit phosphorus targets, your vet may prescribe aluminum hydroxide or calcium carbonate binders with meals.' },
  { title: 'Recheck bloodwork every 3–6 months', body: 'IRIS stage can progress or occasionally improve. Reassess dietary targets with each recheck.' },
];

export default function RenalCalculatorPage() {
  const [form, setForm] = useState<FormState>({
    petName: '', species: 'dog', weight: '', weightUnit: 'lbs', bcs: 5,
    irisStage: 2, protein: '', moisture: '', phosphorus: '', kcalPerKg: '',
  });
  const [loadedFood, setLoadedFood] = useState<string | null>(null);
  const up = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  function handleUseFood(food: RecommendedFood) {
    up('kcalPerKg', food.kcalPerKg);
    up('moisture', food.moisture);
    up('protein', food.protein);
    setLoadedFood(`${food.brand} ${food.name}`);
    setTimeout(() => setLoadedFood(null), 4000);
  }

  const hasInputs = form.weight !== '' && Number(form.weight) > 0;
  const hasNutrition = form.protein !== '' && form.moisture !== '' && form.kcalPerKg !== '';

  const weightKg = hasInputs
    ? (form.weightUnit === 'kg' ? Number(form.weight) : Number(form.weight) / 2.205)
    : 0;
  const ibwKg = weightKg > 0 ? idealKg(weightKg, form.bcs) : 0;
  const rerKcal = ibwKg > 0 ? Math.round(rer(ibwKg)) : 0;
  const dailyKcal = rerKcal;

  const gramsPerDay = hasNutrition && Number(form.kcalPerKg) > 0
    ? (dailyKcal / Number(form.kcalPerKg)) * 1000
    : null;

  const proteinGrams = gramsPerDay && form.protein !== ''
    ? gramsPerDay * (Number(form.protein) / 100)
    : null;
  const proteinPerKg = proteinGrams && ibwKg > 0 ? proteinGrams / ibwKg : null;

  const phosGrams = gramsPerDay && form.phosphorus !== ''
    ? gramsPerDay * (Number(form.phosphorus) / 100)
    : null;
  const phosMgPerKg = phosGrams && ibwKg > 0 ? (phosGrams * 1000) / ibwKg : null;

  const phosTarget = IRIS_PHOS[form.species][form.irisStage];
  const proteinRange = IRIS_PROTEIN[form.species][form.irisStage];

  const phosStatus = phosMgPerKg !== null
    ? phosMgPerKg <= phosTarget ? 'ok' : phosMgPerKg <= phosTarget * 1.3 ? 'warn' : 'high'
    : null;
  const proteinStatus = proteinPerKg !== null
    ? proteinPerKg >= proteinRange[0] && proteinPerKg <= proteinRange[1] * 1.1 ? 'ok'
    : proteinPerKg < proteinRange[0] ? 'low' : 'high'
    : null;

  const petName = form.petName.trim() || (form.species === 'dog' ? 'your dog' : 'your cat');

  return (
    <>
      <Helmet>
        <title>Kidney/Renal Disease Diet Calculator | Atlas Veterinary Hospital</title>
        <meta name="description" content="IRIS stage-specific phosphorus and protein targets for dogs and cats with CKD. Calculate daily intake and compare to kidney disease guidelines." />
      </Helmet>

      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-blue-100">
              <Droplets className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kidney / CKD Diet Calculator</h1>
              <p className="text-sm text-gray-500 mt-0.5">IRIS stage phosphorus &amp; protein targets for dogs and cats</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Patient */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Patient</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pet name (optional)</label>
              <input className={sl} value={form.petName} onChange={e => up('petName', e.target.value)} placeholder="e.g. Max" />
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Body condition score (BCS 1–9, ideal = 5)</label>
            <div className="flex gap-1.5 flex-wrap">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => up('bcs', n)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-colors ${form.bcs === n ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'}`}
                >{n}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">IRIS CKD Stage</label>
            <div className="space-y-1.5">
              {([1,2,3,4] as IrisStage[]).map(s => (
                <label key={s} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.irisStage === s ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" name="stage" checked={form.irisStage === s} onChange={() => up('irisStage', s)} className="accent-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">Stage {s}</div>
                    <div className="text-xs text-gray-500">{STAGE_DESC[s]}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Food label */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Current Food Label</h2>
          <p className="text-xs text-gray-500">Enter as-fed values from the label's Guaranteed Analysis.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Protein (% as-fed)</label>
              <input type="number" min="0" className={sl} value={form.protein} onChange={e => up('protein', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 28" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Moisture (%)</label>
              <input type="number" min="0" max="99" className={sl} value={form.moisture} onChange={e => up('moisture', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 78" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phosphorus (mg/100g) <span className="text-gray-400">optional</span></label>
              <input type="number" min="0" className={sl} value={form.phosphorus} onChange={e => up('phosphorus', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 190" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Calories (kcal/kg)</label>
              <input type="number" min="0" className={sl} value={form.kcalPerKg} onChange={e => up('kcalPerKg', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 1000" />
            </div>
          </div>
          <p className="text-xs text-gray-400">Tip: Wet food kcal/kg is usually 700–1200. Dry food is usually 3000–4000.</p>
          {loadedFood && (
            <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 rounded-xl px-4 py-2.5">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Loaded: {loadedFood}
            </div>
          )}
        </div>

        {/* Results */}
        {hasInputs && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">Results for {petName} — IRIS Stage {form.irisStage}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{ibwKg.toFixed(1)} kg</div>
                <div className="text-xs text-blue-600 mt-0.5">Ideal body weight</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-700">{dailyKcal}</div>
                <div className="text-xs text-gray-500 mt-0.5">kcal/day target (RER)</div>
              </div>
              {gramsPerDay && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">{Math.round(gramsPerDay)} g</div>
                  <div className="text-xs text-gray-500 mt-0.5">food/day</div>
                </div>
              )}
            </div>

            {/* Phosphorus assessment */}
            {phosMgPerKg !== null && (
              <div className={`rounded-xl p-4 border ${phosStatus === 'ok' ? 'bg-green-50 border-green-200' : phosStatus === 'warn' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {phosStatus === 'ok' ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : phosStatus === 'warn' ? <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                  <div>
                    <div className="font-semibold text-sm text-gray-800">Phosphorus intake: {Math.round(phosMgPerKg)} mg/kg IBW/day</div>
                    <div className="text-xs text-gray-600 mt-0.5">IRIS Stage {form.irisStage} target (&lt;{phosTarget} mg/kg/day): {phosStatus === 'ok' ? '✓ Within target' : phosStatus === 'warn' ? '⚠️ Slightly above target' : '✗ Above target — consider a renal diet or phosphate binder'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Protein assessment */}
            {proteinPerKg !== null && (
              <div className={`rounded-xl p-4 border ${proteinStatus === 'ok' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-start gap-3">
                  {proteinStatus === 'ok' ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />}
                  <div>
                    <div className="font-semibold text-sm text-gray-800">Protein intake: {proteinPerKg.toFixed(1)} g/kg IBW/day</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Stage {form.irisStage} target ({proteinRange[0]}–{proteinRange[1]} g/kg/day):&nbsp;
                      {proteinStatus === 'ok' ? '✓ Within range'
                        : proteinStatus === 'low' ? '⚠️ Below target — risk of muscle loss'
                        : '⚠️ Above target — excess nitrogen load on kidneys'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {form.phosphorus === '' && (
              <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">Enter the phosphorus value from the food label to get a phosphorus intake assessment. It's often listed as "min X%" or find exact mg on the manufacturer's website.</p>
              </div>
            )}

            <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
              <strong>Note:</strong> For CKD patients, we use RER (Resting Energy Requirement) without a multiplier to avoid overfeeding. Adjust upward if your pet is losing weight unintentionally.
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">CKD Dietary Management Tips</h2>
          <div className="space-y-3">
            {TIPS.map(t => (
              <div key={t.title}>
                <div className="text-sm font-medium text-gray-800">{t.title}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Food recommendations */}
        <FoodRecommendations
          species={form.species}
          goals={['kidney']}
          onUse={handleUseFood}
          heading="Recommended kidney/renal diets"
        />

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>CKD management requires regular monitoring. <a href="tel:9092226682" className="font-semibold underline">Call Atlas Veterinary (909-222-6682)</a> to discuss your pet's IRIS stage and dietary plan.</span>
        </div>

        <div className="pt-2 border-t border-gray-100 text-sm text-gray-400 text-center">
          <Link to="/diabetes-calculator" className="text-blue-600 hover:underline">Diabetes Calculator</Link>
          {' · '}
          <Link to="/cardiac-calculator" className="text-blue-600 hover:underline">Cardiac Calculator</Link>
          {' · '}
          <Link to="/feeding-calculator" className="text-blue-600 hover:underline">General Feeding Calculator</Link>
        </div>
      </div>
    </>
  );
}
