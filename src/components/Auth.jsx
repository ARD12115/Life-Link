import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, ShieldCheck, Heart, Hospital } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [lastAttempt, setLastAttempt] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Rate limiting check (60 second cooldown)
    const now = Date.now();
    const secondsSinceLastAttempt = Math.floor((now - lastAttempt) / 1000);
    
    if (lastAttempt && secondsSinceLastAttempt < 60) {
      const remaining = 60 - secondsSinceLastAttempt;
      setError(`Please wait ${remaining} second${remaining !== 1 ? 's' : ''} before trying again`);
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
      setLastAttempt(now);
      
      // Countdown timer
      let remaining = 60;
      setCooldownSeconds(remaining);
      const interval = setInterval(() => {
        remaining--;
        setCooldownSeconds(remaining);
        if (remaining <= 0) clearInterval(interval);
      }, 1000);
    }
    setLoading(false);
  };

  return (
    <div className="flex-center" style={{ minHeight: '80vh', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel modal-content" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="logo-dot" style={{ margin: '0 auto 16px' }} />
          <h2 className="logo-text" style={{ fontSize: '28px' }}>Life Link</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
            Secure login for Hospitals & Donors
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div className="confirm-banner banner-success" style={{ justifyContent: 'center', padding: '20px' }}>
              <ShieldCheck size={24} />
              <div style={{ fontSize: '16px' }}>Magic link sent!</div>
            </div>
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
              Check your email to sign in safely.
            </p>
            {cooldownSeconds > 0 && (
              <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--blood-ruby)' }}>
                ⏱️ Can request another link in {cooldownSeconds} second{cooldownSeconds !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="form-field">
              <label className="field-label">Medical / Donor Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  required
                  className="premium-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p style={{ color: 'var(--blood-ruby)', fontSize: '12px', marginBottom: '16px' }}>
                {error}
              </p>
            )}

            <button 
              type="submit" 
              disabled={loading || (lastAttempt && cooldownSeconds > 0)} 
              className="btn-primary" 
              style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '8px',
                opacity: (lastAttempt && cooldownSeconds > 0) ? 0.6 : 1
              }}
            >
              {loading ? 'Verifying...' : cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : 'Send Magic Link'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
          <div className="flex-center" style={{ gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <Hospital size={14} /> Hospital
          </div>
          <div className="flex-center" style={{ gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <Heart size={14} /> Donor
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
