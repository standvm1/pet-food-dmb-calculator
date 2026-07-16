import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Flame, CheckCircle, AlertTriangle, XCircle, Phone, Calculator, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import FoodRecommendations from '../components/FoodRecommendations';
import type { RecommendedFood } from '../data/dietRecommendations';
import LabelScanner, { type ScanResult } from '../components/LabelScanner';

type Species = 'dog' | 'cat';
type WeightUnit = 'lbs' | 'kg';
type Severity = 'mild' | 'moderate' | 'severe';
type CaloriesUnit = 'kcal/cup' | 'kcal/can' | 'kcal/kg';

interface FormState {
  petName: string;
  species: Species;
  weight: number | '';
  weightUnit: WeightUnit;
  bcs: number;
  severity: Severity;
  fat: number | '';
  moisture: number | '';
  calories: number | '';
  caloriesUnit: CaloriesUnit;
}

const sl = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900';

function idealKg(weightKg: number, bcs: number) { return weightKg / (1 + (bcs - 5) * 0.1); }
function rer(kg: number) { return 70 * Math.pow(kg, 0.75); }

const FAT_TARGETS: Record<Severity, { dmb: number; g1000: number; label: string }> = {
  severe:   { dmb: 10, g1000: 12,  label: 'Severe — strict fat restriction required' },
  moderate: { dmb: 12, g1000: 20,  label: 'Moderate pancreatitis' },
  mild:     { dmb: 15, g1000: 25,  label: 'Mild / maintenance' },
};

const TIPS = [
  { title: 'Nothing by mouth during acute episodes', body: 'During a severe acute pancreatitis episode, food is withheld for 24–48 hours to rest the pancreas. Reintroduce with small frequent meals of low-fat food.' },
  { title: 'Fat is the main trigger', body: 'Dietary fat stimulates pancreatic enzyme secretion. Keeping fat below the threshold for your pet reduces the risk of flare-ups.' },
  { title: 'Small, frequent meals are better', body: 'Feeding 3–4 small meals per day instead of 1–2 large meals minimizes the pancreatic workload at each meal.' },
  { title: 'Avoid table scraps and treats', body: 'Single high-fat meals (e.g. turkey skin, gravy) are the most common trigger for acute pancreatitis in dogs. Zero tolerance for high-fat extras.' },
  { title: 'Monitor triglycerides', body: 'Miniature Schnauzers and some other breeds are prone to hypertriglyceridemia, which predisposes to pancreatitis. Ask your vet about a fasting lipid panel.' },
];

export default function PancreatitisCalculatorPage() {
  const [form, setForm] = useState<FormState>({
    petName: '', species: 'dog', weight: '', weightUnit: 'lbs', bcs: 5,
    severity: 'moderate', fat: '', moisture: '', calories: '', caloriesUnit: 'kcal/cup',
  });
  const [snapshot, setSnapshot] = useState<FormState | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [loadedFood, setLoadedFood] = useState<string | null>(null);

  const up = (k: keyof FormState, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    if (snapshot) setIsDirty(true);
  };

  function handleCalculate() { setSnapshot({ ...form }); setIsDirty(false); }

  function handleScan(r: ScanResult) {
    setForm(f => ({
      ...f,
      ...(r.fat !== null ? { fat: r.fat } : {}),
      ...(r.moisture !== null ? { moisture: r.moisture } : {}),
      ...(r.kcalPerCup !== null ? { calories: r.kcalPerCup, caloriesUnit: 'kcal/cup' as CaloriesUnit } :
          r.kcalPerCan !== null ? { calories: r.kcalPerCan, caloriesUnit: 'kcal/can' as CaloriesUnit } :
          r.kcalPerKg  !== null ? { calories: r.kcalPerKg,  caloriesUnit: 'kcal/kg'  as CaloriesUnit } : {}),
    }));
    if (snapshot) setIsDirty(true);
  }

  function handleUseFood(food: RecommendedFood) {
    setForm(f => ({
      ...f,
      fat: food.fat, moisture: food.moisture,
      ...(food.kcalPerCup ? { calories: food.kcalPerCup, caloriesUnit: 'kcal/cup' as CaloriesUnit } :
          food.kcalPerCan ? { calories: food.kcalPerCan, caloriesUnit: 'kcal/can' as CaloriesUnit } :
                            { calories: food.kcalPerKg,  caloriesUnit: 'kcal/kg'  as CaloriesUnit }),
    }));
    if (snapshot) setIsDirty(true);
    setLoadedFood(`${food.brand} ${food.name}`);
    setTimeout(() => setLoadedFood(null), 4000);
  }

  const s = snapshot;
  const sHasWeight = s !== null && s.weight !== '' && Number(s.weight) > 0;
  const sHasNutrition = s !== null && s.fat !== '' && s.moisture !== '';

  const weightKg = sHasWeight ? (s!.weightUnit === 'kg' ? Number(s!.weight) : Number(s!.weight) / 2.205) : 0;
  const ibwKg = weightKg > 0 ? idealKg(weightKg, s!.bcs) : 0;
  const dailyKcal = ibwKg > 0 ? Math.round(rer(ibwKg)) : 0;

  const fat = sHasNutrition ? Number(s!.fat) : 0;
  const moisture = sHasNutrition ? Number(s!.moisture) : 0;
  const calorieInput = s && s.calories !== '' ? Number(s.calories) : null;
  const effectiveKcalPerKg = s && s.caloriesUnit === 'kcal/kg' ? calorieInput : null;

  const fatDMB = sHasNutrition ? (fat / (100 - moisture)) * 100 : null;
  const fatG1000 = sHasNutrition && effectiveKcalPerKg && effectiveKcalPerKg > 0 ? (fat * 10 / effectiveKcalPerKg) * 1000 : null;

  let feedAmt: number | null = null;
  let feedUnit = '';
  let feedLabel = '';
  if (calorieInput && calorieInput > 0 && sHasWeight && dailyKcal > 0) {
    if (s!.caloriesUnit === 'kcal/kg') {
      feedAmt = Math.round((dailyKcal / calorieInput) * 1000);
      feedUnit = 'g'; feedLabel = 'grams/day';
    } else if (s!.caloriesUnit === 'kcal/cup') {
      feedAmt = dailyKcal / calorieInput;
      feedUnit = 'cups'; feedLabel = 'cups/day';
    } else {
      feedAmt = dailyKcal / calorieInput;
      feedUnit = 'cans'; feedLabel = 'cans/day';
    }
  }

  const target = FAT_TARGETS[s?.severity ?? form.severity];

  function fatDmbStatus() {
    if (fatDMB === null) return null;
    if (fatDMB <= target.dmb) return 'ok';
    if (fatDMB <= target.dmb * 1.3) return 'warn';
    return 'high';
  }
  function fatG1000Status() {
    if (fatG1000 === null) return null;
    if (fatG1000 <= target.g1000) return 'ok';
    if (fatG1000 <= target.g1000 * 1.4) return 'warn';
    return 'high';
  }

  const dmbStatus = fatDmbStatus();
  const g1000Status = fatG1000Status();
  const canCalculate = form.weight !== '' && Number(form.weight) > 0;
  const petName = (s?.petName ?? form.petName).trim() || (form.species === 'dog' ? 'your dog' : 'your cat');

  function statusIcon(s: 'ok' | 'warn' | 'high' | null) {
    if (s === 'ok') return <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />;
    if (s === 'warn') return <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />;
    if (s === 'high') return <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />;
    return null;
  }
  function statusBg(s: 'ok' | 'warn' | 'high' | null) {
    if (s === 'ok') return 'bg-green-50 border-green-200';
    if (s === 'warn') return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  }

  return (
    <>
      <Helmet>
        <title>Pancreatitis / Low-Fat Diet Calculator | Atlas Veterinary Hospital</title>
        <meta name="description" content="Calculate fat % DMB and fat g/1000 kcal to assess whether a food meets low-fat targets for dogs and cats with pancreatitis." />
      </Helmet>

      <div className="bg-orange-50 border-b border-orange-100">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-orange-100">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pancreatitis / Low-Fat Calculator</h1>
              <p className="text-sm text-gray-500 mt-0.5">Fat DMB &amp; fat g/1000 kcal assessment for GI-sensitive pets</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <LabelScanner onApply={handleScan} accentClass="focus:ring-orange-500" />

        {/* Patient */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Patient</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pet name (optional)</label>
              <input className={sl} value={form.petName} onChange={e => up('petName', e.target.value)} placeholder="e.g. Buddy" />
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
              <input type="number" min="0" className={sl} value={form.weight} onChange={e => up('weight', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 25" />
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
                  className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-colors ${form.bcs === n ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400'}`}
                >{n}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Severity / target restriction</label>
            <div className="space-y-1.5">
              {(['severe','moderate','mild'] as Severity[]).map(s => (
                <label key={s} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.severity === s ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                  <input type="radio" name="severity" checked={form.severity === s} onChange={() => up('severity', s)} className="accent-orange-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-800 capitalize">{s}</div>
                    <div className="text-xs text-gray-500">Fat target: &lt;{FAT_TARGETS[s].dmb}% DMB / &lt;{FAT_TARGETS[s].g1000} g/1000 kcal</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Food label */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Food Label (Guaranteed Analysis)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fat (% as-fed)</label>
              <input type="number" min="0" className={sl} value={form.fat} onChange={e => up('fat', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 5.5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Moisture (%)</label>
              <input type="number" min="0" max="99" className={sl} value={form.moisture} onChange={e => up('moisture', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 78" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Calories <span className="text-gray-400">kcal/kg required for fat g/1000 kcal</span></label>
              <div className="flex gap-1.5">
                <input type="number" min="0" className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900" value={form.calories} onChange={e => up('calories', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 350" />
                <select className="w-20 px-2 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-700 shrink-0" value={form.caloriesUnit} onChange={e => up('caloriesUnit', e.target.value as CaloriesUnit)}>
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

        {/* Calculate button */}
        <div className="space-y-3">
          <button type="button" onClick={handleCalculate} disabled={!canCalculate}
            className="w-full flex items-center justify-center gap-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-base px-6 py-4 rounded-2xl transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2">
            <Calculator className="w-5 h-5" />
            {snapshot ? 'Recalculate' : 'Calculate Low-Fat Assessment'}
          </button>
          {!canCalculate && <p className="text-xs text-center text-gray-400">Enter your pet's weight above to calculate</p>}
          {snapshot && isDirty && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-800">
              <RefreshCw className="w-4 h-4 flex-shrink-0" />
              Inputs changed — click <strong className="mx-1">Recalculate</strong> to update results.
            </div>
          )}
        </div>

        {/* Results */}
        {snapshot && !isDirty && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Results for {petName}</h2>

            {sHasNutrition && fatDMB !== null && (
              <div className={`rounded-xl p-4 border ${statusBg(dmbStatus)}`}>
                <div className="flex items-start gap-3">
                  {statusIcon(dmbStatus)}
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{fatDMB.toFixed(1)}% fat DMB</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Target &lt;{target.dmb}% fat DMB for {s!.severity} restriction:&nbsp;
                      {dmbStatus === 'ok' ? '✓ Within target' : dmbStatus === 'warn' ? '⚠️ Slightly above target' : '✗ Above target — this food is too high in fat'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {fatG1000 !== null && (
              <div className={`rounded-xl p-4 border ${statusBg(g1000Status)}`}>
                <div className="flex items-start gap-3">
                  {statusIcon(g1000Status)}
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{fatG1000.toFixed(1)} g fat/1000 kcal</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Target &lt;{target.g1000} g/1000 kcal:&nbsp;
                      {g1000Status === 'ok' ? '✓ Low-fat' : g1000Status === 'warn' ? '⚠️ Borderline' : '✗ High fat per calorie'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sHasWeight && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-700">{ibwKg.toFixed(1)} kg</div>
                  <div className="text-xs text-orange-600 mt-0.5">Ideal body weight</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">{dailyKcal}</div>
                  <div className="text-xs text-gray-500 mt-0.5">kcal/day (RER)</div>
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
          </div>
        )}

        {/* Tips */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Pancreatitis Dietary Tips</h2>
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
          goals={['low-fat']}
          onUse={handleUseFood}
          heading="Recommended low-fat diets"
        />

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>Acute pancreatitis is a medical emergency. <a href="tel:9092226682" className="font-semibold underline">Call Atlas Veterinary (909-222-6682)</a> immediately if your pet is vomiting, not eating, or in pain.</span>
        </div>

        <div className="flex justify-end no-print">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Save as PDF
          </button>
        </div>

        <div className="pt-2 border-t border-gray-100 text-sm text-gray-400 text-center">
          <Link to="/hepatic-calculator" className="text-orange-600 hover:underline">Hepatic Calculator</Link>
          {' · '}
          <Link to="/omega3-calculator" className="text-orange-600 hover:underline">Omega-3 Calculator</Link>
          {' · '}
          <Link to="/feeding-calculator" className="text-orange-600 hover:underline">General Feeding Calculator</Link>
        </div>
      </div>
    </>
  );
}
