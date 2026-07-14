import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Heart, CheckCircle, AlertTriangle, XCircle, Phone, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import FoodRecommendations from '../components/FoodRecommendations';
import type { RecommendedFood } from '../data/dietRecommendations';

type Species = 'dog' | 'cat';
type WeightUnit = 'lbs' | 'kg';
type AcvimStage = 'A' | 'B1' | 'B2' | 'C' | 'D';

interface FormState {
  petName: string;
  species: Species;
  weight: number | '';
  weightUnit: WeightUnit;
  bcs: number;
  acvimStage: AcvimStage;
  sodiumMgPer100g: number | '';
  kcalPerKg: number | '';
  isGrainFree: boolean;
  taurineAdded: boolean;
}

const STAGE_INFO: Record<AcvimStage, { desc: string; sodiumMax: number; sodiumLabel: string }> = {
  A:  { desc: 'At risk breed — no cardiac disease yet', sodiumMax: 150, sodiumLabel: 'No restriction' },
  B1: { desc: 'Asymptomatic — heart murmur, no enlargement', sodiumMax: 100, sodiumLabel: 'No restriction needed (<100 mg/100kcal preferred)' },
  B2: { desc: 'Asymptomatic — heart murmur with cardiac enlargement', sodiumMax: 80,  sodiumLabel: 'Mild restriction (<80 mg/100kcal)' },
  C:  { desc: 'Symptomatic CHF — current or past episodes', sodiumMax: 50,  sodiumLabel: 'Moderate restriction (<50 mg/100kcal)' },
  D:  { desc: 'Refractory CHF — end-stage, medication-resistant', sodiumMax: 25,  sodiumLabel: 'Strict restriction (<25 mg/100kcal)' },
};

const sl = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-gray-900';

function idealKg(weightKg: number, bcs: number) { return weightKg / (1 + (bcs - 5) * 0.1); }
function rer(kg: number) { return 70 * Math.pow(kg, 0.75); }

const TIPS = [
  { title: 'Sodium restriction scales with disease severity', body: 'Healthy dogs need no sodium restriction. As CHF advances, excess sodium causes fluid retention (ascites, pulmonary edema). Use ACVIM guidelines to calibrate restriction to your pet\'s stage.' },
  { title: 'The grain-free/DCM link is under investigation', body: 'The FDA flagged a possible link between grain-free legume-based diets (peas, lentils, chickpeas as first ingredients) and dilated cardiomyopathy in atypical breeds. WSAVA recommends avoiding these diets for cardiac-prone breeds until more data are available.' },
  { title: 'Taurine deficiency causes DCM', body: 'Taurine is essential for cardiac muscle function. Cocker Spaniels, Golden Retrievers, and some dogs on grain-free diets are at risk. Fish, meat, and traditional grain diets naturally contain taurine; some grain-free foods do not.' },
  { title: 'Omega-3 fatty acids are cardioprotective', body: 'EPA and DHA from fish oil reduce inflammatory cytokines, lower triglycerides, and may slow cardiac remodeling. Target 40–60 mg EPA+DHA/kg body weight/day for cardiac patients.' },
  { title: 'Maintain lean body weight', body: 'Both obesity and cachexia (cardiac muscle wasting) worsen outcomes. Aim for BCS 4–5/9. Cardiac cachexia is serious and requires calorie-dense foods despite sodium restriction.' },
];

export default function CardiacCalculatorPage() {
  const [form, setForm] = useState<FormState>({
    petName: '', species: 'dog', weight: '', weightUnit: 'lbs', bcs: 5,
    acvimStage: 'B1', sodiumMgPer100g: '', kcalPerKg: '', isGrainFree: false, taurineAdded: true,
  });
  const [loadedFood, setLoadedFood] = useState<string | null>(null);
  const up = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  function handleUseFood(food: RecommendedFood) {
    up('kcalPerKg', food.kcalPerKg);
    setLoadedFood(`${food.brand} ${food.name}`);
    setTimeout(() => setLoadedFood(null), 4000);
  }

  const hasWeight = form.weight !== '' && Number(form.weight) > 0;
  const hasSodium = form.sodiumMgPer100g !== '' && form.kcalPerKg !== '';

  const weightKg = hasWeight ? (form.weightUnit === 'kg' ? Number(form.weight) : Number(form.weight) / 2.205) : 0;
  const ibwKg = weightKg > 0 ? idealKg(weightKg, form.bcs) : 0;
  const dailyKcal = ibwKg > 0 ? Math.round(rer(ibwKg) * 1.0) : 0;

  const sodiumPer100kcal = hasSodium
    ? (Number(form.sodiumMgPer100g) * 1000 / Number(form.kcalPerKg))
    : null;

  const stage = STAGE_INFO[form.acvimStage];

  const sodiumStatus = sodiumPer100kcal !== null
    ? sodiumPer100kcal <= stage.sodiumMax ? 'ok'
    : sodiumPer100kcal <= stage.sodiumMax * 1.4 ? 'warn' : 'high'
    : null;

  const dailySodium = hasWeight && hasSodium
    ? Math.round((dailyKcal / 100) * sodiumPer100kcal!)
    : null;

  const petName = form.petName.trim() || (form.species === 'dog' ? 'your dog' : 'your cat');

  return (
    <>
      <Helmet>
        <title>Cardiac / Heart Disease Diet Calculator | Atlas Veterinary Hospital</title>
        <meta name="description" content="Calculate dietary sodium mg/100kcal and assess DCM risk for dogs with heart disease. ACVIM-stage specific sodium targets and grain-free risk assessment." />
      </Helmet>

      <div className="bg-rose-50 border-b border-rose-100">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-rose-100">
              <Heart className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cardiac / Heart Disease Calculator</h1>
              <p className="text-sm text-gray-500 mt-0.5">Sodium mg/100 kcal &amp; DCM risk assessment for cardiac patients</p>
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
              <input className={sl} value={form.petName} onChange={e => up('petName', e.target.value)} placeholder="e.g. Rex" />
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
              <input type="number" min="0" className={sl} value={form.weight} onChange={e => up('weight', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 20" />
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
                  className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-colors ${form.bcs === n ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-700 border-gray-200 hover:border-rose-400'}`}
                >{n}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">ACVIM Cardiac Stage</label>
            <div className="space-y-1.5">
              {(['A','B1','B2','C','D'] as AcvimStage[]).map(s => (
                <label key={s} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.acvimStage === s ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-300'}`}>
                  <input type="radio" name="stage" checked={form.acvimStage === s} onChange={() => up('acvimStage', s)} className="accent-rose-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">Stage {s}</div>
                    <div className="text-xs text-gray-500">{STAGE_INFO[s].desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Food */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Current Food</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sodium (mg/100g) <span className="text-gray-400">optional</span></label>
              <input type="number" min="0" className={sl} value={form.sodiumMgPer100g} onChange={e => up('sodiumMgPer100g', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Calories (kcal/kg)</label>
              <input type="number" min="0" className={sl} value={form.kcalPerKg} onChange={e => up('kcalPerKg', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 3500" />
            </div>
          </div>
          <div className="space-y-2">
            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${form.isGrainFree ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="checkbox" checked={form.isGrainFree} onChange={e => up('isGrainFree', e.target.checked)} className="w-4 h-4 accent-orange-500" />
              <div>
                <div className="text-sm font-medium text-gray-800">Grain-free formula (peas/lentils/chickpeas as main ingredients)</div>
                <div className="text-xs text-gray-500">The FDA is investigating a possible link to DCM in dogs</div>
              </div>
            </label>
            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${!form.taurineAdded ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="checkbox" checked={form.taurineAdded} onChange={e => up('taurineAdded', e.target.checked)} className="w-4 h-4 accent-teal-500" />
              <div>
                <div className="text-sm font-medium text-gray-800">Taurine listed on ingredient label</div>
                <div className="text-xs text-gray-500">Taurine or L-taurine in the ingredient list indicates it's supplemented</div>
              </div>
            </label>
          </div>
          {loadedFood && (
            <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 rounded-xl px-4 py-2.5">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Loaded: {loadedFood}
            </div>
          )}
        </div>

        {/* Results */}
        {hasWeight && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">Results for {petName} — ACVIM Stage {form.acvimStage}</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-rose-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-rose-700">{ibwKg.toFixed(1)} kg</div>
                <div className="text-xs text-rose-600 mt-0.5">Ideal body weight</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-700">{dailyKcal}</div>
                <div className="text-xs text-gray-500 mt-0.5">kcal/day target</div>
              </div>
            </div>

            {/* Sodium stage guidance */}
            <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
              <div className="font-semibold text-sm text-gray-800 mb-1">Sodium target — Stage {form.acvimStage}</div>
              <div className="text-xs text-gray-700">{stage.sodiumLabel}</div>
              {dailySodium !== null && <div className="text-xs text-gray-500 mt-1">At {dailyKcal} kcal/day, current food provides ~{dailySodium.toLocaleString()} mg sodium/day</div>}
            </div>

            {sodiumPer100kcal !== null && (
              <div className={`rounded-xl p-4 border ${sodiumStatus === 'ok' ? 'bg-green-50 border-green-200' : sodiumStatus === 'warn' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {sodiumStatus === 'ok' ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : sodiumStatus === 'warn' ? <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{sodiumPer100kcal.toFixed(1)} mg sodium / 100 kcal</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Stage {form.acvimStage} target (&lt;{stage.sodiumMax} mg/100kcal):&nbsp;
                      {sodiumStatus === 'ok' ? '✓ Within target' : sodiumStatus === 'warn' ? '⚠️ Slightly above target' : '✗ Too high for this stage — consider a cardiac diet'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DCM risk */}
            {(form.isGrainFree || !form.taurineAdded) && (
              <div className="rounded-xl p-4 border bg-orange-50 border-orange-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm text-gray-900">Potential DCM risk factors detected</div>
                    <div className="text-xs text-gray-700 mt-1 space-y-1">
                      {form.isGrainFree && <div>• Grain-free diet with legumes: FDA is investigating association with DCM in dogs. Consider switching to a grain-inclusive WSAVA-recommended brand.</div>}
                      {!form.taurineAdded && <div>• Taurine not listed on label: Ask your vet about taurine supplementation, especially if your dog is a Golden Retriever, Cocker Spaniel, or large breed.</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {form.acvimStage === 'A' && (
              <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">Stage A dogs have no cardiac disease yet — but are a predisposed breed. Focus on omega-3s, avoiding grain-free legume diets, and annual cardiac screening (echocardiogram).</p>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Cardiac Dietary Management Tips</h2>
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
          goals={['cardiac']}
          onUse={handleUseFood}
          heading="Recommended cardiac diets"
        />

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>Heart disease requires regular monitoring and medication adjustment. <a href="tel:9092226682" className="font-semibold underline">Call Atlas Veterinary (909-222-6682)</a> if your pet is coughing, struggling to breathe, or exercising less.</span>
        </div>

        <div className="pt-2 border-t border-gray-100 text-sm text-gray-400 text-center">
          <Link to="/renal-calculator" className="text-rose-600 hover:underline">Renal Calculator</Link>
          {' · '}
          <Link to="/omega3-calculator" className="text-rose-600 hover:underline">Omega-3 Calculator</Link>
          {' · '}
          <Link to="/feeding-calculator" className="text-rose-600 hover:underline">General Feeding Calculator</Link>
        </div>
      </div>
    </>
  );
}
