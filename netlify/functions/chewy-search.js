// Netlify serverless function — Chewy catalog via Impact affiliate API
// Catalog 24727 = "Chewy US" (228,707 items as of 2026-07-07)
// The catalog Items endpoint is a paginated feed; keyword filtering is not supported.
// Search UX in the frontend redirects to chewy.com with the Impact affiliate link format.
// This function handles direct SKU lookups and catalog-connection verification.

exports.handler = async (event) => {
  const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const ACCOUNT_SID = process.env.IMPACT_ACCOUNT_SID;
  const AUTH_TOKEN  = process.env.IMPACT_AUTH_TOKEN;
  const CATALOG_ID  = process.env.IMPACT_CHEWY_CATALOG_ID ?? '24727';

  if (!ACCOUNT_SID || !AUTH_TOKEN) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ configured: false }) };
  }

  const sku  = (event.queryStringParameters?.sku  ?? '').trim();
  const page = parseInt(event.queryStringParameters?.page ?? '1', 10);

  try {
    const auth    = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64');
    const headers = { Authorization: `Basic ${auth}`, Accept: 'application/json' };

    // Direct SKU lookup
    if (sku) {
      const res = await fetch(
        `https://api.impact.com/Mediapartners/${ACCOUNT_SID}/Catalogs/${CATALOG_ID}/Items/product_${CATALOG_ID}_${sku}`,
        { headers }
      );
      if (!res.ok) return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Product not found' }) };
      const item = await res.json();
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ configured: true, item: mapItem(item) }) };
    }

    // Paginated feed browse (no keyword filter — see comment above)
    const params = new URLSearchParams({ PageSize: '24', PageNumber: String(page) });
    const res = await fetch(
      `https://api.impact.com/Mediapartners/${ACCOUNT_SID}/Catalogs/${CATALOG_ID}/Items?${params}`,
      { headers }
    );

    if (!res.ok) {
      const txt = await res.text();
      console.error('Impact API error', res.status, txt);
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: `Impact API ${res.status}` }) };
    }

    const data  = await res.json();
    const items = (data?.Items ?? []).map(mapItem);
    const total = parseInt(data?.['@total'] ?? '0', 10);

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ configured: true, items, total, page }) };
  } catch (err) {
    console.error('chewy-search error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server error' }) };
  }
};

function mapItem(i) {
  return {
    id:       String(i.CatalogItemId ?? i.Id ?? ''),
    name:     i.Name         ?? '',
    brand:    i.Manufacturer ?? '',
    price:    i.CurrentPrice ?? null,
    imageUrl: i.ImageUrl     ?? null,
    chewyUrl: i.Url          ?? null,  // already contains Impact affiliate tracking
    category: i.Category     ?? '',
    inStock:  i.StockAvailability === 'InStock',
  };
}
