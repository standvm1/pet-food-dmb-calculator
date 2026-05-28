import { Info } from 'lucide-react';
import type { DietGoal } from '../types';
import type { DMBResult } from '../types';
import { round1 } from '../utils/calculations';

interface DietGoalInfoProps {
  goal: DietGoal;
  result: DMBResult;
}

const goalData: Record<DietGoal, { title: string; color: string; borderColor: string; textColor: string; body: string; highlight?: (r: DMBResult) => string }> = {
  'low-fat': {
    title: 'Low Fat Diet',
    color: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    body: 'Low-fat diets are often considered for dogs with pancreatitis, hyperlipidemia, lymphangiectasia, or certain GI conditions. Fat content below 10% DMB is commonly used as a low-fat target, though specific thresholds vary by condition and individual patient. The correct diet should always be selected with your veterinarian.',
    highlight: r => `This food is ${round1(r.fatDMB)}% fat on a dry matter basis.`,
  },
  'kidney-support': {
    title: 'Kidney Support Diet',
    color: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    body: 'Kidney (renal) diets consider much more than protein alone — phosphorus restriction, sodium levels, caloric density, hydration, and protein quality all matter. Phosphorus is usually not listed on standard pet food labels. Because of this complexity, kidney diets should always be selected and monitored by a veterinarian.',
    highlight: r => `This food is ${round1(r.proteinDMB)}% protein on a dry matter basis.`,
  },
  'urinary-support': {
    title: 'Urinary Support Diet',
    color: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    body: 'Urinary diets are tailored to the type of crystals or stones present (struvite, calcium oxalate, urate, etc.). Key factors include urine pH, mineral levels (magnesium, phosphorus, calcium), water intake, and individual patient history. A single urinary food is not appropriate for all patients — always consult your veterinarian.',
    highlight: r => `This food is ${round1(r.proteinDMB)}% protein and ${round1(r.fatDMB)}% fat on a dry matter basis.`,
  },
  'diabetic-support': {
    title: 'Diabetic Support Diet',
    color: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-800',
    body: 'Diabetic diet management involves caloric control, fiber content, carbohydrate levels, protein, and coordination with insulin dosing or other medications. Cats and dogs have different nutritional targets for diabetes. Body condition score, activity level, and concurrent conditions all influence dietary choices. Work closely with your veterinarian.',
    highlight: r => `This food is ${round1(r.carbsDMB)}% carbohydrates and ${round1(r.fiberDMB)}% fiber on a dry matter basis.`,
  },
  'weight-loss': {
    title: 'Weight Loss Diet',
    color: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    body: 'Weight management diets focus on caloric restriction while maintaining adequate protein and nutrients to preserve lean muscle mass. The right caloric target depends on your pet\'s current weight, body condition score, activity level, and target weight. Consult your veterinarian before starting a weight loss program.',
    highlight: r => `This food is ${round1(r.proteinDMB)}% protein and ${round1(r.fatDMB)}% fat on a dry matter basis.`,
  },
  'sensitive-stomach': {
    title: 'Sensitive Stomach / GI Health',
    color: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    body: 'Diets for GI sensitivities often feature highly digestible ingredients, limited ingredient lists to reduce allergic triggers, or specific fiber levels to support gut health. The cause of GI signs (infection, allergy, IBD, etc.) affects which diet is most appropriate. A veterinary workup helps identify the right approach.',
    highlight: r => `This food is ${round1(r.fiberDMB)}% fiber on a dry matter basis.`,
  },
  'general-maintenance': {
    title: 'General Adult Maintenance',
    color: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-800',
    body: 'For healthy adult pets without specific medical needs, AAFCO-complete and balanced diets are appropriate. Key metrics include adequate protein, moderate fat, and appropriate caloric density for your pet\'s size and activity level. Annual wellness exams help ensure the diet continues to meet your pet\'s needs.',
    highlight: r => `This food is ${round1(r.proteinDMB)}% protein and ${round1(r.fatDMB)}% fat on a dry matter basis.`,
  },
  'puppy-kitten': {
    title: 'Puppy / Kitten Growth',
    color: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    body: 'Growing animals have higher requirements for protein, calcium, phosphorus, and calories than adults. Large-breed puppies have specific calcium-to-phosphorus ratio needs to support proper skeletal development. Look for foods labeled "AAFCO complete for growth" or "all life stages." Your veterinarian can recommend appropriate products.',
    highlight: r => `This food is ${round1(r.proteinDMB)}% protein on a dry matter basis.`,
  },
  'senior': {
    title: 'Senior Pet Diet',
    color: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-800',
    body: 'Senior pets often benefit from higher-quality, easily digestible protein, adjusted caloric density, and support for joint, cognitive, or organ health. Nutritional needs vary greatly between senior pets depending on body condition and any concurrent diseases. Regular bloodwork and veterinary guidance are important.',
    highlight: r => `This food is ${round1(r.proteinDMB)}% protein on a dry matter basis.`,
  },
};

export default function DietGoalInfo({ goal, result }: DietGoalInfoProps) {
  const data = goalData[goal];
  if (!data) return null;

  return (
    <div className={`rounded-2xl border p-5 ${data.color} ${data.borderColor}`}>
      <div className="flex items-start gap-2 mb-3">
        <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${data.textColor}`} />
        <h3 className={`font-bold text-sm ${data.textColor}`}>{data.title} — Educational Guide</h3>
      </div>

      {data.highlight && (
        <div className={`font-semibold text-sm mb-3 ${data.textColor}`}>{data.highlight(result)}</div>
      )}

      <p className={`text-sm leading-relaxed ${data.textColor} opacity-90`}>{data.body}</p>

      <p className={`text-xs mt-3 font-medium ${data.textColor} opacity-70`}>
        Always consult your veterinarian before changing your pet's diet, especially for medical conditions.
      </p>
    </div>
  );
}
