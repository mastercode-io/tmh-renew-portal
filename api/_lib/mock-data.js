const ORGANIZATION_PAYLOAD = {
  account: {
    type: 'organization',
    name: 'Tech Innovations Ltd',
    company_number: '09876543',
    vat_number: 'GB123456789',
    address: {
      line1: '123 High Street',
      line2: 'Suite 4B',
      city: 'Manchester',
      postcode: 'M1 1AA',
      country: 'United Kingdom'
    }
  },
  contact: {
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@techinnovations.com',
    mobile: '+44 7700 900123',
    phone: '+44 161 123 4567',
    position: 'Managing Director'
  },
  trademark: {
    id: 'tm_001',
    word_mark: 'TECHIFY',
    mark_type: 'Word Mark',
    status: 'Registered',
    jurisdiction: 'UK',
    application_number: 'UK00003456789',
    registration_number: 'UK00003456789',
    application_date: '2014-06-20',
    registration_date: '2015-06-20',
    expiry_date: '2025-06-20',
    next_renewal_date: '2025-06-20',
    image_url: null,
    classes: [
      {
        nice: '9',
        description: 'Computer software; mobile applications; downloadable software'
      },
      {
        nice: '42',
        description: 'Software development services; IT consulting services'
      }
    ],
    classes_count: 2,
    proprietor: {
      name: 'Tech Innovations Ltd',
      address: '123 High Street, Manchester, M1 1AA, United Kingdom'
    }
  },
  next_due: [
    {
      id: 'tm_002',
      word_mark: 'INNOVATE PRO',
      mark_type: 'Logo',
      status: 'Registered',
      jurisdiction: 'UK',
      application_number: 'UK00003567890',
      registration_number: 'UK00003567890',
      application_date: '2015-08-15',
      registration_date: '2016-08-15',
      expiry_date: '2026-08-15',
      next_renewal_date: '2026-08-15',
      image_url: 'https://cdn.example.com/trademarks/tm_002.png',
      classes: [
        {
          nice: '9',
          description: 'Computer software'
        },
        {
          nice: '35',
          description: 'Business management services'
        },
        {
          nice: '42',
          description: 'IT services'
        }
      ],
      classes_count: 3,
      proprietor: {
        name: 'Tech Innovations Ltd',
        address: '123 High Street, Manchester, M1 1AA, United Kingdom'
      }
    },
    {
      id: 'tm_003',
      word_mark: 'SMARTECH',
      mark_type: 'Series Mark',
      status: 'Registered',
      jurisdiction: 'UK',
      application_number: 'UK00003678901',
      registration_number: 'UK00003678901',
      application_date: '2016-11-10',
      registration_date: '2017-11-10',
      expiry_date: '2027-11-10',
      next_renewal_date: '2027-11-10',
      image_url: 'https://cdn.example.com/trademarks/tm_003.png',
      classes: [
        {
          nice: '9',
          description: 'Electronic devices'
        }
      ],
      classes_count: 1,
      proprietor: {
        name: 'Tech Innovations Ltd',
        address: '123 High Street, Manchester, M1 1AA, United Kingdom'
      }
    }
  ],
  links: {
    book_call: 'https://bookings.thetrademarkhelpline.com/#/4584810000004811044',
    manage_prefs: 'https://portal.thetrademarkhelpline.com/preferences',
    terms_conditions: 'https://www.thetrademarkhelpline.com/terms-and-conditions'
  }
};

const INDIVIDUAL_PAYLOAD = {
  account: {
    type: 'individual',
    name: 'John Michael Smith',
    address: {
      line1: '45 Oak Avenue',
      line2: null,
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'United Kingdom'
    }
  },
  contact: {
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@example.com',
    mobile: '+44 7700 900000',
    phone: null,
    position: null
  },
  trademark: {
    id: 'tm_101',
    word_mark: "JOHN'S ARTISAN BAKERY",
    mark_type: 'Logo',
    status: 'Registered',
    jurisdiction: 'UK',
    application_number: 'UK00003234567',
    registration_number: 'UK00003234567',
    application_date: '2014-03-10',
    registration_date: '2015-03-15',
    expiry_date: '2025-03-15',
    next_renewal_date: '2025-03-15',
    image_url: 'https://cdn.example.com/trademarks/tm_101_logo.png',
    classes: [
      {
        nice: '30',
        description: 'Bread; pastries; cakes; bakery products'
      },
      {
        nice: '43',
        description: 'Café services; bakery services'
      }
    ],
    classes_count: 2,
    proprietor: {
      name: 'John Michael Smith',
      address: '45 Oak Avenue, London, SW1A 1AA, United Kingdom'
    }
  },
  next_due: [
    {
      id: 'tm_102',
      word_mark: "SMITH'S SOURDOUGH",
      mark_type: 'Word Mark',
      status: 'Registered',
      jurisdiction: 'UK',
      application_number: 'UK00003345678',
      registration_number: 'UK00003345678',
      application_date: '2016-09-20',
      registration_date: '2017-09-25',
      expiry_date: '2027-09-25',
      next_renewal_date: '2027-09-25',
      image_url: null,
      classes: [
        {
          nice: '30',
          description: 'Bread; sourdough products'
        }
      ],
      classes_count: 1,
      proprietor: {
        name: 'John Michael Smith',
        address: '45 Oak Avenue, London, SW1A 1AA, United Kingdom'
      }
    }
  ],
  links: {
    book_call: 'https://bookings.thetrademarkhelpline.com/#/4584810000004811044',
    manage_prefs: 'https://portal.thetrademarkhelpline.com/preferences',
    terms_conditions: 'https://www.thetrademarkhelpline.com/terms-and-conditions'
  }
};

const MOCK_ORDER_SUMMARY = {
  deal_id: 'D-000001',
  deal_token: 'mock_deal_token',
  contact_id: 'C-000001',
  account_id: 'A-000001',
  subtotal: 760,
  vat: 152,
  total: 912,
  currency: 'GBP',
  line_items: [
    {
      sku: 'UKIPOTMREN',
      name: 'IPO Renewal Fee',
      quantity: 1,
      unit_price: 200,
      total: 200
    },
    {
      sku: 'UKTMRENNEW',
      name: 'TMH Professional Fee',
      quantity: 1,
      unit_price: 450,
      total: 450
    },
    {
      sku: 'UKCLASSADMIN',
      name: 'Additional Class Admin',
      quantity: 1,
      unit_price: 110,
      total: 110
    }
  ],
  trademark: ORGANIZATION_PAYLOAD.trademark
};

const MOCK_PAYMENT_LINK = {
  payment_url: 'https://invoices.xero.com/link/example',
  deal_token: 'mock_deal_token'
};

const MOCK_PAYMENT_STATUS = {
  deal_token: 'mock_deal_token',
  status: 'pending',
  updated_at: new Date().toISOString()
};

export function getMockRenewalPayload(token = '') {
  if (token.toLowerCase().includes('individual')) {
    return clone(INDIVIDUAL_PAYLOAD);
  }
  return clone(ORGANIZATION_PAYLOAD);
}

export function getMockOrderSummary() {
  return clone(MOCK_ORDER_SUMMARY);
}

export function getMockPaymentLink() {
  return clone(MOCK_PAYMENT_LINK);
}

export function getMockPaymentStatus(token) {
  const payload = clone(MOCK_PAYMENT_STATUS);
  if (token) {
    payload.deal_token = token;
  }
  return payload;
}

// Audit mock data functions

export function getMockAuditUpdate(section, data) {
  const orderId = 'AUD-' + Date.now();

  const response = {
    orderId: orderId,
    success: true,
    message: `Section ${section} saved successfully`
  };

  // For paymentOptions section, include checkoutUrl
  if (section === 'paymentOptions') {
    response.checkoutUrl = `/audit/confirmation/?orderId=${orderId}`;
  }

  return response;
}

export function getMockAuditOrder(orderId) {
  return {
    orderId: orderId || 'AUD-' + Date.now(),
    dealId: 'D-AUD-001',
    sections: {
      contact: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com',
        phone: '+44 7700 900123'
      },
      preferences: {
        methods: ['Email', 'Phone']
      },
      tmStatus: {
        status: 'new'
      },
      temmy: {
        skipped: true,
        selected: null
      },
      tmInfo: {
        types: ['Word'],
        name: 'TECHIFY',
        image: null,
        jurisdictions: ['United Kingdom', 'Europe']
      },
      goods: {
        description: 'Software development and IT consulting services',
        website: 'https://example.com'
      },
      billing: {
        type: 'Individual',
        name: 'Sarah Johnson',
        address: {
          line1: '123 High Street',
          line2: '',
          city: 'Manchester',
          county: 'Greater Manchester',
          postcode: 'M1 1AA',
          country: 'United Kingdom'
        },
        invoiceEmail: 'sarah@example.com',
        invoicePhone: '+44 7700 900123'
      },
      appointment: {
        scheduled: false,
        skipped: true
      },
      paymentOptions: {
        socialMediaAddon: true,
        termsAccepted: true
      }
    },
    subtotal: 69.00,
    vat: 13.80,
    total: 82.80,
    currency: 'GBP',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    status: 'pending'
  };
}

export function getMockAuditPaymentLink(orderId) {
  return {
    payment_url: 'https://invoices.xero.com/link/audit-' + orderId,
    order_id: orderId || 'AUD-' + Date.now()
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
