import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, ShieldCheck, Heart, Hospital, Lock } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    let authError;

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      authError = signUpError;
      if (!authError && isMounted.current) {
        setMessage('Registration successful! Please sign in if you aren\'t redirected.');
        setIsSignUp(true);
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authError = signInError;
    }

    if (isMounted.current) {
      if (authError) setError(authError.message);
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

        {message && (
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '14px' }}>
              <ShieldCheck size={18} /> {message}
            </div>
          </div>
        )}

        <form onSubmit={handleAuth}>
          <div className="form-field">
            <label className="field-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email" required className="text-input"
                style={{ paddingLeft: '40px' }} placeholder="name@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-field" style={{ marginBottom: '24px' }}>
            <label className="field-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password" required className="text-input"
                style={{ paddingLeft: '40px' }} placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>
          </div>

          {error && <p style={{ color: 'var(--accent-red)', fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn-solid" style={{ width: '100%', padding: '14px' }}>
            {loading ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Create one'}
          </button>
        </div>

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
