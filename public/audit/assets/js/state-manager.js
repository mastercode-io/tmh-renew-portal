/**
 * Audit Order State Manager
 * Manages the wizard state across steps using localStorage
 */

const STORAGE_KEY = 'audit_order_state';

/**
 * Initial state template
 */
function getInitialState() {
  return {
    orderId: null,
    currentStep: 1,
    sections: {
      contact: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      },
      preferences: {
        methods: []
      },
      tmStatus: {
        status: null // 'existing' | 'new'
      },
      temmy: {
        skipped: false,
        selected: null
      },
      tmInfo: {
        types: [],
        name: '',
        image: null,
        jurisdictions: []
      },
      goods: {
        description: '',
        website: ''
      },
      billing: {
        type: null, // 'Individual' | 'Organisation'
        name: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          county: '',
          postcode: '',
          country: 'United Kingdom'
        },
        invoiceEmail: '',
        invoicePhone: ''
      },
      appointment: {
        scheduled: false,
        skipped: false
      }
    },
    metadata: {
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
  };
}

/**
 * Initialize state from localStorage or create new
 */
function initState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate structure
      if (parsed.orderId && parsed.sections) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
  }

  return getInitialState();
}

/**
 * Get current state
 */
function getState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to get state:', e);
  }

  return getInitialState();
}

/**
 * Update state and persist to localStorage
 */
function updateState(updates) {
  const currentState = getState();
  const newState = {
    ...currentState,
    ...updates,
    metadata: {
      ...currentState.metadata,
      lastUpdated: new Date().toISOString()
    }
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    return newState;
  } catch (e) {
    console.error('Failed to save state:', e);
    return currentState;
  }
}

/**
 * Update a specific section
 */
function updateSection(sectionName, sectionData) {
  const currentState = getState();

  const newState = {
    ...currentState,
    sections: {
      ...currentState.sections,
      [sectionName]: {
        ...currentState.sections[sectionName],
        ...sectionData
      }
    },
    metadata: {
      ...currentState.metadata,
      lastUpdated: new Date().toISOString()
    }
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    return newState;
  } catch (e) {
    console.error('Failed to update section:', e);
    return currentState;
  }
}

/**
 * Get the current step number
 */
function getCurrentStep() {
  const state = getState();
  return state.currentStep || 1;
}

/**
 * Get the highest completed step
 */
function getHighestCompletedStep() {
  const state = getState();
  const currentStep = state.currentStep || 1;

  // If currentStep is 1, no steps are complete yet
  // Otherwise, the highest completed step is currentStep - 1 (or currentStep if we're on a later page)
  return Math.max(1, currentStep - 1);
}

/**
 * Update the current step
 */
function setCurrentStep(stepNumber) {
  return updateState({ currentStep: stepNumber });
}

/**
 * Check if user can navigate to a specific step
 */
function canNavigateTo(targetStep) {
  const state = getState();
  const currentStep = state.currentStep || 1;

  // Can always go back to previous steps
  if (targetStep <= currentStep) {
    return true;
  }

  // Can only go forward one step at a time
  if (targetStep === currentStep + 1) {
    return true;
  }

  return false;
}

/**
 * Get section data
 */
function getSection(sectionName) {
  const state = getState();
  return state.sections[sectionName] || {};
}

/**
 * Set the order ID (received from backend after Step 1)
 */
function setOrderId(orderId) {
  return updateState({ orderId });
}

/**
 * Get the order ID
 */
function getOrderId() {
  const state = getState();
  return state.orderId;
}

/**
 * Clear all state (used after successful payment)
 */
function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to clear state:', e);
    return false;
  }
}

/**
 * Get next step number based on current step and conditional logic
 */
function getNextStep(currentStep) {
  const state = getState();

  // Step 3 (TM Status) has conditional logic
  if (currentStep === 3) {
    const tmStatus = state.sections.tmStatus?.status;

    // If "existing" trademark, show Step 4 (Temmy search)
    if (tmStatus === 'existing') {
      return 4;
    }

    // If "new" trademark, skip Step 4, go to Step 5
    if (tmStatus === 'new') {
      return 5;
    }
  }

  // Default: next step
  return currentStep + 1;
}

/**
 * Get previous step number
 */
function getPreviousStep(currentStep) {
  const state = getState();

  // If we're on Step 5 and came from Step 3 (skipped Step 4), go back to Step 3
  if (currentStep === 5) {
    const tmStatus = state.sections.tmStatus?.status;
    if (tmStatus === 'new') {
      return 3;
    }
  }

  // Default: previous step
  return Math.max(1, currentStep - 1);
}

/**
 * Check if a section is complete (has required data)
 */
function isSectionComplete(sectionName) {
  const section = getSection(sectionName);

  switch (sectionName) {
    case 'contact':
      return !!(section.firstName && section.lastName && section.email && section.phone);

    case 'preferences':
      return section.methods && section.methods.length > 0;

    case 'tmStatus':
      return !!(section.status === 'existing' || section.status === 'new');

    case 'temmy':
      // Temmy is optional / can be skipped
      return true;

    case 'tmInfo':
      return section.types && section.types.length > 0 &&
             section.jurisdictions && section.jurisdictions.length > 0;

    case 'goods':
      // Goods is optional
      return true;

    case 'billing':
      return !!(section.type && section.name && section.address?.postcode);

    case 'appointment':
      return true; // Appointment is always optional

    default:
      return false;
  }
}

/**
 * Export state as JSON for debugging
 */
function exportState() {
  return JSON.stringify(getState(), null, 2);
}
