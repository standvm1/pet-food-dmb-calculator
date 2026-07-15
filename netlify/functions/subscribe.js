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

  const AC_API_URL = process.env.AC_API_URL;   // e.g. https://atlasveterinaryhospital.api-us1.com
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
    const res = await fetch(`${AC_API_URL}/api/3/contacts`, {
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

    const data = await res.json();
    const contactId = data.contact?.id;

    // Add to list
    if (contactId) {
      await fetch(`${AC_API_URL}/api/3/contactLists`, {
        method: 'POST',
        headers: {
          'Api-Token': AC_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactList: { list: Number(AC_LIST_ID), contact: contactId, status: 1 },
        }),
      });
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('subscribe error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Subscription failed' }) };
  }
};
