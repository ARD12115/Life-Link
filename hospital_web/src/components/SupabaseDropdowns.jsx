import { useState } from 'react';
import { useDonors, useHospitals } from '../hooks/useDonors';

export default function SupabaseDropdowns() {
  // Only render in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const { donors, loading: donorsLoading, error: donorsError } = useDonors();
  const { hospitals, loading: hospitalsLoading, error: hospitalsError } = useHospitals();
  const [selectedDonor, setSelectedDonor] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');

  const donor = donors.find(d => d.id === Number(selectedDonor));
  const hospital = hospitals.find(h => h.id === Number(selectedHospital));

  return (
    <section
      className="glass-panel"
      style={{ padding: '24px', margin: '20px', borderRadius: '24px' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Supabase dropdown lookup (DEV ONLY)</h2>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
            View donors and hospitals from the Supabase database.
          </p>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>
          Tables: <strong>donors</strong>, <strong>hospitals</strong>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '18px',
        }}
      >
        <div>
          <label className="field-label">Select donor</label>
          <select
            className="premium-input"
            value={selectedDonor}
            onChange={e => setSelectedDonor(e.target.value)}
          >
            <option value="">Choose a donor</option>
            {donors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.blood_group}
              </option>
            ))}
          </select>
          {donorsLoading && (
            <p className="field-label" style={{ fontSize: '12px', marginTop: '8px' }}>
              Loading donors...
            </p>
          )}
          {donorsError && (
            <p className="field-label" style={{ fontSize: '12px', color: 'var(--blood-ruby)' }}>
              {donorsError}
            </p>
          )}
        </div>

        <div>
          <label className="field-label">Select hospital</label>
          <select
            className="premium-input"
            value={selectedHospital}
            onChange={e => setSelectedHospital(e.target.value)}
          >
            <option value="">Choose a hospital</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>
                {h.name} — {h.city}
              </option>
            ))}
          </select>
          {hospitalsLoading && (
            <p className="field-label" style={{ fontSize: '12px', marginTop: '8px' }}>
              Loading hospitals...
            </p>
          )}
          {hospitalsError && (
            <p className="field-label" style={{ fontSize: '12px', color: 'var(--blood-ruby)' }}>
              {hospitalsError}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div
          className="glass-panel"
          style={{ padding: '18px', background: 'rgba(255,255,255,0.06)' }}
        >
          <h3 style={{ margin: '0 0 10px', fontSize: '16px' }}>Donor details</h3>
          {donor ? (
            <div style={{ lineHeight: 1.7 }}>
              <div>
                <strong>Name:</strong> {donor.name}
              </div>
              <div>
                <strong>Blood group:</strong> {donor.blood_group}
              </div>
              <div>
                <strong>City:</strong> {donor.city}
              </div>
              <div>
                <strong>Phone:</strong> {donor.phone}
              </div>
              <div>
                <strong>Available:</strong> {donor.available ? 'Yes' : 'No'}
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Select a donor to view details.
            </p>
          )}
        </div>

        <div
          className="glass-panel"
          style={{ padding: '18px', background: 'rgba(255,255,255,0.06)' }}
        >
          <h3 style={{ margin: '0 0 10px', fontSize: '16px' }}>Hospital details</h3>
          {hospital ? (
            <div style={{ lineHeight: 1.7 }}>
              <div>
                <strong>Name:</strong> {hospital.name}
              </div>
              <div>
                <strong>City:</strong> {hospital.city}
              </div>
              <div>
                <strong>Contact:</strong> {hospital.contact_person}
              </div>
              <div>
                <strong>Phone:</strong> {hospital.phone}
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Select a hospital to view details.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
