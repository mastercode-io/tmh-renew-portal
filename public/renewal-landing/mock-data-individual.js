if (shouldInjectMockData()) {
  window.__renewalPayload = {
    "account": {
      "type": "individual",
      "name": "John Michael Smith",
      "address": {
        "line1": "45 Oak Avenue",
        "line2": null,
        "city": "London",
        "postcode": "SW1A 1AA",
        "country": "United Kingdom"
      }
    },
    "contact": {
      "first_name": "John",
      "last_name": "Smith",
      "email": "john.smith@example.com",
      "mobile": "+44 7700 900000",
      "phone": null,
      "position": null
    },
    "trademark": {
      "id": "tm_101",
      "word_mark": "JOHN'S ARTISAN BAKERY",
      "mark_type": "Logo",
      "status": "Registered",
      "jurisdiction": "UK",
      "application_number": "UK00003234567",
      "registration_number": "UK00003234567",
      "application_date": "2014-03-10",
      "registration_date": "2015-03-15",
      "expiry_date": "2025-03-15",
      "next_renewal_date": "2025-03-15",
      "image_url": "https://cdn.example.com/trademarks/tm_101_logo.png",
      "classes": [
        {
          "nice": "30",
          "description": "Bread; pastries; cakes; bakery products"
        },
        {
          "nice": "43",
          "description": "Café services; bakery services"
        }
      ],
      "classes_count": 2,
      "proprietor": {
        "name": "John Michael Smith",
        "address": "45 Oak Avenue, London, SW1A 1AA, United Kingdom"
      }
    },
    "next_due": [
      {
        "id": "tm_102",
        "word_mark": "SMITH'S SOURDOUGH",
        "mark_type": "Word Mark",
        "status": "Registered",
        "jurisdiction": "UK",
        "application_number": "UK00003345678",
        "registration_number": "UK00003345678",
        "application_date": "2016-09-20",
        "registration_date": "2017-09-25",
        "expiry_date": "2027-09-25",
        "next_renewal_date": "2027-09-25",
        "image_url": null,
        "classes": [
          {
            "nice": "30",
            "description": "Bread; sourdough products"
          }
        ],
        "classes_count": 1,
        "proprietor": {
          "name": "John Michael Smith",
          "address": "45 Oak Avenue, London, SW1A 1AA, United Kingdom"
        }
      }
    ],
    "links": {
      "book_call": "https://bookings.thetrademarkhelpline.com/#/4584810000004811044",
      "manage_prefs": "https://portal.thetrademarkhelpline.com/preferences",
      "terms_conditions": "https://www.thetrademarkhelpline.com/terms-and-conditions"
    }
  };
}

function shouldInjectMockData() {
  if (typeof window === 'undefined') return false;
  const search = window.location.search || '';
  if (search.includes('mock=1')) return true;
  const host = window.location.hostname;
  if (!host) return true;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  return window.location.protocol === 'file:';
}
