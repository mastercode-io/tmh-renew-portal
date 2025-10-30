/* Prefill logic and simple client-side validation */
(function () {
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
    tmeApp: document.querySelector('[data-merge="tmeApp"]'),
    applicationNumber: document.querySelector('[data-merge="applicationNumber"]'),
    status: document.querySelector('[data-merge="status"]'),
    regDate: document.querySelector('[data-merge="regDate"]'),
    trademark: document.querySelector('[data-merge="trademark"]'),
    markType: document.querySelector('[data-merge="markType"]'),
    classCount: document.querySelector('[data-merge="classCount"]'),
    jurisdiction: document.querySelector('[data-merge="jurisdiction"]'),
  };

  const reflectSummary = (name, value) => {
    const target = mergeTargets[name];
    if (!target) return;
    const text = (value != null && String(value).trim().length) ? String(value).trim() : '—';
    target.textContent = text;
  };

  const setIf = (name, val) => {
    const el = form.elements[name];
    if (el && val != null && String(val).length) {
      if (el.tagName === 'SELECT') {
        const option = Array.from(el.options).find(opt => opt.value === String(val) || opt.textContent === String(val));
        el.value = option ? option.value : val;
      } else {
        el.value = val;
      }
      reflectSummary(name, el.tagName === 'SELECT' ? el.options[el.selectedIndex]?.textContent || val : val);
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

  async function fetchPrefill() {
    if (!requestId) return;
    try {
      const res = await fetch(`${prefillEndpoint}?request_id=${encodeURIComponent(requestId)}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Prefill fetch failed');
      const payload = await res.json();
      // Expected shape (example):
      // {
      //   person: { firstName, lastName, email, phone, company },
      //   renewal: { tmeApp, jurisdiction, regNumber, trademark },
      //   renewals: [{ trademark, type, status, regDate, regNumber, jurisdiction }]
      // }

      const p = payload.person || {};
      const r = payload.renewal || {};
      Object.entries({
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        company: p.company,
        trademark: r.trademark,
        jurisdiction: r.jurisdiction,
        regNumber: r.regNumber,
      }).forEach(([k, v]) => setIf(k, v));

      if (mergeTargets.firstName && p.firstName) mergeTargets.firstName.textContent = p.firstName;
      if (mergeTargets.tmeApp && (r.tmeApp || r.regNumber)) mergeTargets.tmeApp.textContent = r.tmeApp || r.regNumber;

      const detailPrefill = {
        applicationNumber: r.tmeApp || r.applicationNumber || r.appNumber || r.tmAppNumber || r.regNumber,
        status: r.status || r.tmStatus || r.tm_status || r.currentStatus,
        regDate: r.regDate || r.registrationDate || r.registeredDate || r.registration_date,
        trademark: r.trademark || r.wordMark || r.word_mark_text || r.wordMarkText,
        markType: r.tmType || r.tm_type || r.type || r.markType,
        classCount: r.classCount || r.numberOfClasses || r.classificationNo || r.classificationNumber || r.tmNumberOfClasses,
        jurisdiction: r.jurisdiction || r.country,
      };

      Object.entries(detailPrefill).forEach(([key, value]) => {
        if (value == null || String(value).length === 0) return;
        if (form.elements[key]) {
          setIf(key, value);
        } else {
          reflectSummary(key, value);
        }
      });

      summaryNames.forEach((name) => {
        if (!detailPrefill[name]) {
          const el = form.elements[name];
          if (el) reflectSummary(name, el.tagName === 'SELECT' ? el.options[el.selectedIndex]?.textContent || el.value : el.value);
        }
      });

      const items = Array.isArray(payload.renewals) ? payload.renewals : (r.trademark ? [r] : []);
      if (renewalsList && items.length) {
        renewalsList.innerHTML = items.map(it => {
          const left = `${it.trademark || ''} ${it.type ? '– ' + it.type : ''}`.trim();
          const right = `${it.status || ''}${it.regDate ? ' · ' + it.regDate : ''}`.trim();
          return `<li><span>${left}</span><small>${right}</small></li>`;
        }).join('');
      }
    } catch (e) {
      console.warn('Prefill fetch error', e);
    }
  }
  fetchPrefill();

  // keep summary in sync with edits
  const syncFromForm = (name) => {
    if (!summaryNames.includes(name)) return;
    const el = form.elements[name];
    if (!el) return;
    const value = el.tagName === 'SELECT'
      ? (el.options[el.selectedIndex]?.textContent || el.value)
      : el.value;
    reflectSummary(name, value);
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
  const paymentUrl = form.dataset.paymentUrl || '/pay';
  const booking = 'https://bookings.thetrademarkhelpline.com/#/4584810000004811044';
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
        note.innerHTML = 'You indicated you may need to make changes. Please call 0161 833 5400 or email support@thetrademarkhelpline.com, or <a href="' + booking + '" target="_blank" rel="noopener">schedule a call</a>.';
        note.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }
      // Proceed to payment (pass through request_id for continuity)
      const url = new URL(paymentUrl, location.origin);
      if (requestId) url.searchParams.set('request_id', requestId);
      location.href = url.toString();
    });
  }
})();
