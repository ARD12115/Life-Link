// src/components/HospitalDashboard.jsx

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useRequests } from '../hooks/useRequests'
import { useDonors, useHospitals } from '../hooks/useDonors'
import {
  AlertCircle, Clock, CheckCircle, Plus, X,
  Activity, ChevronDown, ChevronUp
} from 'lucide-react'

const BLOOD_GROUPS  = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const COMPONENTS    = ['Whole blood', 'Platelets', 'Plasma', 'RBC']
const URGENCY_OPTS  = ['Routine', 'Urgent', 'Critical']

const URGENCY_CLASSES = {
  Routine:  'urgency-routine',
  Urgent:   'urgency-urgent',
  Critical: 'urgency-critical pulse-critical',
}

const STATUS_LABELS = {
  open:        'Open',
  in_progress: 'In progress',
  filled:      'Filled',
  cancelled:   'Cancelled',
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

/* ─── New Request Modal ─────────────────────────────────────── */
function NewRequestModal({ myHospital, onClose }) {
  const { donors } = useDonors()

  const [form, setForm] = useState({
    hospital_id:  myHospital.id,
    blood_group:  'B+',
    component:    'Whole blood',
    units_needed: 1,
    urgency:      'Urgent',
    notes:        '',
  })
  const [loading, setLoading]     = useState(false)
  const [matchCount, setMatchCount] = useState(null)

  const handleBloodGroupChange = (bg) => {
    const matched = donors.filter(d => d.blood_group === bg && d.available)
    setMatchCount(matched.length)
    setForm(f => ({ ...f, blood_group: bg }))
  }

  const handleSubmit = async () => {
    if (!form.hospital_id) return
    setLoading(true)

    const { data, error } = await supabase
      .from('blood_requests')
      .insert([{ ...form, units_needed: Number(form.units_needed) }])
      .select()
      .single()

    if (!error && data) {
      const matched = donors.filter(
        d => d.blood_group === form.blood_group && d.available
      )
      if (matched.length > 0) {
        await supabase.from('donor_responses').insert(
          matched.map(d => ({
            request_id: data.id,
            donor_id:   d.id,
            status:     'alerted',
          }))
        )
      }
      onClose()
    }
    setLoading(false)
  }

  const currentMatch = donors.filter(
    d => d.blood_group === form.blood_group && d.available
  ).length

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ padding: '30px', maxWidth: '500px', width: '90%' }}>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px' }}>New blood request</h2>
          <button onClick={onClose} className="icon-btn"><X size={20} /></button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label className="field-label">Posting as</label>
          <div className="premium-input" style={{ opacity: 0.7, background: 'transparent' }}>
            {myHospital.name}
          </div>
        </div>

        <div className="form-field">
          <label className="field-label">Blood group needed</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {BLOOD_GROUPS.map(bg => (
              <button key={bg} onClick={() => handleBloodGroupChange(bg)}
                className={`chip ${form.blood_group === bg ? 'chip-active' : ''}`}>
                {bg}
              </button>
            ))}
          </div>
          <p style={{ marginTop: '8px', fontSize: '12px', color: (matchCount ?? currentMatch) > 0 ? 'var(--healthy-green)' : 'var(--blood-ruby)' }}>
            {(matchCount ?? currentMatch) > 0
              ? `✓ ${matchCount ?? currentMatch} available donor${(matchCount ?? currentMatch) > 1 ? 's' : ''} will be alerted`
              : '⚠ No available donors for this blood group right now'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-field">
            <label className="field-label">Component</label>
            <select className="premium-input"
              value={form.component}
              onChange={e => setForm(f => ({ ...f, component: e.target.value }))}>
              {COMPONENTS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="field-label">Units needed</label>
            <input type="number" min={1} max={10}
              className="premium-input"
              value={form.units_needed}
              onChange={e => setForm(f => ({ ...f, units_needed: parseInt(e.target.value) || 1 }))} />
          </div>
        </div>

        <div className="form-field">
          <label className="field-label">Urgency</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {URGENCY_OPTS.map(u => (
              <button key={u}
                onClick={() => setForm(f => ({ ...f, urgency: u }))}
                className={`chip ${form.urgency === u ? 'chip-active' : ''}`}
                style={{ flex: 1 }}>
                {u}
              </button>
            ))}
          </div>
        </div>

        <div className="form-field" style={{ marginBottom: '24px' }}>
          <label className="field-label">Notes (optional)</label>
          <input className="premium-input"
            placeholder="Patient condition, ward number..."
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ flex: 2 }}>
            {loading ? 'Sending alerts...' : 'Post & Alert Donors'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Hospital Dashboard ────────────────────────────────────── */
export default function HospitalDashboard({ user }) {
  const [myHospital, setMyHospital] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const { requests, loading } = useRequests()
  const [showModal, setShowModal]   = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading hospital:', error)
      } else if (data) {
        setMyHospital(data)
      }
      setProfileLoading(false)
    }
    loadProfile()
  }, [user])

  const handleCreateProfile = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newHospital = {
      user_id: user.id,
      name: formData.get('name'),
      city: formData.get('city'),
      contact_person: formData.get('contact'),
      phone: formData.get('phone'),
    }

    const { data, error } = await supabase
      .from('hospitals')
      .insert([newHospital])
      .select()
      .single()

    if (!error && data) setMyHospital(data)
  }

  if (profileLoading) return <div className="loading-text">Loading secure profile...</div>

  if (!myHospital) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh', justifyContent: 'center' }}>
        <form className="glass-panel modal-content" style={{ padding: '40px', maxWidth: '500px' }} onSubmit={handleCreateProfile}>
          <h2 className="logo-text" style={{ marginBottom: '20px' }}>Register Hospital</h2>
          <div className="form-field">
            <label className="field-label">Hospital Name</label>
            <input name="name" required className="premium-input" placeholder="e.g. City General Hospital" />
          </div>
          <div className="form-field">
            <label className="field-label">City</label>
            <input name="city" required className="premium-input" placeholder="e.g. Mumbai" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-field">
              <label className="field-label">Contact Person</label>
              <input name="contact" required className="premium-input" placeholder="Name" />
            </div>
            <div className="form-field">
              <label className="field-label">Phone</label>
              <input name="phone" required className="premium-input" placeholder="Contact number" />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Complete Setup
          </button>
        </form>
      </div>
    )
  }

  // Filter requests to only show ones from THIS hospital (for the hospital dashboard)
  const myRequests = useMemo(() => {
    return requests.filter(r => r.hospital_id === myHospital.id)
  }, [requests, myHospital.id])

  const stats = useMemo(() => ({
    open:          myRequests.filter(r => r.status === 'open').length,
    inProgress:    myRequests.filter(r => r.status === 'in_progress').length,
    filled:        myRequests.filter(r => r.status === 'filled').length,
    totalAlerted:  myRequests.reduce((acc, r) => acc + (r.donor_responses?.length || 0), 0)
  }), [myRequests])

  const updateStatus = async (id, status, e) => {
    e?.stopPropagation()
    await supabase
      .from('blood_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  const toggleExpand = (id) => setExpandedId(prev => (prev === id ? null : id))

  return (
    <div className="dashboard-page">
      {/* ── Header ── */}
      <header className="glass-panel flex-between" style={{ padding: '20px 30px', marginBottom: '30px', borderRadius: '0 0 24px 24px' }}>
        <div className="flex-center" style={{ gap: '12px' }}>
          <div className="logo-dot" />
          <h1 className="logo-text" style={{ fontSize: '24px' }}>{myHospital.name}</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} style={{ marginRight: '8px' }} />New Request
        </button>
      </header>

      {/* ── Stat cards ── */}
      <div className="stats-grid">
        {[
          { label: 'Open Requests',  value: stats.open,         color: 'var(--blood-ruby)', icon: <AlertCircle size={20} /> },
          { label: 'In Progress',    value: stats.inProgress,   color: '#ba7517', icon: <Clock size={20} /> },
          { label: 'Filled Today',   value: stats.filled,       color: 'var(--healthy-green)', icon: <CheckCircle size={20} /> },
          { label: 'Donors Alerted', value: stats.totalAlerted, color: 'var(--vital-blue)', icon: <Activity size={20} /> },
        ].map(s => (
          <div key={s.label} className="glass-panel stat-card hover-3d">
            <div style={{ color: s.color, marginBottom: '12px' }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Request list ── */}
      <section style={{ padding: '0 30px' }}>
        <h3 className="section-title">Active Requests</h3>

        {loading && <div className="loading-text">Synchronizing with Blood Bank...</div>}

        {!loading && myRequests.length === 0 && (
          <div className="glass-panel empty-state">
            <AlertCircle size={40} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No active requests.</p>
          </div>
        )}

        {myRequests.map(req => {
          const isOpen = expandedId === req.id
          const urgencyClass = URGENCY_CLASSES[req.urgency] || ''

          return (
            <div key={req.id}
              className={`glass-panel request-card hover-3d ${isOpen ? 'active' : ''}`}
              onClick={() => toggleExpand(req.id)}>

              <div className="flex-between">
                <div className="flex-center" style={{ gap: '16px' }}>
                  <div className={`blood-pill ${urgencyClass}`}>
                    {req.blood_group}
                  </div>
                  <div>
                    <div className="request-title">
                      {req.hospitals?.name}
                      <span className="request-component"> — {req.component}</span>
                    </div>
                    <div className="request-meta">
                      {req.units_needed} units · {timeAgo(req.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex-center" style={{ gap: '12px' }}>
                   <span className="status-badge" style={{ background: 'var(--bg-primary)' }}>
                    {STATUS_LABELS[req.status]}
                  </span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {isOpen && (
                <div className="request-expanded-content">
                  {req.notes && <p className="request-notes">"{req.notes}"</p>}
                  
                  <div className="donor-list-section">
                    <h4 className="sub-title">Responding Donors</h4>
                    {req.donor_responses?.length > 0 ? (
                      req.donor_responses.map(dr => (
                        <div key={dr.id} className="donor-row">
                          <div className="donor-avatar">
                            {dr.donors?.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="donor-name">{dr.donors?.name}</div>
                            <div className="donor-meta">{dr.donors?.phone} · {dr.donors?.city}</div>
                          </div>
                          <div className="donor-status">{dr.status}</div>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">Searching for nearby donors...</p>
                    )}
                  </div>

                  <div className="status-actions">
                    <span className="action-label">Update Status:</span>
                    {Object.keys(STATUS_LABELS).map(s => (
                      <button key={s}
                        onClick={(e) => updateStatus(req.id, s, e)}
                        className={`chip ${req.status === s ? 'chip-active' : ''}`}>
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </section>

      {showModal && <NewRequestModal myHospital={myHospital} onClose={() => setShowModal(false)} />}
    </div>
  )
}