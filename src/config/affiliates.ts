// Chewy affiliate program via Impact Radius
// Publisher ID: 8568126 | Campaign: 32975 | Catalog: 24727
// Link format discovered from Impact catalog API responses

// Base for Impact-tracked Chewy links (publisher/creative/campaign IDs from Impact API)
const IMPACT_BASE = 'https://chewy.sjv.io/c/7441793/3054490/32975';

/**
 * Returns an Impact-tracked link to a chewy.com path.
 * Pass a full path starting with '/' (e.g. '/dp/12345' or '/s?query=...').
 */
export function chewyLink(path: string): string {
  const dest = encodeURIComponent(`https://www.chewy.com${path}`);
  return `${IMPACT_BASE}?u=${dest}`;
}

/**
 * Returns an Impact-tracked link to Chewy search results for a query.
 */
export function chewySearchLink(query: string): string {
  const dest = encodeURIComponent(`https://www.chewy.com/s?query=${encodeURIComponent(query)}`);
  return `${IMPACT_BASE}?u=${dest}`;
}
