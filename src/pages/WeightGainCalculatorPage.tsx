import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, ChevronDown, ChevronUp, AlertTriangle, Info, Phone } from 'lucide-react';
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
  petName: '', species: 'dog', weight: '', weightUnit: 'lbs', bcs: 3,
  lifeStage: 'adult', isNeutered: true, activityLevel: 'low',
  calories: '', caloriesUnit: 'kcal/cup', kcalPerKg: '',
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

const SEE_VET_SIGNS = [
  'BCS 1 or 2 (emaciated)',
  'Sudden weight loss with no diet change',
  'Weight loss accompanied by vomiting, diarrhea, or lethargy',
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

export default function WeightGainCalculatorPage() {
  const [form, setForm] = useState<FormState>(defaultForm());
  const [showCalories, setShowCalories] = useState(false);
  const up = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const feedingResult = calculateFeeding(toFoodInput(form));
  const bcsNum = form.bcs !== '' ? Number(form.bcs) : null;
  const petName = form.petName.trim() || (form.species === 'dog' ? 'your dog' : 'your cat');

  const isUnderweight = bcsNum !== null && bcsNum < 5;
  const isSevere = bcsNum !== null && bcsNum <= 2;

  function formatAmount(s: { kcalPerDay: number; gramsPerDay: number | null; unitsPerDay: number | null } | undefined): string {
    if (!s || !feedingResult) return '';
    if (s.gramsPerDay !== null) return `${Math.round(s.gramsPerDay)} g/day`;
    if (s.unitsPerDay !== null) return `${s.unitsPerDay.toFixed(2)} ${feedingResult.unitLabel}`;
    return `${s.kcalPerDay} kcal/day`;
  }

  const weightToGainKg = feedingResult ? feedingResult.idealWeightKg - feedingResult.currentWeightKg : 0;
  const weeksModerate = feedingResult && weightToGainKg > 0
    ? Math.round(weightToGainKg / (feedingResult.idealWeightKg * 0.015))
    : 0;

  return (
    <>
      <Helmet>
        <title>Pet Weight Gain Calculator — Underweight Dog & Cat Feeding Guide | Atlas Veterinary Hospital</title>
        <meta name="description" content="Is your dog or cat underweight? Use our free weight gain calculator to get a safe feeding plan to help your pet reach a healthy body condition." />
        <link rel="canonical" href="https://petfooddmb.atlasveterinaryhospital.com/weight-gain-calculator" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
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

        {/* When to see a vet */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8">
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

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Form ── */}
          <div className="lg:col-span-2 space-y-6">
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
                  placeholder="e.g. 12" className={sl + ' flex-1'} />
                <select value={form.weightUnit} onChange={e => up('weightUnit', e.target.value)} className={sl + ' w-24'}>
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Body Condition Score
              </label>
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
                  <p className="text-xs text-gray-500">Find the "Calorie Content" statement on the food label.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Calories</label>
                      <input type="number" min="0" step="1" value={form.calories}
                        onChange={e => up('calories', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 350"
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
              )}
            </div>
          </div>

          {/* ── Results ── */}
          <div className="lg:col-span-3 space-y-5">
            {!feedingResult ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <div className="text-5xl mb-4">🐾</div>
                <p className="text-gray-500 font-medium">Enter your pet's weight and body condition score to see a weight gain plan.</p>
              </div>
            ) : (
              <>
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

                {isUnderweight && (
                  <>
                    {/* Primary plan */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                      <div className="text-sm font-semibold text-blue-100 uppercase tracking-wide mb-1">Weight gain feeding plan</div>
                      <h2 className="text-2xl font-extrabold mb-1">
                        {formatAmount(feedingResult.scenarios.moderateWeightGain)}
                      </h2>
                      <p className="text-blue-100 text-sm mb-4">
                        Moderate weight gain — {feedingResult.scenarios.moderateWeightGain.kcalPerDay} kcal/day
                        {weightToGainKg > 0.1 && ` · Goal: gain ${(weightToGainKg * 2.205).toFixed(1)} lbs`}
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Current', value: `${feedingResult.currentWeightKg.toFixed(1)} kg` },
                          { label: 'Target (est.)', value: `${feedingResult.idealWeightKg.toFixed(1)} kg` },
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

                    {/* Weight gain range */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900 text-sm">Weight gain feeding range</h3>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {[
                          { s: feedingResult.scenarios.maintenance, label: 'Maintenance', sub: 'Hold current weight', color: 'text-teal-700' },
                          { s: feedingResult.scenarios.moderateWeightGain, label: 'Moderate weight gain ✓', sub: 'Recommended starting point', color: 'text-blue-700', highlight: true },
                          { s: feedingResult.scenarios.aggressiveWeightGain, label: 'Active weight gain', sub: 'Use only under veterinary supervision', color: 'text-purple-700' },
                        ].map(row => (
                          <div key={row.label} className={`flex items-center justify-between px-5 py-3.5 ${row.highlight ? 'bg-blue-50/60' : ''}`}>
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
                  </>
                )}

                {/* CTA */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
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
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
          <Link to="/feeding-calculator" className="text-teal-600 hover:underline">← General feeding calculator</Link>
          {' · '}
          <Link to="/weight-loss-calculator" className="text-teal-600 hover:underline">Weight loss calculator</Link>
          {' · '}
          <Link to="/" className="text-teal-600 hover:underline">Compare food labels (DMB calculator)</Link>
        </div>
      </div>
    </>
  );
}
