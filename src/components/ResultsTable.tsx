import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import type { DMBResult, FoodInput } from '../types';
import { round1, calculateFeeding } from '../utils/calculations';
import DietGoalInfo from './DietGoalInfo';
import type { DietGoal } from '../types';
import PdfReportButton from './PdfReportButton';
import FeedingCalculator from './FeedingCalculator';

interface ResultsTableProps {
  result: DMBResult;
  food: FoodInput;
  label?: string;
}

interface Row {
  nutrient: string;
  asFed: string;
  dmb: string;
  note?: string;
  highlight?: boolean;
}

export default function ResultsTable({ result, food, label = 'Results' }: ResultsTableProps) {
  const feedingResult = calculateFeeding(food);

  const rows: Row[] = [
    {
      nutrient: 'Dry Matter',
      asFed: '—',
      dmb: `${round1(result.dryMatterPercent)}%`,
      note: `100% − ${food.moisture}% moisture`,
    },
    {
      nutrient: 'Crude Protein',
      asFed: `${food.protein}%`,
      dmb: `${round1(result.proteinDMB)}%`,
      highlight: food.dietGoal === 'kidney-support' || food.dietGoal === 'general-maintenance' || food.dietGoal === 'puppy-kitten' || food.dietGoal === 'senior',
    },
    {
      nutrient: 'Crude Fat',
      asFed: `${food.fat}%`,
      dmb: `${round1(result.fatDMB)}%`,
      highlight: food.dietGoal === 'low-fat' || food.dietGoal === 'weight-loss',
    },
    {
      nutrient: 'Crude Fiber',
      asFed: `${food.fiber}%`,
      dmb: `${round1(result.fiberDMB)}%`,
      highlight: food.dietGoal === 'diabetic-support' || food.dietGoal === 'sensitive-stomach',
    },
    {
      nutrient: result.ashEstimated ? 'Ash (estimated)' : 'Ash',
      asFed: result.ashEstimated ? `~${food.foodType === 'canned' ? '2.5' : '7'}%` : `${food.ash}%`,
      dmb: result.ashDMB !== null ? `${round1(result.ashDMB)}%` : '—',
      note: result.ashEstimated ? 'Default estimate used' : undefined,
    },
    {
      nutrient: result.carbsCalculated ? 'Carbohydrates (est.)' : 'Carbohydrates',
      asFed: `${round1(result.carbsAsFed)}%`,
      dmb: `${round1(result.carbsDMB)}%`,
      note: result.carbsCalculated ? 'Calculated by NFE method' : undefined,
      highlight: food.dietGoal === 'diabetic-support',
    },
  ];

  const getMoistureMessage = () => {
    const m = Number(food.moisture);
    if (m >= 70) {
      return `Because this food has high moisture (${m}%), the label protein may look low, but the dry matter protein is actually ${round1(result.proteinDMB)}% — which may be higher than many dry foods.`;
    }
    return null;
  };

  const moistureMsg = getMoistureMessage();

  return (
    <div className="space-y-5">
      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
          {result.errors.map((e, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{e}</span>
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
          {result.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-amber-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-gray-900">{label}</h3>
          </div>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
            Moisture: {food.moisture}%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nutrient</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Label Value</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-teal-600 uppercase tracking-wider">Dry Matter Basis</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-t border-gray-50 ${row.highlight ? 'bg-teal-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                >
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {row.nutrient}
                    {row.note && (
                      <span className="ml-2 text-xs text-gray-400 font-normal">({row.note})</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">{row.asFed}</td>
                  <td className={`px-5 py-3 text-right font-bold ${row.highlight ? 'text-teal-700' : 'text-gray-900'}`}>
                    {row.dmb}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moisture insight */}
      {moistureMsg && (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">{moistureMsg}</p>
        </div>
      )}

      {/* Interpretation */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Interpretation</div>
        <p className="text-sm text-gray-700">
          This food is approximately <span className="font-semibold text-teal-700">{round1(result.proteinDMB)}% protein</span> on a dry matter basis.
        </p>
        <p className="text-sm text-gray-700">
          This food is approximately <span className="font-semibold text-teal-700">{round1(result.fatDMB)}% fat</span> on a dry matter basis.
        </p>
        {result.carbsDMB > 30 && (
          <p className="text-sm text-gray-700">
            This food has a relatively <span className="font-semibold">higher carbohydrate content</span> ({round1(result.carbsDMB)}% DMB).
          </p>
        )}
        <p className="text-xs text-gray-400 pt-1 italic">
          For medical diets — kidney disease, pancreatitis, urinary disease, diabetes, or food allergy — consult your veterinarian before changing diets.
        </p>
      </div>

      {/* Diet goal info */}
      {food.dietGoal && result.errors.length === 0 && (
        <DietGoalInfo goal={food.dietGoal as DietGoal} result={result} />
      )}

      {/* Feeding calculator */}
      {feedingResult && result.errors.length === 0 && (
        <FeedingCalculator result={feedingResult} food={food} />
      )}

      {/* Prompt to fill in pet profile if not shown */}
      {!feedingResult && result.errors.length === 0 && (
        <div className="flex items-start gap-2 bg-teal-50 border border-teal-100 rounded-xl p-4">
          <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-teal-700">
            <strong>Want feeding recommendations?</strong> Open the <em>Pet Profile &amp; Feeding Calculator</em> section in the form above, enter your pet's weight and body condition score to get personalized daily portion suggestions.
          </p>
        </div>
      )}

      {/* PDF download */}
      {result.errors.length === 0 && (
        <PdfReportButton food={food} result={result} label={label} feedingResult={feedingResult} />
      )}
    </div>
  );
}
