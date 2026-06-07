import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { TrendingDown, ChevronDown, ChevronUp, AlertTriangle, Info, Phone, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import BcsSelector from '../components/BcsSelector';
import { calculateFeeding } from '../utils/calculations';
import type { FoodInput, ActivityLevel, LifeStage, CaloriesUnit } from '../types';

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
}

const defaultForm = (): FormState => ({
  petName: '', species: 'dog', weight: '', weightUnit: 'lbs', bcs: 7,
  lifeStage: 'adult', isNeutered: true, activityLevel: 'low',
  calories: '', caloriesUnit: 'kcal/cup', kcalPerKg: '',
});

function toFoodInput(f: FormState): FoodInput {
  return {
    name: f.petName, moisture: '', protein: '', fat: '', fiber: '', ash: '', carbs: '',
    calories: f.calories, caloriesUnit: f.caloriesUnit, foodType: 'dry',
    species: f.species, dietGoal: 'weight-loss', phosphorus: '', sodium: '', calcium: '', omega3: '',
    kcalPerKg: f.kcalPerKg, petWeight: f.weight, petWeightUnit: f.weightUnit,
    targetWeight: '', bodyConditionScore: f.bcs, isNeutered: f.isNeutered,
    activityLevel: f.activityLevel, lifeStage: f.lifeStage, dailyFeedingAmount: '',
  };
}

const sl = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-gray-900';

const WEIGHT_LOSS_TIPS = [
  { title: 'Measure every meal', body: 'Use a kitchen scale — measuring cups can be off by 20–30%. Weigh kibble for accuracy.' },
  { title: 'Scheduled meals only', body: 'Put food down for 15–20 minutes, then remove it. No free-choice feeding during a weight loss program.' },
  { title: 'Low-calorie treats only', body: 'Use a portion of daily kibble as treats, or give vegetables like carrots or green beans (dogs) or plain cooked chicken (cats).' },
  { title: 'Weigh every 2–4 weeks', body: 'Safe weight loss is 1–2% of body weight per week. Faster than that risks muscle loss.' },
  { title: 'More movement', body: 'Even 10–15 extra minutes of walking or play per day makes a difference over weeks.' },
  { title: 'Separate at mealtime', body: 'If you have multiple pets, feed them separately so the overweight pet can\'t eat other animals\' food.' },
];

export default function WeightLossCalculatorPage() {
  const [form, setForm] = useState<FormState>(defaultForm());
  const [showCalories, setShowCalories] = useState(false);
  const up = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const feedingResult = calculateFeeding(toFoodInput(form));
  const bcsNum = form.bcs !== '' ? Number(form.bcs) : null;
  const petName = form.petName.trim() || (form.species === 'dog' ? 'your dog' : 'your cat');

  const isOverweight = bcsNum !== null && bcsNum > 5;
  const isIdeal = bcsNum === 5;

  function formatAmount(s: { kcalPerDay: number; gramsPerDay: number | null; unitsPerDay: number | null } | undefined): string {
    if (!s || !feedingResult) return '';
    if (s.gramsPerDay !== null) return `${Math.round(s.gramsPerDay)} g/day`;
    if (s.unitsPerDay !== null) return `${s.unitsPerDay.toFixed(2)} ${feedingResult.unitLabel}`;
    return `${s.kcalPerDay} kcal/day`;
  }

  // Timeline estimate: safe loss = 1% body weight per week
  const weightToLoseKg = feedingResult ? feedingResult.currentWeightKg - feedingResult.idealWeightKg : 0;
  const weeksModerate = feedingResult && weightToLoseKg > 0
    ? Math.round(weightToLoseKg / (feedingResult.idealWeightKg * 0.01))
    : 0;
  const weeksAggressive = feedingResult && weightToLoseKg > 0
    ? Math.round(weightToLoseKg / (feedingResult.idealWeightKg * 0.015))
    : 0;

  return (
    <>
      <Helmet>
        <title>Pet Weight Loss Calculator — Safe Dog & Cat Diet Plan | Atlas Veterinary Hospital</title>
        <meta name="description" content="Is your dog or cat overweight? Use our free pet weight loss calculator to get a safe daily feeding plan based on your pet's body condition score and weight." />
        <link rel="canonical" href="https://petfooddmb.atlasveterinaryhospital.com/weight-loss-calculator" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-2xl mb-4">
            <TrendingDown className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Pet Weight Loss Calculator
          </h1>
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
            Over 50% of dogs and cats in the US are overweight. Even a small reduction in body weight can dramatically improve your pet's health, mobility, and lifespan.
          </p>
        </div>

        {/* Why it matters */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
          <h2 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Why weight matters for pets
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm text-amber-700">
            {[
              'Overweight pets live 1.5–2 years fewer on average',
              'Extra weight stresses joints, causing arthritis earlier',
              'Increases risk of diabetes, heart disease, and liver problems',
              'Reduces breathing efficiency — especially in flat-faced breeds',
              'Makes surgery and anesthesia riskier',
              'Cats are especially prone to hepatic lipidosis (fatty liver) with rapid weight changes',
            ].map(fact => (
              <div key={fact} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                <span>{fact}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Form ── */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Dog or cat?</label>
              <div className="grid grid-cols-2 gap-3">
                {(['dog', 'cat'] as const).map(s => (
                  <button key={s} type="button" onClick={() => up('species', s)}
                    className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                      form.species === s ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}>
                    {s === 'dog' ? '🐶 Dog' : '🐱 Cat'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Pet's name <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" value={form.petName} onChange={e => up('petName', e.target.value)}
                placeholder={form.species === 'dog' ? 'e.g. Bella' : 'e.g. Mochi'} className={sl} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Current weight</label>
              <div className="flex gap-2">
                <input type="number" min="0.1" step="0.1" value={form.weight}
                  onChange={e => up('weight', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 35" className={sl + ' flex-1'} />
                <select value={form.weightUnit} onChange={e => up('weightUnit', e.target.value)} className={sl + ' w-24'}>
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Body Condition Score
                <span className="ml-1.5 text-xs text-gray-400 font-normal">— select the score that best matches your pet</span>
              </label>
              <BcsSelector value={form.bcs} onChange={v => up('bcs', v)} species={form.species} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Life stage</label>
                <select value={form.lifeStage} onChange={e => up('lifeStage', e.target.value as LifeStage)} className={sl}>
                  <option value="adult">Adult</option>
                  <option value="senior">Senior (7+ years)</option>
                  <option value="puppy-kitten">Puppy / Kitten</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Spayed or neutered?</label>
                <div className="grid grid-cols-2 gap-3">
                  {([true, false] as const).map(v => (
                    <button key={String(v)} type="button" onClick={() => up('isNeutered', v)}
                      className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        form.isNeutered === v ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}>
                      {v ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Activity level</label>
                <select value={form.activityLevel} onChange={e => up('activityLevel', e.target.value as ActivityLevel)} className={sl}>
                  <option value="low">Low (mostly resting)</option>
                  <option value="moderate">Moderate (regular walks)</option>
                  <option value="high">High (very active)</option>
                </select>
              </div>
            </div>

            {/* Food calories */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <button type="button" onClick={() => setShowCalories(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                <div>
                  <div className="text-sm font-semibold text-gray-700">Add food calorie information</div>
                  <div className="text-xs text-gray-400 mt-0.5">Get cups, cans, or grams per day</div>
                </div>
                {showCalories ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showCalories && (
                <div className="p-4 space-y-3">
                  <p className="text-xs text-gray-500">Find the "Calorie Content" on the food label.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Calories</label>
                      <input type="number" min="0" step="1" value={form.calories}
                        onChange={e => up('calories', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 350"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Unit</label>
                      <select value={form.caloriesUnit} onChange={e => up('caloriesUnit', e.target.value as CaloriesUnit)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white">
                        <option value="kcal/cup">kcal / cup</option>
                        <option value="kcal/can">kcal / can</option>
                        <option value="kcal/kg">kcal / kg</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Results ── */}
          <div className="lg:col-span-3 space-y-5">
            {!feedingResult ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <div className="text-5xl mb-4">🐾</div>
                <p className="text-gray-500 font-medium">Enter your pet's weight and body condition score to see a weight loss plan.</p>
              </div>
            ) : (
              <>
                {/* Ideal not reached */}
                {isIdeal && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="font-bold text-green-800">{petName} is at an ideal weight!</p>
                    <p className="text-sm text-green-700 mt-1">Feed for maintenance. Check the <Link to="/feeding-calculator" className="underline">feeding calculator</Link> for your daily amount.</p>
                  </div>
                )}

                {/* Warning for BCS ≤ 5 (not overweight) */}
                {bcsNum !== null && bcsNum < 5 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                    <p className="font-bold text-blue-800">Your pet appears to be underweight, not overweight.</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Try the <Link to="/weight-gain-calculator" className="underline font-semibold">Weight Gain Calculator</Link> instead.
                    </p>
                  </div>
                )}

                {isOverweight && (
                  <>
                    {/* Primary plan */}
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
                      <div className="text-sm font-semibold text-amber-100 uppercase tracking-wide mb-1">Weight loss feeding plan</div>
                      <h2 className="text-2xl font-extrabold mb-1">
                        {formatAmount(feedingResult.scenarios.moderateWeightLoss)}
                      </h2>
                      <p className="text-amber-100 text-sm mb-4">
                        Moderate weight loss — {feedingResult.scenarios.moderateWeightLoss.kcalPerDay} kcal/day
                        {weightToLoseKg > 0.1 && ` · Goal: lose ${(weightToLoseKg * 2.205).toFixed(1)} lbs`}
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Current', value: `${feedingResult.currentWeightKg.toFixed(1)} kg` },
                          { label: 'Target (est.)', value: `${feedingResult.idealWeightKg.toFixed(1)} kg` },
                          { label: 'Est. timeline', value: weeksModerate > 0 ? `~${weeksModerate} wks` : '—' },
                        ].map(item => (
                          <div key={item.label} className="bg-white/10 rounded-xl p-3 text-center">
                            <div className="text-xs text-amber-100 mb-1">{item.label}</div>
                            <div className="font-bold text-sm">{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline note */}
                    {weeksModerate > 0 && (
                      <div className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                        <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-700">
                          <strong>Estimated timeline:</strong>{' '}
                          At a moderate rate (1% body weight/week), {petName} could reach an ideal weight in approximately <strong>{weeksModerate} weeks</strong>.
                          With active weight loss, as fast as <strong>{weeksAggressive} weeks</strong> — though this should only be done under veterinary supervision.
                        </div>
                      </div>
                    )}

                    {/* Weight loss range */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900 text-sm">Weight loss feeding range</h3>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {[
                          { s: feedingResult.scenarios.aggressiveWeightLoss, label: 'Active weight loss', sub: '70% of maintenance — vet supervision recommended', color: 'text-red-600' },
                          { s: feedingResult.scenarios.moderateWeightLoss, label: 'Moderate weight loss ✓', sub: 'Recommended starting point', color: 'text-amber-700', highlight: true },
                          { s: feedingResult.scenarios.maintenance, label: 'Maintenance', sub: 'For weight hold once goal is reached', color: 'text-teal-700' },
                        ].map(row => (
                          <div key={row.label} className={`flex items-center justify-between px-5 py-3.5 ${row.highlight ? 'bg-amber-50/60' : ''}`}>
                            <div>
                              <div className={`text-sm font-semibold ${row.color}`}>{row.label}</div>
                              <div className="text-xs text-gray-400">{row.sub}</div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold text-sm ${row.color}`}>{row.s.kcalPerDay} kcal/day</div>
                              {(row.s.gramsPerDay !== null || row.s.unitsPerDay !== null) && (
                                <div className="text-xs text-gray-500">
                                  {row.s.gramsPerDay !== null ? `${Math.round(row.s.gramsPerDay)} g/day` : `${row.s.unitsPerDay?.toFixed(2)} ${feedingResult.unitLabel}`}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900 text-sm">Weight loss success tips</h3>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {WEIGHT_LOSS_TIPS.map(tip => (
                          <div key={tip.title} className="flex items-start gap-3 px-5 py-4">
                            <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm font-semibold text-gray-800">{tip.title}</div>
                              <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{tip.body}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-xs text-amber-800 leading-relaxed">
                        <strong>These are estimates.</strong> Weigh your pet every 2–4 weeks and adjust food if needed. If your pet isn't losing weight after 4–6 weeks, consult your veterinarian — some pets have underlying conditions that affect metabolism.
                      </p>
                    </div>
                  </>
                )}

                {/* CTA */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="text-3xl flex-shrink-0">🏥</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Need a personalized weight loss plan?</p>
                    <p className="text-xs text-gray-500 mt-0.5">Atlas Veterinary Hospital · La Verne, CA · 3744 Towne Center Drive</p>
                  </div>
                  <a href="tel:9092226682"
                    className="flex-shrink-0 flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                    Call Us
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
          <Link to="/feeding-calculator" className="text-teal-600 hover:underline">← General feeding calculator</Link>
          {' · '}
          <Link to="/weight-gain-calculator" className="text-teal-600 hover:underline">Weight gain calculator →</Link>
          {' · '}
          <Link to="/" className="text-teal-600 hover:underline">Compare food labels (DMB calculator)</Link>
        </div>
      </div>
    </>
  );
}
