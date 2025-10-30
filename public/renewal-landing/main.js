/* Prefill logic and simple client-side validation */
(function () {
  const MOCK_RENEWAL_RESPONSE = {
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
      "signature": "sha256:3b4d…mock"
    }
  };

  const header = document.querySelector('.site-header');
  if (header && typeof window !== 'undefined') {
    const updateHeaderOffset = () => {
      document.body.style.setProperty('--header-offset', `${header.offsetHeight}px`);
    };

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(updateHeaderOffset);
      ro.observe(header);
    } else {
      window.addEventListener('resize', updateHeaderOffset);
    }

    window.addEventListener('load', updateHeaderOffset);
    updateHeaderOffset();
  }

  const form = document.getElementById('lead-form');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);

  // Allow CRM to inject a global object window.prefill = { fieldName: value }
  const injected = (window.prefill && typeof window.prefill === 'object') ? window.prefill : {};

  // Map URL/search parameters to form field names
  const fields = [
    'firstName','lastName','email','phone','company','trademark','jurisdiction','regNumber','contactTime','classCount','applicationNumber','status','regDate','markType'
  ];

  const mergeTargets = {
    firstName: document.querySelector('[data-merge="firstName"]'),
    applicationNumber: document.querySelector('[data-merge="applicationNumber"]'),
    status: document.querySelector('[data-merge="status"]'),
    regDate: document.querySelector('[data-merge="regDate"]'),
    trademark: document.querySelector('[data-merge="trademark"]'),
    markType: document.querySelector('[data-merge="markType"]'),
    classCount: document.querySelector('[data-merge="classCount"]'),
    jurisdiction: document.querySelector('[data-merge="jurisdiction"]'),
    registrationNumber: document.querySelector('[data-merge="registrationNumber"]'),
    heroTrademark: document.querySelector('[data-merge="heroTrademark"]'),
  };

  const linkTargets = {
    bookCall: document.querySelectorAll('[data-merge-href="bookCall"]'),
  };

  const updateMerge = (name, value, fallback = '—') => {
    const target = mergeTargets[name];
    if (!target) return;
    const textValue = value != null ? String(value).trim() : '';
    target.textContent = textValue.length ? textValue : fallback;
  };

  const setLinkTarget = (name, url) => {
    const targets = linkTargets[name];
    if (!targets || !targets.length || !url) return;
    targets.forEach((el) => {
      el.setAttribute('href', url);
    });
  };

  let paymentUrl = form.dataset.paymentUrl || '/pay';
  let bookingUrl = 'https://bookings.thetrademarkhelpline.com/#/4584810000004811044';
  setLinkTarget('bookCall', bookingUrl);

  const reflectSummary = (name, value) => updateMerge(name, value);

  const setIf = (name, val) => {
    const el = form.elements[name];
    if (el && val != null && String(val).length) {
      if (el.tagName === 'SELECT') {
        const option = Array.from(el.options).find(opt => opt.value === String(val) || opt.textContent === String(val));
        el.value = option ? option.value : val;
      } else {
        el.value = val;
      }
      const displayValue = el.tagName === 'SELECT'
        ? (el.options[el.selectedIndex]?.textContent || val)
        : val;
      reflectSummary(name, displayValue);
      if (name === 'trademark') updateMerge('heroTrademark', displayValue, 'your brand');
      if (name === 'regNumber') updateMerge('registrationNumber', displayValue, '—');
    }
  };

  fields.forEach((f) => {
    if (params.has(f)) setIf(f, params.get(f));
    if (injected[f] != null) setIf(f, injected[f]);
  });

  // Capture UTM and context
  const utm = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
  utm.forEach((u) => {
    const el = form.elements[u];
    if (el) el.value = params.get(u) || '';
  });
  if (form.elements['referrer']) form.elements['referrer'].value = document.referrer || '';
  if (form.elements['landing_path']) form.elements['landing_path'].value = location.pathname + location.search;

  // Personalized greeting + renewals list via request_id
  const requestId = params.get('request_id');
  const prefillEndpoint = form.dataset.prefillEndpoint || '/api/prefill';
  const summaryNames = ['applicationNumber','status','regDate','trademark','markType','classCount','jurisdiction'];
  const renewalsList = document.getElementById('renewals');

  const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const pick = (...values) => {
    for (const val of values) {
      if (val == null) continue;
      if (typeof val === 'string' && val.trim().length === 0) continue;
      return val;
    }
    return undefined;
  };

  const splitName = (value) => {
    if (!value || typeof value !== 'string') return { first: undefined, last: undefined };
    const parts = value.trim().split(/\s+/);
    if (!parts.length) return { first: undefined, last: undefined };
    const first = parts.shift();
    return { first, last: parts.length ? parts.join(' ') : undefined };
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };

  const renderRenewals = (items, nextDueId) => {
    if (!renewalsList) return;
    if (!Array.isArray(items) || !items.length) {
      renewalsList.innerHTML = '<li class="tm-empty">No upcoming renewals found.</li>';
      return;
    }
    renewalsList.innerHTML = items.map((tm) => {
      const regDate = pick(tm.registration_date, tm.registrationDate, tm.registered_date);
      const regDateText = regDate ? `Reg. ${formatDate(regDate)}` : null;
      const parts = [
        pick(tm.word_mark, tm.trademark, tm.word_mark_text, tm.wordMarkText),
        pick(tm.mark_type, tm.type, tm.markType),
        pick(tm.registration_number, tm.registrationNumber, tm.regNumber, tm.application_number),
        pick(tm.status, tm.currentStatus),
        regDateText,
      ].filter(Boolean).map(escapeHtml);
      const isNextDue = nextDueId && (tm.id === nextDueId || tm.trademark_id === nextDueId || tm.registration_number === nextDueId);
      return `<li${isNextDue ? ' class="next-due"' : ''}>${parts.join(' – ')}</li>`;
    }).join('');
  };

  function applyRenewalResponse(payload) {
    if (!payload || typeof payload !== 'object') return;

    const person = payload.person || {};
    const organisation = payload.organisation || {};
    const prefill = payload.prefill || {};
    const contact = prefill.contact || {};
    const trademarkPrefill = prefill.trademark || {};
    const trademarks = Array.isArray(payload.trademarks) ? payload.trademarks : [];
    const primaryFromList = trademarks[0] || {};
    const mainTrademark = Object.assign({}, primaryFromList, trademarkPrefill);

    const derivedName = splitName(person.full_name || contact.name);
    const firstName = pick(person.first_name, person.firstName, derivedName.first);
    const lastName = pick(person.last_name, person.lastName, derivedName.last);

    if (firstName) setIf('firstName', firstName);
    if (lastName) setIf('lastName', lastName);
    setIf('email', pick(person.email, contact.email));
    setIf('phone', pick(person.mobile, contact.mobile, person.alt_phone));
    setIf('company', organisation.name);
    setIf('trademark', pick(trademarkPrefill.word_mark, primaryFromList.word_mark, primaryFromList.trademark, primaryFromList.word_mark_text));
    setIf('jurisdiction', pick(trademarkPrefill.jurisdiction, primaryFromList.jurisdiction));
    setIf('regNumber', pick(trademarkPrefill.registration_number, primaryFromList.registration_number, primaryFromList.regNumber, primaryFromList.application_number));
    setIf('applicationNumber', pick(trademarkPrefill.application_number, primaryFromList.application_number, primaryFromList.registration_number));
    setIf('status', pick(trademarkPrefill.status, primaryFromList.status));
    setIf('regDate', pick(trademarkPrefill.registration_date, trademarkPrefill.registrationDate, primaryFromList.registration_date, primaryFromList.registered_date));
    setIf('markType', pick(trademarkPrefill.mark_type, trademarkPrefill.markType, primaryFromList.mark_type, primaryFromList.type));
    setIf('classCount', pick(trademarkPrefill.classes_count, primaryFromList.classes_count, Array.isArray(trademarkPrefill.classes) ? trademarkPrefill.classes.length : undefined));

    updateMerge('registrationNumber', pick(mainTrademark.registration_number, mainTrademark.regNumber, mainTrademark.application_number), '—');
    updateMerge('heroTrademark', pick(mainTrademark.word_mark, mainTrademark.trademark, mainTrademark.word_mark_text), 'your brand');

    const renewalItems = trademarks.length ? trademarks : (Object.keys(mainTrademark).length ? [mainTrademark] : []);
    renderRenewals(renewalItems, payload.next_due?.trademark_id || mainTrademark.id || mainTrademark.registration_number);

    const links = payload.links || {};
    if (links.book_call) {
      bookingUrl = links.book_call;
      setLinkTarget('bookCall', bookingUrl);
    } else {
      setLinkTarget('bookCall', bookingUrl);
    }
    if (links.pay_now) {
      paymentUrl = links.pay_now;
      form.dataset.paymentUrl = links.pay_now;
    }

    const auth = document.getElementById('authConfirm');
    if (auth && prefill.authorisations?.is_authorised_to_renew === true) {
      auth.checked = true;
    }

    const ownershipPref = prefill.changes_requested?.ownership_change;
    if (ownershipPref) {
      const radio = document.querySelector(`input[name="qOwnership"][value="${ownershipPref}"]`);
      if (radio) radio.checked = true;
    }

    const classPref = prefill.changes_requested?.classification_change;
    if (classPref) {
      const radio = document.querySelector(`input[name="qClasses"][value="${classPref}"]`);
      if (radio) radio.checked = true;
    }
  }

  async function fetchPrefill() {
    if (!requestId) return;
    try {
      const res = await fetch(`${prefillEndpoint}?request_id=${encodeURIComponent(requestId)}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Prefill fetch failed');
      const payload = await res.json();
      applyRenewalResponse(payload);
    } catch (e) {
      console.warn('Prefill fetch error', e);
      applyRenewalResponse(MOCK_RENEWAL_RESPONSE);
    }
  }

  if (requestId) {
    fetchPrefill();
  } else {
    applyRenewalResponse(MOCK_RENEWAL_RESPONSE);
  }

  // keep summary in sync with edits
  const syncFromForm = (name) => {
    const el = form.elements[name];
    if (!el) return;
    const value = el.tagName === 'SELECT'
      ? (el.options[el.selectedIndex]?.textContent || el.value)
      : el.value;
    if (summaryNames.includes(name)) {
      reflectSummary(name, value);
    }
    if (name === 'trademark') updateMerge('heroTrademark', value, 'your brand');
    if (name === 'regNumber') updateMerge('registrationNumber', value, '—');
  };

  form.addEventListener('input', (e) => {
    if (!e.target?.name) return;
    if (e.target.tagName === 'SELECT') return;
    syncFromForm(e.target.name);
  });

  form.addEventListener('change', (e) => {
    if (!e.target?.name) return;
    syncFromForm(e.target.name);
  });

  summaryNames.forEach(syncFromForm);
  syncFromForm('regNumber');

  // Basic validation + submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const missing = [];
    ['firstName','lastName','email','trademark','consent'].forEach((name) => {
      const el = form.elements[name];
      if (!el) return;
      if (el.type === 'checkbox') { if (!el.checked) missing.push(name); }
      else if (!el.value) missing.push(name);
    });
    if (missing.length) {
      alert('Please complete the required fields.');
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    // Placeholder network request; replace with your endpoint URL.
    const endpoint = form.dataset.endpoint || '/api/lead';
    form.querySelector('button[type="submit"]').disabled = true;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'renewal-landing', data })
      });
      if (!res.ok) throw new Error('Network error');
      form.innerHTML = '<div class="success"><h3>Thank you!</h3><p>We\'ll be in touch shortly to confirm your renewal details and quote.</p></div>';
    } catch (err) {
      console.error(err);
      alert('Something went wrong sending your details. Please try again, or call us.');
    } finally {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = false;
    }
  });

  // Screening flow
  const cont = document.getElementById('screening-continue');
  const note = document.getElementById('screening-note');
  if (cont) {
    cont.addEventListener('click', (e) => {
      e.preventDefault();
      const own = document.querySelector('input[name="qOwnership"]:checked')?.value;
      const cls = document.querySelector('input[name="qClasses"]:checked')?.value;
      const auth = document.getElementById('authConfirm')?.checked;
      if (!auth) {
        note.textContent = 'Please confirm you are authorised to renew this trademark.';
        return;
      }
      if (own === 'Yes' || cls === 'Yes' || own === 'Not Sure' || cls === 'Not Sure') {
        if (bookingUrl) {
          note.innerHTML = 'You indicated you may need to make changes. Please call 0161 833 5400 or email support@thetrademarkhelpline.com, or <a href="' + escapeHtml(bookingUrl) + '" target="_blank" rel="noopener">schedule a call</a>.';
        } else {
          note.textContent = 'You indicated you may need to make changes. Please call 0161 833 5400 or email support@thetrademarkhelpline.com.';
        }
        note.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }
      // Proceed to payment (pass through request_id for continuity)
      let destination = paymentUrl;
      try {
        const url = new URL(paymentUrl, location.origin);
        if (requestId) url.searchParams.set('request_id', requestId);
        destination = url.toString();
      } catch (err) {
        if (requestId) {
          const separator = paymentUrl.includes('?') ? '&' : '?';
          destination = `${paymentUrl}${separator}request_id=${encodeURIComponent(requestId)}`;
        }
      }
      location.href = destination;
    });
  }
})();
