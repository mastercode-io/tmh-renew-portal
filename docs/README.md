Trademark Renewal Landing Page
================================

Files
- `index.html` – responsive landing page markup
- `styles.css` – brand-aligned styles using CSS variables
- `main.js` – CRM prefill + UTM capture + submit
- `tmh-logo.svg` – simple brand-style logo placeholder

Run
Open `public/renewal-landing/index.html` in a browser or serve the folder with any static server.

Prefill options
- Primary: provide a single `request_id` param and implement a serverless proxy at `/api/prefill?request_id=...` which calls your Zoho CRM custom API. The page will call this endpoint on load and prefill the greeting, the form and the “Next renewals due” list.
- Optional: URL params for local testing `?firstName=…&email=…` or inject `window.prefill = { firstName:"…", … }` before `main.js` runs.

Submission endpoint
- Set the target URL via the `data-endpoint` attribute on the form element.
  Example: `<form id="lead-form" data-endpoint="https://your-crm.example/leads" …>`
- Screening controls below the form mimic the PDF decision logic. If changes are indicated, the page prompts the user to call or book. If not, it redirects to `data-payment-url` (default `/pay`) carrying `request_id`.

Hidden context fields automatically populated
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `referrer`, `landing_path`

Accessibility
- Skip link, semantic headings, labels, focus styles and high-contrast buttons included.

Expected `/api/prefill` response (example)
```
{
  "person": { "firstName": "Alex", "lastName": "Smith", "email": "a@b.com", "phone": "01618335400", "company": "ACME Ltd" },
  "renewal": { "tmeApp": "UK0000123456", "trademark": "ACME", "jurisdiction": "UK", "regNumber": "UK0000123456" },
  "renewals": [
    { "trademark": "ACME", "type": "Word Mark", "status": "Registered", "regDate": "2015-11-04", "regNumber": "UK0000123456", "jurisdiction": "UK" }
  ]
}
```

