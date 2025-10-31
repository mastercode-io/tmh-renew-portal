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
    personName: document.querySelector('[data-merge="personName"]'),
    primaryTrademarkNumber: document.querySelector('[data-merge="primaryTrademarkNumber"]'),
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

  // Personalized greeting + renewals list via payload
  const requestId = params.get('request_id');
  const prefillEndpoint = form.dataset.prefillEndpoint || '/api/prefill';
  const summaryNames = ['applicationNumber','status','regDate','trademark','markType','classCount','jurisdiction'];
  const renewalsList = document.getElementById('renewals');
  let paymentUrl = form.dataset.paymentUrl || '/pay';
  let booking = 'https://bookings.thetrademarkhelpline.com/#/4584810000004811044';

  const splitName = (name) => {
    if (!name) return [null, null];
    const parts = String(name).trim().split(/\s+/);
    if (!parts.length) return [null, null];
    const first = parts.shift();
    const last = parts.length ? parts.join(' ') : null;
    return [first, last];
  };

  const renderRenewals = (items) => {
    if (!renewalsList) return;
    if (!items?.length) {
      renewalsList.innerHTML = '<li class="tm-empty">No upcoming renewals listed.</li>';
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sorted = items.slice().sort((a, b) => {
      const ad = a.expiry_date ? new Date(a.expiry_date) : new Date(8640000000000000);
      const bd = b.expiry_date ? new Date(b.expiry_date) : new Date(8640000000000000);
      return ad - bd;
    });
    renewalsList.innerHTML = sorted.map((it) => {
      const number = it.registration_number || it.application_number || it.id || '—';
      let expiryLabel = null;
      if (it.expiry_date) {
        const expiryDate = new Date(it.expiry_date);
        expiryDate.setHours(0, 0, 0, 0);
        const isExpired = expiryDate < today;
        expiryLabel = `${isExpired ? 'Expired' : 'Expires'} ${it.expiry_date}`;
      }
      const metaParts = [
        it.word_mark,
        it.mark_type,
        it.status,
        expiryLabel
      ].filter(Boolean).join(', ');
      const content = metaParts.length ? metaParts : '—';
      return `<li><span class="tm-number">${number}</span><span class="tm-meta">${content}</span></li>`;
    }).join('');
  };

  function applyPrefillPayload(payload) {
    if (!payload || typeof payload !== 'object') return;

    const person = payload.person || {};
    const contact = payload.prefill?.contact || {};
    const org = payload.organisation || {};
    const tmPrefill = payload.prefill?.trademark || {};
    const hasPrefillData = tmPrefill && Object.keys(tmPrefill).length > 0;
    const allMarks = Array.isArray(payload.trademarks) ? payload.trademarks.slice() : [];
    const [contactFirst, contactLast] = splitName(contact.name);
    const [personFullFirst, personFullLast] = splitName(person.full_name);

    const nextDueId = payload.next_due?.trademark_id || tmPrefill.id;
    const dueMatch = nextDueId ? allMarks.find(tm => tm.id === nextDueId) : null;
    const prefillNumber = tmPrefill.registration_number || tmPrefill.application_number;

    if (hasPrefillData && prefillNumber && !allMarks.some(tm => (tm.registration_number || tm.application_number) === prefillNumber)) {
      allMarks.unshift(tmPrefill);
    }

    const primaryTrademark = dueMatch || (hasPrefillData ? tmPrefill : null) || allMarks[0] || {};
    const heroFirstName = (person.first_name || personFullFirst || contactFirst || '').trim();
    const heroName = heroFirstName || 'there';
    const heroTrademarkNumber = prefillNumber
      || primaryTrademark.registration_number
      || primaryTrademark.application_number
      || payload.next_due?.trademark_id
      || '—';

    if (mergeTargets.personName) mergeTargets.personName.textContent = heroName;
    if (mergeTargets.primaryTrademarkNumber) mergeTargets.primaryTrademarkNumber.textContent = heroTrademarkNumber;

    const fieldValues = {
      firstName: person.first_name || contactFirst || personFullFirst,
      lastName: person.last_name || contactLast || personFullLast,
      email: contact.email || person.email,
      phone: contact.mobile || person.mobile,
      company: org.name,
      trademark: tmPrefill.word_mark || primaryTrademark.word_mark,
      jurisdiction: tmPrefill.jurisdiction || primaryTrademark.jurisdiction,
      regNumber: heroTrademarkNumber,
      classCount: tmPrefill.classes_count || primaryTrademark.classes_count || (Array.isArray(tmPrefill.classes) ? tmPrefill.classes.length : undefined),
      applicationNumber: tmPrefill.application_number || primaryTrademark.application_number,
      status: tmPrefill.status || primaryTrademark.status,
      regDate: tmPrefill.registration_date || primaryTrademark.registration_date,
      markType: tmPrefill.mark_type || primaryTrademark.mark_type
    };

    Object.entries(fieldValues).forEach(([name, value]) => {
      if (value == null || value === '') return;
      setIf(name, value);
    });

    renderRenewals(allMarks);

    if (payload.links?.book_call) {
      booking = payload.links.book_call;
      document.querySelectorAll('[data-link="bookCall"]').forEach((link) => {
        link.href = payload.links.book_call;
        link.target = '_blank';
        link.rel = 'noopener';
      });
    }
    if (payload.links?.pay_now) {
      paymentUrl = payload.links.pay_now;
      form.dataset.paymentUrl = payload.links.pay_now;
    }
  }

  async function fetchPrefill() {
    if (window.__renewalPayload) {
      applyPrefillPayload(window.__renewalPayload);
      return;
    }
    if (!requestId) return;
    try {
      const res = await fetch(`${prefillEndpoint}?request_id=${encodeURIComponent(requestId)}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Prefill fetch failed');
      const payload = await res.json();
      applyPrefillPayload(payload);
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
    ['fullName','email','phone','qOwnership','qClasses','authConfirm','consent'].forEach((name) => {
      const el = form.elements[name];
      if (!el) return;
      if (el.type === 'checkbox') { if (!el.checked) missing.push(name); }
      else if (el.type === 'radio') {
        const checked = form.querySelector(`input[name="${name}"]:checked`);
        if (!checked) missing.push(name);
      }
      else if (!el.value) missing.push(name);
    });
    if (missing.length) {
      alert('Please complete all required fields.');
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
})();

// Testimonial Carousel
(function() {
  const carousel = document.querySelector('.testimonial-carousel');
  if (!carousel) return;

  const cards = carousel.querySelectorAll('.testimonial-card');
  const dots = carousel.querySelectorAll('.dot');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');

  let currentSlide = 0;

  function showSlide(index) {
    // Remove active from all cards and dots
    cards.forEach(card => card.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Add active to current
    cards[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  }

  function nextSlide() {
    const next = (currentSlide + 1) % cards.length;
    showSlide(next);
  }

  function prevSlide() {
    const prev = (currentSlide - 1 + cards.length) % cards.length;
    showSlide(prev);
  }

  // Button clicks
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  // Dot clicks
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });

  // Auto-advance every 5 seconds
  setInterval(nextSlide, 5000);
})();
