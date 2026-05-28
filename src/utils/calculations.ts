import type { DMBResult, FoodType, FeedingResult, FeedingScenario, BcsStatus, FoodInput } from '../types';

interface CalcInput {
  moisture: number;
  protein: number;
  fat: number;
  fiber: number;
  ash?: number;
  carbs?: number;
  foodType?: FoodType;
}

const DEFAULT_ASH: Record<string, number> = {
  dry: 7,
  canned: 2.5,
  'semi-moist': 4,
  treat: 5,
  'home-cooked': 2,
};

export function calculateDryMatterBasis(input: CalcInput): DMBResult {
  const { moisture, protein, fat, fiber, foodType = 'canned' } = input;
  const warnings: string[] = [];
  const errors: string[] = [];

  if (moisture < 0 || moisture >= 100) {
    errors.push('Moisture must be between 0% and 99%.');
  }
  if (moisture === 100) {
    errors.push('Moisture cannot be 100% — there would be no dry matter.');
  }

  if (protein < 0) errors.push('Protein cannot be negative.');
  if (fat < 0) errors.push('Fat cannot be negative.');
  if (fiber < 0) errors.push('Fiber cannot be negative.');

  let ashEstimated = false;
  let ash = input.ash;
  if (ash === undefined || ash === null || isNaN(ash as number)) {
    ash = DEFAULT_ASH[foodType] ?? 2.5;
    ashEstimated = true;
  }

  let carbsCalculated = false;
  let carbsAsFed = input.carbs ?? NaN;
  if (isNaN(carbsAsFed) || carbsAsFed < 0) {
    carbsAsFed = Math.max(0, 100 - protein - fat - fiber - moisture - ash);
    carbsCalculated = true;
  }

  const total = protein + fat + fiber + moisture + ash + (carbsCalculated ? 0 : carbsAsFed);
  if (!carbsCalculated && total > 100.5) {
    warnings.push(`The entered values add up to ${total.toFixed(1)}%, which exceeds 100%. Check your label values.`);
  }

  if (moisture > 90) warnings.push('Moisture above 90% is unusually high for commercial pet food.');
  if (protein > 60) warnings.push('Protein above 60% as-fed is unusually high — double-check the label.');
  if (fat > 40) warnings.push('Fat above 40% as-fed is unusually high — double-check the label.');

  if (errors.length > 0) {
    return {
      dryMatterPercent: 0,
      proteinDMB: 0,
      fatDMB: 0,
      fiberDMB: 0,
      ashDMB: null,
      carbsAsFed: 0,
      carbsDMB: 0,
      ashEstimated,
      carbsCalculated,
      warnings,
      errors,
    };
  }

  const dryMatterPercent = 100 - moisture;
  const toDMB = (asFed: number) => (asFed / dryMatterPercent) * 100;

  return {
    dryMatterPercent,
    proteinDMB: toDMB(protein),
    fatDMB: toDMB(fat),
    fiberDMB: toDMB(fiber),
    ashDMB: toDMB(ash),
    carbsAsFed,
    carbsDMB: toDMB(carbsAsFed),
    ashEstimated,
    carbsCalculated,
    warnings,
    errors,
  };
}

// RER: Resting Energy Requirement (kcal/day) at a given weight in kg
function rer(weightKg: number): number {
  return 70 * Math.pow(weightKg, 0.75);
}

// Estimate ideal weight from current weight and BCS (1-9 scale)
// BCS 5 = ideal. Each point above 5 ≈ 10% overweight; each below ≈ 10% underweight.
function idealWeightKg(currentKg: number, bcs: number): number {
  if (bcs === 5) return currentKg;
  const deviation = (bcs - 5) * 0.1;
  return currentKg / (1 + deviation);
}

// MER multiplier based on species, neuter status, life stage, activity
function merMultiplier(
  species: 'dog' | 'cat',
  isNeutered: boolean,
  lifeStage: string,
  activityLevel: string
): number {
  if (lifeStage === 'puppy-kitten') {
    return species === 'dog' ? 2.5 : 2.0;
  }
  if (lifeStage === 'senior') {
    return species === 'dog' ? 1.3 : 1.1;
  }
  // Adult
  if (species === 'cat') {
    if (!isNeutered) return 1.4;
    if (activityLevel === 'low') return 1.0;
    if (activityLevel === 'high') return 1.4;
    return 1.2; // moderate
  }
  // Dog
  if (!isNeutered) {
    if (activityLevel === 'low') return 1.6;
    if (activityLevel === 'high') return 2.0;
    return 1.8;
  }
  if (activityLevel === 'low') return 1.4;
  if (activityLevel === 'high') return 1.8;
  return 1.6;
}

function bcsStatusAndMessage(bcs: number): { status: BcsStatus; message: string } {
  if (bcs <= 2) return { status: 'very-thin', message: 'Very thin — ribs, spine, and hip bones are very prominent. Veterinary evaluation recommended.' };
  if (bcs <= 4) return { status: 'underweight', message: 'Underweight — ribs easily felt with no fat cover. May benefit from increased caloric intake.' };
  if (bcs === 5) return { status: 'ideal', message: 'Ideal body condition — ribs easily felt with a small amount of fat cover. Waist visible from above.' };
  if (bcs <= 6) return { status: 'overweight', message: 'Slightly overweight — ribs palpable with slight excess fat. Waist is discernible but not prominent.' };
  if (bcs <= 7) return { status: 'overweight', message: 'Overweight — ribs palpable with difficulty. Fat deposits over lumbar area. Waist barely visible.' };
  return { status: 'obese', message: 'Obese — ribs difficult or impossible to feel under heavy fat cover. Fat deposits on neck, limbs, and spine. Veterinary weight management plan recommended.' };
}

function makeScenario(
  label: string,
  description: string,
  kcalPerDay: number,
  kcalPerKg: number | null,
  calories: number | null,
  _caloriesUnit: string
): FeedingScenario {
  let gramsPerDay: number | null = null;
  let unitsPerDay: number | null = null;

  if (kcalPerKg && kcalPerKg > 0) {
    gramsPerDay = (kcalPerDay / kcalPerKg) * 1000;
  } else if (calories && calories > 0) {
    unitsPerDay = kcalPerDay / calories;
  }

  return { label, description, kcalPerDay: Math.round(kcalPerDay), gramsPerDay, unitsPerDay };
}

export function calculateFeeding(food: FoodInput): FeedingResult | null {
  const weightRaw = food.petWeight;
  const bcsRaw = food.bodyConditionScore;
  if (weightRaw === '' || bcsRaw === '') return null;

  const weight = Number(weightRaw);
  const bcs = Number(bcsRaw);
  if (isNaN(weight) || isNaN(bcs) || weight <= 0 || bcs < 1 || bcs > 9) return null;

  const weightKg = food.petWeightUnit === 'kg' ? weight : weight / 2.205;
  const idealKg = idealWeightKg(weightKg, bcs);
  const idealLbs = idealKg * 2.205;

  const rerCurrent = rer(weightKg);
  const rerIdeal = rer(idealKg);

  const multiplier = merMultiplier(
    food.species,
    food.isNeutered,
    food.lifeStage,
    food.activityLevel
  );

  const merMaintenance = rerIdeal * multiplier;
  const { status: bcsStatus, message: bcsMessage } = bcsStatusAndMessage(bcs);

  // Calorie data from food
  const kcalPerKg = food.kcalPerKg !== '' ? Number(food.kcalPerKg) : null;
  const calories = food.calories !== '' ? Number(food.calories) : null;
  const caloriesUnit = food.caloriesUnit;
  const hasCalorieData = (kcalPerKg !== null && kcalPerKg > 0) || (calories !== null && calories > 0);

  // Unit label for display
  let unitLabel = 'grams/day';
  if (!kcalPerKg && calories) {
    if (caloriesUnit === 'kcal/cup') unitLabel = 'cups/day';
    else if (caloriesUnit === 'kcal/can') unitLabel = 'cans/day';
    else unitLabel = 'grams/day';
  }

  const scenarios = {
    aggressiveWeightLoss: makeScenario(
      'Active Weight Loss',
      `Feed at ~70% of maintenance (${food.species === 'cat' ? 'RER at ideal weight' : '70% of MER at ideal weight'}). Best for significantly overweight pets under veterinary supervision.`,
      rerIdeal * 0.7,
      kcalPerKg, calories, caloriesUnit
    ),
    moderateWeightLoss: makeScenario(
      'Moderate Weight Loss',
      'Feed at ~80% of maintenance. Gentle, sustainable weight loss while preserving lean muscle mass.',
      rerIdeal * multiplier * 0.8,
      kcalPerKg, calories, caloriesUnit
    ),
    maintenance: makeScenario(
      'Maintenance',
      `Maintain current ideal weight. Calculated from RER × ${multiplier.toFixed(1)} (life stage & activity multiplier).`,
      merMaintenance,
      kcalPerKg, calories, caloriesUnit
    ),
    moderateWeightGain: makeScenario(
      'Moderate Weight Gain',
      'Feed at ~120% of maintenance. Gradual weight gain for underweight pets.',
      merMaintenance * 1.2,
      kcalPerKg, calories, caloriesUnit
    ),
    aggressiveWeightGain: makeScenario(
      'Active Weight Gain',
      'Feed at ~150% of maintenance. For very underweight pets; monitor closely and consult your veterinarian.',
      merMaintenance * 1.5,
      kcalPerKg, calories, caloriesUnit
    ),
  };

  return {
    currentWeightKg: weightKg,
    idealWeightKg: idealKg,
    idealWeightLbs: idealLbs,
    bcsStatus,
    bcsMessage,
    rerCurrentKcal: Math.round(rerCurrent),
    rerIdealKcal: Math.round(rerIdeal),
    merMaintenanceKcal: Math.round(merMaintenance),
    scenarios,
    unitLabel,
    hasCalorieData,
  };
}

export function round1(n: number): string {
  return n.toFixed(1);
}

export function getDefaultAsh(foodType: FoodType): number {
  return DEFAULT_ASH[foodType] ?? 2.5;
}
