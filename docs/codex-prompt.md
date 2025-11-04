Okay, now I want to deploy this current state and test this first real IP. Actually loading the landing page with a token and that's supposed to load information from CRM using the same token to access renewal details.

So give me step-by-step instructions on how to deploy this on Vercel currently, and what I need to do. Testing will be simple, which is simply access the landing page with a token parameter.

Deploy Steps

- Provision env vars in Vercel: CRM_API_BASE_URL=https://www.zohoapis.com, CRM_API_KEY=<your key>, CRM_AUTH_TYPE=apikey, CRM_API_KEY_HEADER=X-API-
  Key, CRM_API_KEY_PARAM=zapikey, optionally USE_MOCK_DATA=false. Apply to Preview + Production.
- Push current branch to Git (or fork) so Vercel can build from it. Confirm /api/renewal/* files and docs/ updates are included.
- Create/Select Vercel project pointing at this repo. Framework preset: “Other”. Ensure build/deploy settings use defaults (npm install skipped, just
  static + edge functions).
- Trigger deploy (git push or vercel --prod). Wait for build success; note the deployed domain.
