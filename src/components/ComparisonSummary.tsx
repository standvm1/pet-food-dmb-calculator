import { Trophy, ArrowRight } from 'lucide-react';
import type { DMBResult, FoodInput } from '../types';
import { round1 } from '../utils/calculations';

interface ComparisonSummaryProps {
  foodA: FoodInput;
  foodB: FoodInput;
  resultA: DMBResult;
  resultB: DMBResult;
}

interface WinnerBadgeProps {
  winner: 'A' | 'B' | 'tie';
  nameA: string;
  nameB: string;
}

function WinnerBadge({ winner, nameA, nameB }: WinnerBadgeProps) {
  if (winner === 'tie') return <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Tied</span>;
  const name = winner === 'A' ? (nameA || 'Food A') : (nameB || 'Food B');
  return (
    <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full flex items-center gap-1">
      <Trophy className="w-3 h-3" /> {name}
    </span>
  );
}

interface MetricRowProps {
  label: string;
  valueA: number;
  valueB: number;
  unit?: string;
  higherIsBetter: boolean;
  nameA: string;
  nameB: string;
}

function MetricRow({ label, valueA, valueB, unit = '%', higherIsBetter, nameA, nameB }: MetricRowProps) {
  const diff = Math.abs(valueA - valueB);
  const aWins = higherIsBetter ? valueA > valueB : valueA < valueB;
  const bWins = higherIsBetter ? valueB > valueA : valueB < valueA;
  const winner: 'A' | 'B' | 'tie' = diff < 0.1 ? 'tie' : aWins ? 'A' : bWins ? 'B' : 'tie';

  const barMax = Math.max(valueA, valueB) * 1.15;
  const barA = (valueA / barMax) * 100;
  const barB = (valueB / barMax) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <WinnerBadge winner={winner} nameA={nameA} nameB={nameB} />
      </div>
      {/* Bar A */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold w-12 text-right text-teal-700">{nameA || 'Food A'}</span>
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${winner === 'A' ? 'bg-teal-500' : 'bg-gray-300'}`}
            style={{ width: `${barA}%` }}
          />
        </div>
        <span className="text-xs font-bold w-16 text-gray-700">{round1(valueA)}{unit} DMB</span>
      </div>
      {/* Bar B */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold w-12 text-right text-indigo-700">{nameB || 'Food B'}</span>
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${winner === 'B' ? 'bg-indigo-500' : 'bg-gray-300'}`}
            style={{ width: `${barB}%` }}
          />
        </div>
        <span className="text-xs font-bold w-16 text-gray-700">{round1(valueB)}{unit} DMB</span>
      </div>
    </div>
  );
}

export default function ComparisonSummary({ foodA, foodB, resultA, resultB }: ComparisonSummaryProps) {
  const nameA = foodA.name || 'Food A';
  const nameB = foodB.name || 'Food B';

  // Determine overall winner by counting metric wins
  const metrics = [
    { valueA: resultA.proteinDMB, valueB: resultB.proteinDMB, higherIsBetter: true },
    { valueA: resultA.fatDMB, valueB: resultB.fatDMB, higherIsBetter: false },
    { valueA: resultA.carbsDMB, valueB: resultB.carbsDMB, higherIsBetter: false },
  ];
  let aWins = 0;
  let bWins = 0;
  metrics.forEach(({ valueA, valueB, higherIsBetter }) => {
    const diff = Math.abs(valueA - valueB);
    if (diff < 0.1) return;
    if (higherIsBetter ? valueA > valueB : valueA < valueB) aWins++;
    else bWins++;
  });

  const overallWinner = aWins > bWins ? nameA : bWins > aWins ? nameB : null;

  // Calorie comparison
  const hasKcalA = foodA.kcalPerKg !== '' && Number(foodA.kcalPerKg) > 0;
  const hasKcalB = foodB.kcalPerKg !== '' && Number(foodB.kcalPerKg) > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-teal-600 px-5 py-4">
        <div className="flex items-center gap-2 mb-0.5">
          <ArrowRight className="w-5 h-5 text-white opacity-80" />
          <h3 className="font-bold text-white text-base">Comparison Summary</h3>
        </div>
        {overallWinner ? (
          <p className="text-indigo-100 text-xs">
            <span className="font-bold text-white">{overallWinner}</span> wins more nutrient categories on a dry matter basis.
          </p>
        ) : (
          <p className="text-indigo-100 text-xs">These foods are nutritionally similar on a dry matter basis.</p>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Side-by-side label */}
        <div className="flex items-center justify-around text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-teal-500" />
            <span className="text-sm font-bold text-teal-700">{nameA}</span>
            <span className="text-xs text-gray-400">{foodA.foodType} · {round1(resultA.dryMatterPercent)}% DM</span>
          </div>
          <span className="text-gray-300 text-lg font-light">vs</span>
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-sm font-bold text-indigo-700">{nameB}</span>
            <span className="text-xs text-gray-400">{foodB.foodType} · {round1(resultB.dryMatterPercent)}% DM</span>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="space-y-4">
          <MetricRow
            label="Crude Protein (DMB)"
            valueA={resultA.proteinDMB}
            valueB={resultB.proteinDMB}
            higherIsBetter
            nameA={nameA}
            nameB={nameB}
          />
          <MetricRow
            label="Crude Fat (DMB)"
            valueA={resultA.fatDMB}
            valueB={resultB.fatDMB}
            higherIsBetter={false}
            nameA={nameA}
            nameB={nameB}
          />
          <MetricRow
            label="Crude Fiber (DMB)"
            valueA={resultA.fiberDMB}
            valueB={resultB.fiberDMB}
            higherIsBetter={false}
            nameA={nameA}
            nameB={nameB}
          />
          <MetricRow
            label="Carbohydrates (DMB)"
            valueA={resultA.carbsDMB}
            valueB={resultB.carbsDMB}
            higherIsBetter={false}
            nameA={nameA}
            nameB={nameB}
          />
        </div>

        {/* Calorie comparison */}
        {hasKcalA && hasKcalB && (
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Caloric Density</div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-lg font-extrabold text-teal-700">{Number(foodA.kcalPerKg).toLocaleString()}</div>
                <div className="text-xs text-gray-500">{nameA} kcal/kg</div>
              </div>
              <div className="text-gray-300">vs</div>
              <div className="text-center">
                <div className="text-lg font-extrabold text-indigo-700">{Number(foodB.kcalPerKg).toLocaleString()}</div>
                <div className="text-xs text-gray-500">{nameB} kcal/kg</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {Number(foodA.kcalPerKg) < Number(foodB.kcalPerKg)
                ? `${nameA} is ${Math.round(Number(foodB.kcalPerKg) - Number(foodA.kcalPerKg))} kcal/kg lower — useful for weight management.`
                : Number(foodB.kcalPerKg) < Number(foodA.kcalPerKg)
                ? `${nameB} is ${Math.round(Number(foodA.kcalPerKg) - Number(foodB.kcalPerKg))} kcal/kg lower — useful for weight management.`
                : 'These foods have similar caloric density.'}
            </p>
          </div>
        )}

        {/* Key takeaway */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-3">
          <p className="text-xs text-teal-800 leading-relaxed">
            <strong>Remember:</strong> Dry matter basis removes moisture so you can compare wet and dry foods fairly. A food with more protein DMB is not always "better" — the right diet depends on your pet's health, age, and medical needs. Always consult your veterinarian.
          </p>
        </div>
      </div>
    </div>
  );
}
