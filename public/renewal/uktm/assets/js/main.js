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

  let prefillState = { contact: {}, trademark: {}, heroTrademarkNumber: null };

  const mergeTargets = {
    personName: document.querySelector('[data-merge="personName"]'),
    primaryTrademarkNumber: document.querySelector('[data-merge="primaryTrademarkNumber"]'),
    applicationNumber: document.querySelector('[data-merge="applicationNumber"]'),
    status: document.querySelector('[data-merge="status"]'),
    regDate: document.querySelector('[data-merge="regDate"]'),
    trademark: document.querySelector('[data-merge="trademark"]'),
    markType: document.querySelector('[data-merge="markType"]'),
    classCountLabel: document.querySelector('[data-merge="classCountLabel"]'),
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
      if (name === 'classCount') {
        if (mergeTargets.classCountLabel) {
          mergeTargets.classCountLabel.textContent = formatClassCountLabel(val, null);
        }
      }
    }
  };

  const normaliseClassEntries = (classes) => {
    if (classes == null) return [];
    const arr = Array.isArray(classes) ? classes : [classes];
    return arr
      .map((entry) => {
        if (entry == null) return null;
        if (typeof entry === 'object') {
          if (entry.nice != null) return entry.nice;
          if (entry.code != null) return entry.code;
          if (entry.class != null) return entry.class;
          if (entry.number != null) return entry.number;
        }
        return entry;
      })
      .map((value) => {
        if (value == null) return null;
        const text = String(value).trim();
        return text.length ? text : null;
      })
      .filter(Boolean);
  };

  const formatClassCountLabel = (count, classes) => {
    if (count != null && count !== '') return String(count);
    const fallback = normaliseClassEntries(classes).length;
    return fallback ? String(fallback) : '—';
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
  const token = params.get('token');
  const prefillEndpoint = form.dataset.prefillEndpoint || '/api/renewal/details';
  const summaryNames = ['applicationNumber','status','regDate','trademark','markType','jurisdiction'];
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

  const toTrimmedString = (value) => (value == null ? '' : String(value).trim());

  const base64EncodeJson = (value) => {
    try {
      const json = JSON.stringify(value);
      return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
    } catch (error) {
      console.error('Failed to base64 encode JSON', error);
      throw error;
    }
  };

  const buildOrderUrl = (orderData) => {
    try {
      const encoded = base64EncodeJson(orderData);
      return `/uktm/order.html?order=${encodeURIComponent(encoded)}`;
    } catch (error) {
      return '/uktm/order.html';
    }
  };

  const persistOrderData = (orderData) => {
    try {
      localStorage.setItem('renewal_order', JSON.stringify(orderData));
    } catch (error) {
      console.warn('Unable to persist order data', error);
    }
  };

  function applyPrefillPayload(payload) {
    if (!payload || typeof payload !== 'object') return;

    // New structure uses account, contact, trademark (singular), next_due (array)
    const account = payload.account || {};
    const contact = payload.contact || {};
    const trademark = payload.trademark || {};
    const nextDue = Array.isArray(payload.next_due) ? payload.next_due : [];

    // Build full name from contact
    let fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || '';
    if (!contact.first_name || !contact.last_name) {
      const [derivedFirst, derivedLast] = splitName(fullName || contact.name);
      contact.first_name = contact.first_name || derivedFirst || '';
      contact.last_name = contact.last_name || derivedLast || '';
      fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || fullName;
    }
    const heroFirstName = (contact.first_name || '').trim();
    const heroName = heroFirstName || 'there';

    // Primary trademark number from the main trademark object
    const heroTrademarkNumber = trademark.registration_number
      || trademark.application_number
      || trademark.id
      || '—';

    prefillState = {
      account,
      contact,
      trademark,
      heroTrademarkNumber
    };

    // Update hero section
    if (mergeTargets.personName) mergeTargets.personName.textContent = heroName;
    if (mergeTargets.primaryTrademarkNumber) mergeTargets.primaryTrademarkNumber.textContent = heroTrademarkNumber;

    // Update hero trademark info card
    const heroTmName = document.querySelector('[data-merge="heroTrademarkName"]');
    const heroTmNumber = document.querySelector('[data-merge="heroTrademarkNumber"]');
    const heroRegDate = document.querySelector('[data-merge="heroRegDate"]');
    const heroExpiryDate = document.querySelector('[data-merge="heroExpiryDate"]');
    const heroMarkType = document.querySelector('[data-merge="heroMarkType"]');
    const heroStatus = document.querySelector('[data-merge="heroStatus"]');
    const heroClassCount = document.querySelector('[data-merge="heroClassCount"]');
    const heroTmImageContainer = document.getElementById('hero-tm-image');
    const heroTmImg = document.getElementById('hero-tm-img');

    if (heroTmName) heroTmName.textContent = trademark.word_mark || '—';
    if (heroTmNumber) heroTmNumber.textContent = heroTrademarkNumber;

    if (heroRegDate) {
      const regDate = trademark.registration_date;
      if (regDate) {
        const date = new Date(regDate);
        const formatted = date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        heroRegDate.textContent = formatted;
      } else {
        heroRegDate.textContent = '—';
      }
    }

    if (heroExpiryDate) {
      const expiryDate = trademark.expiry_date || trademark.next_renewal_date;
      if (expiryDate) {
        // Format date nicely (e.g., "9 June 2025")
        const date = new Date(expiryDate);
        const formatted = date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        heroExpiryDate.textContent = formatted;
      } else {
        heroExpiryDate.textContent = '—';
      }
    }

    if (heroMarkType) heroMarkType.textContent = trademark.mark_type || '—';
    if (heroStatus) heroStatus.textContent = trademark.status || '—';

    if (heroClassCount) {
      const count = trademark.classes_count || (Array.isArray(trademark.classes) ? trademark.classes.length : null);
      heroClassCount.textContent = count ? `${count} ${count === 1 ? 'class' : 'classes'}` : '—';
    }

    // Show trademark image if available
    if (trademark.image_url && heroTmImageContainer && heroTmImg) {
      heroTmImg.src = trademark.image_url;
      heroTmImg.alt = trademark.word_mark || 'Trademark logo';
      heroTmImageContainer.style.display = 'block';
    }

    // Get classes data
    const classes = trademark.classes;
    const classesCount = trademark.classes_count || (Array.isArray(classes) ? classes.length : undefined);

    // Populate form fields with trademark and contact data
    const fieldValues = {
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      phone: contact.mobile,
      company: account.name,
      trademark: trademark.word_mark,
      jurisdiction: trademark.jurisdiction,
      regNumber: heroTrademarkNumber,
      classCount: classesCount,
      applicationNumber: trademark.application_number,
      status: trademark.status,
      regDate: trademark.registration_date,
      markType: trademark.mark_type
    };

    Object.entries(fieldValues).forEach(([name, value]) => {
      if (value == null || value === '') return;
      setIf(name, value);
    });

    // Special handling for classes count
    if (mergeTargets.classCountLabel) {
      mergeTargets.classCountLabel.textContent = formatClassCountLabel(classesCount, classes);
    }

    // Prefill contact fields in the form
    const firstNameField = document.getElementById('firstName');
    const lastNameField = document.getElementById('lastName');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');

    if (firstNameField && contact.first_name) firstNameField.value = contact.first_name;
    if (lastNameField && contact.last_name) lastNameField.value = contact.last_name;
    if (emailField && contact.email) emailField.value = contact.email;
    if (phoneField && contact.mobile) phoneField.value = contact.mobile;

    // Handle trademark image display
    const trademarkImageContainer = document.getElementById('trademark-image-container');
    const trademarkImage = document.getElementById('trademark-image');
    if (trademark.image_url && trademarkImage && trademarkImageContainer) {
      trademarkImage.src = trademark.image_url;
      trademarkImage.alt = trademark.word_mark || 'Trademark logo';
      trademarkImageContainer.style.display = 'block';
    } else if (trademarkImageContainer) {
      trademarkImageContainer.style.display = 'none';
    }

    // Render renewals list - show only next_due trademarks (not including the main one being renewed)
    renderRenewals(nextDue);

    // Handle links
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
    if (payload.links?.terms_conditions) {
      document.querySelectorAll('[data-link="termsConditions"]').forEach((link) => {
        link.href = payload.links.terms_conditions;
        link.target = '_blank';
        link.rel = 'noopener';
      });
    }
    if (payload.links?.manage_prefs) {
      document.querySelectorAll('[data-link="managePrefs"]').forEach((link) => {
        link.href = payload.links.manage_prefs;
        link.target = '_blank';
        link.rel = 'noopener';
      });
    }
  }

  function showErrorBanner(message) {
    const errorBanner = document.getElementById('token-error-banner');
    const errorMessage = document.getElementById('error-banner-message');
    const mainContent = document.getElementById('main');

    if (errorBanner) {
      errorBanner.classList.remove('hidden');
      if (errorMessage && message) {
        errorMessage.innerHTML = message;
      }
    }

    // Hide main content when error is shown
    if (mainContent) {
      mainContent.style.display = 'none';
    }
  }

  async function fetchPrefill() {
    const loadingOverlay = document.getElementById('page-loading');

    // Show loading overlay if fetching from API
    const needsLoading = !window.__renewalPayload && token;
    if (needsLoading && loadingOverlay) {
      loadingOverlay.classList.remove('hidden');
    }

    try {
      if (window.__renewalPayload) {
        applyPrefillPayload(window.__renewalPayload);
        return;
      }

      // Check if token is missing - show error banner
      if (!token) {
        showErrorBanner('To access your trademark renewal details, please use the exact link provided in your email.<br>This ensures your information is securely loaded.');
        return;
      }

      const res = await fetch(`${prefillEndpoint}?token=${encodeURIComponent(token)}`, { credentials: 'include' });
      if (!res.ok) {
        // Token is invalid or expired
        showErrorBanner('This link has expired or is invalid.<br>Please use the link from your most recent email, or contact us for assistance.');
        return;
      }
      const payload = await res.json();
      applyPrefillPayload(payload);
    } catch (e) {
      console.warn('Prefill fetch error', e);
      showErrorBanner('We encountered an error loading your renewal details.<br>Please try again or contact support@thetrademarkhelpline.com for assistance.');
    } finally {
      // Hide loading overlay
      if (loadingOverlay) {
        setTimeout(() => {
          loadingOverlay.classList.add('hidden');
        }, 300);
      }
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

  // Handle screening questions to show/hide contact fields and buttons
  const handleScreeningQuestions = () => {
    const ownership = form.querySelector('input[name="qOwnership"]:checked');
    const classes = form.querySelector('input[name="qClasses"]:checked');

    const contactFields = document.getElementById('contact-fields');
    const authSection = document.getElementById('auth-section');
    const submitSection = document.getElementById('submit-section');
    const screeningNote = document.getElementById('screening-note');

    // Check if at least one question has "Yes" or "Not Sure" selected
    const ownershipNeedsReview = ownership && ownership.value !== 'No';
    const classesNeedsReview = classes && classes.value !== 'No';

    if (ownershipNeedsReview || classesNeedsReview) {
      // Show screening note with book call button immediately
      contactFields.style.display = 'none';
      authSection.style.display = 'none';
      submitSection.style.display = 'none';
      screeningNote.style.display = 'block';
      return;
    }

    // Only show contact fields if both questions are answered and both are "No"
    if (ownership && classes && ownership.value === 'No' && classes.value === 'No') {
      contactFields.style.display = 'block';
      authSection.style.display = 'block';
      submitSection.style.display = 'block';
      screeningNote.style.display = 'none';
    } else {
      // If questions not fully answered yet, hide everything
      contactFields.style.display = 'none';
      authSection.style.display = 'none';
      submitSection.style.display = 'none';
      screeningNote.style.display = 'none';
    }
  };

  // Add event listeners to screening questions
  const ownershipRadios = form.querySelectorAll('input[name="qOwnership"]');
  const classesRadios = form.querySelectorAll('input[name="qClasses"]');

  ownershipRadios.forEach(radio => {
    radio.addEventListener('change', handleScreeningQuestions);
  });

  classesRadios.forEach(radio => {
    radio.addEventListener('change', handleScreeningQuestions);
  });

  // Clear error for a specific field
  const clearError = (fieldId) => {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);

    if (field) {
      field.classList.remove('error');
      // For checkboxes, clear error from parent label
      if (field.type === 'checkbox') {
        const checkLabel = field.closest('.check');
        if (checkLabel) checkLabel.classList.remove('error');
      }
    }
    if (errorEl) {
      errorEl.classList.remove('visible');
      errorEl.textContent = '';
    }
  };

  // Show error for a specific field
  const showError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);

    if (field) {
      field.classList.add('error');
      // For checkboxes, add error to parent label
      if (field.type === 'checkbox') {
        const checkLabel = field.closest('.check');
        if (checkLabel) checkLabel.classList.add('error');
      }
    }
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  };

  // Clear errors when user interacts with fields
  ['firstName', 'lastName', 'email', 'phone'].forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', () => clearError(fieldId));
    }
  });

  ['authConfirm', 'consent'].forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('change', () => clearError(fieldId));
    }
  });

  // Basic validation + submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear all previous errors
    ['firstName', 'lastName', 'email', 'phone', 'authConfirm', 'consent'].forEach(clearError);

    let hasErrors = false;

    // Validate name
    const firstNameInput = document.getElementById('firstName');
    if (firstNameInput && firstNameInput.offsetParent !== null) {
      if (!firstNameInput.value.trim()) {
        showError('firstName', 'Please provide your first name');
        hasErrors = true;
      }
    }

    const lastNameInput = document.getElementById('lastName');
    if (lastNameInput && lastNameInput.offsetParent !== null) {
      if (!lastNameInput.value.trim()) {
        showError('lastName', 'Please provide your last name');
        hasErrors = true;
      }
    }

    // Validate email
    const email = document.getElementById('email');
    if (email && email.offsetParent !== null) {
      if (!email.value.trim()) {
        showError('email', 'Please provide your email address');
        hasErrors = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        showError('email', 'Please provide a valid email address');
        hasErrors = true;
      }
    }

    // Validate phone
    const phone = document.getElementById('phone');
    if (phone && phone.offsetParent !== null) {
      if (!phone.value.trim()) {
        showError('phone', 'Please provide your mobile number');
        hasErrors = true;
      }
    }

    // Validate authorization checkbox
    const authConfirm = document.getElementById('authConfirm');
    if (authConfirm && authConfirm.offsetParent !== null) {
      if (!authConfirm.checked) {
        showError('authConfirm', 'You must confirm you are authorised to renew this trademark');
        hasErrors = true;
      }
    }

    // Validate consent checkbox
    const consent = form.elements.consent;
    if (consent && consent.offsetParent !== null) {
      if (!consent.checked) {
        showError('consent', 'You must agree to be contacted about your renewal');
        hasErrors = true;
      }
    }

    if (hasErrors) {
      return;
    }

    const rawFormData = Object.fromEntries(new FormData(form).entries());
    const contactPrefill = prefillState.contact || {};
    const firstNamePrefill = contactPrefill.first_name || '';
    const lastNamePrefill = contactPrefill.last_name || '';
    const emailPrefill = contactPrefill.email || '';
    const phonePrefill = contactPrefill.mobile || contactPrefill.phone || '';
    const heroNumber = prefillState.heroTrademarkNumber;
    const normalizedHeroNumber = heroNumber && heroNumber !== '—' ? heroNumber : '';
    const trademarkPrefill = normalizedHeroNumber
      || prefillState.trademark?.registration_number
      || prefillState.trademark?.application_number
      || prefillState.trademark?.id
      || rawFormData.regNumber
      || '';

    const data = {
      first_name: toTrimmedString(rawFormData.firstName) || toTrimmedString(firstNamePrefill),
      last_name: toTrimmedString(rawFormData.lastName) || toTrimmedString(lastNamePrefill),
      email: toTrimmedString(rawFormData.email) || toTrimmedString(emailPrefill),
      phone: toTrimmedString(rawFormData.phone) || toTrimmedString(phonePrefill),
      trademark_number: toTrimmedString(trademarkPrefill)
    };

    // Placeholder network request; replace with your endpoint URL.
    const endpoint = form.dataset.endpoint || '/api/renewal/order';
    const submitBtn = form.querySelector('button[type="submit"]');

    // Add loading state to button
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-text"><span class="spinner"></span>Processing your renewal...</span>';

    try {
      const payload = {
        token,
        source: 'renewal-landing',
        type: 'lead',
        data
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Network error');

      const orderSummary = await res.json();
      if (!orderSummary || typeof orderSummary !== 'object' || orderSummary.error) {
        const errMsg = typeof orderSummary?.error === 'string' ? orderSummary.error : 'Invalid order response';
        throw new Error(errMsg);
      }

      persistOrderData(orderSummary);
      window.location.href = buildOrderUrl(orderSummary);
    } catch (err) {
      console.error(err);
      alert('Something went wrong sending your details. Please try again, or call us.');
    } finally {
      // Only restore button if still on page (not redirected)
      if (submitBtn) {
        submitBtn.classList.remove('btn-loading');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
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
