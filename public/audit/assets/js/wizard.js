/**
 * Audit Wizard Controller
 * Handles navigation, step rendering, and form submission
 */

// Initialize wizard on page load
document.addEventListener('DOMContentLoaded', () => {
  initWizard();
});

function initWizard() {
  // Initialize or restore state
  const state = initState();

  // Determine starting step
  const startStep = state.currentStep || 1;

  // Show the appropriate step
  goToStep(startStep);

  // Bind button events
  setupButtonHandlers();
}

/**
 * Navigate to a specific step
 */
function goToStep(stepNumber) {
  // Update current step in state
  setCurrentStep(stepNumber);

  // Render the step
  renderStep(stepNumber);

  // Update progress bar
  updateProgressBar(stepNumber);

  // Update button states
  updateButtonStates(stepNumber);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Render a specific step
 */
function renderStep(stepNumber) {
  // Hide all steps
  document.querySelectorAll('.wizard-step').forEach(step => {
    step.classList.remove('active');
  });

  // Show target step
  const targetStep = document.getElementById(`step-${stepNumber}`);
  if (targetStep) {
    targetStep.classList.add('active');

    // Render step content if not Step 1 (Step 1 is hardcoded in HTML)
    if (stepNumber > 1) {
      renderStepContent(stepNumber, targetStep);
    }

    // Restore form values from state
    restoreFormValues(stepNumber);
  }
}

/**
 * Render step-specific content
 */
function renderStepContent(stepNumber, container) {
  let html = '';

  switch (stepNumber) {
    case 2:
      html = renderStep2();
      break;
    case 3:
      html = renderStep3();
      break;
    case 4:
      html = renderStep4();
      break;
    case 5:
      html = renderStep5();
      break;
    case 6:
      html = renderStep6();
      break;
    case 7:
      html = renderStep7();
      break;
    case 8:
      html = renderStep8();
      break;
  }

  container.innerHTML = html;
}

/**
 * Step 2: Contact Preferences
 */
function renderStep2() {
  return `
    <div class="card wizard-card">
      <h2 class="wizard-title">Applicant Information</h2>
      <p class="wizard-subtitle">If we need to contact you about your trademark audit, what are your preferred methods of contact?</p>

      <form id="preferences-form" class="wizard-form">
        <div class="checkbox-grid">
          <label class="checkbox-card">
            <input type="checkbox" name="methods" value="Phone">
            <span class="checkbox-label">Phone</span>
          </label>
          <label class="checkbox-card">
            <input type="checkbox" name="methods" value="SMS">
            <span class="checkbox-label">SMS</span>
          </label>
          <label class="checkbox-card">
            <input type="checkbox" name="methods" value="WhatsApp">
            <span class="checkbox-label">WhatsApp</span>
          </label>
          <label class="checkbox-card">
            <input type="checkbox" name="methods" value="Email">
            <span class="checkbox-label">Email</span>
          </label>
          <label class="checkbox-card">
            <input type="checkbox" name="methods" value="Video Call">
            <span class="checkbox-label">Video Call (Teams)</span>
          </label>
        </div>
        <div class="field-error" id="methods-error"></div>
      </form>
    </div>
  `;
}

/**
 * Step 3: Trademark Status
 */
function renderStep3() {
  return `
    <div class="card wizard-card">
      <h2 class="wizard-title">Trademark Information</h2>
      <div class="info-box">
        <p><strong>Did you know?</strong> Over 60% of DIY trademark applications face objections or rejections. Our audit service helps you avoid costly mistakes.</p>
      </div>
      <p class="wizard-subtitle">What is the status of your trademark?</p>

      <form id="tmStatus-form" class="wizard-form">
        <div class="radio-grid">
          <label class="radio-card">
            <input type="radio" name="status" value="existing">
            <div class="radio-content">
              <span class="radio-label">Existing Trademark – Registered</span>
              <span class="radio-description">I have already registered my trademark</span>
            </div>
          </label>
          <label class="radio-card">
            <input type="radio" name="status" value="new">
            <div class="radio-content">
              <span class="radio-label">New Application – Unregistered</span>
              <span class="radio-description">I'm planning to apply for a new trademark</span>
            </div>
          </label>
        </div>
        <div class="field-error" id="status-error"></div>
      </form>
    </div>
  `;
}

/**
 * Step 4: Existing TM Search (Conditional - Placeholder for MVP)
 */
function renderStep4() {
  return `
    <div class="card wizard-card">
      <h2 class="wizard-title">Existing Trademark Information</h2>
      <p class="wizard-subtitle">Please provide the Trademark Name and/or Application Number</p>

      <form id="temmy-form" class="wizard-form">
        <div class="form-group">
          <label for="tmName">Trademark Name</label>
          <input type="text" id="tmName" name="tmName" placeholder="e.g. TECHIFY" />
        </div>
        <div class="form-group">
          <label for="tmAppNumber">Application Number</label>
          <input type="text" id="tmAppNumber" name="tmAppNumber" placeholder="e.g. UK00003456789" />
        </div>
        <div class="info-box">
          <p><strong>Note:</strong> Trademark search integration coming soon. You can skip this step or enter details manually.</p>
        </div>
      </form>
    </div>
  `;
}

/**
 * Step 5: TM Information
 */
function renderStep5() {
  return `
    <div class="card wizard-card">
      <h2 class="wizard-title">Please provide information about the trademark we are auditing</h2>

      <form id="tmInfo-form" class="wizard-form">
        <div class="form-group">
          <label>Trademark Type <span class="required">*</span></label>
          <div class="checkbox-grid">
            <label class="checkbox-card">
              <input type="checkbox" name="types" value="Word">
              <span class="checkbox-label">Word Only</span>
            </label>
            <label class="checkbox-card">
              <input type="checkbox" name="types" value="Image">
              <span class="checkbox-label">Image Only</span>
            </label>
            <label class="checkbox-card">
              <input type="checkbox" name="types" value="Both">
              <span class="checkbox-label">Both Image & Word</span>
            </label>
          </div>
          <div class="field-error" id="types-error"></div>
        </div>

        <div class="form-group">
          <label for="tmNameInput">Trademark Name <span class="required">*</span></label>
          <input type="text" id="tmNameInput" name="name" placeholder="e.g. TECHIFY" />
          <div class="field-error" id="name-error"></div>
        </div>

        <div class="form-group">
          <label>Trademark Image</label>
          <div class="info-box">
            <p>Image upload coming soon. You can provide this via email after completing the order.</p>
          </div>
        </div>

        <div class="form-group">
          <label>Jurisdictions <span class="required">*</span></label>
          <div class="checkbox-grid">
            <label class="checkbox-card">
              <input type="checkbox" name="jurisdictions" value="United Kingdom">
              <span class="checkbox-label">United Kingdom</span>
            </label>
            <label class="checkbox-card">
              <input type="checkbox" name="jurisdictions" value="Europe">
              <span class="checkbox-label">Europe</span>
            </label>
            <label class="checkbox-card">
              <input type="checkbox" name="jurisdictions" value="United States">
              <span class="checkbox-label">United States of America</span>
            </label>
            <label class="checkbox-card">
              <input type="checkbox" name="jurisdictions" value="Canada">
              <span class="checkbox-label">Canada</span>
            </label>
            <label class="checkbox-card">
              <input type="checkbox" name="jurisdictions" value="China">
              <span class="checkbox-label">China</span>
            </label>
            <label class="checkbox-card">
              <input type="checkbox" name="jurisdictions" value="Australia">
              <span class="checkbox-label">Australia</span>
            </label>
            <label class="checkbox-card">
              <input type="checkbox" name="jurisdictions" value="New Zealand">
              <span class="checkbox-label">New Zealand</span>
            </label>
            <label class="checkbox-card">
              <input type="checkbox" name="jurisdictions" value="United Arab Emirates">
              <span class="checkbox-label">United Arab Emirates</span>
            </label>
            <label class="checkbox-card">
              <input type="checkbox" name="jurisdictions" value="Saudi Arabia">
              <span class="checkbox-label">Saudi Arabia</span>
            </label>
            <label class="checkbox-card">
              <input type="checkbox" name="jurisdictions" value="Other">
              <span class="checkbox-label">Other</span>
            </label>
          </div>
          <div class="field-error" id="jurisdictions-error"></div>
        </div>
      </form>
    </div>
  `;
}

/**
 * Step 6: Goods & Services
 */
function renderStep6() {
  return `
    <div class="card wizard-card">
      <h2 class="wizard-title">Goods & Services</h2>
      <p class="wizard-subtitle">Tell us about your business and what your trademark will be used for</p>

      <form id="goods-form" class="wizard-form">
        <div class="form-group">
          <label for="description">Business Description</label>
          <textarea id="description" name="description" rows="4" placeholder="Describe your business and what goods/services your trademark covers..."></textarea>
        </div>

        <div class="form-group">
          <label for="website">Website URL</label>
          <input type="url" id="website" name="website" placeholder="https://www.example.com" />
          <div class="field-error" id="website-error"></div>
        </div>
      </form>
    </div>
  `;
}

/**
 * Step 7: Billing Information
 */
function renderStep7() {
  return `
    <div class="card wizard-card">
      <h2 class="wizard-title">Please confirm the correct billing information</h2>

      <form id="billing-form" class="wizard-form">
        <div class="form-group">
          <label>Billing Type <span class="required">*</span></label>
          <div class="radio-grid">
            <label class="radio-card">
              <input type="radio" name="type" value="Individual">
              <div class="radio-content">
                <span class="radio-label">Individual</span>
              </div>
            </label>
            <label class="radio-card">
              <input type="radio" name="type" value="Organisation">
              <div class="radio-content">
                <span class="radio-label">Organisation</span>
              </div>
            </label>
          </div>
          <div class="field-error" id="type-error"></div>
        </div>

        <div class="form-group">
          <label for="billingName">Name <span class="required">*</span></label>
          <input type="text" id="billingName" name="name" required />
          <div class="field-error" id="name-error"></div>
        </div>

        <div class="form-group">
          <label for="addressLine1">Address Line 1 <span class="required">*</span></label>
          <input type="text" id="addressLine1" name="addressLine1" required />
          <div class="field-error" id="addressLine1-error"></div>
        </div>

        <div class="form-group">
          <label for="addressLine2">Address Line 2</label>
          <input type="text" id="addressLine2" name="addressLine2" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="addressCity">City/Town <span class="required">*</span></label>
            <input type="text" id="addressCity" name="addressCity" required />
            <div class="field-error" id="addressCity-error"></div>
          </div>
          <div class="form-group">
            <label for="addressCounty">County</label>
            <input type="text" id="addressCounty" name="addressCounty" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="addressPostcode">Postcode <span class="required">*</span></label>
            <input type="text" id="addressPostcode" name="addressPostcode" required />
            <div class="field-error" id="addressPostcode-error"></div>
          </div>
          <div class="form-group">
            <label for="addressCountry">Country</label>
            <input type="text" id="addressCountry" name="addressCountry" value="United Kingdom" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="invoiceEmail">Invoice Email <span class="required">*</span></label>
            <input type="email" id="invoiceEmail" name="invoiceEmail" required />
            <div class="field-error" id="invoiceEmail-error"></div>
          </div>
          <div class="form-group">
            <label for="invoicePhone">Invoice Phone <span class="required">*</span></label>
            <input type="tel" id="invoicePhone" name="invoicePhone" required />
            <div class="field-error" id="invoicePhone-error"></div>
          </div>
        </div>
      </form>
    </div>
  `;
}

/**
 * Step 8: Appointment
 */
function renderStep8() {
  return `
    <div class="card wizard-card">
      <h2 class="wizard-title">Trademark Audit – What Happens Next</h2>
      <p class="wizard-subtitle">Here's what to expect after placing your order:</p>

      <div style="margin-bottom: 2rem;">
        <div style="margin-bottom: 1.5rem;">
          <h3 style="color: var(--brand-navy); font-size: 1.1rem; margin-bottom: 0.5rem;">Step 1 – Research</h3>
          <p style="color: var(--muted); line-height: 1.6;">Our team will conduct comprehensive searches across trademark databases in your selected jurisdictions.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <h3 style="color: var(--brand-navy); font-size: 1.1rem; margin-bottom: 0.5rem;">Step 2 – Risk Analysis</h3>
          <p style="color: var(--muted); line-height: 1.6;">We'll analyze potential conflicts and assess the registrability of your trademark.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <h3 style="color: var(--brand-navy); font-size: 1.1rem; margin-bottom: 0.5rem;">Step 3 – Client Consultation</h3>
          <p style="color: var(--muted); line-height: 1.6;">We'll discuss our findings and recommendations in a consultation call.</p>
        </div>
        <div class="info-box">
          <p><strong>Please note:</strong> This is a one-time audit service with no ongoing obligation. You can choose to proceed with our recommendations or take a different path.</p>
        </div>
      </div>

      <p style="font-weight: 600; margin-bottom: 1rem; color: var(--brand-navy);">Would you like to schedule your consultation appointment now?</p>
      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button type="button" class="btn btn-primary" id="schedule-appointment-btn">Yes – Schedule Now</button>
        <button type="button" class="btn btn-ghost" id="skip-appointment-btn">No – I'll schedule later</button>
      </div>
    </div>
  `;
}

/**
 * Restore form values from state
 */
function restoreFormValues(stepNumber) {
  const state = getState();
  const sectionName = getSectionName(stepNumber);
  const sectionData = state.sections[sectionName];

  if (!sectionData) return;

  // Restore based on step number
  switch (stepNumber) {
    case 1:
      if (sectionData.firstName) document.getElementById('firstName').value = sectionData.firstName;
      if (sectionData.lastName) document.getElementById('lastName').value = sectionData.lastName;
      if (sectionData.email) document.getElementById('email').value = sectionData.email;
      if (sectionData.phone) document.getElementById('phone').value = sectionData.phone;
      break;

    case 2:
      if (sectionData.methods) {
        sectionData.methods.forEach(method => {
          const checkbox = document.querySelector(`input[name="methods"][value="${method}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
      break;

    case 3:
      if (sectionData.status) {
        const radio = document.querySelector(`input[name="status"][value="${sectionData.status}"]`);
        if (radio) radio.checked = true;
      }
      break;

    case 5:
      if (sectionData.types) {
        sectionData.types.forEach(type => {
          const checkbox = document.querySelector(`input[name="types"][value="${type}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
      if (sectionData.name) document.getElementById('tmNameInput').value = sectionData.name;
      if (sectionData.jurisdictions) {
        sectionData.jurisdictions.forEach(jurisdiction => {
          const checkbox = document.querySelector(`input[name="jurisdictions"][value="${jurisdiction}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
      break;

    case 6:
      if (sectionData.description) document.getElementById('description').value = sectionData.description;
      if (sectionData.website) document.getElementById('website').value = sectionData.website;
      break;

    case 7:
      if (sectionData.type) {
        const radio = document.querySelector(`input[name="type"][value="${sectionData.type}"]`);
        if (radio) radio.checked = true;
      }
      if (sectionData.name) document.getElementById('billingName').value = sectionData.name;
      if (sectionData.address) {
        if (sectionData.address.line1) document.getElementById('addressLine1').value = sectionData.address.line1;
        if (sectionData.address.line2) document.getElementById('addressLine2').value = sectionData.address.line2;
        if (sectionData.address.city) document.getElementById('addressCity').value = sectionData.address.city;
        if (sectionData.address.county) document.getElementById('addressCounty').value = sectionData.address.county;
        if (sectionData.address.postcode) document.getElementById('addressPostcode').value = sectionData.address.postcode;
        if (sectionData.address.country) document.getElementById('addressCountry').value = sectionData.address.country;
      }

      // Pre-fill invoice email/phone from contact data
      const contactData = state.sections.contact;
      if (document.getElementById('invoiceEmail').value === '' && contactData?.email) {
        document.getElementById('invoiceEmail').value = contactData.email;
      }
      if (document.getElementById('invoicePhone').value === '' && contactData?.phone) {
        document.getElementById('invoicePhone').value = contactData.phone;
      }

      if (sectionData.invoiceEmail) document.getElementById('invoiceEmail').value = sectionData.invoiceEmail;
      if (sectionData.invoicePhone) document.getElementById('invoicePhone').value = sectionData.invoicePhone;
      break;
  }
}

/**
 * Update progress bar
 */
function updateProgressBar(stepNumber) {
  document.documentElement.style.setProperty('--current-step', stepNumber);
  const label = document.getElementById('step-label');
  if (label) {
    label.textContent = `Step ${stepNumber} of 8`;
  }
}

/**
 * Update button states
 */
function updateButtonStates(stepNumber) {
  const backBtn = document.getElementById('back-btn');
  const nextBtn = document.getElementById('next-btn');

  // Back button visibility
  if (backBtn) {
    backBtn.style.display = stepNumber === 1 ? 'none' : 'inline-flex';
  }

  // Next button text
  if (nextBtn) {
    if (stepNumber === 7) {
      nextBtn.textContent = 'Review My Order';
    } else if (stepNumber === 8) {
      nextBtn.style.display = 'none'; // Step 8 has custom buttons
    } else {
      nextBtn.textContent = 'Continue';
      nextBtn.style.display = 'inline-flex';
    }
  }
}

/**
 * Setup button event handlers
 */
function setupButtonHandlers() {
  const backBtn = document.getElementById('back-btn');
  const nextBtn = document.getElementById('next-btn');

  if (backBtn) {
    backBtn.addEventListener('click', handleBackClick);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', handleNextClick);
  }
}

/**
 * Handle back button click
 */
function handleBackClick() {
  const currentStep = getCurrentStep();
  const previousStep = getPreviousStep(currentStep);
  goToStep(previousStep);
}

/**
 * Handle next button click
 */
async function handleNextClick() {
  const currentStep = getCurrentStep();

  // Collect and validate current step data
  const { valid, data, errors } = collectStepData(currentStep);

  if (!valid) {
    displayErrors(errors);
    return;
  }

  // Clear any existing errors
  clearErrors();

  // Submit to backend
  const success = await submitStepData(currentStep, data);

  if (!success) {
    return; // Error handling done in submitStepData
  }

  // Update state
  const sectionName = getSectionName(currentStep);
  updateSection(sectionName, data);

  // Initialize SalesIQ after Step 1
  if (currentStep === 1) {
    initializeSalesIQ(data);
  }

  // Navigate to next step or summary
  if (currentStep === 7) {
    // Go to summary page
    redirectToSummary();
  } else {
    const nextStep = getNextStep(currentStep);
    goToStep(nextStep);
  }
}

/**
 * Collect and validate data from current step
 */
function collectStepData(stepNumber) {
  const sectionName = getSectionName(stepNumber);
  let data = {};

  switch (stepNumber) {
    case 1:
      data = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim()
      };
      break;

    case 2:
      data = {
        methods: Array.from(document.querySelectorAll('input[name="methods"]:checked'))
          .map(cb => cb.value)
      };
      break;

    case 3:
      const statusRadio = document.querySelector('input[name="status"]:checked');
      data = {
        status: statusRadio ? statusRadio.value : null
      };
      break;

    case 4:
      data = {
        skipped: true,
        selected: null
      };
      break;

    case 5:
      data = {
        types: Array.from(document.querySelectorAll('input[name="types"]:checked'))
          .map(cb => cb.value),
        name: document.getElementById('tmNameInput').value.trim(),
        image: null,
        jurisdictions: Array.from(document.querySelectorAll('input[name="jurisdictions"]:checked'))
          .map(cb => cb.value)
      };
      break;

    case 6:
      data = {
        description: document.getElementById('description').value.trim(),
        website: document.getElementById('website').value.trim()
      };
      break;

    case 7:
      const typeRadio = document.querySelector('input[name="type"]:checked');
      data = {
        type: typeRadio ? typeRadio.value : null,
        name: document.getElementById('billingName').value.trim(),
        address: {
          line1: document.getElementById('addressLine1').value.trim(),
          line2: document.getElementById('addressLine2').value.trim(),
          city: document.getElementById('addressCity').value.trim(),
          county: document.getElementById('addressCounty').value.trim(),
          postcode: document.getElementById('addressPostcode').value.trim(),
          country: document.getElementById('addressCountry').value.trim()
        },
        invoiceEmail: document.getElementById('invoiceEmail').value.trim(),
        invoicePhone: document.getElementById('invoicePhone').value.trim()
      };
      break;

    default:
      return { valid: true, data: {}, errors: {} };
  }

  // Validate
  const validation = validateSection(sectionName, data);

  return {
    valid: validation.valid,
    data: sanitizeFormData(data),
    errors: validation.errors
  };
}

/**
 * Submit step data to backend
 */
async function submitStepData(stepNumber, data) {
  const sectionName = getSectionName(stepNumber);
  const orderId = getOrderId();

  showLoading();

  try {
    const response = await fetch('/api/audit/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        section: sectionName,
        data
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to save ${sectionName}`);
    }

    const result = await response.json();

    // Store orderId if this is Step 1
    if (stepNumber === 1 && result.orderId) {
      setOrderId(result.orderId);
    }

    hideLoading();
    return true;
  } catch (error) {
    console.error('Failed to submit step data:', error);
    hideLoading();
    alert('Failed to save your information. Please try again.');
    return false;
  }
}

/**
 * Get section name from step number
 */
function getSectionName(stepNumber) {
  const mapping = {
    1: 'contact',
    2: 'preferences',
    3: 'tmStatus',
    4: 'temmy',
    5: 'tmInfo',
    6: 'goods',
    7: 'billing',
    8: 'appointment'
  };
  return mapping[stepNumber];
}

/**
 * Redirect to summary page
 */
function redirectToSummary() {
  const orderId = getOrderId();
  window.location.href = `/audit/summary/?orderId=${orderId}`;
}

/**
 * Show loading overlay
 */
function showLoading() {
  const overlay = document.getElementById('page-loading');
  if (overlay) {
    overlay.classList.remove('hidden');
  }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  const overlay = document.getElementById('page-loading');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

// Handle Step 8 appointment buttons
document.addEventListener('click', (e) => {
  if (e.target.id === 'schedule-appointment-btn') {
    handleScheduleAppointment();
  } else if (e.target.id === 'skip-appointment-btn') {
    handleSkipAppointment();
  }
});

async function handleScheduleAppointment() {
  // Open booking link
  window.open('https://bookings.thetrademarkhelpline.com/#/4584810000004811044', '_blank');

  // Update state
  updateSection('appointment', { scheduled: true, skipped: false });

  // Submit to backend
  await submitStepData(8, { scheduled: true, skipped: false });

  // Redirect to summary
  redirectToSummary();
}

async function handleSkipAppointment() {
  // Update state
  updateSection('appointment', { scheduled: false, skipped: true });

  // Submit to backend
  await submitStepData(8, { scheduled: false, skipped: true });

  // Redirect to summary
  redirectToSummary();
}

/**
 * Initialize SalesIQ with visitor information from Step 1
 */
function initializeSalesIQ(contactData) {
  try {
    if (typeof window.$zoho === 'undefined' || !window.$zoho.salesiq) {
      console.log('[SalesIQ] Widget not loaded yet');
      return;
    }

    // Store visitor data in sessionStorage for use across pages
    if (contactData.email) {
      sessionStorage.setItem('salesiq_visitor_email', contactData.email);
    }
    if (contactData.firstName && contactData.lastName) {
      const fullName = `${contactData.firstName} ${contactData.lastName}`;
      sessionStorage.setItem('salesiq_visitor_name', fullName);
    }
    if (contactData.phone) {
      sessionStorage.setItem('salesiq_visitor_phone', contactData.phone);
    }

    // Initialize SalesIQ visitor
    $zoho.salesiq.ready = function() {
      if (contactData.firstName && contactData.lastName) {
        $zoho.salesiq.visitor.name(`${contactData.firstName} ${contactData.lastName}`);
      }

      if (contactData.email) {
        $zoho.salesiq.visitor.email(contactData.email);
      }

      if (contactData.phone) {
        $zoho.salesiq.visitor.contactnumber(contactData.phone);
      }

      console.log('[SalesIQ] Visitor initialized:', contactData.email || 'anonymous');
    };

    // Trigger ready if SalesIQ already loaded
    if (typeof $zoho.salesiq.ready === 'function') {
      $zoho.salesiq.ready();
    }
  } catch (error) {
    console.error('[SalesIQ] Failed to initialize:', error);
  }
}
