// Inline food search using SerpAPI (site:chewy.com).
// Fast path: SerpAPI only (~300ms). No secondary catalog lookups.

const IMPACT_BASE = 'https://chewy.sjv.io/c/7441793/3054490/32975';

exports.handler = async (event) => {
  const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const q = (event.queryStringParameters?.q ?? '').trim();
  if (!q) return { statusCode: 200, headers: CORS, body: JSON.stringify({ items: [] }) };

  const SERP_KEY = process.env.SERPAPI_KEY;
  if (!SERP_KEY) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ items: [], error: 'Search not configured' }) };
  }

  try {
    const serpUrl = `https://serpapi.com/search.json?api_key=${SERP_KEY}&engine=google` +
      `&q=${encodeURIComponent('site:chewy.com ' + q)}&num=10&gl=us&hl=en`;

    const serpRes  = await fetch(serpUrl);
    const serpData = await serpRes.json();

    if (serpData.error) {
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ items: [], error: serpData.error }) };
    }

    // Filter to actual product pages only (/dp/NUMBER)
    const productHits = (serpData.organic_results ?? [])
      .filter(r => r.link && /\/dp\/\d+/.test(r.link))
      .slice(0, 8);

    const items = productHits.map(hit => {
      const skuMatch = hit.link.match(/\/dp\/(\d+)/);
      const sku      = skuMatch?.[1];

      // Wrap Chewy URL in Impact affiliate tracking
      const chewyUrl = `${IMPACT_BASE}?u=${encodeURIComponent(hit.link)}`;

      // Strip Google's title suffixes
      const name = (hit.title ?? '')
        .replace(/\s*[-|]\s*(chewy\.com|free shipping|chewy).*$/i, '')
        .trim();

      // Try to extract price from snippet (e.g. "$56.99")
      const priceMatch = (hit.snippet ?? '').match(/\$[\d,]+\.?\d*/);
      const price = priceMatch ? priceMatch[0] : null;

      return {
        id:       sku ?? hit.link,
        name,
        snippet:  hit.snippet ?? '',
        imageUrl: hit.thumbnail ?? null,
        price,
        chewyUrl,
      };
    });

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ items: items.filter(i => i.name) }),
    };
  } catch (err) {
    console.error('food-search error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ items: [], error: 'Search failed' }) };
  }
};
