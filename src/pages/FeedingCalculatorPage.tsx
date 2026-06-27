import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Scale, ChevronDown, ChevronUp, Info, Phone, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BcsSelector from '../components/BcsSelector';
import FoodRecommendations from '../components/FoodRecommendations';
import { calculateFeeding } from '../utils/calculations';
import type { FoodInput, ActivityLevel, LifeStage, CaloriesUnit } from '../types';
import type { RecommendedFood, DietGoal } from '../data/dietRecommendations';

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
  petName: '',
  species: 'dog',
  weight: '',
  weightUnit: 'lbs',
  bcs: '',
  lifeStage: 'adult',
  isNeutered: true,
  activityLevel: 'moderate',
  calories: '',
  caloriesUnit: 'kcal/cup',
  kcalPerKg: '',
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

const sl = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900';

interface Props { embedded?: boolean }

export default function FeedingCalculatorPage({ embedded }: Props = {}) {
  const [form, setForm] = useState<FormState>(defaultForm());
  const [showCalories, setShowCalories] = useState(false);
  const [loadedFood, setLoadedFood] = useState<string | null>(null);
  const up = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  function handleUseFood(food: RecommendedFood) {
    up('kcalPerKg', food.kcalPerKg);
    if (food.kcalPerCup) { up('calories', food.kcalPerCup); up('caloriesUnit', 'kcal/cup'); }
    else if (food.kcalPerCan) { up('calories', food.kcalPerCan); up('caloriesUnit', 'kcal/can'); }
    else { up('calories', food.kcalPerKg); up('caloriesUnit', 'kcal/kg'); }
    setShowCalories(true);
    setLoadedFood(`${food.brand} ${food.name}`);
    setTimeout(() => setLoadedFood(null), 4000);
  }

  const feedingResult = calculateFeeding(toFoodInput(form));
  const bcsNum = form.bcs !== '' ? Number(form.bcs) : null;

  const recommendationGoals: DietGoal[] = bcsNum === null
    ? ['maintenance']
    : bcsNum <= 2 ? ['weight-gain']
    : bcsNum <= 4 ? ['weight-gain']
    : bcsNum === 5 ? ['maintenance']
    : bcsNum <= 7 ? ['weight-loss']
    : ['weight-loss'];

  const primaryScenario = feedingResult
    ? bcsNum === null ? feedingResult.scenarios.maintenance
      : bcsNum <= 2 ? feedingResult.scenarios.aggressiveWeightGain
      : bcsNum <= 4 ? feedingResult.scenarios.moderateWeightGain
      : bcsNum === 5 ? feedingResult.scenarios.maintenance
      : bcsNum <= 7 ? feedingResult.scenarios.moderateWeightLoss
      : feedingResult.scenarios.aggressiveWeightLoss
    : null;

  const primaryLabel = bcsNum === null ? 'Maintenance'
    : bcsNum <= 2 ? 'Active Weight Gain'
    : bcsNum <= 4 ? 'Moderate Weight Gain'
    : bcsNum === 5 ? 'Maintenance'
    : bcsNum <= 7 ? 'Moderate Weight Loss'
    : 'Active Weight Loss';

  const petName = form.petName.trim() || (form.species === 'dog' ? 'your dog' : 'your cat');

  function formatAmount(s: { kcalPerDay: number; gramsPerDay: number | null; unitsPerDay: number | null }): string {
    if (!feedingResult) return '';
    if (s.gramsPerDay !== null) return `${Math.round(s.gramsPerDay)} g/day`;
    if (s.unitsPerDay !== null) return `${s.unitsPerDay.toFixed(2)} ${feedingResult.unitLabel}`;
    return `${s.kcalPerDay} kcal/day`;
  }

  return (
    <>
      {!embedded && (
        <Helmet>
          <title>Pet Feeding Calculator — How Much Should I Feed My Pet? | Atlas Veterinary Hospital</title>
          <meta name="description" content="Free pet feeding calculator for dogs and cats. Enter your pet's weight and body condition score to get personalized daily feeding recommendations from Atlas Veterinary Hospital." />
          <link rel="canonical" href="https://petfooddmb.atlasveterinaryhospital.com/feeding-calculator" />
        </Helmet>
      )}

      <div className={embedded ? '' : 'max-w-4xl mx-auto px-4 sm:px-6 py-8'}>
        {/* Hero — standalone only */}
        {!embedded && (
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 rounded-2xl mb-4">
              <Scale className="w-7 h-7 text-teal-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
              How Much Should I Feed My Pet?
            </h1>
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
              Enter your pet's information below to get a personalized daily feeding recommendation — based on the same formula veterinarians use.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm text-gray-500">
              <Link to="/weight-loss-calculator" className="text-amber-600 hover:underline font-medium">My pet is overweight →</Link>
              <Link to="/weight-gain-calculator" className="text-blue-600 hover:underline font-medium">My pet is underweight →</Link>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Form ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Species */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Is this a dog or cat?</label>
              <div className="grid grid-cols-2 gap-3">
                {(['dog', 'cat'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => up('species', s)}
                    className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                      form.species === s
                        ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {s === 'dog' ? '🐶 Dog' : '🐱 Cat'}
                  </button>
                ))}
              </div>
            </div>

            {/* Pet name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Pet's name <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="text"
                value={form.petName}
                onChange={e => up('petName', e.target.value)}
                placeholder={form.species === 'dog' ? 'e.g. Buddy' : 'e.g. Luna'}
                className={sl}
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Current weight</label>
              <div className="flex gap-2">
                <input
                  type="number" min="0.1" step="0.1"
                  value={form.weight}
                  onChange={e => up('weight', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 25"
                  className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
                />
                <select value={form.weightUnit} onChange={e => up('weightUnit', e.target.value)} className="w-16 px-2 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900 text-center">
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
              {form.weight !== '' && (
                <p className="text-xs text-gray-400 mt-1">
                  ≈ {form.weightUnit === 'lbs'
                    ? `${(Number(form.weight) / 2.205).toFixed(1)} kg`
                    : `${(Number(form.weight) * 2.205).toFixed(1)} lbs`}
                </p>
              )}
            </div>

            {/* BCS */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Body Condition Score
                <span className="ml-1.5 text-xs text-gray-400 font-normal">— how does your pet look and feel?</span>
              </label>
              <BcsSelector value={form.bcs} onChange={v => up('bcs', v)} species={form.species} />
            </div>

            {/* Life stage, neuter, activity */}
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
                        form.isNeutered === v ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}>
                      {v ? 'Yes' : 'No (intact)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Activity level</label>
                <div className="space-y-2">
                  {([
                    { v: 'low', label: 'Low', desc: 'Mostly sleeps, indoor only, little exercise' },
                    { v: 'moderate', label: 'Moderate', desc: 'Typical pet — regular walks or play' },
                    { v: 'high', label: 'High', desc: 'Very active, working dog, lots of outdoor exercise' },
                  ] as { v: ActivityLevel; label: string; desc: string }[]).map(opt => (
                    <button key={opt.v} type="button" onClick={() => up('activityLevel', opt.v)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        form.activityLevel === opt.v
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                      <div className={`text-sm font-semibold ${form.activityLevel === opt.v ? 'text-teal-700' : 'text-gray-700'}`}>{opt.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Food calories — collapsible */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <button type="button" onClick={() => setShowCalories(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                <div>
                  <div className="text-sm font-semibold text-gray-700">Food calorie information</div>
                  <div className="text-xs text-gray-400 mt-0.5">Optional — needed to show cups, cans, or grams per day</div>
                </div>
                {showCalories ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showCalories && (
                <div className="p-4 space-y-3">
                  <p className="text-xs text-gray-500 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
                    Find the "Calorie Content" on your food bag or can label. It usually reads something like "3,500 kcal/kg" or "185 kcal/cup".
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Calories</label>
                      <input type="number" min="0" step="1"
                        value={form.calories}
                        onChange={e => up('calories', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 350"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Unit</label>
                      <select value={form.caloriesUnit} onChange={e => up('caloriesUnit', e.target.value as CaloriesUnit)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                        <option value="kcal/cup">kcal / cup</option>
                        <option value="kcal/can">kcal / can</option>
                        <option value="kcal/kg">kcal / kg</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Or kcal/kg (for grams per day)</label>
                    <input type="number" min="0" step="1"
                      value={form.kcalPerKg}
                      onChange={e => up('kcalPerKg', e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 3500"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
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
                <p className="text-gray-500 font-medium">Enter your pet's weight and body condition score to see results.</p>
              </div>
            ) : (
              <>
                {/* Primary recommendation */}
                <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
                  <div className="text-sm font-semibold text-teal-100 uppercase tracking-wide mb-1">Recommended feeding</div>
                  <h2 className="text-2xl font-extrabold mb-1">
                    {primaryScenario ? formatAmount(primaryScenario) : '—'}
                  </h2>
                  <p className="text-teal-100 text-sm mb-4">
                    {primaryLabel} — for {petName}
                    {primaryScenario && ` (${primaryScenario.kcalPerDay} kcal/day)`}
                  </p>

                  {/* Weight summary */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Current weight', value: form.weightUnit === 'lbs' ? `${Number(form.weight).toFixed(1)} lbs` : `${Number(form.weight).toFixed(1)} kg` },
                      { label: 'Ideal weight (est.)', value: `${feedingResult.idealWeightLbs.toFixed(1)} lbs` },
                      { label: 'Body condition', value: `BCS ${form.bcs}/9` },
                    ].map(item => (
                      <div key={item.label} className="bg-white/10 rounded-xl p-3 text-center">
                        <div className="text-xs text-teal-100 mb-1">{item.label}</div>
                        <div className="font-bold text-sm">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BCS message */}
                <div className={`rounded-xl border p-4 flex items-start gap-3 ${
                  feedingResult.bcsStatus === 'ideal' ? 'bg-green-50 border-green-200' :
                  feedingResult.bcsStatus === 'overweight' || feedingResult.bcsStatus === 'obese' ? 'bg-amber-50 border-amber-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-500" />
                  <p className="text-sm text-gray-700 leading-relaxed">{feedingResult.bcsMessage}</p>
                </div>

                {/* Full range */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50">
                    <h3 className="font-bold text-gray-900 text-sm">Full daily feeding range</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Based on {feedingResult.rerIdealKcal} kcal/day resting energy requirement at ideal weight</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {[
                      { s: feedingResult.scenarios.aggressiveWeightLoss, label: 'Active weight loss', sub: '70% of maintenance', color: 'text-red-600', bg: '' },
                      { s: feedingResult.scenarios.moderateWeightLoss, label: 'Moderate weight loss', sub: '80% of maintenance', color: 'text-orange-600', bg: '' },
                      { s: feedingResult.scenarios.maintenance, label: 'Maintenance', sub: 'Hold current ideal weight', color: 'text-teal-700', bg: 'bg-teal-50/50' },
                      { s: feedingResult.scenarios.moderateWeightGain, label: 'Moderate weight gain', sub: '120% of maintenance', color: 'text-blue-600', bg: '' },
                      { s: feedingResult.scenarios.aggressiveWeightGain, label: 'Active weight gain', sub: '150% of maintenance', color: 'text-purple-600', bg: '' },
                    ].map(row => (
                      <div key={row.label} className={`flex items-center justify-between px-5 py-3.5 ${row.bg}`}>
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

                {!feedingResult.hasCalorieData && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">
                      <strong>See cups or grams per day:</strong> Open "Food calorie information" above and enter the calorie content from your food label.
                    </p>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>These are estimates.</strong> Individual metabolic rates vary. Start at the recommended amount and adjust based on weight checks every 2–4 weeks. Pets with medical conditions should have feeding plans reviewed by a veterinarian.
                  </p>
                </div>

                {/* Loaded food banner */}
                {loadedFood && (
                  <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    Loaded: {loadedFood} — calorie data filled in above.
                  </div>
                )}

                {/* CTA */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="text-3xl flex-shrink-0">🏥</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Questions about your pet's diet?</p>
                    <p className="text-xs text-gray-500 mt-0.5">Atlas Veterinary Hospital — La Verne, CA</p>
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

        {/* Recommended foods — only when there's a result */}
        {feedingResult && (
          <FoodRecommendations
            species={form.species}
            goals={recommendationGoals}
            onUse={handleUseFood}
          />
        )}

        {/* How it works — standalone only */}
        {!embedded && <div className="mt-12 border-t border-gray-100 pt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">How this calculator works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: '⚖️', title: 'Resting Energy Requirement', body: 'We calculate how many calories your pet needs just to maintain basic body functions at rest (RER = 70 × weight_kg^0.75).' },
              { icon: '✖️', title: 'Life Stage Multiplier', body: 'We multiply by a factor based on species, age, neuter status, and activity level to get the true daily calorie need (MER).' },
              { icon: '🎯', title: 'Goal-Based Adjustment', body: 'Based on your pet\'s body condition score, we adjust the target: less food for weight loss, more for weight gain, or maintenance to stay steady.' },
            ].map(item => (
              <div key={item.title} className="text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Also compare food labels using our <Link to="/" className="text-teal-600 hover:underline">Dry Matter Basis Calculator</Link>.
          </p>
        </div>}
      </div>
    </>
  );
}
