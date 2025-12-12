/**
 * Audit Wizard Controller
 * Handles navigation, step rendering, and form submission
 */

// Initialize wizard on page load
document.addEventListener('DOMContentLoaded', () => {
  initWizard();
});

/**
 * Get persistent service description HTML (no longer needed - now in HTML)
 * Keeping function for backward compatibility but returning empty string
 */
function getServiceDescriptionHTML() {
  return ''; // Service description is now outside the card in HTML
}

function initWizard() {
  // Initialize or restore state
  const state = initState();

  // Determine starting step
  const startStep = state.currentStep || 1;

  // Clear stale token if starting from step 1 (new audit flow)
  if (startStep === 1) {
    setToken(null);
  }

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

  // Update page indicators
  updatePageIndicators(stepNumber);

  // Show/hide service description and page indicators based on step
  toggleStepUIElements(stepNumber);

  // Update button states
  updateButtonStates(stepNumber);

  // Step 3: Restore button text based on selection (after updateButtonStates)
  if (stepNumber === 3) {
    restoreStep3ButtonText();
  }

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
      html = renderStep6(); // Goods & Services (was step 6)
      break;
    case 5:
      html = renderStep7(); // Billing (was step 7)
      break;
    case 6:
      html = renderStep8(); // Payment (was step 8)
      break;
  }

  container.innerHTML = html;

  // Add event handlers for step 3 radio toggle
  if (stepNumber === 3) {
    setupStep3Toggle();
  }
}

/**
 * Step 2: Contact Preferences
 */
function renderStep2() {
  return `
    <div class="form-card">
      <p class="wizard-subtitle">If we need to contact you about your trademark audit, what are your preferred methods of contact?</p>

      <form id="preferences-form" class="wizard-form">
        <div class="audit-contact-options">
          <label class="audit-contact-option">
            <input type="checkbox" name="methods" value="Phone" checked>
            <span class="audit-option-text">Phone</span>
          </label>
          <label class="audit-contact-option">
            <input type="checkbox" name="methods" value="SMS" checked>
            <span class="audit-option-text">SMS</span>
          </label>
          <label class="audit-contact-option">
            <input type="checkbox" name="methods" value="WhatsApp" checked>
            <span class="audit-option-text">WhatsApp</span>
          </label>
          <label class="audit-contact-option">
            <input type="checkbox" name="methods" value="Email" checked>
            <span class="audit-option-text">Email</span>
          </label>
          <label class="audit-contact-option">
            <input type="checkbox" name="methods" value="Video Call" checked>
            <span class="audit-option-text">Video Call (Teams)</span>
          </label>
        </div>
        <div class="field-error" id="methods-error"></div>
      </form>
    </div>
  `;
}

/**
 * Step 3: Combined Trademark Status + Search/Application Form
 */
function renderStep3() {
  return `
    <div class="form-card">
      <div class="info-box">
        <p>Did you know that 50% of trademark applications which are done without a representative fail? Our Trademark Audit is about helping you to avoid losing money on failed applications.</p>
      </div>
      <p class="wizard-subtitle">What is the purpose of this audit, is it for a new trademark application or to review an existing registered trademark?</p>

      <form id="tmStatus-form" class="wizard-form">
        <!-- Compact Radio Buttons -->
        <div class="tm-type-selector">
          <label class="tm-type-option">
            <input type="radio" name="status" value="existing" id="status-existing">
            <div class="tm-type-content">
              <span class="tm-type-label">Existing Trademark</span>
              <span class="tm-type-desc">I have already registered my trademark</span>
            </div>
          </label>
          <label class="tm-type-option">
            <input type="radio" name="status" value="new" id="status-new">
            <div class="tm-type-content">
              <span class="tm-type-label">New Application</span>
              <span class="tm-type-desc">I'm planning to apply for a new trademark</span>
            </div>
          </label>
        </div>
        <div class="field-error" id="status-error"></div>

        <!-- Search Fields (shown when "existing" selected) -->
        <div id="existing-trademark-section" class="conditional-section" style="display: none;">
          <p class="wizard-subtitle" style="margin-top: 2rem;">Please provide the Trademark Name or the Trademark Application Number</p>
          <div class="tm-search-row">
            <div class="form-group">
              <label for="tmName">Trademark Name</label>
              <input type="text" id="tmName" name="tmName" placeholder="e.g. TECHIFY" />
            </div>
            <div class="form-group">
              <label for="tmAppNumber">Application Number</label>
              <input type="text" id="tmAppNumber" name="tmAppNumber" placeholder="e.g. UK00003456789" />
            </div>
          </div>
          <div class="field-error" id="tmSearch-error"></div>
	        </div>
	        <div id="temmy-results-container"></div>
	        <div class="field-error" id="temmySelect-error"></div>

	        <!-- Application Form (shown when "new" selected) -->
	        <div id="new-trademark-section" class="conditional-section" style="display: none;">
          <div class="form-group" style="margin-top: 2rem;">
            <label>What type of trademark application is it? <span class="required">*</span></label>
            <div class="radio-simple-list">
              <label class="radio-simple">
                <input type="radio" name="types" value="Word">
                <span class="radio-simple-label">Word Only – You want to audit the Text Only such as a company name, tagline, brand or product name</span>
              </label>
              <label class="radio-simple">
                <input type="radio" name="types" value="Image">
                <span class="radio-simple-label">Image Only – You want to audit the image only such as such as a logo or character.</span>
              </label>
              <label class="radio-simple">
                <input type="radio" name="types" value="Both">
                <span class="radio-simple-label">Both Image & Word – You want to audit both an image and a word</span>
              </label>
            </div>
            <div class="field-error" id="types-error"></div>
          </div>

          <div class="form-group">
            <label for="tmNameInput">What is the trademark name? <span class="required">*</span></label>
            <input type="text" id="tmNameInput" name="name" placeholder="e.g. TECHIFY" />
            <div class="field-error" id="name-error"></div>
          </div>

          <div class="form-group">
            <label>Do you have an image you would like to upload now?</label>
            <div class="radio-simple-list">
              <label class="radio-simple">
                <input type="radio" name="imageUpload" value="yes">
                <span class="radio-simple-label">Yes – Upload</span>
              </label>
              <label class="radio-simple">
                <input type="radio" name="imageUpload" value="later">
                <span class="radio-simple-label">I will do this later or share via email</span>
              </label>
            </div>

            <div class="file-upload-field hidden" id="image-upload-container">
              <input type="file" id="tmImageFile" name="imageFile" accept="image/*" style="display: none;" />
              <label for="tmImageFile" style="cursor: pointer; display: block;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 0.5rem;">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p style="margin: 0; font-weight: 600; color: var(--brand-pink);">Click to upload image</p>
                <p style="margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--muted);">PNG, JPG, SVG up to 10MB</p>
              </label>
              <div id="file-name-display" style="margin-top: 1rem; font-weight: 600; color: var(--brand-navy);"></div>
            </div>
          </div>

          <div class="form-group">
            <label>Jurisdictions <span class="required">*</span></label>
            <div class="audit-contact-options">
              <label class="audit-contact-option">
                <input type="checkbox" name="jurisdictions" value="Europe">
                <span class="audit-option-text">Europe</span>
              </label>
              <label class="audit-contact-option">
                <input type="checkbox" name="jurisdictions" value="Rest of Countries">
                <span class="audit-option-text">Rest of Countries</span>
              </label>
              <label class="audit-contact-option">
                <input type="checkbox" name="jurisdictions" value="United Kingdom">
                <span class="audit-option-text">United Kingdom</span>
              </label>
              <label class="audit-contact-option">
                <input type="checkbox" name="jurisdictions" value="United States of America">
                <span class="audit-option-text">United States of America</span>
              </label>
            </div>
            <div class="field-error" id="jurisdictions-error"></div>

            <div id="other-jurisdiction-field" style="display: none; margin-top: 1rem;">
              <label for="otherJurisdiction">Please specify the jurisdiction:</label>
              <input type="text" id="otherJurisdiction" name="otherJurisdiction" placeholder="Enter jurisdiction name" style="margin-top: 0.5rem;" />
              <div class="field-error" id="otherJurisdiction-error"></div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `;
}

/**
 * Setup Step 3 Toggle - Shows search or form based on selection
 */
function setupStep3Toggle() {
  const existingRadio = document.getElementById('status-existing');
  const newRadio = document.getElementById('status-new');
  const existingSection = document.getElementById('existing-trademark-section');
  const newSection = document.getElementById('new-trademark-section');

  function toggleSections() {
  if (existingRadio.checked) {
    existingSection.style.display = 'block';
    newSection.style.display = 'none';
    updateContinueButtonText('Continue');
    updateButtonStates(3);
  } else if (newRadio.checked) {
    existingSection.style.display = 'none';
    newSection.style.display = 'block';
    updateContinueButtonText('Continue');
    updateButtonStates(3);

    // Setup image upload and jurisdiction handlers for new application form
    setupImageUploadToggle();
    setupJurisdictionToggle();
  }
  }

  existingRadio.addEventListener('change', toggleSections);
  newRadio.addEventListener('change', toggleSections);

  // Check if a selection was already made (from restored state)
  if (existingRadio.checked || newRadio.checked) {
    toggleSections();
  }
}

/**
 * Update Continue Button Text
 */
function updateContinueButtonText(text) {
  const continueBtn = document.getElementById('next-btn');
  if (continueBtn) {
    continueBtn.textContent = text;
  }
}

/**
 * Restore Step 3 button text based on current selection
 * Called after updateButtonStates() to override default "Continue" text
 */
function restoreStep3ButtonText() {
  const existingRadio = document.getElementById('status-existing');
  const newRadio = document.getElementById('status-new');

  if (existingRadio?.checked) {
    updateContinueButtonText('Continue');
    updateButtonStates(3);
    renderTemmyResultsFromState();
  } else if (newRadio?.checked) {
    updateContinueButtonText('Continue');
    updateButtonStates(3);
    clearTemmyResultsUI();
  }
  // If neither is checked, keep default "Continue" from updateButtonStates()
}

/**
 * Backwards-compatible helper (was referenced in older code).
 * Controls Temmy search button visibility on Step 3.
 */
function setTemmySearchButtonVisibility(visible) {
  const searchBtn = document.getElementById('search-temmy-btn');
  if (!searchBtn) return;
  searchBtn.style.display = visible ? 'inline-flex' : 'none';
}

/**
 * Setup image upload toggle (for new application)
 */
function setupImageUploadToggle() {
  const imageUploadRadios = document.querySelectorAll('input[name="imageUpload"]');
  const uploadContainer = document.getElementById('image-upload-container');
  const fileInput = document.getElementById('tmImageFile');
  const fileNameDisplay = document.getElementById('file-name-display');

  imageUploadRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'yes') {
        uploadContainer.classList.remove('hidden');
      } else {
        uploadContainer.classList.add('hidden');
      }
    });
  });

  // File input handler
  if (fileInput) {
    fileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        fileNameDisplay.textContent = `Selected: ${this.files[0].name}`;
      }
    });
  }
}

/**
 * Setup jurisdiction toggle (for "Rest of Countries" option)
 */
function setupJurisdictionToggle() {
  const jurisdictionCheckboxes = document.querySelectorAll('input[name="jurisdictions"]');
  const otherField = document.getElementById('other-jurisdiction-field');

  jurisdictionCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const restOfCountriesChecked = Array.from(jurisdictionCheckboxes).some(
        cb => cb.value === 'Rest of Countries' && cb.checked
      );
      otherField.style.display = restOfCountriesChecked ? 'block' : 'none';
    });
  });
}

/**
 * DEPRECATED: Step 4 and 5 are now combined into Step 3
 * Keeping these functions for backward compatibility but they are no longer used
 */

/**
 * Step 6: Goods & Services
 */
function renderStep6() {
  return `
    <div class="form-card">
      <form id="goods-form" class="wizard-form">
        <div class="form-group">
          <label for="description">To give ensure your application covers all the goods and services you provide, please provide a brief description of what your company does, the more detail the better as this will ensure we do not miss any essential classes and terms for your application. (optional)</label>
          <textarea id="description" name="description" rows="4" placeholder="Describe your business and what goods/services your trademark covers..."></textarea>
        </div>

        <div class="form-group">
          <label for="website">If you have a website please provide a link… (optional)</label>
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
    <div class="form-card">
      <p style="font-size: 0.95rem; color: var(--muted); margin-bottom: 1.5rem;"><em>If we have applicant information from Temmy this can pre-populate – all can be amended.</em></p>

      <form id="billing-form" class="wizard-form">
        <div class="form-group">
          <label>Billing Type <span class="required">*</span></label>
          <div class="radio-simple-list">
            <label class="radio-simple">
              <input type="radio" name="type" value="Individual" checked>
              <span class="radio-simple-label">Individual</span>
            </label>
            <label class="radio-simple">
              <input type="radio" name="type" value="Organisation">
              <span class="radio-simple-label">Organisation</span>
            </label>
          </div>
          <div class="field-error" id="type-error"></div>
        </div>

        <!-- Name fields (dynamic based on billing type) -->
        <div id="individual-name-fields">
          <div class="form-row">
            <div class="form-group">
              <label for="billingFirstName">First Name <span class="required">*</span></label>
              <input type="text" id="billingFirstName" name="firstName" required />
              <div class="field-error" id="firstName-error"></div>
            </div>
            <div class="form-group">
              <label for="billingLastName">Last Name <span class="required">*</span></label>
              <input type="text" id="billingLastName" name="lastName" required />
              <div class="field-error" id="lastName-error"></div>
            </div>
          </div>
        </div>

        <div id="organisation-name-fields" style="display: none;">
          <div class="form-group">
            <label for="billingCompanyName">Company Name <span class="required">*</span></label>
            <input type="text" id="billingCompanyName" name="companyName" />
            <div class="field-error" id="companyName-error"></div>
          </div>
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
    <div class="form-card">
      <h3 style="font-size: 1.3rem; font-weight: 600; color: var(--brand-navy); margin-bottom: 1.5rem;">What Happens Next</h3>

      <div style="margin-bottom: 2rem;">
        <div style="margin-bottom: 1.5rem;">
          <h4 style="color: var(--brand-navy); font-size: 1.1rem; margin-bottom: 0.5rem; font-weight: 700;">Step 1 – Research</h4>
          <p style="color: var(--muted); line-height: 1.6;">Our team will carry out comprehensive searches across trademark databases in your selected jurisdictions to identify any existing marks that could conflict with yours.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <h4 style="color: var(--brand-navy); font-size: 1.1rem; margin-bottom: 0.5rem; font-weight: 700;">Step 2 – Risk Analysis</h4>
          <p style="color: var(--muted); line-height: 1.6;">We'll analyze potential conflicts, assess the strength and registrability of your trademark, and identify any legal or procedural obstacles.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <h4 style="color: var(--brand-navy); font-size: 1.1rem; margin-bottom: 0.5rem; font-weight: 700;">Step 3 – Client Consultation</h4>
          <p style="color: var(--muted); line-height: 1.6;">We'll discuss our findings and recommendations with you in a detailed consultation, answering your questions and outlining your options.</p>
        </div>
        <div class="info-box">
          <p><strong>Please Note:</strong> Instructing our Trademark Audit Service does not commit you to proceeding with a trademark application. You remain free to make your own decision based on our recommendations.</p>
        </div>
      </div>

      <p style="font-weight: 600; margin-bottom: 1rem; color: var(--brand-navy);">Would you like to schedule your appointment now?</p>
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
        if (radio) {
          radio.checked = true;

          // Trigger the toggle to show appropriate section
          const existingSection = document.getElementById('existing-trademark-section');
          const newSection = document.getElementById('new-trademark-section');

          if (sectionData.status === 'existing') {
            // Show search fields section
            if (existingSection) existingSection.style.display = 'block';
            if (newSection) newSection.style.display = 'none';
            updateContinueButtonText('Continue');
            setTemmySearchButtonVisibility(true);

            // Restore search field values
            if (sectionData.tmName) {
              const tmNameInput = document.getElementById('tmName');
              if (tmNameInput) tmNameInput.value = sectionData.tmName;
            }
            if (sectionData.tmAppNumber) {
              const tmAppNumberInput = document.getElementById('tmAppNumber');
              if (tmAppNumberInput) tmAppNumberInput.value = sectionData.tmAppNumber;
            }
            renderTemmyResultsFromState();
            updateButtonStates(3);
          } else if (sectionData.status === 'new') {
            // Show new application form section
            if (existingSection) existingSection.style.display = 'none';
            if (newSection) newSection.style.display = 'block';
            updateContinueButtonText('Continue');
            setTemmySearchButtonVisibility(false);

            // Restore application form values
            // Trademark type
            if (sectionData.types) {
              const typeRadio = document.querySelector(`input[name="types"][value="${sectionData.types}"]`);
              if (typeRadio) typeRadio.checked = true;
            }

            // Trademark name
            if (sectionData.name) {
              const nameInput = document.getElementById('tmNameInput');
              if (nameInput) nameInput.value = sectionData.name;
            }

            // Image upload choice
            if (sectionData.imageUploadChoice) {
              const imageRadio = document.querySelector(`input[name="imageUpload"][value="${sectionData.imageUploadChoice}"]`);
              if (imageRadio) {
                imageRadio.checked = true;
                if (sectionData.imageUploadChoice === 'yes') {
                  const uploadContainer = document.getElementById('image-upload-container');
                  if (uploadContainer) uploadContainer.classList.remove('hidden');
                }
              }
            }

            // Jurisdictions
            if (sectionData.jurisdictions) {
              sectionData.jurisdictions.forEach(jurisdiction => {
                const checkbox = document.querySelector(`input[name="jurisdictions"][value="${jurisdiction}"]`);
                if (checkbox) checkbox.checked = true;
              });

              // Show custom jurisdiction field if "Rest of Countries" selected
              if (sectionData.jurisdictions.includes('Rest of Countries')) {
                const otherField = document.getElementById('other-jurisdiction-field');
                if (otherField) {
                  otherField.style.display = 'block';
                  if (sectionData.otherJurisdiction) {
                    const otherInput = document.getElementById('otherJurisdiction');
                    if (otherInput) otherInput.value = sectionData.otherJurisdiction;
                  }
                }
              }
            }

            // Setup handlers for new application form
            setupImageUploadToggle();
            setupJurisdictionToggle();
            updateButtonStates(3);
          }
        }
      }
      break;

    case 4:
      // Step 4: Goods & Services
      if (sectionData.description) document.getElementById('description').value = sectionData.description;
      if (sectionData.website) document.getElementById('website').value = sectionData.website;
      break;

    case 5:
      // Step 5: Billing
      // Restore billing type
      if (sectionData.type) {
        const radio = document.querySelector(`input[name="type"][value="${sectionData.type}"]`);
        if (radio) {
          radio.checked = true;
          // Trigger the field visibility logic
          const individualFields = document.getElementById('individual-name-fields');
          const organisationFields = document.getElementById('organisation-name-fields');
          if (sectionData.type === 'Individual') {
            if (individualFields) individualFields.style.display = 'block';
            if (organisationFields) organisationFields.style.display = 'none';
          } else {
            if (individualFields) individualFields.style.display = 'none';
            if (organisationFields) organisationFields.style.display = 'block';
          }
        }
      }

      // Pre-fill name fields from contact data (Step 1)
      const contactData = state.sections.contact;

      // For Individual: pre-fill first name and last name from Step 1
      const billingFirstName = document.getElementById('billingFirstName');
      const billingLastName = document.getElementById('billingLastName');
      if (billingFirstName && !sectionData.firstName && contactData?.firstName) {
        billingFirstName.value = contactData.firstName;
      } else if (billingFirstName && sectionData.firstName) {
        billingFirstName.value = sectionData.firstName;
      }
      if (billingLastName && !sectionData.lastName && contactData?.lastName) {
        billingLastName.value = contactData.lastName;
      } else if (billingLastName && sectionData.lastName) {
        billingLastName.value = sectionData.lastName;
      }

      // For Organisation: restore company name if saved
      const billingCompanyName = document.getElementById('billingCompanyName');
      if (billingCompanyName && sectionData.companyName) {
        billingCompanyName.value = sectionData.companyName;
      }

      // Restore address fields
      if (sectionData.address) {
        if (sectionData.address.line1) document.getElementById('addressLine1').value = sectionData.address.line1;
        if (sectionData.address.line2) document.getElementById('addressLine2').value = sectionData.address.line2;
        if (sectionData.address.city) document.getElementById('addressCity').value = sectionData.address.city;
        if (sectionData.address.county) document.getElementById('addressCounty').value = sectionData.address.county;
        if (sectionData.address.postcode) document.getElementById('addressPostcode').value = sectionData.address.postcode;
        if (sectionData.address.country) document.getElementById('addressCountry').value = sectionData.address.country;
      }

      // Pre-fill invoice email/phone from contact data
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
 * Update page number indicators
 */
function updatePageIndicators(stepNumber) {
  const pageNumbers = document.querySelectorAll('.page-number');

  pageNumbers.forEach((pageNum, index) => {
    const pageIndex = index + 1;
    pageNum.classList.remove('active', 'completed');

    if (pageIndex === stepNumber) {
      pageNum.classList.add('active');
    } else if (pageIndex < stepNumber) {
      pageNum.classList.add('completed');
    }
  });
}

/**
 * Show/hide page indicators based on current step
 */
function toggleStepUIElements(stepNumber) {
  const progressSection = document.getElementById('wizard-progress-section');

  if (stepNumber === 1) {
    // Hide on Step 1
    if (progressSection) progressSection.classList.add('hidden');
  } else {
    // Show on Steps 2-8
    if (progressSection) progressSection.classList.remove('hidden');
  }
}

/**
 * Update button states
 */
function updateButtonStates(stepNumber) {
  const backBtn = document.getElementById('back-btn');
  const nextBtn = document.getElementById('next-btn');
  const searchBtn = document.getElementById('search-temmy-btn');

  // Back button visibility
  if (backBtn) {
    if (stepNumber === 1) {
      backBtn.style.display = 'none';
    } else {
      backBtn.style.display = 'inline-flex';
      backBtn.textContent = 'Go Back';
    }
  }

  // Next button text and visibility
  if (nextBtn) {
    // Reset disabled state by default; Step 3 may override.
    nextBtn.disabled = false;
    if (stepNumber === 1) {
      nextBtn.textContent = 'Begin Audit';
      nextBtn.style.display = 'inline-flex';
    } else if (stepNumber === 5) {
      // Step 5: Billing - Review order button
      nextBtn.textContent = 'Review My Order';
      nextBtn.style.display = 'inline-flex';
    } else if (stepNumber === 6) {
      // Step 6: Appointment - has custom buttons (hide next)
      nextBtn.style.display = 'none';
    } else {
      // Default for all other steps (including Step 3 - will be updated by toggle if needed)
      nextBtn.textContent = 'Continue';
      nextBtn.style.display = 'inline-flex';
    }
  }

  updateTemmyButtons(stepNumber, nextBtn, searchBtn);
}

	function updateTemmyButtons(stepNumber, nextBtn, searchBtn) {
	  if (!searchBtn || !nextBtn) return;

	  if (stepNumber !== 3) {
	    searchBtn.style.display = 'none';
	    return;
	  }

  const existingSelected = document.getElementById('status-existing')?.checked;
  const stateStatus = getSection('tmStatus')?.status;
  const isExisting = existingSelected || stateStatus === 'existing';

  if (!isExisting) {
    searchBtn.style.display = 'none';
    nextBtn.style.display = 'inline-flex';
    return;
  }

	  const temmy = getSection('temmy') || {};
	  const hasResults = Array.isArray(temmy.results?.items) && temmy.results.items.length > 0;
	  const resultCount = hasResults ? temmy.results.items.length : 0;
	  const hasSelection = !!temmy.selected;
	  const hasSearched = !!temmy.lastSearchedAt || !!temmy.query;

	  searchBtn.style.display = 'inline-flex';
	  searchBtn.textContent = hasResults || hasSearched ? 'Search Again' : 'Search on Temmy';

	  // Variant swap: if single result, Search Again becomes secondary
	  if (resultCount === 1) {
	    searchBtn.classList.remove('btn-primary', 'btn-lg');
	    if (!searchBtn.classList.contains('btn-ghost')) {
	      searchBtn.classList.add('btn-ghost');
	    }
	  } else {
	    searchBtn.classList.remove('btn-ghost');
	    if (!searchBtn.classList.contains('btn-primary')) {
	      searchBtn.classList.add('btn-primary');
	    }
	    if (!searchBtn.classList.contains('btn-lg')) {
	      searchBtn.classList.add('btn-lg');
	    }
	  }

	  if (hasResults) {
	    nextBtn.style.display = 'inline-flex';
	    nextBtn.textContent = 'Continue';
	    // Require selection only when multiple results
	    if (resultCount > 1 && !hasSelection) {
	      nextBtn.disabled = true;
	    } else {
	      nextBtn.disabled = false;
	    }
	  } else {
	    nextBtn.style.display = 'none';
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
function collectStepData(stepNumber, options = {}) {
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
      const status = statusRadio ? statusRadio.value : null;

      data = { status };

      // If "existing" trademark selected, collect search fields
      if (status === 'existing') {
        data.tmAppNumber = document.getElementById('tmAppNumber')?.value.trim() || '';
        data.tmName = document.getElementById('tmName')?.value.trim() || '';
        // If application number is present, ignore trademark name input.
        if (data.tmAppNumber) {
          data.tmName = '';
        }
      }
      // If "new" application selected, collect full form
      else if (status === 'new') {
        const imageUploadChoice = document.querySelector('input[name="imageUpload"]:checked');
        const imageFile = document.getElementById('tmImageFile')?.files[0];
        const typeRadio = document.querySelector('input[name="types"]:checked');
        const jurisdictionsChecked = Array.from(document.querySelectorAll('input[name="jurisdictions"]:checked'))
          .map(cb => cb.value);

        data.types = typeRadio ? typeRadio.value : null;
        data.name = document.getElementById('tmNameInput')?.value.trim() || '';
        data.imageUploadChoice = imageUploadChoice ? imageUploadChoice.value : null;
        data.imageFile = imageFile ? imageFile.name : null;
        data.imageFileSize = imageFile ? imageFile.size : null;
        data.jurisdictions = jurisdictionsChecked;

        // Add custom jurisdiction if "Rest of Countries" is selected
        if (jurisdictionsChecked.includes('Rest of Countries')) {
          const otherJurisdiction = document.getElementById('otherJurisdiction');
          if (otherJurisdiction) {
            data.otherJurisdiction = otherJurisdiction.value.trim();
          }
        }
      }
      break;

    case 4:
      data = {
        description: document.getElementById('description').value.trim(),
        website: document.getElementById('website').value.trim()
      };
      break;

    case 5:
      const billingTypeRadio = document.querySelector('input[name="type"]:checked');
      const billingType = billingTypeRadio ? billingTypeRadio.value : 'Individual';

      data = {
        type: billingType,
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

      // Add name fields based on billing type
      if (billingType === 'Individual') {
        data.firstName = document.getElementById('billingFirstName').value.trim();
        data.lastName = document.getElementById('billingLastName').value.trim();
      } else {
        data.companyName = document.getElementById('billingCompanyName').value.trim();
      }
      break;

    default:
      return { valid: true, data: {}, errors: {} };
  }

  // Validate
  const validation = validateSection(sectionName, data);

  // Additional validation: if existing trademark and multiple results, require selection
  if (stepNumber === 3 && data.status === 'existing' && validation.valid && !options.skipTemmySelection) {
    const temmy = getSection('temmy') || {};
    const items = temmy.results?.items || [];
    if (Array.isArray(items) && items.length > 1 && !temmy.selected) {
      validation.valid = false;
      validation.errors = { ...(validation.errors || {}), temmySelect: 'Please select a trademark from the results' };
    }
  }

  return {
    valid: validation.valid,
    data: sanitizeFormData(data),
    errors: validation.errors
  };
}

/**
 * Convert section data to lead format for API
 * Each step only sends its new/changed fields
 */
function convertToLeadFormat(sectionName, data) {
  const leadData = {};

  switch (sectionName) {
    case 'contact':
      // Step 1: Basic contact info
      leadData.first_name = data.firstName;
      leadData.last_name = data.lastName;
      leadData.email = data.email;
      leadData.phone = data.phone;
      break;

    case 'preferences':
      // Step 2: Contact preferences
      leadData.preferred_methods_of_contact = data.methods;
      break;

    case 'tmStatus':
      // Step 3: Trademark status + search/application (combined)
      leadData.trademark_status = data.status; // 'existing' or 'new'

      // If existing trademark, include search fields
      if (data.status === 'existing') {
        if (data.tmName) {
          leadData.trademark_name = data.tmName;
        }
        if (data.tmAppNumber) {
          leadData.trademark_application_number = data.tmAppNumber;
        }
      }
      // If new application, include full application form fields
      else if (data.status === 'new') {
        if (data.types) {
          leadData.trademark_types = data.types;
        }
        if (data.name) {
          leadData.trademark_name = data.name;
        }
        if (data.jurisdictions) {
          leadData.trademark_jurisdictions = data.jurisdictions;
        }
        if (data.otherJurisdiction) {
          leadData.trademark_other_jurisdiction = data.otherJurisdiction;
        }
        if (data.imageUploadChoice) {
          leadData.trademark_image_choice = data.imageUploadChoice;
        }
        if (data.imageFile) {
          leadData.trademark_image_file = data.imageFile;
        }
      }
      break;

    case 'goods':
      // Step 6: Goods and services
      if (data.description) {
        leadData.goods_description = data.description;
      }
      if (data.website) {
        leadData.website = data.website;
      }
      break;

    case 'billing':
      // Step 7: Billing information
      leadData.billing_type = data.type;

      if (data.type === 'Individual') {
        leadData.billing_first_name = data.firstName;
        leadData.billing_last_name = data.lastName;
      } else {
        leadData.billing_company_name = data.companyName;
      }

      leadData.billing_address = data.address;
      leadData.billing_invoice_email = data.invoiceEmail;
      leadData.billing_invoice_phone = data.invoicePhone;
      break;

    default:
      // For any other section, return data as-is
      return data;
  }

  return leadData;
}

/**
 * Submit step data to backend
 */
async function submitStepData(stepNumber, data) {
  const sectionName = getSectionName(stepNumber);

  showLoading();

  try {
    let response, result;

    // Steps 1-5: Use lead endpoint (incremental updates)
    if (stepNumber <= 5) {
      const token = getToken();
      const leadData = convertToLeadFormat(sectionName, data);

      const payload = {
        lead: leadData
      };

      // Include token for steps 2-5 ONLY (never on step 1)
      if (stepNumber > 1 && token) {
        payload.token = token;
      }

      response = await fetch('/api/audit/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${sectionName}`);
      }

      result = await response.json();

      // Store token from response (especially important for Step 1)
      if (result.token) {
        setToken(result.token);
      }
    }
    // Step 6+: Use order/deal endpoint
    else {
      const orderId = getOrderId();

      response = await fetch('/api/audit/update', {
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

      result = await response.json();

      // Store orderId if this is Step 8
      if (stepNumber === 8 && result.orderId) {
        setOrderId(result.orderId);
      }
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
    3: 'tmStatus', // Combined: status + search/application form
    4: 'goods',
    5: 'billing',
    6: 'appointment'
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

// Handle Step 4 buttons, Step 8 appointment buttons, and other click events
document.addEventListener('click', (e) => {
  // Step 4 buttons
  if (e.target.id === 'search-temmy-btn') {
    handleTemmySearch({ skipTemmySelection: true });
  } else if (e.target.id === 'skip-to-billing-btn') {
    handleSkipToBilling();
  }
  // Step 8 appointment buttons
  else if (e.target.id === 'schedule-appointment-btn') {
    handleScheduleAppointment();
  } else if (e.target.id === 'skip-appointment-btn') {
    handleSkipAppointment();
  } else if (e.target.closest('.temmy-expand-btn')) {
    const btn = e.target.closest('.temmy-expand-btn');
    const appNumber = btn?.dataset?.appNumber;
    if (appNumber) {
      e.preventDefault();
      e.stopPropagation();
      handleTemmyExpand(appNumber);
    }
  } else if (e.target.id === 'temmy-expand-all') {
    e.preventDefault();
    handleTemmyExpandCollapseAll(true);
  } else if (e.target.id === 'temmy-collapse-all') {
    e.preventDefault();
    handleTemmyExpandCollapseAll(false);
  }
});

// Temmy details fetch queue (sequential)
let temmyDetailQueue = [];
let temmyDetailProcessing = false;

// Step 4: Temmy Search handler
async function handleTemmySearch(options = {}) {
  const currentStep = getCurrentStep();
  if (currentStep !== 3) return;

  const { valid, data, errors } = collectStepData(3, options);

  if (!valid) {
    displayErrors(errors);
    return;
  }

  clearErrors();

  // Clear current results before re-searching
  const existingTemmy = getSection('temmy') || {};
  updateSection('temmy', {
    ...existingTemmy,
    results: { items: [] },
    details: {},
    expanded: {},
    selected: null
  });
  clearTemmyResultsUI();
  updateButtonStates(3);

  const payload = {};
  if (data.tmAppNumber) {
    payload.application_number = data.tmAppNumber;
  } else if (data.tmName) {
    payload.text = data.tmName;
  }

  showLoading();

  try {
    const response = await fetch('/api/temmy/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      const message = result?.error || 'Temmy search failed';
      throw new Error(message);
    }

    updateSection('tmStatus', data);
    const resultsData = result.data;
    const items = Array.isArray(resultsData?.items)
      ? resultsData.items
      : resultsData
        ? [resultsData]
        : [];
	    const sortedItems = sortTemmyItems(items);
	    const singleAppNumber = sortedItems.length === 1
	      ? (sortedItems[0].application_number || payload.application_number || null)
	      : null;
	    const detailSeed = payload.application_number && sortedItems.length === 1
	      ? { [payload.application_number]: sortedItems[0] }
	      : {};

	    updateSection('temmy', {
	      skipped: false,
	      selected: singleAppNumber,
	      query: payload,
	      results: { items: sortedItems },
	      details: detailSeed,
      source: result.source || 'live',
      lastSearchedAt: new Date().toISOString(),
      searchType: payload.application_number ? 'application_number' : 'text',
      expanded: {}
    });
    updateButtonStates(getCurrentStep());
    renderTemmyResultsFromState();
  } catch (err) {
    console.error('Temmy search failed', err);
    alert('Unable to search Temmy right now. Please try again.');
  } finally {
    hideLoading();
  }
}

function renderTemmyResultsFromState() {
  const container = document.getElementById('temmy-results-container');
  if (!container) return;

  const temmy = getSection('temmy');
  if (!temmy || !temmy.results || !Array.isArray(temmy.results.items)) {
    container.innerHTML = '';
    return;
  }

  const items = sortTemmyItems(temmy.results.items);

  container.innerHTML = renderTemmyResultsTable(items, temmy.details || {});
}

function clearTemmyResultsUI() {
  const container = document.getElementById('temmy-results-container');
  if (container) {
    container.innerHTML = '';
  }
}

function getApplicantName(item) {
  if (!item) return '';
  if (Array.isArray(item.applicants) && item.applicants.length > 0) {
    return item.applicants[0].name || '';
  }
  return '';
}

function sortTemmyItems(items) {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => {
    const nameA = getApplicantName(a).toLowerCase();
    const nameB = getApplicantName(b).toLowerCase();
    if (nameA && nameB && nameA !== nameB) {
      return nameA.localeCompare(nameB);
    }

    const dateA = new Date(a.expiry_date || a.expiryDate || '').getTime();
    const dateB = new Date(b.expiry_date || b.expiryDate || '').getTime();
    if (!isNaN(dateA) && !isNaN(dateB)) {
      return dateA - dateB;
    }
    if (!isNaN(dateA)) return -1;
    if (!isNaN(dateB)) return 1;
    return 0;
  });
}

	function renderTemmyResultsTable(items, detailsMap) {
	  if (!items || items.length === 0) {
	    return `
	      <div class="temmy-results">
	        <div class="temmy-results-header">
	          <h4>Search Results</h4>
	        </div>
	        <p class="muted temmy-empty-message">
	          Not found. If this is a new trademark application, please go back and select “New Application”.
	        </p>
	      </div>
	    `;
	  }

	  const temmy = getSection('temmy') || {};
	  const expandedState = temmy.expanded || {};
	  const selectedAppNumber = temmy.selected || null;

	  if (items.length === 1) {
	    const item = items[0];
	    const appNumber = item.application_number || 'N/A';
	    const name = item.verbal_element_text || 'N/A';
	    const applicantName = getApplicantName(item) || 'N/A';
	    const status = item.status || 'N/A';
	    const detail = detailsMap[appNumber] || item;
	    const detailContent = detail
	      ? renderTemmyDetailCard(detail)
	      : '<div class="tm-detail-card"><div class="detail-label">Loading details...</div></div>';

	    return `
	      <div class="temmy-results">
	        <div class="temmy-results-header">
	          <h4>Trademark Found</h4>
	        </div>
	        <div class="temmy-single-card">
	          <div class="temmy-single-header">
	            <div><span class="detail-label">Application Number</span><div class="detail-value">${appNumber}</div></div>
	            <div><span class="detail-label">Trademark</span><div class="detail-value">${name}</div></div>
	            <div><span class="detail-label">Applicant</span><div class="detail-value">${applicantName}</div></div>
	            <div><span class="detail-label">Status</span><div class="detail-value">${status}</div></div>
	          </div>
	          ${detailContent}
	        </div>
	      </div>
	    `;
	  }

	  const rows = items
	    .map(item => {
	      const appNumber = item.application_number || 'N/A';
	      const name = item.verbal_element_text || 'N/A';
	      const applicantName = getApplicantName(item) || 'N/A';
	      const status = item.status || 'N/A';
	      const detail = detailsMap[appNumber];
	      const isExpanded = expandedState[appNumber] || false;
	      const isSelected = selectedAppNumber === appNumber;
	      const detailContent = detail
	        ? renderTemmyDetailCard(detail)
	        : '<div class="tm-detail-card"><div class="detail-label">Loading details...</div></div>';

	      return `
	        <tr data-app-number="${appNumber}">
	          <td>
	            <button type="button" class="temmy-expand-btn" data-app-number="${appNumber}">
	              <span class="expand-icon">${isExpanded ? '&#8722;' : '&#43;'}</span>
	              ${appNumber}
	            </button>
	          </td>
	          <td>${name}</td>
	          <td>${applicantName}</td>
	          <td>${status}</td>
	          <td class="temmy-select-cell">
	            <input type="checkbox" class="temmy-select-checkbox" data-app-number="${appNumber}" ${isSelected ? 'checked' : ''} aria-label="Select ${appNumber}">
	          </td>
	        </tr>
	        <tr class="temmy-detail-row" data-app-number="${appNumber}" style="${isExpanded ? '' : 'display: none;'}">
	          <td colspan="5">
	            ${detailContent}
	          </td>
	        </tr>
	      `;
	    })
	    .join('');

	  return `
	    <div class="temmy-results">
	      <div class="temmy-results-header">
	        <h4>Search Results</h4>
	        <div class="temmy-results-actions">
	          <button type="button" class="btn btn-ghost btn-sm" id="temmy-expand-all">Expand all</button>
	          <button type="button" class="btn btn-ghost btn-sm" id="temmy-collapse-all">Collapse all</button>
	        </div>
	      </div>
	      <table class="temmy-table">
	        <thead>
	          <tr>
	            <th>Application Number</th>
	            <th>Trademark</th>
	            <th>Applicant</th>
	            <th>Status</th>
	            <th class="temmy-select-header">Select</th>
	          </tr>
	        </thead>
	        <tbody>
	          ${rows}
	        </tbody>
	      </table>
	    </div>
	  `;
	}

function renderTemmyDetailCard(detail) {
  if (detail && detail.error) {
    return `
      <div class="tm-detail-card">
        <div class="detail-value" style="color: #dc2626;">${detail.error}</div>
      </div>
    `;
  }

  const mark = detail.mark || {};
  const classes = Array.isArray(detail.classes) ? detail.classes : [];
  const classCount = classes.length;
  const classList = classCount > 0 ? classes.join(', ') : 'N/A';

  return `
    <div class="tm-detail-card">
      <div class="detail-grid">
        <div>
          <div class="detail-label">Application Date</div>
          <div class="detail-value">${formatDate(detail.application_date_time)}</div>
        </div>
        <div>
          <div class="detail-label">Expiry Date</div>
          <div class="detail-value">${formatDate(detail.expiry_date)}</div>
        </div>
        <div>
          <div class="detail-label">Classes</div>
          <div class="detail-value">${classList} (${classCount} ${classCount === 1 ? 'class' : 'classes'})</div>
        </div>
        <div>
          <div class="detail-label">Mark Type</div>
          <div class="detail-value">${mark.feature || detail.mark_type || 'N/A'}</div>
        </div>
      </div>
    </div>
  `;
}

function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Step 4: Skip to Billing handler
async function handleSkipToBilling() {
  // Save Step 4 as skipped
  updateSection('temmy', { skipped: true, selected: null });
  await submitStepData(4, { skipped: true, selected: null });
  // Jump directly to Step 7 (Billing)
  goToStep(7);
}

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

// Step 5: File upload handlers
document.addEventListener('change', (e) => {
  if (e.target.classList && e.target.classList.contains('temmy-select-checkbox')) {
    const appNumber = e.target.dataset.appNumber;
    const temmy = getSection('temmy') || {};
    const checked = e.target.checked;

    document.querySelectorAll('.temmy-select-checkbox').forEach(cb => {
      if (cb !== e.target) cb.checked = false;
    });

    updateSection('temmy', {
      ...temmy,
      selected: checked ? appNumber : null
    });

    updateButtonStates(getCurrentStep());
    return;
  }

  // Toggle file upload visibility based on radio selection
  if (e.target.name === 'imageUpload') {
    const container = document.getElementById('image-upload-container');
    if (container) {
      if (e.target.value === 'yes') {
        container.classList.remove('hidden');
      } else {
        container.classList.add('hidden');
      }
    }
  }

  // Display selected file name
  if (e.target.id === 'tmImageFile') {
    const file = e.target.files[0];
    if (file) {
      const display = document.getElementById('file-name-display');
      if (display) {
        display.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      }
      const container = document.getElementById('image-upload-container');
      if (container) {
        container.classList.add('has-file');
      }
    }
  }

  // Step 7: Toggle between Individual and Organisation name fields
  if (e.target.name === 'type' && e.target.closest('#billing-form')) {
    const individualFields = document.getElementById('individual-name-fields');
    const organisationFields = document.getElementById('organisation-name-fields');

    if (e.target.value === 'Individual') {
      if (individualFields) individualFields.style.display = 'block';
      if (organisationFields) organisationFields.style.display = 'none';
    } else if (e.target.value === 'Organisation') {
      if (individualFields) individualFields.style.display = 'none';
      if (organisationFields) organisationFields.style.display = 'block';
    }
  }

  // Step 5: Toggle "Rest of Countries" jurisdiction field
  if (e.target.name === 'jurisdictions' && e.target.value === 'Rest of Countries') {
    const otherField = document.getElementById('other-jurisdiction-field');
    if (otherField) {
      otherField.style.display = e.target.checked ? 'block' : 'none';
    }
  }
});

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
async function handleTemmyExpand(appNumber) {
  const temmy = getSection('temmy') || {};
  const detailsMap = temmy.details || {};

  // Toggle if already loaded
  if (detailsMap[appNumber]) {
    const detailRow = document.querySelector(`.temmy-detail-row[data-app-number="${appNumber}"]`);
    const icon = document.querySelector(`.temmy-expand-btn[data-app-number="${appNumber}"] .expand-icon`);
    const isVisible = detailRow && detailRow.style.display !== 'none';

    const newExpanded = { ...(temmy.expanded || {}) };
    newExpanded[appNumber] = !isVisible;

    if (detailRow) {
      detailRow.style.display = isVisible ? 'none' : '';
    }
    if (icon) {
      icon.innerHTML = isVisible ? '&#43;' : '&#8722;';
    }
    updateSection('temmy', {
      ...temmy,
      expanded: newExpanded
    });
    return;
  }

  // Mark expanded, render placeholder, queue fetch
  updateSection('temmy', {
    ...temmy,
    expanded: { ...(temmy.expanded || {}), [appNumber]: true }
  });
  renderTemmyResultsFromState();
  enqueueTemmyDetail(appNumber);
}

function enqueueTemmyDetail(appNumber) {
  if (!appNumber) return;
  if (!temmyDetailQueue.includes(appNumber)) {
    temmyDetailQueue.push(appNumber);
  }
  processTemmyDetailQueue();
}

async function processTemmyDetailQueue() {
  if (temmyDetailProcessing) return;
  if (temmyDetailQueue.length === 0) return;

  temmyDetailProcessing = true;
  showLoading();

  while (temmyDetailQueue.length > 0) {
    const current = temmyDetailQueue.shift();
    try {
      const response = await fetch('/api/temmy/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_number: current })
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result?.error || 'Temmy details failed');
      }

      const temmy = getSection('temmy') || {};
      const newDetails = {
        ...(temmy.details || {}),
        [current]: result.data || {}
      };

      updateSection('temmy', {
        ...temmy,
        details: newDetails,
        expanded: { ...(temmy.expanded || {}), [current]: true }
      });

      renderTemmyResultsFromState();
    } catch (err) {
      console.error('Failed to load Temmy details', err);
      const temmy = getSection('temmy') || {};
      updateSection('temmy', {
        ...temmy,
        details: {
          ...(temmy.details || {}),
          [current]: { error: 'Unable to load trademark details. Please try again.' }
        }
      });
      renderTemmyResultsFromState();
    }
  }

  hideLoading();
  temmyDetailProcessing = false;
}

function handleTemmyExpandCollapseAll(expand) {
  const temmy = getSection('temmy') || {};
  const items = temmy.results?.items || [];

  const expandedState = {};
  items.forEach(item => {
    const appNumber = item.application_number;
    if (!appNumber) return;
    expandedState[appNumber] = expand;
  });

  updateSection('temmy', {
    ...temmy,
    expanded: expandedState
  });

  renderTemmyResultsFromState();

  // If expanding, ensure details are fetched as needed
  if (expand) {
    items.forEach(item => {
      const appNumber = item.application_number;
      if (!appNumber) return;
      if (!(temmy.details && temmy.details[appNumber])) {
        handleTemmyExpand(appNumber);
      }
    });
  } else {
    // Collapse UI immediately
    renderTemmyResultsFromState();
  }
}
