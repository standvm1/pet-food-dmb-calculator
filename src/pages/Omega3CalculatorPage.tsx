import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Fish, Info, Phone, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import LabelScanner from '../components/LabelScanner';

type Species = 'dog' | 'cat';
type WeightUnit = 'lbs' | 'kg';
type Condition = 'wellness' | 'joint' | 'kidney' | 'cardiac' | 'skin' | 'cancer';

interface FormState {
  species: Species;
  weight: number | '';
  weightUnit: WeightUnit;
  condition: Condition;
  capsuleMg: number;
}

const CONDITION_INFO: Record<Condition, { label: string; dosePerKg: number; rationale: string }> = {
  wellness: { label: 'General wellness / healthy pet', dosePerKg: 30,  rationale: 'Baseline anti-inflammatory support. Fish oil for skin coat, immune function, and longevity.' },
  joint:    { label: 'Joint disease / osteoarthritis', dosePerKg: 60,  rationale: 'High-dose EPA/DHA reduces synovial inflammation and prostaglandin production in arthritic joints. Therapeutic effect usually seen within 4–6 weeks.' },
  kidney:   { label: 'Kidney disease (CKD)', dosePerKg: 90,  rationale: 'Omega-3 fatty acids reduce glomerular hypertension and slow CKD progression. WSAVA recommends 40–100 mg/kg/day for CKD patients.' },
  cardiac:  { label: 'Heart disease (DCM / CHF)', dosePerKg: 50,  rationale: 'EPA+DHA reduce cardiac inflammatory cytokines, lower triglycerides, and may slow cardiac remodeling in CHF patients.' },
  skin:     { label: 'Skin disease / allergies', dosePerKg: 60,  rationale: 'High-dose EPA+DHA reduces pruritis and skin inflammation in atopic dermatitis. Often combined with other allergy management.' },
  cancer:   { label: 'Cancer / neoplasia support', dosePerKg: 75,  rationale: 'Omega-3 fatty acids may reduce tumor-associated cachexia and have anti-proliferative effects. Used as adjunctive support alongside oncology treatment.' },
};

const SUPPLEMENT_EXAMPLES = [
  { name: 'Standard fish oil (1g/softgel)', mg: 300 },
  { name: 'High-potency fish oil (2g/softgel)', mg: 600 },
  { name: 'Welactin Canine (per pump)', mg: 400 },
  { name: 'Nordic Naturals Omega-3 Pet (per capsule)', mg: 300 },
  { name: 'Vetri-Mega Omega (per capsule)', mg: 375 },
];

const sl = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900';

const TIPS = [
  { title: 'EPA + DHA — not total omega-3', body: 'Only EPA and DHA have the anti-inflammatory benefits. ALA (from flaxseed) does not convert efficiently in dogs and cats. Always look for the EPA + DHA amount, not total omega-3.' },
  { title: 'Store fish oil properly', body: 'Fish oil oxidizes quickly. Buy smaller bottles, keep refrigerated after opening, and use within 3 months. Rancid fish oil is pro-inflammatory — it defeats the purpose.' },
  { title: 'Liquid vs. capsules', body: 'Liquid fish oil (pumped over food) is easier to dose precisely for large dogs. Capsules work well for cats and small dogs. Avoid enteric-coated capsules — some pets don\'t absorb them as well.' },
  { title: 'Expect a 4–8 week delay', body: 'Omega-3 fatty acids incorporate into cell membranes over weeks. Don\'t expect instant results — consistent daily supplementation for at least 1–2 months is needed to see effects.' },
  { title: 'Bleeding risk at very high doses', body: 'Very high omega-3 doses (>310 mg/kg/day) can theoretically affect platelet function. For most therapeutic doses listed here, this is not a clinical concern, but mention it to your vet if your pet has surgery coming up.' },
];

export default function Omega3CalculatorPage() {
  const [form, setForm] = useState<FormState>({
    species: 'dog', weight: '', weightUnit: 'lbs',
    condition: 'joint', capsuleMg: 300,
  });
  const up = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const hasWeight = form.weight !== '' && Number(form.weight) > 0;
  const weightKg = hasWeight ? (form.weightUnit === 'kg' ? Number(form.weight) : Number(form.weight) / 2.205) : 0;

  const info = CONDITION_INFO[form.condition];
  const dailyMg = weightKg > 0 ? Math.round(weightKg * info.dosePerKg) : 0;
  const capsules = dailyMg > 0 && form.capsuleMg > 0 ? dailyMg / form.capsuleMg : 0;

  const isHighDose = capsules > 6;

  return (
    <>
      <Helmet>
        <title>Omega-3 / EPA+DHA Supplement Calculator | Atlas Veterinary Hospital</title>
        <meta name="description" content="Calculate the correct daily EPA+DHA omega-3 dose for dogs and cats based on weight and condition. Joint disease, kidney disease, cardiac, skin, and cancer support dosing." />
      </Helmet>

      <div className="bg-teal-50 border-b border-teal-100">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-teal-100">
              <Fish className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Omega-3 / EPA+DHA Dosing Calculator</h1>
              <p className="text-sm text-gray-500 mt-0.5">Daily fish oil target by condition and body weight</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <LabelScanner accentClass="focus:ring-teal-500" />

        {/* Inputs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Pet Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Species</label>
              <select className={sl} value={form.species} onChange={e => up('species', e.target.value as Species)}>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Weight unit</label>
              <select className={sl} value={form.weightUnit} onChange={e => up('weightUnit', e.target.value as WeightUnit)}>
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Body weight</label>
            <input type="number" min="0" className={sl} value={form.weight} onChange={e => up('weight', e.target.value === '' ? '' : Number(e.target.value))} placeholder={`e.g. ${form.weightUnit === 'lbs' ? '30' : '14'}`} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Condition / reason for supplementation</label>
            <div className="space-y-1.5">
              {(Object.keys(CONDITION_INFO) as Condition[]).map(c => (
                <label key={c} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.condition === c ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}>
                  <input type="radio" name="condition" checked={form.condition === c} onChange={() => up('condition', c)} className="accent-teal-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{CONDITION_INFO[c].label}</div>
                    <div className="text-xs text-gray-500 leading-relaxed mt-0.5">{CONDITION_INFO[c].rationale}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Supplement EPA+DHA concentration</label>
            <div className="space-y-1.5 mb-3">
              {SUPPLEMENT_EXAMPLES.map(s => (
                <label key={s.name} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${form.capsuleMg === s.mg && false ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}
                  onClick={() => up('capsuleMg', s.mg)}>
                  <span className="text-xs text-gray-700 flex-1">{s.name}</span>
                  <span className="text-xs font-semibold text-teal-700">{s.mg} mg EPA+DHA</span>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Or enter custom EPA+DHA per dose (mg)</label>
              <input type="number" min="1" className={sl} value={form.capsuleMg} onChange={e => up('capsuleMg', Number(e.target.value) || 300)} />
            </div>
          </div>
        </div>

        {/* Results */}
        {hasWeight && dailyMg > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">Daily Omega-3 Target</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-teal-50 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-teal-700">{dailyMg.toLocaleString()} mg</div>
                <div className="text-sm text-teal-600 mt-1">EPA+DHA per day</div>
                <div className="text-xs text-teal-500 mt-0.5">{info.dosePerKg} mg/kg × {weightKg.toFixed(1)} kg</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-gray-700">{capsules % 1 === 0 ? capsules : capsules.toFixed(1)}</div>
                <div className="text-sm text-gray-600 mt-1">{form.capsuleMg === 300 ? 'standard capsules' : `doses (${form.capsuleMg} mg each)`}</div>
                <div className="text-xs text-gray-500 mt-0.5">at {form.capsuleMg} mg EPA+DHA per dose</div>
              </div>
            </div>

            {capsules > 1 && capsules <= 2 && (
              <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-800 leading-relaxed">
                <strong>Tip:</strong> For {Math.round(capsules)} capsules/day, give 1 with morning meal and 1 with evening meal. Splitting doses improves absorption and reduces any GI upset.
              </div>
            )}

            {isHighDose && (
              <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800 leading-relaxed">
                  This is a higher dose ({capsules.toFixed(1)} capsules/day). Consider a liquid fish oil for easier dosing. Confirm with your vet, especially if your pet is on blood-thinning medications or has surgery scheduled.
                </p>
              </div>
            )}

            <div className="flex items-start gap-3 bg-teal-50 rounded-xl p-4">
              <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-teal-800 leading-relaxed space-y-1">
                <p>Look for a supplement that lists EPA and DHA separately — not just "total omega-3". A 1g fish oil capsule typically contains 180 mg EPA + 120 mg DHA = 300 mg EPA+DHA total.</p>
                <p className="font-medium">Always read the label and calculate based on the actual EPA+DHA content of your specific product.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Omega-3 Supplementation Tips</h2>
          <div className="space-y-3">
            {TIPS.map(t => (
              <div key={t.title}>
                <div className="text-sm font-medium text-gray-800">{t.title}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>Questions about omega-3 supplements for your pet? <a href="tel:9092226682" className="font-semibold underline">Call Atlas Veterinary (909-222-6682)</a> — we can recommend the right product and dose.</span>
        </div>

        <div className="flex justify-end no-print">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Save as PDF
          </button>
        </div>

        <div className="pt-2 border-t border-gray-100 text-sm text-gray-400 text-center">
          <Link to="/renal-calculator" className="text-teal-600 hover:underline">Renal Calculator</Link>
          {' · '}
          <Link to="/cardiac-calculator" className="text-teal-600 hover:underline">Cardiac Calculator</Link>
          {' · '}
          <Link to="/joint-disease" className="text-teal-600 hover:underline">Joint Disease Guide</Link>
        </div>
      </div>
    </>
  );
}
