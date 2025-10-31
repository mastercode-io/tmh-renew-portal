# Repository Guidelines

## Project Structure & Module Organization
The landing page lives in `public/renewal-landing/` with `index.html`, `styles.css`, `main.js`, and `mock-data.js` for local payloads. `main.js` wraps the prefill, UTM capture, and screening logic in a self-invoking module; keep new scripts colocated. API examples in `api/lead.example.js` and `api/prefill.example.js` show the expected request/response contracts for Zoho integration—treat them as templates. Reference assets and CRM samples are stored in `docs/`.

## Build, Test, and Development Commands
- `open public/renewal-landing/index.html` – quick visual check in a browser.
- `cd public/renewal-landing && python3 -m http.server 8000` – lightweight static server for local testing.
- `cd public/renewal-landing && npx serve .` – Node-based static hosting that mimics production headers.

No bundler or package step is required; refresh the page to see changes.

## Coding Style & Naming Conventions
Use 2-space indentation across HTML, CSS, and JS; keep declarations in alphabetical blocks where possible. Prefer `const`/`let`, single quotes, and terminate statements with semicolons as in `main.js`. Extend CSS with existing custom property tokens (`--brand-*`, `--radius`, `--shadow`). Data attributes follow the current `data-…` naming (`data-prefill-endpoint`, `data-payment-url`); mirror that pattern for new hooks.

## Testing Guidelines
Rely on manual browser testing: load the page via the local server, ensure the summary card updates while editing the form, and confirm the renewals list sorts by expiry date. Use query-string overrides (`?request_id=test123&firstName=Alex`) or edit `mock-data.js` to emulate CRM payloads. When wiring APIs, hit the adapted handlers with curl or your platform’s test harness to validate `/api/prefill` and `/api/lead` responses before pointing the form at them.

## Commit & Pull Request Guidelines
Follow the existing short, present-tense subjects (`renewal form`, `design update`); keep them under ~50 characters and skip trailing punctuation. For pull requests, include: 1) a concise summary of the user-facing change, 2) testing notes or manual steps run, and 3) screenshots or screencasts when the UI shifts. Link to the CRM ticket or issue if one exists.

## Security & Configuration Tips
Never commit Zoho credentials or request tokens—store them in your deployment platform secrets. Ensure `data-endpoint` and `data-prefill-endpoint` target HTTPS URLs and enforce one-time `request_id` validation in your serverless layer. Strip UTM and personal data from logs before persisting analytics.
