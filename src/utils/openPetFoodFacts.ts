export interface LiveFoodItem {
  id: string;
  brand: string;
  productName: string;
  species: 'dog' | 'cat' | 'both' | 'unknown';
  foodType: 'dry' | 'canned' | 'semi-moist' | 'treat' | 'unknown';
  moisture: number;
  moistureEstimated: boolean;
  // as-fed (from label) — may be null if not in database
  proteinAsFed: number | null;
  fatAsFed: number | null;
  fiberAsFed: number | null;
  // dry matter basis — calculated
  proteinDMB: number | null;
  fatDMB: number | null;
  fiberDMB: number | null;
  kcalPerKg: number | null;
  imageUrl?: string;
  sourceUrl?: string;
}

interface OPFFProduct {
  id: string;
  product_name?: string;
  brands?: string;
  categories?: string;
  categories_tags?: string[];
  nutriments?: {
    proteins_100g?: number;
    proteins_value?: number;
    fat_100g?: number;
    fat_value?: number;
    fiber_100g?: number;
    fiber_value?: number;
    water_100g?: number;
    moisture_100g?: number;
    'energy-kcal_100g'?: number;
    'energy-kcal_serving'?: number;
  };
  image_url?: string;
  image_small_url?: string;
  url?: string;
}

interface OPFFResponse {
  count: number;
  products: OPFFProduct[];
}

const FIELDS = [
  'id', 'product_name', 'brands', 'categories', 'categories_tags',
  'nutriments', 'image_small_url', 'url',
].join(',');

function detectSpecies(tags: string[], categories: string): 'dog' | 'cat' | 'both' | 'unknown' {
  const hasDog = tags.some(t => t.includes('dog') || t.includes('chien')) || categories.toLowerCase().includes('dog') || categories.toLowerCase().includes('chien');
  const hasCat = tags.some(t => t.includes('cat') || t.includes('chat')) || categories.toLowerCase().includes('cat') || categories.toLowerCase().includes('chat');
  if (hasDog && hasCat) return 'both';
  if (hasDog) return 'dog';
  if (hasCat) return 'cat';
  return 'unknown';
}

function detectFoodType(tags: string[], categories: string): 'dry' | 'canned' | 'semi-moist' | 'treat' | 'unknown' {
  const s = categories.toLowerCase();
  const isDry = tags.some(t => t.includes('dry') || t.includes('kibble') || t.includes('croquette') || t.includes('sec')) || s.includes('dry') || s.includes('kibble');
  const isWet = tags.some(t => t.includes('wet') || t.includes('canned') || t.includes('pate') || t.includes('paté') || t.includes('humide')) || s.includes('wet') || s.includes('canned') || s.includes('pate') || s.includes('pouch');
  const isTreat = tags.some(t => t.includes('treat') || t.includes('snack') || t.includes('friandise')) || s.includes('treat') || s.includes('snack');
  if (isDry) return 'dry';
  if (isWet) return 'canned';
  if (isTreat) return 'treat';
  return 'unknown';
}

function mapProduct(p: OPFFProduct): LiveFoodItem | null {
  const name = p.product_name?.trim();
  const brand = p.brands?.split(',')[0]?.trim();
  if (!name || !brand || name.length < 2) return null;

  const n = p.nutriments ?? {};
  const protein = n.proteins_100g ?? n.proteins_value ?? null;
  const fat = n.fat_100g ?? n.fat_value ?? null;
  const fiber = n.fiber_100g ?? n.fiber_value ?? null;
  const water = n.water_100g ?? n.moisture_100g ?? null;
  const kcalPer100g = n['energy-kcal_100g'] ?? null;

  const tags = p.categories_tags ?? [];
  const categories = p.categories ?? '';
  const species = detectSpecies(tags, categories);
  const foodType = detectFoodType(tags, categories);

  // Skip if we can't determine it's pet food at all
  if (species === 'unknown' && !categories.toLowerCase().includes('pet')) return null;

  const moistureEstimated = water === null;
  // Estimate moisture from food type if missing
  const moisture = water ?? (foodType === 'dry' ? 10 : foodType === 'canned' ? 78 : 12);

  const dm = 100 - moisture;
  const toDMB = (v: number | null): number | null =>
    v !== null && dm > 0 ? Math.round((v / dm) * 1000) / 10 : null;

  return {
    id: p.id,
    brand,
    productName: name,
    species,
    foodType,
    moisture,
    moistureEstimated,
    proteinAsFed: protein !== null ? Math.round(protein * 10) / 10 : null,
    fatAsFed: fat !== null ? Math.round(fat * 10) / 10 : null,
    fiberAsFed: fiber !== null ? Math.round(fiber * 10) / 10 : null,
    proteinDMB: toDMB(protein),
    fatDMB: toDMB(fat),
    fiberDMB: toDMB(fiber),
    kcalPerKg: kcalPer100g !== null ? Math.round(kcalPer100g * 10) : null,
    imageUrl: p.image_small_url || p.image_url,
    sourceUrl: p.url,
  };
}

export async function searchPetFoods(
  query: string,
  species?: 'dog' | 'cat' | '',
  signal?: AbortSignal
): Promise<{ items: LiveFoodItem[]; total: number }> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '30',
    fields: FIELDS,
  });

  // Server-side species filter
  if (species === 'dog') {
    params.set('tagtype_0', 'categories');
    params.set('tag_contains_0', 'contains');
    params.set('tag_0', 'dog');
  } else if (species === 'cat') {
    params.set('tagtype_0', 'categories');
    params.set('tag_contains_0', 'contains');
    params.set('tag_0', 'cat');
  }

  const res = await fetch(
    `https://world.openpetfoodfacts.org/cgi/search.pl?${params}`,
    { signal }
  );
  if (!res.ok) throw new Error(`API error ${res.status}`);

  const data: OPFFResponse = await res.json();
  const items = (data.products ?? [])
    .map(mapProduct)
    .filter((x): x is LiveFoodItem => x !== null);

  return { items, total: data.count };
}
