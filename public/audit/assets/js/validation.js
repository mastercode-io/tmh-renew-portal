/**
 * Validation Rules for Audit Order Form
 * Provides client-side validation for all form sections
 */

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {Object.<string, string>} errors - Field-specific error messages
 */

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * UK phone validation (basic)
 */
const PHONE_REGEX = /^[\d\s\+\-\(\)]{10,}$/;

/**
 * URL validation regex
 */
const URL_REGEX = /^https?:\/\/.+\..+/i;

/**
 * Validate contact section (Step 1)
 */
function validateContact(data) {
  const errors = {};

  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.firstName = 'First name is required';
  }

  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.lastName = 'Last name is required';
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.phone || data.phone.trim().length === 0) {
    errors.phone = 'Phone number is required';
  } else if (!PHONE_REGEX.test(data.phone.trim())) {
    errors.phone = 'Please enter a valid phone number';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate preferences section (Step 2)
 */
function validatePreferences(data) {
  const errors = {};

  if (!data.methods || data.methods.length === 0) {
    errors.methods = 'Please select at least one contact method';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate TM status section (Step 3)
 */
function validateTmStatus(data) {
  const errors = {};

  if (!data.status || (data.status !== 'existing' && data.status !== 'new')) {
    errors.status = 'Please select trademark status';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate Temmy section (Step 4)
 * This is optional/can be skipped, so always valid
 */
function validateTemmy(data) {
  return {
    valid: true,
    errors: {}
  };
}

/**
 * Validate TM info section (Step 5)
 */
function validateTmInfo(data) {
  const errors = {};

  // Types validation
  if (!data.types || data.types.length === 0) {
    errors.types = 'Please select at least one trademark type';
  }

  // Name validation (required if Word or Both selected)
  if (data.types && (data.types.includes('Word') || data.types.includes('Both'))) {
    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Trademark name is required when Word or Both type is selected';
    }
  }

  // Jurisdictions validation
  if (!data.jurisdictions || data.jurisdictions.length === 0) {
    errors.jurisdictions = 'Please select at least one jurisdiction';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate goods & services section (Step 6)
 * Both fields are optional, but validate URL format if provided
 */
function validateGoods(data) {
  const errors = {};

  // Website is optional, but if provided must be valid URL
  if (data.website && data.website.trim().length > 0) {
    if (!URL_REGEX.test(data.website.trim())) {
      errors.website = 'Please enter a valid website URL (must start with http:// or https://)';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate billing section (Step 7)
 */
function validateBilling(data) {
  const errors = {};

  if (!data.type || (data.type !== 'Individual' && data.type !== 'Organisation')) {
    errors.type = 'Please select billing type';
  }

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Billing name is required';
  }

  // Address validation
  if (!data.address) {
    errors.address = 'Address is required';
  } else {
    if (!data.address.line1 || data.address.line1.trim().length === 0) {
      errors.addressLine1 = 'Address line 1 is required';
    }

    if (!data.address.city || data.address.city.trim().length === 0) {
      errors.addressCity = 'City/Town is required';
    }

    if (!data.address.postcode || data.address.postcode.trim().length === 0) {
      errors.addressPostcode = 'Postcode is required';
    }
  }

  // Invoice email validation
  if (!data.invoiceEmail || data.invoiceEmail.trim().length === 0) {
    errors.invoiceEmail = 'Invoice email is required';
  } else if (!EMAIL_REGEX.test(data.invoiceEmail.trim())) {
    errors.invoiceEmail = 'Please enter a valid email address';
  }

  // Invoice phone validation
  if (!data.invoicePhone || data.invoicePhone.trim().length === 0) {
    errors.invoicePhone = 'Invoice phone is required';
  } else if (!PHONE_REGEX.test(data.invoicePhone.trim())) {
    errors.invoicePhone = 'Please enter a valid phone number';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate appointment section (Step 8)
 * Always valid since both options are acceptable
 */
function validateAppointment(data) {
  return {
    valid: true,
    errors: {}
  };
}

/**
 * Validate payment options (Step 9 - Summary page)
 */
function validatePaymentOptions(data) {
  const errors = {};

  if (!data.termsAccepted) {
    errors.termsAccepted = 'You must accept the terms and conditions';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Main validation function - validates a section by name
 */
function validateSection(sectionName, data) {
  switch (sectionName) {
    case 'contact':
      return validateContact(data);

    case 'preferences':
      return validatePreferences(data);

    case 'tmStatus':
      return validateTmStatus(data);

    case 'temmy':
      return validateTemmy(data);

    case 'tmInfo':
      return validateTmInfo(data);

    case 'goods':
      return validateGoods(data);

    case 'billing':
      return validateBilling(data);

    case 'appointment':
      return validateAppointment(data);

    case 'paymentOptions':
      return validatePaymentOptions(data);

    default:
      return {
        valid: false,
        errors: { _general: 'Unknown section: ' + sectionName }
      };
  }
}

/**
 * Display validation errors in the UI
 */
function displayErrors(errors, formId = null) {
  // Clear existing errors
  document.querySelectorAll('.field-error').forEach(el => {
    el.classList.remove('visible');
    el.textContent = '';
  });

  document.querySelectorAll('input.error, select.error, textarea.error').forEach(el => {
    el.classList.remove('error');
  });

  // Display new errors
  Object.keys(errors).forEach(fieldName => {
    const errorMessage = errors[fieldName];

    // Find the error display element
    const errorEl = document.getElementById(`${fieldName}-error`) ||
                   document.querySelector(`[data-error-for="${fieldName}"]`);

    if (errorEl) {
      errorEl.textContent = errorMessage;
      errorEl.classList.add('visible');
    }

    // Mark the input as error
    const inputEl = document.getElementById(fieldName) ||
                   document.querySelector(`[name="${fieldName}"]`);

    if (inputEl) {
      inputEl.classList.add('error');
    }
  });

  // Scroll to first error
  const firstError = document.querySelector('.field-error.visible');
  if (firstError) {
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Clear all validation errors from the UI
 */
function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => {
    el.classList.remove('visible');
    el.textContent = '';
  });

  document.querySelectorAll('input.error, select.error, textarea.error').forEach(el => {
    el.classList.remove('error');
  });
}

/**
 * Helper: Sanitize input to prevent XSS
 */
function sanitizeInput(value) {
  if (typeof value !== 'string') return value;

  return value
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 500); // Limit length
}

/**
 * Helper: Sanitize all form data
 */
function sanitizeFormData(data) {
  const sanitized = {};

  Object.keys(data).forEach(key => {
    const value = data[key];

    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => typeof v === 'string' ? sanitizeInput(v) : v);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeFormData(value);
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
}
