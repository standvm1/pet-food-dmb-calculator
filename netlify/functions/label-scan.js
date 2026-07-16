// Vision scan for pet food Guaranteed Analysis labels.
// Uses Claude Haiku vision to extract nutritional values from a photo.

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

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Label scanning is not configured on this server.' }) };
  }

  let image, mediaType;
  try {
    ({ image, mediaType } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!image) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'No image provided' }) };
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType || 'image/jpeg',
                data: image,
              },
            },
            {
              type: 'text',
              text: `This is a photo of a pet food label. Find the "Guaranteed Analysis" section and extract the nutritional values.

Return ONLY a valid JSON object with exactly these fields (use the numeric value only — no % signs, no units; use null if a value is not visible):
{
  "protein": <crude protein % — labeled "Crude Protein (min)" or similar>,
  "fat": <crude fat % — labeled "Crude Fat (min)" or similar>,
  "fiber": <crude fiber % — labeled "Crude Fiber (max)" or similar>,
  "moisture": <moisture % — labeled "Moisture (max)" or similar>,
  "ash": <crude ash % if listed, otherwise null>,
  "phosphorus": <phosphorus % — look for any line containing "Phosphorus" or "Phos" anywhere in the guaranteed analysis, it may say min OR max, e.g. "Phosphorus (min) 0.19%" → return 0.19; if not found return null>,
  "kcalPerKg": <kcal/kg from the calorie statement, e.g. "3,500 kcal/kg" → return 3500, otherwise null>,
  "kcalPerCup": <kcal per cup from calorie statement, e.g. "395 kcal/cup" → return 395, otherwise null>,
  "kcalPerCan": <kcal per can or pouch from calorie statement, otherwise null>,
  "confidence": <"high" if values are clearly readable, "medium" if image is angled or partially blurry, "low" if very uncertain>
}

Return only the JSON object. No explanation, no markdown, no code blocks.`,
            },
          ],
        }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Anthropic API error:', res.status, errText);
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Vision API error — please try again.' }) };
    }

    const data = await res.json();
    const text = (data.content?.[0]?.text ?? '').trim();

    // Extract JSON from response (handle any accidental wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON in Claude response:', text);
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ error: 'Could not read the label — please try a clearer photo.' }) };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return { statusCode: 200, headers: CORS, body: JSON.stringify(parsed) };

  } catch (err) {
    console.error('label-scan error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Scan failed — please try again.' }) };
  }
};
