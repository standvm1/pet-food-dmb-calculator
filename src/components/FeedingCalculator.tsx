import { TrendingDown, TrendingUp, Minus, Scale, AlertTriangle, Info } from 'lucide-react';
import type { FeedingResult, FeedingScenario, BcsStatus, FoodInput } from '../types';

interface FeedingCalculatorProps {
  result: FeedingResult;
  food: FoodInput;
}

const BCS_COLOR: Record<BcsStatus, string> = {
  'very-thin': 'text-red-600 bg-red-50 border-red-200',
  'underweight': 'text-orange-600 bg-orange-50 border-orange-200',
  'ideal': 'text-green-700 bg-green-50 border-green-200',
  'overweight': 'text-amber-700 bg-amber-50 border-amber-200',
  'obese': 'text-red-600 bg-red-50 border-red-200',
};

interface ScenarioRowProps {
  scenario: FeedingScenario;
  unitLabel: string;
  isRecommended?: boolean;
  icon: React.ReactNode;
  colorClass: string;
  textClass: string;
  badgeClass: string;
}

function ScenarioRow({ scenario, unitLabel, isRecommended, icon, colorClass, textClass, badgeClass }: ScenarioRowProps) {
  const amount = scenario.gramsPerDay ?? scenario.unitsPerDay;
  const hasAmount = amount !== null;

  return (
    <div className={`rounded-xl border p-4 ${colorClass} ${isRecommended ? 'ring-2 ring-teal-400' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className={`font-semibold text-sm ${textClass}`}>{scenario.label}</span>
          {isRecommended && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${badgeClass}`}>Recommended</span>
          )}
        </div>
        <div className="text-right">
          <div className={`text-lg font-extrabold ${textClass}`}>
            {Math.round(scenario.kcalPerDay)} <span className="text-xs font-semibold">kcal/day</span>
          </div>
          {hasAmount && (
            <div className={`text-sm font-bold ${textClass}`}>
              {scenario.gramsPerDay !== null
                ? `${Math.round(scenario.gramsPerDay)}g/day`
                : `${(amount as number).toFixed(2)} ${unitLabel}`}
            </div>
          )}
        </div>
      </div>
      <p className={`text-xs leading-relaxed ${textClass} opacity-80`}>{scenario.description}</p>
    </div>
  );
}

export default function FeedingCalculator({ result, food }: FeedingCalculatorProps) {
  const bcsNum = Number(food.bodyConditionScore);
  const bcsColorClass = BCS_COLOR[result.bcsStatus];
  const weightLbs = food.petWeightUnit === 'lbs' ? Number(food.petWeight) : Number(food.petWeight) * 2.205;
  const idealLbs = result.idealWeightLbs;
  const weightDiffLbs = Math.abs(weightLbs - idealLbs);
  const isIdeal = result.bcsStatus === 'ideal';
  const isUnderweight = result.bcsStatus === 'very-thin' || result.bcsStatus === 'underweight';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-4">
        <div className="flex items-center gap-2 mb-0.5">
          <Scale className="w-5 h-5 text-teal-100" />
          <h3 className="font-bold text-white text-base">Feeding Calculator</h3>
        </div>
        <p className="text-teal-100 text-xs">Based on RER formula (70 × weight_kg^0.75) × life stage multiplier</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Weight & BCS summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs font-semibold text-gray-500 mb-1">Current Weight</div>
            <div className="text-lg font-extrabold text-gray-900">{weightLbs.toFixed(1)} lbs</div>
            <div className="text-xs text-gray-500">{result.currentWeightKg.toFixed(1)} kg</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs font-semibold text-gray-500 mb-1">Estimated Ideal Weight</div>
            <div className={`text-lg font-extrabold ${isIdeal ? 'text-green-700' : 'text-teal-700'}`}>
              {idealLbs.toFixed(1)} lbs
            </div>
            <div className="text-xs text-gray-500">{result.idealWeightKg.toFixed(1)} kg</div>
          </div>
        </div>

        {/* BCS status */}
        <div className={`rounded-xl border p-3 ${bcsColorClass}`}>
          <div className="flex items-start gap-2">
            {result.bcsStatus === 'ideal' ? (
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-sm">BCS {bcsNum}/9 — {result.bcsStatus === 'ideal' ? 'Ideal Body Condition' : result.bcsStatus === 'very-thin' || result.bcsStatus === 'underweight' ? 'Underweight' : 'Overweight'}</div>
              <p className="text-xs mt-0.5 leading-relaxed opacity-90">{result.bcsMessage}</p>
              {!isIdeal && (
                <p className="text-xs mt-1 font-medium">
                  {isUnderweight
                    ? `Goal: gain approx. ${weightDiffLbs.toFixed(1)} lbs to reach ideal weight`
                    : `Goal: lose approx. ${weightDiffLbs.toFixed(1)} lbs to reach ideal weight`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Calorie baseline */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-xs text-gray-500 font-medium mb-0.5">RER (current)</div>
            <div className="text-base font-extrabold text-gray-800">{result.rerCurrentKcal}</div>
            <div className="text-xs text-gray-400">kcal/day</div>
          </div>
          <div className="bg-teal-50 rounded-xl p-3">
            <div className="text-xs text-teal-700 font-medium mb-0.5">RER (ideal wt)</div>
            <div className="text-base font-extrabold text-teal-800">{result.rerIdealKcal}</div>
            <div className="text-xs text-teal-600">kcal/day</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-xs text-gray-500 font-medium mb-0.5">Maintenance</div>
            <div className="text-base font-extrabold text-gray-800">{result.merMaintenanceKcal}</div>
            <div className="text-xs text-gray-400">kcal/day</div>
          </div>
        </div>

        {!result.hasCalorieData && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Enter <strong>kcal/kg</strong> (in the feeding calculator section) or <strong>Calories per cup/can</strong> above to also see daily portion amounts (grams, cups, or cans per day).
            </p>
          </div>
        )}

        {/* Feeding scenarios */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Daily Feeding Ranges
            {result.hasCalorieData && <span className="ml-1 normal-case font-normal">— kcal/day and {result.unitLabel}</span>}
          </div>
          <div className="space-y-3">
            <ScenarioRow
              scenario={result.scenarios.aggressiveWeightLoss}
              unitLabel={result.unitLabel}
              icon={<TrendingDown className="w-4 h-4 text-red-500" />}
              colorClass="bg-red-50 border-red-200"
              textClass="text-red-700"
              badgeClass="bg-red-600 text-white"
            />
            <ScenarioRow
              scenario={result.scenarios.moderateWeightLoss}
              unitLabel={result.unitLabel}
              icon={<TrendingDown className="w-4 h-4 text-orange-500" />}
              colorClass="bg-orange-50 border-orange-200"
              textClass="text-orange-700"
              badgeClass="bg-orange-600 text-white"
              isRecommended={result.bcsStatus === 'overweight' || result.bcsStatus === 'obese'}
            />
            <ScenarioRow
              scenario={result.scenarios.maintenance}
              unitLabel={result.unitLabel}
              icon={<Minus className="w-4 h-4 text-teal-600" />}
              colorClass="bg-teal-50 border-teal-200"
              textClass="text-teal-700"
              badgeClass="bg-teal-600 text-white"
              isRecommended={result.bcsStatus === 'ideal'}
            />
            <ScenarioRow
              scenario={result.scenarios.moderateWeightGain}
              unitLabel={result.unitLabel}
              icon={<TrendingUp className="w-4 h-4 text-blue-500" />}
              colorClass="bg-blue-50 border-blue-200"
              textClass="text-blue-700"
              badgeClass="bg-blue-600 text-white"
              isRecommended={result.bcsStatus === 'underweight'}
            />
            <ScenarioRow
              scenario={result.scenarios.aggressiveWeightGain}
              unitLabel={result.unitLabel}
              icon={<TrendingUp className="w-4 h-4 text-purple-500" />}
              colorClass="bg-purple-50 border-purple-200"
              textClass="text-purple-700"
              badgeClass="bg-purple-600 text-white"
              isRecommended={result.bcsStatus === 'very-thin'}
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>These are estimates only.</strong> Individual metabolic rates vary significantly. Always start at the calculated amount and adjust based on weight checks every 2–4 weeks. Pets with medical conditions or rapid weight changes should be managed with your veterinarian.
          </p>
        </div>
      </div>
    </div>
  );
}
