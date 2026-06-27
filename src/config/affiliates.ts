// ─── Chewy Affiliate Program ────────────────────────────────────────────────
// Sign up at: https://www.chewy.com/p/affiliate-program (managed via Impact)
// Once approved, paste your Impact Publisher ID below.
// All Chewy links on this site will automatically include your tracking params.

export const CHEWY_AFFILIATE_ID = '8568126';

// Impact Radius campaign tag (optional — customize in your Impact dashboard)
const CAMPAIGN = 'atlas-vet-pet-food-calc';

/**
 * Returns a Chewy product URL, appending affiliate tracking params when an
 * affiliate ID is configured. Pass a full path starting with '/'.
 */
export function chewyLink(path: string): string {
  const base = `https://www.chewy.com${path}`;
  if (!CHEWY_AFFILIATE_ID) return base;
  const sep = path.includes('?') ? '&' : '?';
  return `${base}${sep}irgwc=1&utm_source=affiliate&utm_medium=petfoodcalc&utm_campaign=${CAMPAIGN}&clickId=${CHEWY_AFFILIATE_ID}`;
}
