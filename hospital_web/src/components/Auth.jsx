import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, Heart, Hospital, Lock } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleAuth = async e => {
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
        setMessage("Registration successful! Please sign in if you aren't redirected.");
        setIsSignUp(false);
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authError = signInError;
      if (!authError) navigate('/hospital');
    }

    if (isMounted.current) {
      if (authError) setError(authError.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container fade-in">
      <div className="auth-left">
        <ShieldCheck size={64} style={{ marginBottom: '24px' }} />
        <h1 style={{ fontSize: '48px', marginBottom: '16px', lineHeight: 1.1 }}>
          LifeLink
          <br />
          Medical Network
        </h1>
        <p style={{ fontSize: '20px', opacity: 0.9, maxWidth: '400px', lineHeight: 1.5 }}>
          Authorized access portal for verified hospitals and blood banks. Join the real-time
          emergency network.
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-panel fade-in">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Facility Portal</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Authorized Personnel Only
              </p>
            </div>

            {message && (
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div
                  className="badge badge-low"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                  }}
                >
                  <ShieldCheck size={18} /> {message}
                </div>
              </div>
            )}

            <form onSubmit={handleAuth}>
              <div className="form-field">
                <label className="field-label">Institutional Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="email"
                    required
                    className="text-input"
                    style={{ paddingLeft: '48px', height: '52px' }}
                    placeholder="staff@hospital.org"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field" style={{ marginBottom: '32px' }}>
                <label className="field-label">Secure Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="password"
                    required
                    className="text-input"
                    style={{ paddingLeft: '48px', height: '52px' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <p
                  style={{
                    color: 'var(--accent-red)',
                    fontSize: '13px',
                    marginBottom: '16px',
                    fontWeight: 500,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-solid"
                style={{ width: '100%', padding: '16px', justifyContent: 'center' }}
              >
                {loading ? 'Authenticating...' : isSignUp ? 'Register Facility' : 'Secure Sign In'}
              </button>
            </form>

            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setMessage(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {isSignUp ? 'Already registered? Sign In' : 'Need facility access? Register'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
