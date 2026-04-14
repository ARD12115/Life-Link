// src/components/DonorDashboard.jsx

import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useRequests } from '../hooks/useRequests'
import { Heart, MapPin, CheckCircle, X, Bell, Phone } from 'lucide-react'

const URGENCY_CLASSES = {
  Routine:  'urgency-routine',
  Urgent:   'urgency-urgent',
  Critical: 'urgency-critical pulse-critical',
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function AlertCard({ response, request, onRespond }) {
  const [loading, setLoading] = useState(false)
  const eta = response.eta_minutes ?? 15

  const respond = useCallback(async (status) => {
    setLoading(true)
    await supabase
      .from('donor_responses')
      .update({
        status,
        eta_minutes: status === 'confirmed' ? eta : null,
        responded_at: new Date().toISOString(),
      })
      .eq('id', response.id)

    if (status === 'confirmed') {
      await supabase
        .from('blood_requests')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', request.id)
        .eq('status', 'open')
    }

    setLoading(false)
    onRespond()
  }, [response.id, request.id, eta, onRespond])

  if (!request) return null

  const isOpen      = response.status === 'alerted'
  const isConfirmed = response.status === 'confirmed'
  const urgencyClass = URGENCY_CLASSES[request.urgency] || ''

  return (
    <div className={`glass-panel alert-card hover-3d ${response.status === 'declined' ? 'declined-card' : ''}`}>
      <div className="flex-between" style={{ marginBottom: '16px' }}>
        <div className="flex-center" style={{ gap: '12px' }}>
          <div className={`blood-pill ${urgencyClass}`}>
            {request.blood_group}
          </div>
          <div>
            <div className="request-title">{request.hospitals?.name}</div>
            <div className="request-meta">{request.hospitals?.city} · {timeAgo(request.created_at)}</div>
          </div>
        </div>
        <span className={`status-badge ${urgencyClass}`}>{request.urgency}</span>
      </div>

      <div className="request-meta" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <span className="flex-center" style={{ gap: '6px' }}><Heart size={14} /> {request.component}</span>
        <span className="flex-center" style={{ gap: '6px' }}><MapPin size={14} /> {request.hospitals?.city}</span>
      </div>

      {isOpen && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => respond('declined')} disabled={loading} className="btn-secondary" style={{ flex: 1 }}>Not Available</button>
          <button onClick={() => respond('confirmed')} disabled={loading} className="btn-primary" style={{ flex: 2 }}>I Can Donate</button>
        </div>
      )}

      {isConfirmed && (
        <div className="confirm-banner banner-success">
          <CheckCircle size={18} />
          <div style={{ flex: 1 }}>Confirmed · ETA {eta} min</div>
        </div>
      )}
    </div>
  )
}

export default function DonorDashboard({ user }) {
  const [donor, setDonor] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const { requests, loading, refetch } = useRequests()

  useEffect(() => {
    async function loadDonorProfile() {
      if (!user) return
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (data) setDonor(data)
      setProfileLoading(false)
    }
    loadDonorProfile()
  }, [user])

  const handleCreateProfile = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newDonor = {
      user_id: user.id,
      name: formData.get('name'),
      blood_group: formData.get('blood_group'),
      city: formData.get('city'),
      phone: formData.get('phone'),
    }

    const { data, error } = await supabase
      .from('donors')
      .insert([newDonor])
      .select()
      .single()

    if (!error && data) setDonor(data)
  }

  const toggleAvailable = useCallback(async () => {
    if (!donor) return
    const { data } = await supabase
      .from('donors')
      .update({ available: !donor.available })
      .eq('id', donor.id)
      .select()
      .single()
    if (data) setDonor(data)
  }, [donor])

  // Optimization: Memoize responses filter
  const myResponses = useMemo(() => {
    if (!donor) return []
    return requests
      .map(req => ({
        request: req,
        response: req.donor_responses?.find(r => r.donor_id === donor.id)
      }))
      .filter(x => x.response)
  }, [requests, donor])

  // Optimization: Memoize stats
  const pendingAlerts = useMemo(() => {
    return myResponses.filter(r => r.response.status === 'alerted').length
  }, [myResponses])

  if (profileLoading) return <div className="loading-text">Loading secure profile...</div>

  if (!donor) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh', justifyContent: 'center' }}>
        <form className="glass-panel modal-content" style={{ padding: '40px', maxWidth: '500px' }} onSubmit={handleCreateProfile}>
          <h2 className="logo-text" style={{ marginBottom: '20px' }}>Donor Registration</h2>
          <div className="form-field">
            <label className="field-label">Full Name</label>
            <input name="name" required className="premium-input" placeholder="Your Name" />
          </div>
          <div className="form-field">
            <label className="field-label">Blood Group</label>
            <select name="blood_group" className="premium-input">
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-field">
              <label className="field-label">City</label>
              <input name="city" required className="premium-input" placeholder="Mumbai" />
            </div>
            <div className="form-field">
              <label className="field-label">Phone</label>
              <input name="phone" required className="premium-input" placeholder="Contact number" />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Become a Donor
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <header className="glass-panel flex-between" style={{ padding: '20px 30px', marginBottom: '30px', borderRadius: '0 0 24px 24px' }}>
        <div className="flex-center" style={{ gap: '12px' }}>
          <div className="logo-dot" />
          <h1 className="logo-text" style={{ fontSize: '24px' }}>Donor Hub</h1>
        </div>
        <div className="flex-center" style={{ gap: '16px' }}>
          {pendingAlerts > 0 && (
            <div className="status-badge urgency-critical pulse-critical" style={{ textTransform: 'none' }}>
              <Bell size={12} style={{ marginRight: '6px' }} /> {pendingAlerts} alerts
            </div>
          )}
          <div className="blood-pill urgency-critical" style={{ minWidth: '40px' }}>{donor.blood_group}</div>
        </div>
      </header>

      <div style={{ padding: '0 30px' }}>
        <div className="glass-panel profile-card hover-3d" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div className="profile-avatar">{donor.name[0].toUpperCase()}</div>
            <div>
              <h2 className="profile-name">{donor.name}</h2>
              <div className="profile-sub">{donor.city} · {donor.phone}</div>
            </div>
          </div>
          
          <div className="auth-toggle-row">
            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Ready for emergencies?</span>
            <div onClick={toggleAvailable} className={`toggle-switch ${donor.available ? 'active' : ''}`}>
              <div className="toggle-thumb" />
            </div>
            <span style={{ fontSize: '12px', minWidth: '70px', color: donor.available ? 'var(--healthy-green)' : 'var(--text-secondary)' }}>
              {donor.available ? 'Available' : 'Resting'}
            </span>
          </div>
        </div>

        <section>
          <h3 className="section-title">Urgent Alerts</h3>
          {loading ? (
            <p className="loading-text">Scanning for matches...</p>
          ) : myResponses.length === 0 ? (
            <div className="glass-panel empty-state">
              <p style={{ color: 'var(--text-secondary)' }}>No matching emergency alerts right now.</p>
            </div>
          ) : (
            myResponses.map(({ response, request }) => (
              <AlertCard key={response.id} response={response} request={request} onRespond={refetch} />
            ))
          )}
        </section>
      </div>
    </div>
  )
}