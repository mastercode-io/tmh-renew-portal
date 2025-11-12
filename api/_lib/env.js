const ENV = {
  crmBaseUrl: process.env.CRM_API_BASE_URL || '',
  crmApiKey: process.env.CRM_API_KEY || '',
  crmAuthType: process.env.CRM_AUTH_TYPE || 'apikey',
  crmApiKeyHeader: process.env.CRM_API_KEY_HEADER || 'X-API-Key',
  crmApiKeyParam: process.env.CRM_API_KEY_PARAM || 'zapikey',
  useMockData: process.env.USE_MOCK_DATA !== 'false'
};

export default ENV;
