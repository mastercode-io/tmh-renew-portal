// Example serverless handler for GET /api/prefill?request_id=...
// Replace Zoho-related parts with your actual auth + API calls.

export default async function handler(req, res) {
  try {
    const { request_id: requestId } = req.query || {};
    if (!requestId) return res.status(400).json({ error: 'request_id required' });

    // 1) Validate token / request id (e.g., signed, time-limited)
    // 2) Call your Zoho CRM custom API to fetch the contact/account and renewal data
    // Example pseudo-code:
    // const zoho = await fetch(`https://.../custom/renewal?id=${encodeURIComponent(requestId)}`, { headers: { Authorization: `Zoho-oauthtoken ${token}` }})
    // const crm = await zoho.json();

    // Demo response shape
    const payload = {
      person: {
        firstName: 'Alex',
        lastName: 'Smith',
        email: 'alex@example.com',
        phone: '01618335400',
        company: 'ACME Ltd'
      },
      renewal: {
        tmeApp: 'UK0000123456',
        trademark: 'ACME',
        jurisdiction: 'UK',
        regNumber: 'UK0000123456'
      },
      renewals: [
        { trademark: 'ACME', type: 'Word Mark', status: 'Registered', regDate: '2015-11-04', regNumber: 'UK0000123456', jurisdiction: 'UK' }
      ]
    };

    return res.status(200).json(payload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'prefill_failed' });
  }
}

