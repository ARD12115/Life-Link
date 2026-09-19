import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(() => {
    // Check if consent was already given
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lifelink_cookie_consent') !== 'true';
    }
    return true;
  });

  const acceptAll = () => {
    localStorage.setItem('lifelink_cookie_consent', 'true');
    setShowConsent(false);
    // Initialize analytics here
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': 'granted',
        'analytics_storage': 'granted'
      });
    }
  };

  const acceptNecessary = () => {
    localStorage.setItem('lifelink_cookie_consent', 'true');
    setShowConsent(false);
    // Only necessary cookies
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': 'denied',
        'analytics_storage': 'denied'
      });
    }
  };

  useEffect(() => {
    // Initialize consent state on load
    if (typeof window !== 'undefined') {
      const hasConsent = localStorage.getItem('lifelink_cookie_consent') === 'true';
      setShowConsent(!hasConsent);
    }
  }, []);

  if (!showConsent) {
    return null;
  }

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-content">
        <div className="cookie-consent-header">
          <h3>Cookie Policy</h3>
          <button className="cookie-consent-close" onClick={() => setShowConsent(false)}>
            ×
          </button>
        </div>
        <p className="cookie-consent-text">
          We use cookies to enhance your experience, analyze site traffic, and for marketing purposes.
          By continuing to use our site, you consent to our use of cookies.
        </p>
        <div className="cookie-consent-buttons">
          <button className="cookie-consent-btn necessary" onClick={acceptNecessary}>
            Necessary Only
          </button>
          <button className="cookie-consent-btn accept-all" onClick={acceptAll}>
            Accept All
          </button>
        </div>
        <div className="cookie-consent-links">
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          <span> | </span>
          <a href="/terms.html" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;