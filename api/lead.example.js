// Example serverless handler for POST /api/lead
// Stores lead details and context in Zoho CRM (custom object or Lead).

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).end();
    const { source, data } = req.body || {};
    if (!data) return res.status(400).json({ error: 'invalid_payload' });

    // Map to Zoho record fields then call Zoho
    // const zohoRes = await fetch('https://.../crm/lead', { method:'POST', headers: {...}, body: JSON.stringify(mapped) });

    // For demo purposes, just echo back
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'lead_post_failed' });
  }
}

