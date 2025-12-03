/**
 * Confirmation Page - Token Validation
 * Validates that user came from successful payment flow
 */

(function() {
  'use strict';

  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');

  // Get token from sessionStorage
  const sessionToken = sessionStorage.getItem('payment_completed');

  // Validate tokens
  if (!urlToken || !sessionToken || urlToken !== sessionToken) {
    // Invalid access - redirect to landing page
    console.log('Invalid confirmation page access - redirecting to landing page');
    window.location.href = '/renewals/uk/';
    return;
  }

  // Valid access - clear the session token (one-time use)
  sessionStorage.removeItem('payment_completed');

  console.log('Confirmation page access validated successfully');
})();
