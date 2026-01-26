import ENV from './env.js';

export const CRM_ENDPOINTS = {
  renewalDetails: '/crm/v7/functions/renewalgetleadinfo/actions/execute',
  renewalOrder: '/crm/v7/functions/renewalcreateorder/actions/execute',
  renewalOrderSummary: '/crm/v7/functions/renewalgetordersummary/actions/execute',
  xeroInvoiceLink: '/crm/v7/functions/dealcreatepayment/actions/execute',
  xeroInvoiceStatus: '/crm/v7/functions/renewalgetpaymentstatus/actions/execute',
  // Audit endpoints
  auditCreateLead: '/crm/v7/functions/auditcreatelead/actions/execute',
  auditUpdate: '/crm/v7/functions/auditupdate/actions/execute',
  auditGetOrder: '/crm/v7/functions/auditgetorder/actions/execute',
  auditCreatePayment: '/crm/v7/functions/auditcreatepayment/actions/execute'
};

export const CRM_REQUIRED_APIS = [
  {
    name: 'RenewalDetails',
    method: 'GET',
    endpoint: CRM_ENDPOINTS.renewalDetails,
    description: 'Returns account, contact, primary trademark, and upcoming renewals for a token.'
  },
  {
    name: 'RenewalOrder',
    method: 'POST',
    endpoint: CRM_ENDPOINTS.renewalOrder,
    description: 'Creates or updates the renewal Deal and associated records from the landing page submission.'
  },
  {
    name: 'RenewalOrderSummary',
    method: 'GET',
    endpoint: CRM_ENDPOINTS.renewalOrderSummary,
    description: 'Fetches Deal line items, totals, and metadata for order review.'
  },
  {
    name: 'XeroPaymentLink',
    method: 'GET',
    endpoint: CRM_ENDPOINTS.xeroInvoiceLink,
    description: 'Creates or retrieves the Xero invoice and payment link for a Deal (runs inside CRM).'
  },
  {
    name: 'XeroPaymentStatus',
    method: 'GET',
    endpoint: CRM_ENDPOINTS.xeroInvoiceStatus,
    description: 'Returns latest payment status for a Deal-linked Xero invoice via CRM custom function.'
  },
  // Audit endpoints
  {
    name: 'AuditCreateLead',
    method: 'POST',
    endpoint: CRM_ENDPOINTS.auditCreateLead,
    description: 'Creates or updates audit lead with incremental field updates (steps 1-7).'
  },
  {
    name: 'AuditUpdate',
    method: 'POST',
    endpoint: CRM_ENDPOINTS.auditUpdate,
    description: 'Creates or updates audit order Deal with section-specific data (unified endpoint).'
  },
  {
    name: 'AuditGetOrder',
    method: 'GET',
    endpoint: CRM_ENDPOINTS.auditGetOrder,
    description: 'Fetches complete audit order data by orderId for summary/confirmation display.'
  },
  {
    name: 'AuditCreatePayment',
    method: 'POST',
    endpoint: CRM_ENDPOINTS.auditCreatePayment,
    description: 'Creates Xero invoice and payment link for audit order (with social addon if selected).'
  }
];

export function isCrmConfigured() {
  return Boolean(ENV.crmBaseUrl && ENV.crmApiKey);
}

export async function callCrm(endpoint, options = {}) {
  if (!isCrmConfigured()) {
    throw new Error('CRM_NOT_CONFIGURED');
  }

  const { url, headers } = buildRequest(endpoint, options);

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    next: options.next
  });

  if (!res.ok) {
    const body = await safeJson(res);
    const error = new Error('CRM_REQUEST_FAILED');
    error.status = res.status;
    error.details = body;
    throw error;
  }

  return safeJson(res);
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch (error) {
    return null;
  }
}

function buildRequest(endpoint, options) {
  const url = buildUrl(endpoint, options.query);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (ENV.crmApiKey) {
    headers[ENV.crmApiKeyHeader] = ENV.crmApiKey;
  }

  return { url, headers };
}

function buildUrl(endpoint, query = {}) {
  const [path, search] = endpoint.split('?');
  const url = new URL(`${ENV.crmBaseUrl}${path}`);

  if (search) {
    const initial = new URLSearchParams(search);
    initial.forEach((value, key) => url.searchParams.append(key, value));
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  if (ENV.crmAuthType) {
    url.searchParams.set('auth_type', ENV.crmAuthType);
  }

  if (ENV.crmApiKeyParam && ENV.crmApiKey) {
    url.searchParams.set(ENV.crmApiKeyParam, ENV.crmApiKey);
  }

  return url.toString();
}
