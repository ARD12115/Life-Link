import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, ShieldCheck, Heart, Hospital } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
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

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {loading ? 'Verifying...' : 'Send Magic Link'}
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
