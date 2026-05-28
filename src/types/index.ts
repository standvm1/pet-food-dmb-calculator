export type Species = 'dog' | 'cat';
export type FoodType = 'dry' | 'canned' | 'semi-moist' | 'treat' | 'home-cooked';
export type CaloriesUnit = 'kcal/can' | 'kcal/cup' | 'kcal/kg';
export type DietGoal =
  | 'weight-loss'
  | 'low-fat'
  | 'kidney-support'
  | 'urinary-support'
  | 'diabetic-support'
  | 'sensitive-stomach'
  | 'general-maintenance'
  | 'puppy-kitten'
  | 'senior';

export type ActivityLevel = 'low' | 'moderate' | 'high';
export type LifeStage = 'adult' | 'senior' | 'puppy-kitten';
export type WeightUnit = 'lbs' | 'kg';

export interface FoodInput {
  name: string;
  moisture: number | '';
  protein: number | '';
  fat: number | '';
  fiber: number | '';
  ash: number | '';
  carbs: number | '';
  calories: number | '';
  caloriesUnit: CaloriesUnit;
  foodType: FoodType;
  species: Species;
  dietGoal: DietGoal | '';
  // Mineral nutrients
  phosphorus: number | '';
  sodium: number | '';
  calcium: number | '';
  omega3: number | '';
  // Caloric density (from label)
  kcalPerKg: number | '';
  // Pet profile for feeding calculator
  petWeight: number | '';
  petWeightUnit: WeightUnit;
  targetWeight: number | '';
  bodyConditionScore: number | '';
  isNeutered: boolean;
  activityLevel: ActivityLevel;
  lifeStage: LifeStage;
  // Legacy / informational
  dailyFeedingAmount: number | '';
}

export interface DMBResult {
  dryMatterPercent: number;
  proteinDMB: number;
  fatDMB: number;
  fiberDMB: number;
  ashDMB: number | null;
  carbsAsFed: number;
  carbsDMB: number;
  ashEstimated: boolean;
  carbsCalculated: boolean;
  warnings: string[];
  errors: string[];
}

export type BcsStatus = 'very-thin' | 'underweight' | 'ideal' | 'overweight' | 'obese';

export interface FeedingScenario {
  label: string;
  description: string;
  kcalPerDay: number;
  gramsPerDay: number | null;
  unitsPerDay: number | null;
}

export interface FeedingResult {
  currentWeightKg: number;
  idealWeightKg: number;
  idealWeightLbs: number;
  bcsStatus: BcsStatus;
  bcsMessage: string;
  rerCurrentKcal: number;
  rerIdealKcal: number;
  merMaintenanceKcal: number;
  scenarios: {
    aggressiveWeightLoss: FeedingScenario;
    moderateWeightLoss: FeedingScenario;
    maintenance: FeedingScenario;
    moderateWeightGain: FeedingScenario;
    aggressiveWeightGain: FeedingScenario;
  };
  unitLabel: string;
  hasCalorieData: boolean;
}

export interface FoodItem {
  id: string;
  brand: string;
  productName: string;
  species: Species | 'both';
  foodType: Exclude<FoodType, 'home-cooked'>;
  proteinDMB: number;
  fatDMB: number;
  fiberDMB: number;
  moisture: number;
  kcalPerKg: number;
  dietTags: string[];
  purchaseUrl: string;
  affiliateUrl: string;
  sponsored: boolean;
  isPrescription: boolean;
  description?: string;
}

export interface ComparisonState {
  foodA: FoodInput;
  foodB: FoodInput;
  resultA: DMBResult | null;
  resultB: DMBResult | null;
}
