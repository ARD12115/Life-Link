import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function RoleSelector({ user, onProfileCreated }) {
  const [role, setRole] = useState('hospital');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async event => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        [
          {
            user_id: user.id,
            role,
            display_name: user.email?.split('@')[0] || null,
            phone: null,
          },
        ],
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      setError(error.message);
      setLoading(false);
      return;
    }

    onProfileCreated(data);
    setLoading(false);
  };

  return (
    <div
      className="flex-center"
      style={{ minHeight: '80vh', justifyContent: 'center', padding: '20px' }}
    >
      <div
        className="glass-panel modal-content"
        style={{ maxWidth: '520px', width: '100%', padding: '40px' }}
      >
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <h2 className="logo-text" style={{ fontSize: '26px' }}>
            Choose your role
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
            We secure access by role so the right people see only the data they should.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <button
              type="button"
              onClick={() => setRole('hospital')}
              className={`chip ${role === 'hospital' ? 'chip-active' : ''}`}
              style={{ padding: '20px', textAlign: 'left' }}
            >
              <strong>Hospital</strong>
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Manage blood requests, alert donors, and review responses.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('donor')}
              className={`chip ${role === 'donor' ? 'chip-active' : ''}`}
              style={{ padding: '20px', textAlign: 'left' }}
            >
              <strong>Donor</strong>
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Receive alerts, update availability, and respond to requests.
              </div>
            </button>
          </div>

          {error && <p style={{ color: 'var(--blood-ruby)', marginBottom: '16px' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Saving role...' : 'Continue as ' + role}
          </button>
        </form>
      </div>
    </div>
  );
}
