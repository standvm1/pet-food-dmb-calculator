// ─── Curated Diet Recommendations Database ───────────────────────────────────
// Nutrient values sourced from current product labels (as of 2025).
// Verify with manufacturer if values seem outdated — formulas do change.
// chewyPath: update to direct product path (e.g. /product-name/dp/12345)
//            once you confirm the product is still listed; search URLs always work.

export type DietGoal =
  | 'weight-loss'
  | 'weight-gain'
  | 'maintenance'
  | 'kidney'
  | 'puppy'
  | 'senior'
  | 'urinary'
  | 'low-fat';

export interface RecommendedFood {
  id: string;
  brand: string;
  name: string;
  species: 'dog' | 'cat' | 'both';
  foodType: 'dry' | 'canned';
  goals: DietGoal[];
  isRx: boolean;
  // As-fed label values (for pre-filling calculators)
  moisture: number;
  protein: number;
  fat: number;
  fiber: number;
  ash?: number;
  kcalPerKg: number;
  kcalPerCup?: number;
  kcalPerCan?: number;
  // Pre-computed dry matter basis (for display)
  proteinDMB: number;
  fatDMB: number;
  fiberDMB: number;
  // UI
  highlight: string;   // Why this food is recommended
  chewyPath: string;   // Path on chewy.com — used with chewyLink()
}

function dmb(value: number, moisture: number): number {
  return Math.round((value / (100 - moisture)) * 1000) / 10;
}

function food(
  f: Omit<RecommendedFood, 'proteinDMB' | 'fatDMB' | 'fiberDMB'>
): RecommendedFood {
  return {
    ...f,
    proteinDMB: dmb(f.protein, f.moisture),
    fatDMB: dmb(f.fat, f.moisture),
    fiberDMB: dmb(f.fiber, f.moisture),
  };
}

// ─── DOG — WEIGHT LOSS ───────────────────────────────────────────────────────

const hillsRdDog = food({
  id: 'hills-rd-dog',
  brand: "Hill's Prescription Diet",
  name: 'r/d Weight Reduction Chicken (Dog, Dry)',
  species: 'dog', foodType: 'dry',
  goals: ['weight-loss', 'low-fat'],
  isRx: true,
  moisture: 10, protein: 20.5, fat: 8.5, fiber: 5.2, ash: 4.8,
  kcalPerKg: 3003, kcalPerCup: 308,
  highlight: 'Low calorie density — reduces daily portion while keeping your dog full',
  chewyPath: '/hills-prescription-diet-rd-weight-reduction-chicken-dry-dog-food/dp/51977',
});

const royalCaninSatietyDog = food({
  id: 'rc-satiety-dog',
  brand: 'Royal Canin Veterinary Diet',
  name: 'Satiety Support (Dog, Dry)',
  species: 'dog', foodType: 'dry',
  goals: ['weight-loss'],
  isRx: true,
  moisture: 9, protein: 36.5, fat: 9.5, fiber: 16.7, ash: 7.5,
  kcalPerKg: 2800, kcalPerCup: 264,
  highlight: 'Very high fiber (17% DMB) promotes satiety and helps your dog feel full longer',
  chewyPath: '/s?query=royal+canin+satiety+support+dry+dog+food',
});

const purinaOMDog = food({
  id: 'purina-om-dog',
  brand: 'Purina Pro Plan Veterinary Diets',
  name: 'OM Overweight Management (Dog, Dry)',
  species: 'dog', foodType: 'dry',
  goals: ['weight-loss'],
  isRx: true,
  moisture: 12, protein: 32, fat: 8.5, fiber: 9,
  kcalPerKg: 2778, kcalPerCup: 233,
  highlight: 'High protein preserves muscle mass while cutting calories',
  chewyPath: '/purina-pro-plan-veterinary-diets-om-overweight-management-dry-dog-food/dp/162440',
});

const hillsPerfectWeightDog = food({
  id: 'hills-perfect-weight-dog',
  brand: "Hill's Science Diet",
  name: 'Adult Perfect Weight (Dog, Dry)',
  species: 'dog', foodType: 'dry',
  goals: ['weight-loss', 'maintenance'],
  isRx: false,
  moisture: 10, protein: 25, fat: 10.1, fiber: 6.6,
  kcalPerKg: 3366, kcalPerCup: 324,
  highlight: 'No prescription needed — great OTC choice for mildly overweight dogs (BCS 6–7)',
  chewyPath: '/hills-science-diet-adult-perfect-weight-chicken-recipe-dry-dog-food/dp/52074',
});

const purinaFocusWeightDog = food({
  id: 'purina-focus-weight-dog',
  brand: 'Purina Pro Plan',
  name: 'FOCUS Weight Management (Dog, Dry)',
  species: 'dog', foodType: 'dry',
  goals: ['weight-loss'],
  isRx: false,
  moisture: 12, protein: 30, fat: 10, fiber: 12,
  kcalPerKg: 3022, kcalPerCup: 265,
  highlight: 'High protein + high fiber with no prescription needed',
  chewyPath: '/purina-pro-plan-focus-adult-weight-management-chicken-rice-formula/dp/35938',
});

// ─── DOG — MAINTENANCE ───────────────────────────────────────────────────────

const hillsAdultDog = food({
  id: 'hills-adult-dog',
  brand: "Hill's Science Diet",
  name: 'Adult Chicken & Barley (Dog, Dry)',
  species: 'dog', foodType: 'dry',
  goals: ['maintenance'],
  isRx: false,
  moisture: 10, protein: 19.1, fat: 13.1, fiber: 2.3, ash: 5.9,
  kcalPerKg: 3728, kcalPerCup: 363,
  highlight: 'WSAVA-recommended brand with consistent formulation and quality control',
  chewyPath: '/hills-science-diet-adult-chicken-barley-recipe-dry-dog-food/dp/52058',
});

const purinaProPlanAdultDog = food({
  id: 'purina-pro-plan-adult-dog',
  brand: 'Purina Pro Plan',
  name: 'Adult Chicken & Rice (Dog, Dry)',
  species: 'dog', foodType: 'dry',
  goals: ['maintenance'],
  isRx: false,
  moisture: 12, protein: 30, fat: 17, fiber: 3,
  kcalPerKg: 3989, kcalPerCup: 402,
  highlight: 'High protein with real chicken as the #1 ingredient — supports lean muscle',
  chewyPath: '/purina-pro-plan-savor-adult-chicken-rice-formula-dry-dog-food/dp/14059',
});

// ─── DOG — WEIGHT GAIN ───────────────────────────────────────────────────────

const purinaSportDog = food({
  id: 'purina-sport-dog',
  brand: 'Purina Pro Plan',
  name: 'Sport Performance 30/20 (Dog, Dry)',
  species: 'dog', foodType: 'dry',
  goals: ['weight-gain'],
  isRx: false,
  moisture: 12, protein: 30, fat: 20, fiber: 3,
  kcalPerKg: 4296, kcalPerCup: 459,
  highlight: 'High calorie density (4300 kcal/kg) — effective for underweight dogs',
  chewyPath: '/purina-pro-plan-sport-performance-30-20-dry-dog-food/dp/14064',
});

const royalCaninRecoveryDog = food({
  id: 'rc-recovery-dog',
  brand: 'Royal Canin Veterinary Diet',
  name: 'Recovery RS Canned (Dog & Cat)',
  species: 'both', foodType: 'canned',
  goals: ['weight-gain'],
  isRx: true,
  moisture: 75, protein: 8.5, fat: 6.5, fiber: 0.3,
  kcalPerKg: 1013, kcalPerCan: 122,
  highlight: 'For severely underweight or post-surgical pets — highly palatable, easy to digest',
  chewyPath: '/s?query=royal+canin+recovery+canned+dog+cat',
});

// ─── DOG — KIDNEY ────────────────────────────────────────────────────────────

const hillsKdDog = food({
  id: 'hills-kd-dog',
  brand: "Hill's Prescription Diet",
  name: 'k/d Kidney Care Chicken (Dog, Dry)',
  species: 'dog', foodType: 'dry',
  goals: ['kidney'],
  isRx: true,
  moisture: 10, protein: 14.6, fat: 11.6, fiber: 0.7, ash: 4.3,
  kcalPerKg: 3695, kcalPerCup: 358,
  highlight: 'Low phosphorus (0.23%) and restricted protein — the clinical gold standard for CKD',
  chewyPath: '/hills-prescription-diet-kd-kidney-care-chicken-dry-dog-food/dp/51979',
});

const royalCaninRenalDog = food({
  id: 'rc-renal-dog',
  brand: 'Royal Canin Veterinary Diet',
  name: 'Renal Support F (Dog, Dry)',
  species: 'dog', foodType: 'dry',
  goals: ['kidney'],
  isRx: true,
  moisture: 8.5, protein: 25.5, fat: 13, fiber: 5.5,
  kcalPerKg: 3740, kcalPerCup: 356,
  highlight: 'Renal support formula with enhanced palatability for dogs with reduced appetite',
  chewyPath: '/s?query=royal+canin+renal+support+dry+dog+food',
});

// ─── DOG — PUPPY ─────────────────────────────────────────────────────────────

const hillsPuppyDog = food({
  id: 'hills-puppy-dog',
  brand: "Hill's Science Diet",
  name: 'Puppy Chicken & Barley (Dog, Dry)',
  species: 'dog', foodType: 'dry',
  goals: ['puppy', 'weight-gain'],
  isRx: false,
  moisture: 10, protein: 25.4, fat: 14.1, fiber: 2.2,
  kcalPerKg: 3858, kcalPerCup: 391,
  highlight: 'AAFCO growth-approved with optimized calcium:phosphorus ratio for bone development',
  chewyPath: '/hills-science-diet-puppy-chicken-barley-recipe-dry-dog-food/dp/51984',
});

const hillsPuppyLargeBreedDog = food({
  id: 'hills-puppy-large-breed-dog',
  brand: "Hill's Science Diet",
  name: 'Puppy Large Breed (Dog, Dry)',
  species: 'dog', foodType: 'dry',
  goals: ['puppy'],
  isRx: false,
  moisture: 10, protein: 25.4, fat: 12.3, fiber: 1.5,
  kcalPerKg: 3537, kcalPerCup: 342,
  highlight: 'Controlled calcium for large breeds — prevents too-rapid growth that stresses joints',
  chewyPath: '/hills-science-diet-puppy-large-breed-chicken-meal-oat-recipe-dry-dog-food/dp/51987',
});

// ─── DOG — SENIOR ────────────────────────────────────────────────────────────

const hillsSeniorDog = food({
  id: 'hills-senior-dog',
  brand: "Hill's Science Diet",
  name: 'Adult 7+ Chicken Meal & Rice (Dog, Dry)',
  species: 'dog', foodType: 'dry',
  goals: ['senior'],
  isRx: false,
  moisture: 10, protein: 23.5, fat: 12.6, fiber: 2.6,
  kcalPerKg: 3599, kcalPerCup: 351,
  highlight: 'Clinically proven to improve vitality in dogs 7+ with antioxidants and omega-3s',
  chewyPath: '/hills-science-diet-adult-7-chicken-meal-rice-recipe-dry-dog-food/dp/52055',
});

// ─── CAT — WEIGHT LOSS ───────────────────────────────────────────────────────

const hillsRdCat = food({
  id: 'hills-rd-cat',
  brand: "Hill's Prescription Diet",
  name: 'r/d Weight Reduction Chicken (Cat, Dry)',
  species: 'cat', foodType: 'dry',
  goals: ['weight-loss', 'low-fat'],
  isRx: true,
  moisture: 10, protein: 28.5, fat: 8.6, fiber: 7.8,
  kcalPerKg: 3136, kcalPerCup: 209,
  highlight: 'Low calorie with high L-carnitine — supports fat burning in overweight cats',
  chewyPath: '/hills-prescription-diet-rd-weight-reduction-chicken-dry-cat-food/dp/51999',
});

const royalCaninSatietyCat = food({
  id: 'rc-satiety-cat',
  brand: 'Royal Canin Veterinary Diet',
  name: 'Satiety Support (Cat, Dry)',
  species: 'cat', foodType: 'dry',
  goals: ['weight-loss'],
  isRx: true,
  moisture: 8, protein: 40, fat: 11, fiber: 13,
  kcalPerKg: 3104, kcalPerCup: 243,
  highlight: 'Very high fiber promotes satiety — cats feel full on less food',
  chewyPath: '/royal-canin-veterinary-diet-satiety-support-dry-cat-food/dp/165041',
});

const purinaOMCat = food({
  id: 'purina-om-cat',
  brand: 'Purina Pro Plan Veterinary Diets',
  name: 'OM Overweight Management (Cat, Dry)',
  species: 'cat', foodType: 'dry',
  goals: ['weight-loss'],
  isRx: true,
  moisture: 10, protein: 50, fat: 7, fiber: 11,
  kcalPerKg: 3168, kcalPerCup: 261,
  highlight: 'Very high protein (50% DMB) — cats lose fat while preserving lean muscle',
  chewyPath: '/s?query=purina+pro+plan+veterinary+OM+overweight+cat+dry',
});

// ─── CAT — MAINTENANCE ───────────────────────────────────────────────────────

const hillsAdultCat = food({
  id: 'hills-adult-cat',
  brand: "Hill's Science Diet",
  name: 'Adult Chicken Recipe (Cat, Dry)',
  species: 'cat', foodType: 'dry',
  goals: ['maintenance'],
  isRx: false,
  moisture: 10, protein: 30.1, fat: 17.1, fiber: 1.1,
  kcalPerKg: 3652, kcalPerCup: 316,
  highlight: 'WSAVA-recommended, taurine-complete, consistently formulated',
  chewyPath: '/hills-science-diet-adult-chicken-recipe-dry-cat-food/dp/52000',
});

const purinaProPlanAdultCat = food({
  id: 'purina-pro-plan-adult-cat',
  brand: 'Purina Pro Plan',
  name: 'Adult Indoor Turkey & Rice (Cat, Dry)',
  species: 'cat', foodType: 'dry',
  goals: ['maintenance', 'senior'],
  isRx: false,
  moisture: 12, protein: 40, fat: 14, fiber: 3,
  kcalPerKg: 3680, kcalPerCup: 388,
  highlight: 'High protein, low fat — ideal for indoor cats prone to weight gain',
  chewyPath: '/purina-pro-plan-savor-adult-indoor-turkey-rice-formula-dry-cat-food/dp/36049',
});

// ─── CAT — WEIGHT GAIN / KITTEN ──────────────────────────────────────────────

const purinaKittenCat = food({
  id: 'purina-kitten-cat',
  brand: 'Purina Pro Plan',
  name: 'Kitten Chicken & Rice (Cat, Dry)',
  species: 'cat', foodType: 'dry',
  goals: ['puppy', 'weight-gain'],
  isRx: false,
  moisture: 12, protein: 45, fat: 22, fiber: 1.5,
  kcalPerKg: 4528, kcalPerCup: 449,
  highlight: 'High calorie density (4500 kcal/kg) — effective for underweight adult cats too',
  chewyPath: '/purina-pro-plan-savor-kitten-chicken-rice-formula-dry-cat-food/dp/36040',
});

const royalCaninKittenCat = food({
  id: 'rc-kitten-cat',
  brand: 'Royal Canin',
  name: 'Kitten (Cat, Dry)',
  species: 'cat', foodType: 'dry',
  goals: ['puppy', 'weight-gain'],
  isRx: false,
  moisture: 10, protein: 34, fat: 21, fiber: 2.5,
  kcalPerKg: 4080, kcalPerCup: 396,
  highlight: 'Highly digestible with DHA for brain and vision development in kittens',
  chewyPath: '/s?query=royal+canin+kitten+dry+cat+food',
});

// ─── CAT — KIDNEY ────────────────────────────────────────────────────────────

const hillsKdCat = food({
  id: 'hills-kd-cat',
  brand: "Hill's Prescription Diet",
  name: 'k/d Kidney Care Chicken (Cat, Dry)',
  species: 'cat', foodType: 'dry',
  goals: ['kidney'],
  isRx: true,
  moisture: 10, protein: 24.6, fat: 22.4, fiber: 0.5,
  kcalPerKg: 4176, kcalPerCup: 374,
  highlight: 'Low phosphorus (0.51%) with added omega-3s to slow CKD progression in cats',
  chewyPath: '/hills-prescription-diet-kd-kidney-care-chicken-dry-cat-food/dp/52003',
});

const royalCaninRenalCat = food({
  id: 'rc-renal-cat',
  brand: 'Royal Canin Veterinary Diet',
  name: 'Renal Support A (Cat, Dry)',
  species: 'cat', foodType: 'dry',
  goals: ['kidney'],
  isRx: true,
  moisture: 9, protein: 30, fat: 22, fiber: 5,
  kcalPerKg: 4000, kcalPerCup: 370,
  highlight: 'Unique "A" flavor profile for cats that resist dietary changes',
  chewyPath: '/s?query=royal+canin+renal+support+a+dry+cat+food',
});

// ─── CAT — SENIOR ────────────────────────────────────────────────────────────

const hillsSeniorCat = food({
  id: 'hills-senior-cat',
  brand: "Hill's Science Diet",
  name: 'Adult 7+ Indoor (Cat, Dry)',
  species: 'cat', foodType: 'dry',
  goals: ['senior'],
  isRx: false,
  moisture: 10, protein: 32.3, fat: 10.9, fiber: 6.3,
  kcalPerKg: 3369, kcalPerCup: 287,
  highlight: 'Lower calorie with extra fiber for senior indoor cats prone to weight gain',
  chewyPath: '/hills-science-diet-adult-7-indoor-chicken-recipe-dry-cat-food/dp/52006',
});

// ─── CAT — URINARY ───────────────────────────────────────────────────────────

const hillsUrinaryCat = food({
  id: 'hills-urinary-cat',
  brand: "Hill's Prescription Diet",
  name: 'c/d Multicare Urinary Care Chicken (Cat, Dry)',
  species: 'cat', foodType: 'dry',
  goals: ['urinary'],
  isRx: true,
  moisture: 10, protein: 28.4, fat: 11.5, fiber: 2.8,
  kcalPerKg: 3588, kcalPerCup: 279,
  highlight: 'Dissolves struvite stones and reduces recurrence of all common urinary crystals',
  chewyPath: '/hills-prescription-diet-cd-multicare-urinary-care-chicken-dry-cat-food/dp/52001',
});

const royalCaninUrinaryCat = food({
  id: 'rc-urinary-cat',
  brand: 'Royal Canin Veterinary Diet',
  name: 'Urinary SO (Cat, Dry)',
  species: 'cat', foodType: 'dry',
  goals: ['urinary'],
  isRx: true,
  moisture: 8.5, protein: 33, fat: 14, fiber: 5.5,
  kcalPerKg: 3673, kcalPerCup: 347,
  highlight: 'Creates urine pH and dilution that prevents struvite and calcium oxalate crystals',
  chewyPath: '/s?query=royal+canin+urinary+so+dry+cat+food',
});

// ─── Full database ────────────────────────────────────────────────────────────

export const DIET_RECOMMENDATIONS: RecommendedFood[] = [
  // Dog — weight loss
  hillsRdDog, royalCaninSatietyDog, purinaOMDog, hillsPerfectWeightDog, purinaFocusWeightDog,
  // Dog — maintenance
  hillsAdultDog, purinaProPlanAdultDog,
  // Dog — weight gain
  purinaSportDog, royalCaninRecoveryDog,
  // Dog — kidney
  hillsKdDog, royalCaninRenalDog,
  // Dog — puppy
  hillsPuppyDog, hillsPuppyLargeBreedDog,
  // Dog — senior
  hillsSeniorDog,
  // Cat — weight loss
  hillsRdCat, royalCaninSatietyCat, purinaOMCat,
  // Cat — maintenance
  hillsAdultCat, purinaProPlanAdultCat,
  // Cat — kitten / weight gain
  purinaKittenCat, royalCaninKittenCat,
  // Cat — kidney
  hillsKdCat, royalCaninRenalCat,
  // Cat — senior
  hillsSeniorCat,
  // Cat — urinary
  hillsUrinaryCat, royalCaninUrinaryCat,
];

/** Filter recommendations by species and one or more goals, up to maxCount results. */
export function getRecommendations(
  species: 'dog' | 'cat',
  goals: DietGoal[],
  maxCount = 3
): RecommendedFood[] {
  return DIET_RECOMMENDATIONS
    .filter(f =>
      (f.species === species || f.species === 'both') &&
      goals.some(g => f.goals.includes(g))
    )
    .slice(0, maxCount);
}
