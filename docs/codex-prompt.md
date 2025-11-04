Tried this: https://tmh-renew-portal-git-dev-alexs-projects-5ddeff74.vercel.app/api/renewal/details?token=7+C9LoSYtRfoYB8P6Ps6nA37CwTrW7S3mYIejpX87fdVG4UVbBARXPY16TjmmpUR

it's a valid but Vercel requires authentication

## Note to agents accessing this page:

This page requires authentication to access. Automated agents should use a Vercel authentication bypass token to access this page.

The easiest way to get a token is using the get_access_to_vercel_url or web_fetch_vercel_url functions of the Vercel MCP server
at https://mcp.vercel.com (Docs at https://vercel.com/docs/mcp/vercel-mcp).

Alternatively, this URL documents how to use the bypass token: https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
You need to prompt the user to provide the bypass token to access this page. The URL above also explains how the user can
access the bypass token. Then you can calculate a URL of the following form and successfully access it: `https://current-domain/current-pathname?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=$bypass_token`.