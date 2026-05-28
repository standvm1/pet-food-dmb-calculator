import { useState } from 'react';
import { ChevronDown, ChevronUp, Activity, FlaskConical } from 'lucide-react';
import type { FoodInput, WeightUnit, ActivityLevel, LifeStage } from '../types';

interface AdvancedSectionProps {
  food: FoodInput;
  onChange: (updates: Partial<FoodInput>) => void;
}

const BCS_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: '1 — Emaciated', color: 'text-red-600' },
  2: { label: '2 — Very Thin', color: 'text-red-500' },
  3: { label: '3 — Thin', color: 'text-orange-500' },
  4: { label: '4 — Slightly Thin', color: 'text-yellow-600' },
  5: { label: '5 — Ideal', color: 'text-green-600' },
  6: { label: '6 — Slightly Overweight', color: 'text-yellow-600' },
  7: { label: '7 — Overweight', color: 'text-orange-500' },
  8: { label: '8 — Obese', color: 'text-red-500' },
  9: { label: '9 — Severely Obese', color: 'text-red-600' },
};

function numInput(
  value: number | '',
  onChange: (v: number | '') => void,
  placeholder = 'Optional',
  min = '0',
  step = '0.01'
) {
  return (
    <input
      type="number"
      min={min}
      step={step}
      value={value}
      onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-300"
    />
  );
}

export default function AdvancedSection({ food, onChange }: AdvancedSectionProps) {
  const [open, setOpen] = useState(false);
  const bcsNum = food.bodyConditionScore !== '' ? Number(food.bodyConditionScore) : null;
  const bcsInfo = bcsNum !== null ? BCS_LABELS[bcsNum] : null;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-semibold text-gray-700">Pet Profile & Feeding Calculator</span>
          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Optional</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="p-4 bg-white space-y-5">
          <p className="text-xs text-gray-500 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 leading-relaxed">
            Fill in your pet's details to unlock a <strong>personalized feeding calculator</strong> with daily calorie and portion recommendations — including weight loss, maintenance, and weight gain ranges.
          </p>

          {/* Pet weight */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pet Weight</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Weight</label>
                {numInput(food.petWeight, v => onChange({ petWeight: v }), 'e.g. 25', '0.1', '0.1')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={food.petWeightUnit}
                  onChange={e => onChange({ petWeightUnit: e.target.value as WeightUnit })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
            {food.petWeight !== '' && food.petWeightUnit === 'lbs' && (
              <p className="text-xs text-gray-400 mt-1">≈ {(Number(food.petWeight) / 2.205).toFixed(1)} kg</p>
            )}
            {food.petWeight !== '' && food.petWeightUnit === 'kg' && (
              <p className="text-xs text-gray-400 mt-1">≈ {(Number(food.petWeight) * 2.205).toFixed(1)} lbs</p>
            )}
          </div>

          {/* Body condition score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body Condition Score (BCS) — 1 to 9
            </label>
            <select
              value={food.bodyConditionScore}
              onChange={e => onChange({ bodyConditionScore: e.target.value === '' ? '' : Number(e.target.value) })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">Select BCS…</option>
              {Object.entries(BCS_LABELS).map(([score, info]) => (
                <option key={score} value={score}>{info.label}</option>
              ))}
            </select>
            {bcsInfo && (
              <p className={`text-xs mt-1 font-medium ${bcsInfo.color}`}>
                {bcsNum === 5
                  ? 'Ideal — your pet is at a healthy weight.'
                  : bcsNum && bcsNum < 5
                  ? `Underweight — ideal weight is approximately ${food.petWeight !== '' ? ((food.petWeightUnit === 'lbs' ? Number(food.petWeight) : Number(food.petWeight) * 2.205) * (1 + (5 - bcsNum) * 0.1)).toFixed(1) : '?'} lbs.`
                  : bcsNum && bcsNum > 5
                  ? `Overweight — ideal weight is approximately ${food.petWeight !== '' ? ((food.petWeightUnit === 'lbs' ? Number(food.petWeight) : Number(food.petWeight) * 2.205) / (1 + (bcsNum - 5) * 0.1)).toFixed(1) : '?'} lbs.`
                  : ''
                }
              </p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">Ask your veterinarian if unsure. BCS 5/9 is ideal for most pets.</p>
          </div>

          {/* Life stage, neuter status, activity */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pet Profile</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Life Stage</label>
                <select
                  value={food.lifeStage}
                  onChange={e => onChange({ lifeStage: e.target.value as LifeStage })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="adult">Adult</option>
                  <option value="puppy-kitten">Puppy / Kitten</option>
                  <option value="senior">Senior (7+ yrs)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spayed / Neutered?</label>
                <div className="flex gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onChange({ isNeutered: true })}
                    className={`flex-1 text-sm font-medium py-2 rounded-lg border transition-colors ${
                      food.isNeutered ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ isNeutered: false })}
                    className={`flex-1 text-sm font-medium py-2 rounded-lg border transition-colors ${
                      !food.isNeutered ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                <select
                  value={food.activityLevel}
                  onChange={e => onChange({ activityLevel: e.target.value as ActivityLevel })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="low">Low (mostly indoor/sedentary)</option>
                  <option value="moderate">Moderate (typical pet)</option>
                  <option value="high">High (very active / working)</option>
                </select>
              </div>
            </div>
          </div>

          {/* kcal/kg from food */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Caloric Density — kcal/kg{' '}
              <span className="text-xs text-gray-400 font-normal">(from food label's "Calorie Content" statement)</span>
            </label>
            {numInput(food.kcalPerKg, v => onChange({ kcalPerKg: v }), 'e.g. 3500', '0', '1')}
            <p className="text-xs text-gray-400 mt-0.5">
              Used with pet weight to calculate daily grams. Also enter the Calories field above for cups/cans.
            </p>
          </div>

          {/* Mineral nutrients */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-4 h-4 text-teal-600" />
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mineral Nutrients</div>
              <span className="text-xs text-gray-400">(for PDF report / vet reference)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'phosphorus' as const, label: 'Phosphorus %', hint: 'Important for kidney diets' },
                { key: 'sodium' as const, label: 'Sodium %', hint: 'Heart/kidney conditions' },
                { key: 'calcium' as const, label: 'Calcium %', hint: 'Growing pets' },
                { key: 'omega3' as const, label: 'Omega-3 %', hint: 'Premium food labels' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  {numInput(food[field.key], v => onChange({ [field.key]: v }))}
                  <p className="text-xs text-gray-400 mt-0.5">{field.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
