// src/components/HospitalDashboard.jsx

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useRequests } from '../hooks/useRequests'
import { useDonors, useHospitals } from '../hooks/useDonors'
import EmergencyMap from './EmergencyMap'
import { getCompatibleDonorGroups } from '../lib/bloodLogic'
import {
  AlertCircle, Clock, CheckCircle, Plus, X,
  Activity, ChevronDown, ChevronUp, MapPin, 
  Droplets, Users, HeartPulse, Phone
} from 'lucide-react'

const BLOOD_GROUPS  = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const COMPONENTS    = ['Whole blood', 'Platelets', 'Plasma', 'RBC']
const URGENCY_OPTS  = ['Routine', 'Urgent', 'Critical']

const URGENCY_BADGES = {
  Routine:  'badge-low',
  Urgent:   'badge-mid',
  Critical: 'badge-high',
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

  const handleSubmit = async () => {
    if (!form.hospital_id) return
    setLoading(true)
    const { data, error } = await supabase
      .from('blood_requests')
      .insert([{ ...form, units_needed: Number(form.units_needed) }])
      .select().single()

    if (!error && data) {
      const compatibleGroups = getCompatibleDonorGroups(form.blood_group)
      const matched = donors.filter(d => compatibleGroups.includes(d.blood_group) && d.available)
      if (matched.length > 0) {
        await supabase.from('donor_responses').insert(
          matched.map(d => ({ request_id: data.id, donor_id: d.id, status: 'alerted' }))
        )

        // Trigger SMS Alerts for Urgent/Critical requests
        if (['Urgent', 'Critical'].includes(form.urgency)) {
          console.log('📡 Trigger the Edge Function (SMS/Push logic)')
          const { data: funcData, error: funcError } = await supabase.functions.invoke('send-blood-alert', {
            body: { 
              requestId: data.id,
              hospitalName: myHospital.name,
              bloodGroup: form.blood_group,
              urgency: form.urgency
            }
          })

          if (funcError) {
            console.warn('📡 Simulation Mode: Edge function trigger failed (likely due to missing Twilio keys).')
            console.log(`💡 [MOCK ALERT] An emergency SMS would have been sent to matching ${form.blood_group} donors in ${myHospital.city}.`)
          } else {
            console.log('Emergency alerts sent successfully to matching donors!')
          }
        }
      }
      onClose()
    }
    setLoading(false)
  }

  const compatibleGroups = getCompatibleDonorGroups(form.blood_group)
  const matchedDonors = donors.filter(d => compatibleGroups.includes(d.blood_group) && d.available).length

  return (
    <div className="modal-overlay">
      <div className="modal-content ui-panel fade-in">
        <div className="flex-between" style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px' }}>Emergency Request</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '12px', borderRadius: '50%' }}><X size={20} /></button>
        </div>

        <div className="form-field">
          <label className="field-label">Target Blood Group</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {BLOOD_GROUPS.map(bg => (
              <button key={bg} onClick={() => setForm(f => ({ ...f, blood_group: bg }))}
                className={`btn-ghost ${form.blood_group === bg ? 'btn-solid' : ''}`}
                style={{ padding: '12px 0', fontSize: '13px' }}>
                {bg}
              </button>
            ))}
          </div>
          {matchedDonors > 0 && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '14px', fontWeight: 600 }}>
              <Users size={16} /> {matchedDonors} compatible donors ready
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <div className="form-field">
            <label className="field-label">Component</label>
            <select className="text-input" value={form.component} onChange={e => setForm(f => ({ ...f, component: e.target.value }))}>
              {COMPONENTS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="field-label">Units</label>
            <input type="number" min={1} className="text-input" value={form.units_needed} onChange={e => setForm(f => ({ ...f, units_needed: parseInt(e.target.value) || 1 }))} />
          </div>
        </div>

        <div className="form-field">
          <label className="field-label">Urgency</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {URGENCY_OPTS.map(u => (
              <button key={u} onClick={() => setForm(f => ({ ...f, urgency: u }))}
                className={`btn-ghost ${form.urgency === u ? 'btn-solid' : ''}`} style={{ flex: 1 }}>{u}</button>
            ))}
          </div>
        </div>

        <div className="form-field" style={{ marginBottom: '40px' }}>
          <label className="field-label">Clinical Notes</label>
          <input className="text-input" placeholder="e.g. Operation Room 4, Attn: Dr. Smith" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-solid" style={{ flex: 2 }}>{loading ? 'Transmitting...' : 'Post Emergency Alert'}</button>
        </div>
      </div>
    </div>
  )
}

export default function HospitalDashboard({ user }) {
  const [myHospital, setMyHospital] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const { requests, loading } = useRequests()
  const { donors } = useDonors()
  const [showModal, setShowModal]   = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [activeTab, setActiveTab]   = useState('emergencies')
  const [selectedDonor, setSelectedDonor] = useState(null)
  const { hospitals } = useHospitals()

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      const { data } = await supabase.from('hospitals').select('*').eq('user_id', user.id).single()
      if (data) setMyHospital(data)
      setProfileLoading(false)
    }
    loadProfile()
  }, [user])

  const myRequests = useMemo(() => requests.filter(r => r.hospital_id === myHospital?.id), [requests, myHospital])
  
  const stats = useMemo(() => ({
    open:       myRequests.filter(r => r.status === 'open').length,
    inProgress: myRequests.filter(r => r.status === 'in_progress').length,
    filled:     myRequests.filter(r => r.status === 'filled').length,
    alerted:    myRequests.reduce((acc, r) => acc + (r.donor_responses?.length || 0), 0)
  }), [myRequests])

  if (profileLoading) return <div className="flex-center" style={{ height: '80vh', justifyContent: 'center', fontSize: '18px', fontWeight: 600 }}>Initialising Secure Medical Node...</div>

  if (!myHospital) {
    return (
      <div className="flex-center" style={{ minHeight: '90vh', justifyContent: 'center' }}>
        <form className="ui-panel fade-in" style={{ padding: '60px', maxWidth: '500px', width: '90%' }} 
          onSubmit={async (e) => {
            e.preventDefault()
            const fd = new FormData(e.target)
            
            // Capture coordinates if available
            let lat = null, lng = null;
            try {
              const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
              });
              lat = pos.coords.latitude;
              lng = pos.coords.longitude;
            } catch (err) {
              console.warn("📡 Geolocation failed, proceeding with city only:", err);
            }

            const { data } = await supabase.from('hospitals').insert([{ 
              user_id: user.id, 
              name: fd.get('name'), 
              city: fd.get('city'), 
              contact_person: fd.get('contact'), 
              phone: fd.get('phone'),
              latitude: lat,
              longitude: lng
            }]).select().single()
            if (data) setMyHospital(data)
          }}>
          <h1 style={{ marginBottom: '12px', fontSize: '32px' }}>Hospital Setup</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Register your medical facility to the LifeLink network.</p>
          <div className="form-field"><label className="field-label">Facility Name</label><input name="name" required className="text-input" /></div>
          <div className="form-field"><label className="field-label">City</label><input name="city" required className="text-input" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
            <div className="form-field"><label className="field-label">Contact Person</label><input name="contact" required className="text-input" /></div>
            <div className="form-field"><label className="field-label">Phone</label><input name="phone" required className="text-input" /></div>
          </div>
          
          <button type="submit" className="btn-solid" style={{ width: '100%' }}>
            Register Facility
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="dashboard-page fade-in">
      <header className="header-section">
        <div>
          <h1 style={{ fontSize: '42px', marginBottom: '8px' }}>{myHospital.name}</h1>
          <div className="flex-center" style={{ gap: '16px', color: 'var(--text-muted)', fontSize: '15px' }}>
            <span className="flex-center" style={{ gap: '6px' }}><MapPin size={16} /> {myHospital.city}</span>
            <span className="flex-center" style={{ gap: '6px' }}><HeartPulse size={16} /> Network Active</span>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-solid">
          <Plus size={20} /> New Request
        </button>
      </header>

      <div className="stats-grid">
        <div className="ui-panel stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-red)' }}>{stats.open}</div>
          <div className="stat-label">Critical Needs</div>
        </div>
        <div className="ui-panel stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{stats.inProgress}</div>
          <div className="stat-label">In Transit</div>
        </div>
        <div className="ui-panel stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{stats.filled}</div>
          <div className="stat-label">Lives Saved</div>
        </div>
        <div className="ui-panel stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{stats.alerted}</div>
          <div className="stat-label">Network Alerts</div>
        </div>
      </div>

      <div className="view-tabs">
        <button className={`tab-btn ${activeTab === 'emergencies' ? 'active' : ''}`} onClick={() => setActiveTab('emergencies')}>
          <Activity size={18} /> Active Emergencies
        </button>
        <button className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
          <MapPin size={18} /> Network Map
        </button>
        <button className={`tab-btn ${activeTab === 'directory' ? 'active' : ''}`} onClick={() => setActiveTab('directory')}>
          <Users size={18} /> Donor Directory
        </button>
      </div>

      {activeTab === 'emergencies' && (
        <section className="fade-in">
          <div className="flex-between" style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px' }}>Active Emergency Stream</h2>
            {loading && <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Syncing...</div>}
          </div>
          
          <div className="stream-container">
            {!loading && myRequests.length === 0 && (
              <div className="ui-panel flex-center" style={{ padding: '80px', justifyContent: 'center', flexDirection: 'column', gap: '20px', borderStyle: 'dashed', background: 'transparent' }}>
                <Droplets size={48} strokeWidth={1} style={{ color: 'var(--border-soft)' }} />
                <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No active emergency requests</p>
              </div>
            )}

            {myRequests.map(req => (
              <div key={req.id} className={`ui-panel data-row ${expandedId === req.id ? 'active' : ''}`} onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}>
                <div className="flex-center" style={{ gap: '24px' }}>
                  <div className="blood-tag">{req.blood_group}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '18px' }}>{req.component}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {req.units_needed} Units Required • {timeAgo(req.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex-center" style={{ gap: '16px' }}>
                  <span className={`badge ${URGENCY_BADGES[req.urgency]}`}>{req.urgency}</span>
                  <div className="badge badge-low" style={{ background: 'var(--bg-app)' }}>{STATUS_LABELS[req.status]}</div>
                  {expandedId === req.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                {expandedId === req.id && (
                  <div style={{ width: '100%', position: 'absolute', top: '100%', left: 0, padding: '32px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-soft)', zIndex: 10 }}>
                     {req.notes && <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '32px', fontStyle: 'italic' }}>"{req.notes}"</p>}
                     <h4 style={{ marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Donor Response Network</h4>
                     {req.donor_responses?.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                          {req.donor_responses.map(dr => (
                            <div key={dr.id} className="ui-panel" style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '16px' }}>
                              <div style={{ fontWeight: 700, fontSize: '14px' }}>{dr.donors?.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--accent-green)', marginTop: '4px', fontWeight: 600 }}>{dr.status.toUpperCase()}</div>
                            </div>
                          ))}
                        </div>
                     ) : <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Waiting for donor responses...</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'map' && (
        <section className="fade-in">
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px' }}>Real-time Emergency Intel</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Visualising hospital needs and donor distribution across the network.</p>
          </div>
          <EmergencyMap donors={donors} hospitals={hospitals} requests={requests} />
        </section>
      )}

      {activeTab === 'directory' && (
        <section className="fade-in">
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px' }}>Network Donors</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Total registered donors in the LifeLink network.</p>
          </div>
          
          <div className="master-detail-container">
            <div className="master-list">
              {donors.length === 0 ? (
                <div className="ui-panel flex-center" style={{ padding: '40px', justifyContent: 'center', borderStyle: 'dashed', background: 'transparent' }}>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No donors found</p>
                </div>
              ) : (
                donors.map(donor => (
                  <div 
                    key={donor.id} 
                    className={`ui-panel directory-card master-item ${selectedDonor?.id === donor.id ? 'active' : ''}`}
                    onClick={() => setSelectedDonor(donor)}
                    style={{ cursor: 'pointer', padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}
                  >
                    <div className="blood-tag" style={{ minWidth: '48px', padding: '8px 0', fontSize: '14px', justifyContent: 'center', display: 'flex' }}>
                      {donor.blood_group}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{donor.name}</h3>
                      <div className="flex-center" style={{ gap: '6px', fontSize: '13px', marginTop: '4px', color: 'var(--text-muted)' }}>
                        <span className={`status-dot ${donor.available ? 'active' : 'offline'}`}></span>
                        {donor.available ? 'Available' : 'Offline'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="detail-pane ui-panel" style={{ padding: '32px', minHeight: '400px' }}>
              {selectedDonor ? (
                <div className="fade-in">
                  <div className="flex-between" style={{ marginBottom: '32px' }}>
                    <div className="flex-center" style={{ gap: '20px' }}>
                      <div className="blood-tag" style={{ width: '64px', height: '64px', fontSize: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedDonor.name[0]}
                      </div>
                      <div>
                        <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>{selectedDonor.name}</h2>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                          Blood Group: <strong style={{ color: 'var(--text-main)' }}>{selectedDonor.blood_group}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="flex-center" style={{ gap: '8px', fontSize: '14px', fontWeight: 600, padding: '8px 16px', borderRadius: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-soft)' }}>
                      <span className={`status-dot ${selectedDonor.available ? 'active' : 'offline'}`}></span>
                      {selectedDonor.available ? 'Ready for Donation' : 'Currently Offline'}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                    <div className="ui-panel" style={{ background: 'var(--bg-app)', padding: '20px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Location</div>
                      <div className="flex-center" style={{ gap: '8px', fontSize: '16px', fontWeight: 500 }}><MapPin size={18} /> {selectedDonor.city}</div>
                    </div>
                    <div className="ui-panel" style={{ background: 'var(--bg-app)', padding: '20px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Contact Number</div>
                      <div className="flex-center" style={{ gap: '8px', fontSize: '16px', fontWeight: 500 }}><Phone size={18} /> {selectedDonor.phone || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="ui-panel" style={{ background: 'var(--bg-app)', padding: '24px' }}>
                    <div className="flex-between" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-soft)', marginBottom: '16px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total Lifetime Donations</span>
                      <strong style={{ fontSize: '18px' }}>{selectedDonor.total_donations || 0}</strong>
                    </div>
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)' }}>Joined Network</span>
                      <strong style={{ fontSize: '16px' }}>{new Date(selectedDonor.created_at).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '16px', color: 'var(--text-muted)' }}>
                  <Users size={48} strokeWidth={1} style={{ opacity: 0.5 }} />
                  <p style={{ fontSize: '16px' }}>Select a donor to view details</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {showModal && <NewRequestModal myHospital={myHospital} onClose={() => setShowModal(false)} />}
    </div>
  )
}