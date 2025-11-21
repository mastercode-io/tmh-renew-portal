⏺ Done. I've added diagnostic logging at three levels:

Frontend (order.js)

- Logs the deal token being sent
- Logs the response status
- Logs the full response data
- Logs available keys when payment_url is missing

API Endpoint (payment-link.js)

- Logs incoming token
- Logs what the service returns

Service Layer (renewal.js)

- Logs raw CRM response before normalization
- Logs normalized result

How to Debug

1. Deploy to Vercel (push to dev branch)
2. Open browser DevTools → Console tab
3. Click "Pay Now"
4. Look for [Payment] logs in browser console - this will show what the frontend receives
5. Check Vercel Logs (Vercel Dashboard → your project → Logs)
   - Look for [payment-link] and [createOrRetrievePaymentLink] logs
   - This will show what the CRM actually returns

The logs will reveal whether:
- The CRM returns data in an unexpected format
- The payment_url field is named differently
- The CRM returns an error or null
