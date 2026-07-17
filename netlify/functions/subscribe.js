// ActiveCampaign subscription proxy.
// Set AC_API_URL and AC_API_KEY in Netlify environment variables.
// Set AC_LIST_ID to the numeric ID of the list to subscribe contacts to.

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const AC_API_URL = process.env.AC_API_URL;   // e.g. https://youraccount.api-us1.com
  const AC_API_KEY = process.env.AC_API_KEY;
  const AC_LIST_ID = process.env.AC_LIST_ID || '1';

  if (!AC_API_URL || !AC_API_KEY) {
    // Not yet configured — accept silently so the form still appears to work
    console.warn('subscribe: AC_API_URL or AC_API_KEY not set');
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
  }

  let email, firstName;
  try {
    ({ email, firstName } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  if (!email) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Email is required' }) };
  }

  try {
    // sync endpoint upserts — works for both new and existing contacts
    const syncRes = await fetch(`${AC_API_URL}/api/3/contact/sync`, {
      method: 'POST',
      headers: {
        'Api-Token': AC_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact: {
          email,
          firstName: firstName || '',
        },
      }),
    });

    const syncData = await syncRes.json();
    console.log('AC sync response:', syncRes.status, JSON.stringify(syncData).slice(0, 200));

    if (!syncRes.ok) {
      console.error('AC sync failed:', syncData);
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Could not create contact' }) };
    }

    const contactId = syncData.contact?.id;

    // Add to list
    if (contactId && AC_LIST_ID) {
      const listRes = await fetch(`${AC_API_URL}/api/3/contactLists`, {
        method: 'POST',
        headers: {
          'Api-Token': AC_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactList: { list: Number(AC_LIST_ID), contact: Number(contactId), status: 1 },
        }),
      });
      const listData = await listRes.json();
      console.log('AC list response:', listRes.status, JSON.stringify(listData).slice(0, 200));
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('subscribe error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Subscription failed' }) };
  }
};
