import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, ChevronDown, ChevronUp, AlertTriangle, Info, Phone, CheckCircle2, Calculator, RefreshCw, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import BcsSelector from '../components/BcsSelector';
import FoodRecommendations from '../components/FoodRecommendations';
import LabelScanner, { type ScanResult } from '../components/LabelScanner';
import { calculateFeeding } from '../utils/calculations';
import type { FoodInput, ActivityLevel, LifeStage, CaloriesUnit } from '../types';
import type { RecommendedFood } from '../data/dietRecommendations';

type FeedUnit = 'cups' | 'cans' | 'grams';

interface FormState {
  petName: string;
  species: 'dog' | 'cat';
  weight: number | '';
  weightUnit: 'lbs' | 'kg';
  bcs: number | '';
  lifeStage: LifeStage;
  isNeutered: boolean;
  activityLevel: ActivityLevel;
  calories: number | '';
  caloriesUnit: CaloriesUnit;
  kcalPerKg: number | '';
  currentFeedAmount: number | '';
  currentFeedUnit: FeedUnit;
  feedingsPerDay: number;
}

const defaultForm = (): FormState => ({
  petName: '', species: 'dog', weight: '', weightUnit: 'lbs', bcs: 3,
  lifeStage: 'adult', isNeutered: true, activityLevel: 'low',
  calories: '', caloriesUnit: 'kcal/cup', kcalPerKg: '',
  currentFeedAmount: '', currentFeedUnit: 'cups', feedingsPerDay: 2,
});

function toFoodInput(f: FormState): FoodInput {
  return {
    name: f.petName, moisture: '', protein: '', fat: '', fiber: '', ash: '', carbs: '',
    calories: f.calories, caloriesUnit: f.caloriesUnit, foodType: 'dry',
    species: f.species, dietGoal: '', phosphorus: '', sodium: '', calcium: '', omega3: '',
    kcalPerKg: f.kcalPerKg, petWeight: f.weight, petWeightUnit: f.weightUnit,
    targetWeight: '', bodyConditionScore: f.bcs, isNeutered: f.isNeutered,
    activityLevel: f.activityLevel, lifeStage: f.lifeStage, dailyFeedingAmount: '',
  };
}

const sl = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900';

function getUnitLabel(cu: CaloriesUnit, plural = true): string {
  if (cu === 'kcal/cup') return plural ? 'cups' : 'cup';
  if (cu === 'kcal/can') return plural ? 'cans' : 'can';
  return 'g';
}

function fmtAmt(n: number, cu: CaloriesUnit): string {
  if (cu === 'kcal/kg') return String(Math.round(n / 5) * 5);
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function getRecommendedAmt(kcalPerDay: number, kcalPerUnit: number, cu: CaloriesUnit): number {
  if (cu === 'kcal/kg') return (kcalPerDay / kcalPerUnit) * 1000;
  return kcalPerDay / kcalPerUnit;
}

const SEE_VET_SIGNS = [
  'BCS 1 or 2 (emaciated)',
  'Sudden weight loss with no diet change',
  'Weight loss with vomiting, diarrhea, or lethargy',
  'Visible parasites or suspected worm infestation',
  'Dental disease making eating painful',
  'Loss of appetite for more than 24–48 hours (cats especially)',
  'Recent rescue or stray with unknown history',
];

const GAIN_TIPS = [
  { title: 'Transition food slowly', body: 'Switch to a higher-calorie food over 7–10 days to avoid GI upset. Mix increasing proportions of new food with old.' },
  { title: 'Multiple small meals', body: 'Feed 3–4 smaller meals per day instead of one or two large ones. This improves absorption and reduces the risk of bloat in dogs.' },
  { title: 'High-quality protein first', body: 'Choose a food with a named meat (chicken, beef, salmon) as the first ingredient. Protein quality matters for muscle building.' },
  { title: 'Weigh weekly', body: 'Safe weight gain is 1–2% of body weight per week. Faster than that suggests the pet may be retaining fluid or gaining mostly fat.' },
  { title: 'Rule out parasites', body: 'A fecal exam at your vet is quick and inexpensive. Intestinal parasites are a common hidden cause of underweight in pets.' },
  { title: 'Limit heavy exercise', body: 'While the pet is underweight, focus on weight gain before rigorous activity. Light play is fine.' },
];

interface Props { embedded?: boolean }

export default function WeightGainCalculatorPage({ embedded }: Props = {}) {
  const [form, setForm] = useState<FormState>(defaultForm());
  const [snapshot, setSnapshot] = useState<FormState | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showCalories, setShowCalories] = useState(false);
  const [loadedFood, setLoadedFood] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const up = (k: keyof FormState, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    if (snapshot) setIsDirty(true);
  };

  function handleCalculate() {
    setSnapshot({ ...form });
    setIsDirty(false);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function handleScan(r: ScanResult) {
    setForm(f => ({
      ...f,
      ...(r.kcalPerKg !== null ? { kcalPerKg: r.kcalPerKg } : {}),
      ...(r.kcalPerCan !== null ? { calories: r.kcalPerCan, caloriesUnit: 'kcal/can' as CaloriesUnit } :
          r.kcalPerCup !== null ? { calories: r.kcalPerCup, caloriesUnit: 'kcal/cup' as CaloriesUnit } :
          r.kcalPerKg  !== null ? { calories: r.kcalPerKg,  caloriesUnit: 'kcal/kg'  as CaloriesUnit } : {}),
    }));
    setShowCalories(true);
    if (snapshot) setIsDirty(true);
  }

  function handleUseFood(food: RecommendedFood) {
    up('kcalPerKg', food.kcalPerKg);
    if (food.kcalPerCup) { up('calories', food.kcalPerCup); up('caloriesUnit', 'kcal/cup'); }
    else if (food.kcalPerCan) { up('calories', food.kcalPerCan); up('caloriesUnit', 'kcal/can'); }
    else { up('calories', food.kcalPerKg); up('caloriesUnit', 'kcal/kg'); }
    setShowCalories(true);
    setLoadedFood(`${food.brand} ${food.name}`);
    setTimeout(() => setLoadedFood(null), 4000);
  }

  const feedingResult = snapshot ? calculateFeeding(toFoodInput(snapshot)) : null;
  const bcsNum = snapshot && snapshot.bcs !== '' ? Number(snapshot.bcs) : null;
  const petName = (snapshot?.petName ?? '').trim() || (form.species === 'dog' ? 'your dog' : 'your cat');
  const isUnderweight = bcsNum !== null && bcsNum < 5;
  const isSevere = bcsNum !== null && bcsNum <= 2;

  const cu = snapshot?.caloriesUnit ?? form.caloriesUnit;
  const kcalPerUnit = snapshot && snapshot.calories !== '' ? Number(snapshot.calories) : null;
  const ul = getUnitLabel(cu);
  const us = getUnitLabel(cu, false);

  const modScenario = feedingResult?.scenarios.moderateWeightGain;
  const aggScenario = feedingResult?.scenarios.aggressiveWeightGain;
  const maintScenario = feedingResult?.scenarios.maintenance;

  const modAmt = kcalPerUnit && modScenario ? getRecommendedAmt(modScenario.kcalPerDay, kcalPerUnit, cu) : null;
  const aggAmt = kcalPerUnit && aggScenario ? getRecommendedAmt(aggScenario.kcalPerDay, kcalPerUnit, cu) : null;
  const maintAmt = kcalPerUnit && maintScenario ? getRecommendedAmt(maintScenario.kcalPerDay, kcalPerUnit, cu) : null;

  const currentAmt = snapshot && snapshot.currentFeedAmount !== '' ? Number(snapshot.currentFeedAmount) : null;
  const feedUnitCompatible = snapshot ? (
    (snapshot.currentFeedUnit === 'cups' && snapshot.caloriesUnit === 'kcal/cup') ||
    (snapshot.currentFeedUnit === 'cans' && snapshot.caloriesUnit === 'kcal/can') ||
    (snapshot.currentFeedUnit === 'grams' && snapshot.caloriesUnit === 'kcal/kg')
  ) : false;
  const currentKcalRaw = kcalPerUnit && currentAmt !== null && feedUnitCompatible
    ? currentAmt * kcalPerUnit * (snapshot?.currentFeedUnit === 'grams' ? 0.001 : 1)
    : null;
  const currentKcal = currentKcalRaw !== null ? Math.round(currentKcalRaw) : null;
  const deltaAmt = feedUnitCompatible && modAmt !== null && currentAmt !== null ? modAmt - currentAmt : null;
  const pctChange = deltaAmt !== null && currentAmt ? Math.abs(deltaAmt / currentAmt) * 100 : null;
  const feedingsPerDay = snapshot?.feedingsPerDay ?? 2;

  const weightToGainKg = feedingResult ? feedingResult.idealWeightKg - feedingResult.currentWeightKg : 0;
  const weeksModerate = feedingResult && weightToGainKg > 0
    ? Math.round(weightToGainKg / (feedingResult.idealWeightKg * 0.015)) : 0;

  return (
    <>
      {!embedded && (
        <Helmet>
          <title>Pet Weight Gain Calculator — Underweight Dog & Cat Feeding Guide | Atlas Veterinary Hospital</title>
          <meta name="description" content="Is your dog or cat underweight? Use our free weight gain calculator to get a safe feeding plan to help your pet reach a healthy body condition." />
          <link rel="canonical" href="https://petfooddmb.atlasveterinaryhospital.com/weight-gain-calculator" />
        </Helmet>
      )}

      <div className={embedded ? '' : 'max-w-4xl mx-auto px-4 sm:px-6 py-8'}>
        {!embedded && (
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4">
              <TrendingUp className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
              Pet Weight Gain Calculator
            </h1>
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
              An underweight pet may simply need more food — or there may be an underlying medical cause. This calculator helps you build a safe feeding plan while knowing when to call the vet.
            </p>
          </div>
        )}

        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 no-print">
          <h2 className="font-bold text-red-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> See your vet first if any of these apply
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {SEE_VET_SIGNS.map(sign => (
              <div key={sign} className="flex items-start gap-2 text-sm text-red-700">
                <span className="text-red-400 flex-shrink-0 mt-0.5">⚠</span>
                <span>{sign}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-red-600 font-semibold mt-3">
            Unexplained weight loss always warrants a veterinary exam. This calculator is for pets that are simply underfed, recently adopted, or recovering — not for pets with active illness.
          </p>
        </div>

        <div className="no-print mb-6">
          <LabelScanner onApply={handleScan} accentClass="focus:ring-blue-500" />
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Form ── */}
          <div className="lg:col-span-2 space-y-6 no-print">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Dog or cat?</label>
              <div className="grid grid-cols-2 gap-3">
                {(['dog', 'cat'] as const).map(s => (
                  <button key={s} type="button" onClick={() => up('species', s)}
                    className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                      form.species === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}>
                    {s === 'dog' ? '🐶 Dog' : '🐱 Cat'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Pet's name <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" value={form.petName} onChange={e => up('petName', e.target.value)}
                placeholder={form.species === 'dog' ? 'e.g. Rex' : 'e.g. Noodle'} className={sl} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Current weight</label>
              <div className="flex gap-2">
                <input type="number" min="0.1" step="0.1" value={form.weight}
                  onChange={e => up('weight', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 12"
                  className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" />
                <select value={form.weightUnit} onChange={e => up('weightUnit', e.target.value)}
                  className="w-16 px-2 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-center">
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Body Condition Score</label>
              <BcsSelector value={form.bcs} onChange={v => up('bcs', v)} species={form.species} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Life stage</label>
                <select value={form.lifeStage} onChange={e => up('lifeStage', e.target.value as LifeStage)} className={sl}>
                  <option value="adult">Adult</option>
                  <option value="puppy-kitten">Puppy / Kitten (under 1 year)</option>
                  <option value="senior">Senior (7+ years)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Spayed or neutered?</label>
                <div className="grid grid-cols-2 gap-3">
                  {([true, false] as const).map(v => (
                    <button key={String(v)} type="button" onClick={() => up('isNeutered', v)}
                      className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        form.isNeutered === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}>
                      {v ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Food info + current feeding */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <button type="button" onClick={() => setShowCalories(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                <div>
                  <div className="text-sm font-semibold text-gray-700">Food calorie info & current feeding</div>
                  <div className="text-xs text-gray-400 mt-0.5">Get a precise recommendation in cups, cans, or grams</div>
                </div>
                {showCalories ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showCalories && (
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Find the "Calorie Content" statement on the food label.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Calories</label>
                        <input type="number" min="0" step="1" value={form.calories}
                          onChange={e => up('calories', e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="e.g. 400"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Unit</label>
                        <select value={form.caloriesUnit} onChange={e => up('caloriesUnit', e.target.value as CaloriesUnit)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="kcal/cup">kcal / cup</option>
                          <option value="kcal/can">kcal / can</option>
                          <option value="kcal/kg">kcal / kg</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-600">How much do you currently feed?</p>
                    <div className="flex gap-2 items-center">
                      <input type="number" min="0" step="0.1" value={form.currentFeedAmount}
                        onChange={e => up('currentFeedAmount', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 1.5"
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                      <select value={form.currentFeedUnit} onChange={e => up('currentFeedUnit', e.target.value as FeedUnit)}
                        className="px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="cups">cups</option>
                        <option value="cans">cans</option>
                        <option value="grams">grams</option>
                      </select>
                      <span className="text-sm text-gray-500 whitespace-nowrap">/day</span>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Meals per day</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map(n => (
                          <button key={n} type="button" onClick={() => up('feedingsPerDay', n)}
                            className={`py-2 rounded-lg border-2 text-sm font-bold transition-all ${
                              form.feedingsPerDay === n ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                            }`}>
                            {n}×
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Calculate button */}
            <button
              type="button"
              onClick={handleCalculate}
              className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base px-6 py-4 rounded-2xl transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <Calculator className="w-5 h-5" />
              {snapshot ? 'Recalculate Plan' : 'Calculate Weight Gain Plan'}
            </button>
          </div>

          {/* ── Results ── */}
          <div ref={resultsRef} className="lg:col-span-3 space-y-5 pt-2 lg:pt-0">
            {!snapshot ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <div className="text-5xl mb-4">📈</div>
                <p className="text-gray-600 font-medium mb-2">Ready to build {form.petName.trim() ? `${form.petName}'s` : 'your pet\'s'} weight gain plan.</p>
                <p className="text-sm text-gray-400">Fill in the details on the left, then click <strong className="text-blue-600">Calculate</strong>.</p>
              </div>
            ) : (
              <>
                {isDirty && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 no-print">
                    <RefreshCw className="w-4 h-4 flex-shrink-0" />
                    Inputs changed — click <strong className="mx-1">Recalculate</strong> to update.
                  </div>
                )}

                {bcsNum !== null && bcsNum > 5 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <p className="font-bold text-amber-800">Your pet appears to be overweight, not underweight.</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Try the <Link to="/weight-loss-calculator" className="underline font-semibold">Weight Loss Calculator</Link> instead.
                    </p>
                  </div>
                )}

                {bcsNum === 5 && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="font-bold text-green-800">{petName} is at an ideal weight!</p>
                    <p className="text-sm text-green-700 mt-1">Feed for maintenance. See the <Link to="/feeding-calculator" className="underline">feeding calculator</Link> for your daily amount.</p>
                  </div>
                )}

                {isSevere && (
                  <div className="bg-red-50 border border-red-300 rounded-2xl p-5 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-red-800">BCS 1–2 requires veterinary care</p>
                      <p className="text-sm text-red-700 mt-1">
                        At this level of underweight, refeeding must be done carefully to avoid "refeeding syndrome." Please see a veterinarian before starting an aggressive feeding program.
                      </p>
                    </div>
                  </div>
                )}

                {isUnderweight && feedingResult && (
                  <>
                    {/* Primary plan card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-sm font-semibold text-blue-100 uppercase tracking-wide">
                          {snapshot.petName ? `${snapshot.petName}'s ` : ''}Weight Gain Plan
                        </div>
                        <button type="button" onClick={() => window.print()}
                          className="no-print flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">
                          <Printer className="w-3.5 h-3.5" />
                          Save PDF
                        </button>
                      </div>

                      {modAmt !== null ? (
                        <>
                          <div className="text-xs text-blue-200 mb-1">Recommended daily amount</div>
                          <div className="text-4xl font-extrabold mb-0.5">
                            {fmtAmt(modAmt, cu)} {ul}
                          </div>
                          {feedingsPerDay > 1 && (
                            <div className="text-blue-100 text-sm mb-1">
                              {fmtAmt(modAmt / feedingsPerDay, cu)} {us} × {feedingsPerDay} meals/day
                            </div>
                          )}
                          <div className="text-blue-200 text-xs mb-4">= {modScenario!.kcalPerDay} kcal/day</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs text-blue-200 mb-1">Recommended daily calories</div>
                          <div className="text-4xl font-extrabold mb-1">{modScenario?.kcalPerDay} kcal/day</div>
                          <div className="text-blue-100 text-sm mb-4">Moderate weight gain</div>
                        </>
                      )}

                      {/* Current vs recommended */}
                      {deltaAmt !== null && (
                        <div className="bg-white/15 rounded-xl p-3 mb-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-blue-200 text-xs mb-0.5">Currently feeding</div>
                              <div className="font-bold">{fmtAmt(currentAmt!, cu)} {snapshot!.currentFeedUnit}/day</div>
                              {currentKcal && <div className="text-blue-200 text-xs">{currentKcal} kcal</div>}
                            </div>
                            <div>
                              <div className="text-blue-200 text-xs mb-0.5">Increase to</div>
                              <div className="font-bold">{fmtAmt(modAmt!, cu)} {ul}/day</div>
                              <div className="text-blue-200 text-xs">
                                +{fmtAmt(Math.abs(deltaAmt), cu)} {us} more (+{pctChange!.toFixed(0)}%)
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Current weight', value: `${feedingResult.currentWeightKg.toFixed(1)} kg` },
                          { label: 'Target weight', value: `${feedingResult.idealWeightKg.toFixed(1)} kg` },
                          { label: 'Est. timeline', value: weeksModerate > 0 ? `~${weeksModerate} wks` : '—' },
                        ].map(item => (
                          <div key={item.label} className="bg-white/10 rounded-xl p-3 text-center">
                            <div className="text-xs text-blue-100 mb-1">{item.label}</div>
                            <div className="font-bold text-sm">{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {weeksModerate > 0 && (
                      <div className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                        <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">
                          <strong>Estimated timeline:</strong> At a safe rate (1.5% body weight/week), {petName} could reach an ideal weight in approximately <strong>{weeksModerate} weeks</strong>. Start at the moderate rate and increase gradually.
                        </p>
                      </div>
                    )}

                    {/* Feeding range */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900 text-sm">Full feeding range</h3>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {[
                          { s: maintScenario, amt: maintAmt, label: 'Maintenance', sub: 'Hold current weight', color: 'text-teal-700' },
                          { s: modScenario, amt: modAmt, label: 'Moderate weight gain ✓', sub: 'Recommended starting point', color: 'text-blue-700', highlight: true },
                          { s: aggScenario, amt: aggAmt, label: 'Active weight gain', sub: 'Use only under vet supervision', color: 'text-purple-700' },
                        ].map(row => (
                          <div key={row.label} className={`flex items-center justify-between px-5 py-3.5 ${row.highlight ? 'bg-blue-50/60' : ''}`}>
                            <div>
                              <div className={`text-sm font-semibold ${row.color}`}>{row.label}</div>
                              <div className="text-xs text-gray-400">{row.sub}</div>
                            </div>
                            <div className="text-right">
                              {row.amt !== null ? (
                                <>
                                  <div className={`font-bold text-sm ${row.color}`}>{fmtAmt(row.amt, cu)} {ul}/day</div>
                                  <div className="text-xs text-gray-500">{row.s?.kcalPerDay} kcal/day</div>
                                </>
                              ) : (
                                <div className={`font-bold text-sm ${row.color}`}>{row.s?.kcalPerDay} kcal/day</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900 text-sm">Safe weight gain tips</h3>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {GAIN_TIPS.map(tip => (
                          <div key={tip.title} className="flex items-start gap-3 px-5 py-4">
                            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-800">{tip.title}</div>
                              <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{tip.body}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-xs text-blue-800 leading-relaxed">
                        <strong>Monitor progress weekly.</strong> If your pet is not gaining weight after 2–3 weeks at the recommended amount, see your veterinarian. Conditions like intestinal parasites, dental disease, hyperthyroidism (cats), or diabetes can prevent weight gain regardless of food intake.
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 no-print">
                      <div className="text-3xl flex-shrink-0">🏥</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">Concerned about your underweight pet?</p>
                        <p className="text-xs text-gray-500 mt-0.5">Atlas Veterinary Hospital · La Verne, CA</p>
                      </div>
                      <a href="tel:9092226682"
                        className="flex-shrink-0 flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                        Call Us
                      </a>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {loadedFood && (
          <div className="flex items-center gap-2 mt-6 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-800 font-medium no-print">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Loaded: {loadedFood} — calorie data filled in above.
          </div>
        )}

        {feedingResult && (
          <div className="no-print">
            <FoodRecommendations
              species={snapshot?.species ?? form.species}
              goals={['weight-gain', 'puppy']}
              onUse={handleUseFood}
              heading="Recommended high-calorie diets"
            />
          </div>
        )}

        {!embedded && (
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-400 no-print">
            <Link to="/feeding-calculator" className="text-teal-600 hover:underline">← General feeding calculator</Link>
            {' · '}
            <Link to="/weight-loss-calculator" className="text-teal-600 hover:underline">Weight loss calculator</Link>
            {' · '}
            <Link to="/" className="text-teal-600 hover:underline">Compare food labels (DMB calculator)</Link>
          </div>
        )}
      </div>
    </>
  );
}
