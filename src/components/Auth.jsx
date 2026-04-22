import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, ShieldCheck, Heart, Hospital } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (isMounted.current) {
      if (error) { setError(error.message); } else { setSent(true); }
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '80vh', justifyContent: 'center', padding: '24px' }}>
      <div className="ui-panel fade-in" style={{ maxWidth: '400px', width: '100%', padding: '48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Life Link</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Emergency Blood Matching Network</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div className="badge badge-mid" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '14px' }}>
              <ShieldCheck size={18} /> Magic Link Sent
            </div>
            <p style={{ marginTop: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
              Check your inbox to sign in securely.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="form-field">
              <label className="field-label">Medical or Donor Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email" required className="text-input"
                  style={{ paddingLeft: '40px' }} placeholder="name@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && <p style={{ color: 'var(--accent-primary)', fontSize: '12px', marginBottom: '16px' }}>{error}</p>}

            <button type="submit" disabled={loading} className="btn-solid" style={{ width: '100%', padding: '14px' }}>
              {loading ? 'Verifying...' : 'Send Magic Link'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', gap: '24px', borderTop: '1px solid var(--border-soft)', paddingTop: '32px' }}>
          <div className="flex-center" style={{ gap: '8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
            <Hospital size={14} /> Hospital
          </div>
          <div className="flex-center" style={{ gap: '8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
            <Heart size={14} /> Donor
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
