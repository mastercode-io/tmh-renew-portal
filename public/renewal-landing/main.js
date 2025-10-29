/* Prefill logic and simple client-side validation */
(function () {
  const form = document.getElementById('lead-form');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);

  // Allow CRM to inject a global object window.prefill = { fieldName: value }
  const injected = (window.prefill && typeof window.prefill === 'object') ? window.prefill : {};

  // Map URL/search parameters to form field names
  const fields = [
    'firstName','lastName','email','phone','company','trademark','jurisdiction','regNumber','contactTime'
  ];

  const setIf = (name, val) => {
    const el = form.elements[name];
    if (el && val != null && String(val).length) el.value = val;
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
  const merges = {
    firstName: document.querySelector('[data-merge="firstName"]'),
    tmeApp: document.querySelector('[data-merge="tmeApp"]'),
  };
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

      if (merges.firstName && p.firstName) merges.firstName.textContent = p.firstName;
      if (merges.tmeApp && (r.tmeApp || r.regNumber)) merges.tmeApp.textContent = r.tmeApp || r.regNumber;

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
