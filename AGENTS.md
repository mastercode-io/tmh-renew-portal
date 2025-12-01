# Repository Guidelines

## Project Structure & Module Organization
- `public/renewals/uk/` contains the UK trademark landing journey. HTML entry points (`index.html`, `order.html`, `confirmation.html`) load scoped assets from `assets/` and structured content from `content/`.
- Shared front-end assets live under `assets/css`, `assets/js`, and `assets/images`. Keep campaign-specific files inside the relevant journey folder.
- Edge/back-end handlers reside in `api/` (Vercel Edge Functions). Any new API should follow the existing structure (`api/renewals/...`) and re-use helper modules in `api/_lib/`.

## Build, Test, and Development Commands
- **Static preview:** `npx serve public` or `cd public/renewals/uk && python3 -m http.server 8000` to inspect the landing pages locally.
- **Edge function smoke test:** `npm run lint` (if configured later) and `npm test` for any server-side utilities. Currently no automated build is required; Vercel deploys directly from the repo.

## Coding Style & Naming Conventions
- Use 2-space indentation for HTML, CSS, and JS. Favor single quotes in JS and terminate statements with semicolons.
- Keep assets referenced via relative paths (e.g., `./assets/js/main.js`). New JS modules should live in `assets/js` and export IIFEs similar to `main.js`.
- Name environment variables in ALL_CAPS (see `api/_lib/env.js`). Stick to snake_case for JSON payload fields to match CRM responses.

## Testing Guidelines
- The UI relies on manual browser testing. Verify both `/uk` and `/uk/order` flows via the mock data scripts before pointing to live APIs.
- For API changes, add unit tests under `api/_tests/` (create if missing) or at minimum exercise the endpoint via `curl` against Vercel preview deployments.
- When adding new polling or form logic, test edge cases: missing token, expired invoice, and CRM error responses.

## Commit & Pull Request Guidelines
- Use short, present-tense commit subjects (e.g., `update payment polling`, `add seeu landing`). Keep commits focused.
- Pull requests should include: a concise summary, screenshots/gifs for UI changes, test notes (manual steps or commands), and links to tickets/CRM tasks where applicable.

## Security & Configuration Tips
- Never commit secrets; rely on Vercel environment variables (`CRM_API_BASE_URL`, `CRM_API_KEY`, etc.).
- Sensitive tokens should be mocked in local data files (`mock_deal_token`). Replace demo payloads before sharing externally.
