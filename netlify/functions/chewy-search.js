// Netlify serverless function — proxies Chewy product search via Impact affiliate catalog API
// Credentials live in Netlify environment variables (never in frontend code):
//   IMPACT_ACCOUNT_SID   — from impact.com → Settings → API
//   IMPACT_AUTH_TOKEN    — from impact.com → Settings → API
//   IMPACT_CHEWY_CATALOG_ID — from impact.com → Brands → Chewy → Data Feeds/Catalog

exports.handler = async (event) => {
  const CORS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const q = (event.queryStringParameters?.q ?? '').trim();
  const page = parseInt(event.queryStringParameters?.page ?? '1', 10);

  const ACCOUNT_SID = process.env.IMPACT_ACCOUNT_SID;
  const AUTH_TOKEN  = process.env.IMPACT_AUTH_TOKEN;
  const CATALOG_ID  = process.env.IMPACT_CHEWY_CATALOG_ID;

  // If not yet configured, tell the frontend gracefully
  if (!ACCOUNT_SID || !AUTH_TOKEN || !CATALOG_ID) {
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ configured: false, items: [], total: 0 }),
    };
  }

  if (!q) {
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ configured: true, items: [], total: 0 }),
    };
  }

  try {
    const auth = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64');

    const params = new URLSearchParams({
      Keywords:   q,
      PageNumber: String(page),
      PageSize:   '24',
    });

    const apiUrl = `https://api.impact.com/Mediapartners/${ACCOUNT_SID}/Catalogs/${CATALOG_ID}/Items?${params}`;

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('Impact API error', res.status, txt);
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: `Impact API ${res.status}` }) };
    }

    const data = await res.json();

    // Impact's response nests data — try the known envelope first, then fall back
    const envelope  = data?.ImpactRadiusResponse?.CatalogItems ?? data?.Response?.CatalogItems ?? data;
    const rawItems  = envelope?.CatalogItem ?? envelope?.Items ?? envelope?.items ?? data?.items ?? [];
    const itemArray = Array.isArray(rawItems) ? rawItems : [rawItems];
    const total     = parseInt(envelope?.['@total'] ?? data?.total ?? itemArray.length, 10);

    const items = itemArray
      .map(i => ({
        id:       String(i.Id       ?? i.id       ?? i.SKU      ?? i.Sku      ?? Math.random()),
        name:     i.Name            ?? i.name      ?? i.Title    ?? i.title    ?? '',
        brand:    i.Brand           ?? i.brand     ?? '',
        price:    i.Price           ?? i.price     ?? null,
        imageUrl: i.ImageUrl        ?? i.ImageURL  ?? i.image_url ?? null,
        // Use the affiliate-tracked URL from Impact; fall back to direct Chewy URL
        chewyUrl: i.TrackingUrl     ?? i.tracking_url ?? i.Url ?? i.url ?? i.URL ?? null,
        category: i.Category        ?? i.category  ?? '',
        inStock:  i.InStock         ?? i.in_stock  ?? true,
      }))
      .filter(i => i.name && i.chewyUrl);

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ configured: true, items, total, page }),
    };
  } catch (err) {
    console.error('chewy-search function error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Search failed' }) };
  }
};
