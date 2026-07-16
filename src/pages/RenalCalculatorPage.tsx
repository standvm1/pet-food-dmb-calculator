import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Droplets, AlertTriangle, CheckCircle, XCircle, Info, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import FoodRecommendations from '../components/FoodRecommendations';
import type { RecommendedFood } from '../data/dietRecommendations';
import LabelScanner, { type ScanResult } from '../components/LabelScanner';

type Species = 'dog' | 'cat';
type WeightUnit = 'lbs' | 'kg';
type IrisStage = 1 | 2 | 3 | 4;
type CaloriesUnit = 'kcal/cup' | 'kcal/can' | 'kcal/kg';

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
  calories: number | '';
  caloriesUnit: CaloriesUnit;
  kcalPerKgFromScan: number | null;
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
    irisStage: 2, protein: '', moisture: '', phosphorus: '', calories: '', caloriesUnit: 'kcal/cup',
    kcalPerKgFromScan: null,
  });
  const [loadedFood, setLoadedFood] = useState<string | null>(null);
  const up = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  function handleScan(r: ScanResult) {
    setForm(f => ({
      ...f,
      ...(r.protein !== null ? { protein: r.protein } : {}),
      ...(r.moisture !== null ? { moisture: r.moisture } : {}),
      // phosphorus on label is % (e.g. 0.19%) → convert to mg/100g (× 1000)
      ...(r.phosphorus !== null ? { phosphorus: Math.round(r.phosphorus * 1000) } : {}),
      // always store kcal/kg from scan so nutrient math works even when cups is the display unit
      kcalPerKgFromScan: r.kcalPerKg,
      ...(r.kcalPerCup !== null ? { calories: r.kcalPerCup, caloriesUnit: 'kcal/cup' as CaloriesUnit } :
          r.kcalPerCan !== null ? { calories: r.kcalPerCan, caloriesUnit: 'kcal/can' as CaloriesUnit } :
          r.kcalPerKg  !== null ? { calories: r.kcalPerKg,  caloriesUnit: 'kcal/kg'  as CaloriesUnit } : {}),
    }));
    const calStr = r.kcalPerCup !== null ? `${r.kcalPerCup} kcal/cup`
      : r.kcalPerCan !== null ? `${r.kcalPerCan} kcal/can`
      : r.kcalPerKg !== null ? `${r.kcalPerKg} kcal/kg` : null;
    const parts = [
      r.protein !== null && 'protein',
      r.moisture !== null && 'moisture',
      r.phosphorus !== null && 'phosphorus',
      calStr,
    ].filter(Boolean) as string[];
    if (parts.length > 0) {
      setLoadedFood(`Scanned: ${parts.join(' · ')}`);
      setTimeout(() => setLoadedFood(null), 6000);
    }
  }

  function handleUseFood(food: RecommendedFood) {
    setForm(f => ({
      ...f,
      moisture: food.moisture,
      protein: food.protein,
      kcalPerKgFromScan: null,
      ...(food.kcalPerCup ? { calories: food.kcalPerCup, caloriesUnit: 'kcal/cup' as CaloriesUnit } :
          food.kcalPerCan ? { calories: food.kcalPerCan, caloriesUnit: 'kcal/can' as CaloriesUnit } :
                            { calories: food.kcalPerKg, caloriesUnit: 'kcal/kg' as CaloriesUnit }),
    }));
    setLoadedFood(`${food.brand} ${food.name}`);
    setTimeout(() => setLoadedFood(null), 4000);
  }

  const hasInputs = form.weight !== '' && Number(form.weight) > 0;
  const calorieInput = form.calories !== '' ? Number(form.calories) : null;

  // kcal/kg for nutrient math: use typed value if unit is kcal/kg, else use auxiliary from scan
  const effectiveKcalPerKg = form.caloriesUnit === 'kcal/kg' ? calorieInput : form.kcalPerKgFromScan;
  const hasNutrition = form.protein !== '' && form.moisture !== '' && effectiveKcalPerKg !== null;

  const weightKg = hasInputs
    ? (form.weightUnit === 'kg' ? Number(form.weight) : Number(form.weight) / 2.205)
    : 0;
  const ibwKg = weightKg > 0 ? idealKg(weightKg, form.bcs) : 0;
  const rerKcal = ibwKg > 0 ? Math.round(rer(ibwKg)) : 0;
  const dailyKcal = rerKcal;

  const gramsPerDay = hasNutrition && effectiveKcalPerKg! > 0
    ? (dailyKcal / effectiveKcalPerKg!) * 1000
    : null;

  const proteinGrams = gramsPerDay && form.protein !== ''
    ? gramsPerDay * (Number(form.protein) / 100)
    : null;
  const proteinPerKg = proteinGrams && ibwKg > 0 ? proteinGrams / ibwKg : null;

  const phosGrams = gramsPerDay && form.phosphorus !== ''
    ? gramsPerDay * (Number(form.phosphorus) / 100)
    : null;
  const phosMgPerKg = phosGrams && ibwKg > 0 ? (phosGrams * 1000) / ibwKg : null;

  // DMB (dry matter basis) — works with protein + moisture alone, no kcal needed
  const hasDMB = form.protein !== '' && form.moisture !== '' && Number(form.moisture) < 100;
  const dmbFactor = hasDMB ? 1 / (1 - Number(form.moisture) / 100) : null;
  const dmbProteinPct = dmbFactor !== null ? Number(form.protein) * dmbFactor : null;
  const dmbPhosPct = dmbFactor !== null && form.phosphorus !== ''
    ? (Number(form.phosphorus) / 10) * dmbFactor  // mg/100g → % → DMB%
    : null;

  let feedAmt: number | null = null;
  let feedUnit = '';
  let feedLabel = '';
  if (calorieInput && calorieInput > 0 && hasInputs && dailyKcal > 0) {
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

        <LabelScanner onApply={handleScan} accentClass="focus:ring-blue-500" />

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
          <p className="text-xs text-gray-500">Enter as-fed values from the Guaranteed Analysis — or scan the label above to fill in automatically.</p>
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
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Calories</label>
              <div className="flex gap-1.5">
                <input type="number" min="0" className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" value={form.calories} onChange={e => up('calories', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 350" />
                <select className="w-20 px-2 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 shrink-0" value={form.caloriesUnit} onChange={e => up('caloriesUnit', e.target.value as CaloriesUnit)}>
                  <option value="kcal/cup">/ cup</option>
                  <option value="kcal/can">/ can</option>
                  <option value="kcal/kg">/ kg</option>
                </select>
              </div>
              {form.kcalPerKgFromScan && form.caloriesUnit !== 'kcal/kg' && (
                <p className="text-xs text-blue-500 mt-1.5">Also using {form.kcalPerKgFromScan} kcal/kg (from scan) for protein &amp; phosphorus assessment</p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400">Tip: Labels often list both kcal/cup and kcal/kg in the calorie statement. The scanner captures both automatically.</p>
          {loadedFood && (
            <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 rounded-xl px-4 py-2.5">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {loadedFood}
            </div>
          )}
        </div>

        {/* Results */}
        {hasInputs && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">Results for {petName} — IRIS Stage {form.irisStage}</h2>

            {/* Energy + feeding amount */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{ibwKg.toFixed(1)} kg</div>
                <div className="text-xs text-blue-600 mt-0.5">Ideal body weight</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-700">{dailyKcal}</div>
                <div className="text-xs text-gray-500 mt-0.5">kcal/day target (RER)</div>
              </div>
              {feedAmt !== null && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">{feedUnit === 'g' ? feedAmt : feedAmt.toFixed(1)} {feedUnit}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{feedLabel}</div>
                  {feedUnit !== 'g' && gramsPerDay && (
                    <div className="text-xs text-gray-400 mt-0.5">≈ {Math.round(gramsPerDay)} g · {dailyKcal} kcal</div>
                  )}
                  {feedUnit !== 'g' && !gramsPerDay && (
                    <div className="text-xs text-gray-400 mt-0.5">{dailyKcal} kcal/day</div>
                  )}
                </div>
              )}
            </div>

            {/* IRIS dietary targets — always visible once weight + stage set */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2.5">
                IRIS Stage {form.irisStage} dietary targets
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Phosphorus</div>
                  <div className="text-sm font-semibold text-gray-800">&lt;{phosTarget} mg/kg/day</div>
                  <div className="text-xs text-blue-700 font-medium">&lt;{Math.round(phosTarget * ibwKg)} mg/day for {petName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Protein</div>
                  <div className="text-sm font-semibold text-gray-800">{proteinRange[0]}–{proteinRange[1]} g/kg/day</div>
                  <div className="text-xs text-blue-700 font-medium">{(proteinRange[0]*ibwKg).toFixed(1)}–{(proteinRange[1]*ibwKg).toFixed(1)} g/day for {petName}</div>
                </div>
              </div>
            </div>

            {/* DMB — appears as soon as protein + moisture are entered */}
            {dmbProteinPct !== null && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dry Matter Basis (DMB)</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Protein</div>
                    <div className="text-lg font-bold text-gray-800">{dmbProteinPct.toFixed(1)}%</div>
                    <div className="text-xs text-gray-400">as-fed concentration after removing water weight</div>
                  </div>
                  {dmbPhosPct !== null && (
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Phosphorus</div>
                      <div className="text-lg font-bold text-gray-800">{dmbPhosPct.toFixed(2)}%</div>
                      <div className="text-xs text-gray-400">target &lt;0.5% DMB for CKD diets</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Phosphorus intake assessment — needs kcal/kg (from entry or scan) + phosphorus mg/100g */}
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

            {/* Protein intake assessment */}
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

            {/* Hints for missing data */}
            {form.phosphorus === '' && (
              <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">Scan the label or enter the phosphorus value to get a phosphorus assessment. It's listed as "Phosphorus min X%" in the Guaranteed Analysis — if not shown, check the manufacturer's website.</p>
              </div>
            )}

            {calorieInput && form.caloriesUnit !== 'kcal/kg' && !form.kcalPerKgFromScan && (
              <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4">
                <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">To assess protein and phosphorus intake, the label's kcal/kg value is also needed. Scan the label — it usually lists both kcal/cup and kcal/kg in the calorie statement, and the scanner captures both at once.</p>
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

        <div className="flex justify-end no-print">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Save as PDF
          </button>
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
