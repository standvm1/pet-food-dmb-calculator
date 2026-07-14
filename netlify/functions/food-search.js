// Inline food search: SerpAPI (site:chewy.com) for product URLs + titles,
// Impact catalog for product images via SKU lookup.
// Results stay inside the app; "Buy on Chewy" opens in a new tab.

const IMPACT_BASE = 'https://chewy.sjv.io/c/7441793/3054490/32975';

exports.handler = async (event) => {
  const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const q = (event.queryStringParameters?.q ?? '').trim();
  if (!q) return { statusCode: 200, headers: CORS, body: JSON.stringify({ items: [] }) };

  const SERP_KEY    = process.env.SERPAPI_KEY;
  const ACCOUNT_SID = process.env.IMPACT_ACCOUNT_SID;
  const AUTH_TOKEN  = process.env.IMPACT_AUTH_TOKEN;
  const CATALOG_ID  = process.env.IMPACT_CHEWY_CATALOG_ID ?? '24727';

  if (!SERP_KEY) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ items: [], error: 'Search not configured' }) };
  }

  try {
    // Step 1 — SerpAPI: search chewy.com for the query
    const serpUrl = `https://serpapi.com/search.json?api_key=${SERP_KEY}&engine=google` +
      `&q=${encodeURIComponent('site:chewy.com ' + q)}&num=10&gl=us&hl=en`;
    const serpRes  = await fetch(serpUrl);
    const serpData = await serpRes.json();

    if (serpData.error) {
      console.error('SerpAPI error:', serpData.error);
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ items: [], error: serpData.error }) };
    }

    // Filter to actual product pages (/dp/ URLs) only
    const productHits = (serpData.organic_results ?? [])
      .filter(r => r.link && /\/dp\/\d+/.test(r.link))
      .slice(0, 8);

    if (productHits.length === 0) {
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ items: [] }) };
    }

    // Step 2 — Impact catalog: parallel image lookups by SKU
    const impactAuth    = ACCOUNT_SID && AUTH_TOKEN
      ? Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64')
      : null;
    const impactHeaders = impactAuth
      ? { Authorization: `Basic ${impactAuth}`, Accept: 'application/json' }
      : null;

    const items = await Promise.all(
      productHits.map(async (hit) => {
        const skuMatch = hit.link.match(/\/dp\/(\d+)/);
        const sku      = skuMatch?.[1];

        let imageUrl   = null;
        let price      = null;
        let chewyUrl   = hit.link;

        // Try to get image + price from Impact catalog
        if (sku && impactHeaders) {
          try {
            const catRes = await fetch(
              `https://api.impact.com/Mediapartners/${ACCOUNT_SID}/Catalogs/${CATALOG_ID}/Items/product_${CATALOG_ID}_${sku}`,
              { headers: impactHeaders }
            );
            if (catRes.ok) {
              const item = await catRes.json();
              imageUrl = item.ImageUrl     ?? null;
              price    = item.CurrentPrice ?? null;
              // Prefer Impact's pre-built affiliate URL; fall back below
              if (item.Url) chewyUrl = item.Url;
            }
          } catch (_) { /* catalog lookup is best-effort */ }
        }

        // Build affiliate link if Impact didn't supply one
        if (!chewyUrl.includes('sjv.io')) {
          chewyUrl = `${IMPACT_BASE}?u=${encodeURIComponent(hit.link)}`;
        }

        // Clean up Google's title suffix (e.g. " - Chewy.com | Free Shipping")
        const name = (hit.title ?? '')
          .replace(/\s*[-|]\s*(chewy\.com|free shipping|chewy).*$/i, '')
          .trim();

        return {
          id:      sku ?? hit.link,
          name,
          snippet: hit.snippet ?? '',
          imageUrl,
          price,
          chewyUrl,
        };
      })
    );

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
