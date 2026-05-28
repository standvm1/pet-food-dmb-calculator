import { ArrowRight, Lightbulb } from 'lucide-react';

const examples = [
  {
    label: 'Dry Kibble',
    color: 'bg-amber-50 border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-700',
    protein: 25,
    moisture: 10,
    dmb: 27.8,
    icon: '🥣',
  },
  {
    label: 'Canned / Wet Food',
    color: 'bg-teal-50 border-teal-200',
    badgeColor: 'bg-teal-100 text-teal-700',
    protein: 10,
    moisture: 78,
    dmb: 45.5,
    icon: '🥫',
  },
];

export default function FoodComparisonExample() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start gap-2 mb-5">
        <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-gray-900 text-base">Why labels can be misleading</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Wet food contains much more water than dry food. Dry Matter Basis (DMB) removes water so you can compare
            foods fairly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {examples.map((ex, i) => (
          <div key={i} className={`rounded-xl border p-4 ${ex.color}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg">{ex.icon}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ex.badgeColor}`}>{ex.label}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Moisture</span>
                <span className="font-semibold text-gray-900">{ex.moisture}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Label protein</span>
                <span className="font-semibold text-gray-900">{ex.protein}%</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
                <span className="text-gray-700 font-medium">Protein (DMB)</span>
                <span className="font-bold text-teal-700 text-base">{ex.dmb}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          The canned food's label <span className="font-semibold">looks lower</span> in protein (10% vs 25%), but on a
          dry matter basis it actually has <span className="font-semibold">more protein</span> (45.5% vs 27.8%).
        </p>
      </div>
    </div>
  );
}
