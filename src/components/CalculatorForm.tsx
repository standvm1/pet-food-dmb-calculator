import { useState } from 'react';
import { HelpCircle, RotateCcw, Calculator } from 'lucide-react';
import type { FoodInput, FoodType, Species, CaloriesUnit, DietGoal } from '../types';
import AdvancedSection from './AdvancedSection';

const defaultFood = (): FoodInput => ({
  name: '',
  moisture: '',
  protein: '',
  fat: '',
  fiber: '',
  ash: '',
  carbs: '',
  calories: '',
  caloriesUnit: 'kcal/can',
  foodType: 'canned',
  species: 'dog',
  dietGoal: '',
  phosphorus: '',
  sodium: '',
  calcium: '',
  omega3: '',
  kcalPerKg: '',
  petWeight: '',
  petWeightUnit: 'lbs',
  targetWeight: '',
  bodyConditionScore: '',
  isNeutered: true,
  activityLevel: 'moderate',
  lifeStage: 'adult',
  dailyFeedingAmount: '',
});

interface CalculatorFormProps {
  food: FoodInput;
  onChange: (food: FoodInput) => void;
  onCalculate: () => void;
  label?: string;
  hideCalculate?: boolean;
}

interface FieldProps {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
}

function Field({ label, tooltip, children }: FieldProps) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              onFocus={() => setShowTip(true)}
              onBlur={() => setShowTip(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            {showTip && (
              <div className="absolute left-5 top-0 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 z-10 shadow-lg leading-relaxed">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export default function CalculatorForm({ food, onChange, onCalculate, label = 'Food', hideCalculate = false }: CalculatorFormProps) {
  const update = (key: keyof FoodInput, value: unknown) => {
    onChange({ ...food, [key]: value });
  };

  const numField = (key: keyof FoodInput) => (
    <input
      type="number"
      min="0"
      max="100"
      step="0.01"
      value={food[key] as number | ''}
      onChange={e => update(key, e.target.value === '' ? '' : Number(e.target.value))}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 text-sm transition-colors"
      placeholder="0.00"
    />
  );

  const reset = () => onChange(defaultFood());

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-teal-600 px-5 py-4">
        <h2 className="font-bold text-white text-lg">{label}</h2>
        <p className="text-teal-100 text-sm mt-0.5">Enter values from the Guaranteed Analysis on the food label</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Food name */}
        <Field label="Food Name (optional)" tooltip="Give this food a nickname to identify it in comparisons and your PDF report.">
          <input
            type="text"
            value={food.name}
            onChange={e => update('name', e.target.value)}
            placeholder="e.g. Brand X Salmon Recipe Canned"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 text-sm"
          />
        </Field>

        {/* Species + Food type */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Species">
            <select
              value={food.species}
              onChange={e => update('species', e.target.value as Species)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900 text-sm"
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>
          </Field>

          <Field label="Food Type">
            <select
              value={food.foodType}
              onChange={e => update('foodType', e.target.value as FoodType)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900 text-sm"
            >
              <option value="canned">Canned / Wet</option>
              <option value="dry">Dry / Kibble</option>
              <option value="semi-moist">Semi-Moist</option>
              <option value="treat">Treat</option>
              <option value="home-cooked">Home-Cooked / Other</option>
            </select>
          </Field>
        </div>

        {/* Diet goal */}
        <Field
          label="Diet Goal (optional)"
          tooltip="Selecting a diet goal shows educational guidance about that type of diet after you calculate."
        >
          <select
            value={food.dietGoal}
            onChange={e => update('dietGoal', e.target.value as DietGoal | '')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900 text-sm"
          >
            <option value="">No specific goal</option>
            <option value="general-maintenance">General Adult Maintenance</option>
            <option value="weight-loss">Weight Loss</option>
            <option value="low-fat">Low Fat</option>
            <option value="kidney-support">Kidney Support</option>
            <option value="urinary-support">Urinary Support</option>
            <option value="diabetic-support">Diabetic Support</option>
            <option value="sensitive-stomach">Sensitive Stomach</option>
            <option value="puppy-kitten">Puppy / Kitten</option>
            <option value="senior">Senior</option>
          </select>
        </Field>

        <hr className="border-gray-100" />

        {/* Core nutrients */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Guaranteed Analysis — from the food label
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Moisture %"
              tooltip="Found on every pet food label. Wet/canned foods are typically 75–85%. Dry foods are typically 8–12%."
            >
              {numField('moisture')}
            </Field>

            <Field
              label="Crude Protein %"
              tooltip="Listed as 'Crude Protein (min)' on the label. This is the as-fed (wet basis) value."
            >
              {numField('protein')}
            </Field>

            <Field
              label="Crude Fat %"
              tooltip="Listed as 'Crude Fat (min)' on the label."
            >
              {numField('fat')}
            </Field>

            <Field
              label="Crude Fiber %"
              tooltip="Listed as 'Crude Fiber (max)' on the label."
            >
              {numField('fiber')}
            </Field>

            <Field
              label="Ash % (optional)"
              tooltip="Ash represents the mineral content. Often not on labels — if left blank, a default estimate will be used (2.5% for canned, 7% for dry)."
            >
              {numField('ash')}
            </Field>

            <Field
              label="Carbohydrates % (optional)"
              tooltip="Usually not on labels. If left blank, carbs will be estimated using the NFE method: 100 − protein − fat − fiber − moisture − ash."
            >
              {numField('carbs')}
            </Field>
          </div>
        </div>

        {/* Calories */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Calorie Information (optional — used in feeding calculator)</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Calories" tooltip="From the 'Calorie Content' statement on the label.">
              <input
                type="number"
                min="0"
                step="1"
                value={food.calories}
                onChange={e => update('calories', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 185"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900 placeholder-gray-400 text-sm"
              />
            </Field>
            <Field label="Calorie Unit">
              <select
                value={food.caloriesUnit}
                onChange={e => update('caloriesUnit', e.target.value as CaloriesUnit)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900 text-sm"
              >
                <option value="kcal/can">kcal / can</option>
                <option value="kcal/cup">kcal / cup</option>
                <option value="kcal/kg">kcal / kg</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Advanced */}
        <AdvancedSection food={food} onChange={updates => onChange({ ...food, ...updates })} />

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          {!hideCalculate && (
            <button
              type="button"
              onClick={onCalculate}
              className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <Calculator className="w-4 h-4" />
              Calculate DMB
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            className={`flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-3 px-4 rounded-xl transition-colors ${hideCalculate ? 'flex-1' : ''}`}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export { defaultFood };
