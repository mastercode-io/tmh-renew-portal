window.__renewalPayload = {
  "model": {
    "version": "v1.0",
    "source": "crm+tm-db",
    "generated_at": "2025-10-30T23:18:00Z",
    "currency": "GBP",
    "locale": "en-GB"
  },
  "lead": {
    "id": "1964745000070660247",
    "owner": { "name": "Stephen Dobson", "email": "steve@thetrademarkhelpline.com" },
    "crm_url": "https://crm.example.com/leads/1964745000070660247"
  },
  "person": {
    "full_name": "Jamie Moodie",
    "first_name": "Jamie",
    "last_name": "Moodie",
    "email": "jamiemoodie@wearessg.com",
    "mobile": "+447824441656",
    "alt_phone": null
  },
  "organisation": {
    "name": "SSG RECRUITMENT PARTNERSHIPS LTD",
    "company_number": "04834923",
    "vat_number": "GB123456789",
    "address": {
      "line1": "2 The Waterhouse, Waterhouse Street",
      "city": "Hemel Hempstead",
      "region": "England",
      "postal_code": "HP4 2BL",
      "country": "United Kingdom"
    },
    "website": "https://www.ssgpartnerships.co.uk",
    "linkedin": "https://www.linkedin.com/company/support-services-group"
  },
  "trademarks": [
    {
      "id": "tm_1374435",
      "word_mark": "weareSSG",
      "mark_type": "Word",
      "status": "Registered",
      "jurisdiction": "UK",
      "application_number": "UK00003116635",
      "registration_number": "UK00003116635",
      "application_date": "2015-10-09",
      "registration_date": "2016-01-08",
      "expiry_date": "2025-07-07",
      "classes": [
        {"nice": 35, "description": "Recruitment; HR consulting"},
        {"nice": 41, "description": "Training services"}
      ],
      "classes_count": 2,
      "image_url": null,
      "links": {
        "official": "https://www.gov.uk/search-for-trademark/UK00003116635",
        "tmview": "https://www.tmdn.org/tmview/#/tmview/detail/UK00003116635"
      }
    },
    {
      "id": "tm_418349",
      "word_mark": "Rhodium",
      "mark_type": "Word",
      "status": "Registered",
      "jurisdiction": "UK",
      "application_number": "UK00003093072",
      "registration_number": "UK00003093072",
      "application_date": "2015-05-08",
      "registration_date": "2015-11-06",
      "expiry_date": "2035-02-06",
      "classes": [{"nice": 9, "description": "Software"}],
      "classes_count": 1,
      "image_url": null,
      "links": {
        "official": "https://www.gov.uk/search-for-trademark/UK00003093072",
        "tmview": "https://www.tmdn.org/tmview/#/tmview/detail/UK00003093072"
      }
    }
  ],
  "next_due": {
    "trademark_id": "tm_1374435",
    "expiry_date": "2025-07-07"
  },
  "prefill": {
    "contact": {
      "name": "Jamie Moodie",
      "email": "jamiemoodie@wearessg.com",
      "mobile": "+447824441656"
    },
    "trademark": {
      "application_number": "UK00003116635",
      "registration_number": "UK00003116635",
      "word_mark": "weareSSG",
      "mark_type": "Word",
      "status": "Registered",
      "application_date": "2015-10-09",
      "registration_date": "2016-01-08",
      "expiry_date": "2025-07-07",
      "classes_count": 2,
      "classes": [35, 41],
      "jurisdiction": "UK"
    },
    "authorisations": {
      "is_authorised_to_renew": null,
      "confirm_contact_is_correct": null
    },
    "changes_requested": {
      "ownership_change": null,
      "classification_change": null,
      "new_classes": []
    }
  },
  "pricing_estimate": {
    "assumptions": {
      "classes_count": 2,
      "late_renewal": false
    },
    "items": [
      {"code": "IPO_BASE", "label": "IPO Renewal Fees (1st class)", "qty": 1, "unit_amount": 200.00},
      {"code": "IPO_ADDL", "label": "Additional Class Fees", "qty": 1, "unit_amount": 50.00},
      {"code": "ADMIN", "label": "Administration Fee", "qty": 1, "unit_amount": 222.00},
      {"code": "DISC", "label": "Online Discount", "qty": 1, "unit_amount": -120.00}
    ],
    "subtotal": 352.00,
    "vat_rate": 0.20,
    "vat": 70.40,
    "total": 422.40
  },
  "links": {
    "book_call": "https://bookings.thetrademarkhelpline.com/#/4584810000004811044",
    "pay_now": "stripe://checkout/session/{SESSION_ID}",
    "manage_prefs": "https://portal.example.com/prefs?t={JWT}"
  },
  "flags": {
    "missing_registration_date": false,
    "missing_status": false,
    "show_monitoring_upsell": true
  },
  "security": {
    "lead_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock",
    "signature": "sha256:3b4d...mock"
  }
};
