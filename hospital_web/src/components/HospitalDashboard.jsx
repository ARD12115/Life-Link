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
  Droplets, Users, HeartPulse, Phone, Heart
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { CardSkeleton } from './Skeleton'

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
    blood_group:  'O+',
    component:    'Whole blood',
    units_needed: 1,
    urgency:      'Critical',
    delivery_point: '',
    notes:        '',
  })
  const [loading, setLoading]     = useState(false)

  const handleSubmit = async () => {
    if (!form.hospital_id) return
    setLoading(true)
    const { data, error } = await supabase
      .from('blood_requests')
      .insert([{ 
        ...form, 
        units_needed: Number(form.units_needed),
        delivery_point: form.delivery_point || 'General Admissions'
      }])
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
            <label className="field-label">Units (Gloved-Friendly)</label>
            <div className="flex-center" style={{ gap: '12px', background: 'var(--bg-app)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-soft)' }}>
              <button onClick={() => setForm(f => ({ ...f, units_needed: Math.max(1, f.units_needed - 1) }))} className="btn-ghost" style={{ padding: '8px 20px', fontSize: '20px' }}>-</button>
              <span style={{ fontSize: '20px', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>{form.units_needed}</span>
              <button onClick={() => setForm(f => ({ ...f, units_needed: f.units_needed + 1 }))} className="btn-ghost" style={{ padding: '8px 20px', fontSize: '20px' }}>+</button>
            </div>
          </div>
        </div>

        <div className="form-field">
          <label className="field-label">Precise Delivery Point (Ward / Room / ER Entrance)</label>
          <input className="text-input" placeholder="e.g. ICU 2nd Floor, Room 204" value={form.delivery_point} onChange={e => setForm(f => ({ ...f, delivery_point: e.target.value }))} />
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
  const historyRequests = useMemo(() => requests.filter(r => r.hospital_id === myHospital?.id && r.status === 'closed'), [requests, myHospital])
  const activeRequests = useMemo(() => requests.filter(r => r.hospital_id === myHospital?.id && r.status !== 'closed'), [requests, myHospital])

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      const { data } = await supabase.from('hospitals').select('*').eq('user_id', user.id).single()
      if (data) setMyHospital(data)
      setProfileLoading(false)
    }
    loadProfile()
  }, [user])

  const updateStatus = async (id, newStatus) => {
    let receivedBy = null
    if (newStatus === 'closed') {
      receivedBy = window.prompt('Enter staff name who received the blood:')
      if (!receivedBy) return // Cancel if no name
    }
    
    const { error } = await supabase
      .from('blood_requests')
      .update({ status: newStatus, notes: receivedBy ? `Received by: ${receivedBy}` : undefined })
      .eq('id', id)
      
    if (error) toast.error('Update failed')
    else toast.success('Request updated')
  }

  const myRequests = useMemo(() => requests.filter(r => r.hospital_id === myHospital?.id), [requests, myHospital])
  
  const stats = useMemo(() => ({
    open:       activeRequests.filter(r => r.status === 'open').length,
    inProgress: activeRequests.filter(r => r.status === 'in_progress').length,
    filled:     historyRequests.length,
    alerted:    activeRequests.reduce((acc, r) => acc + (r.donor_responses?.length || 0), 0)
  }), [activeRequests, historyRequests])

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
        
        {/* Mobile App Promotion for Staff */}
        <div className="ui-panel stat-card flex-center" style={{ flexDirection: 'row', gap: '16px', padding: '12px 20px', border: '1px solid var(--accent-blue)' }}>
           <div style={{ background: 'white', padding: '4px', borderRadius: '4px', display: 'flex', justifyContent: 'center' }}>
              <QRCodeCanvas value={process.env.REACT_APP_EXPO_URL || 'exp://localhost:8081'} size={40} level="L" />
           </div>
           <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>Expo Bridge</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scan for Expo Go</div>
           </div>
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
        <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <Clock size={18} /> Past Deliveries
        </button>
      </div>

      {activeTab === 'emergencies' && (
        <section className="fade-in">
          <div className="flex-between" style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px' }}>Active Emergency Stream</h2>
            {loading && <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Syncing...</div>}
          </div>
          
          <div className="stream-container">
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
              </div>
            ) : myRequests.length === 0 ? (
              <div className="ui-panel flex-center" style={{ padding: '80px', justifyContent: 'center', flexDirection: 'column', gap: '20px', borderStyle: 'dashed', background: 'transparent' }}>
                <Heart size={48} strokeWidth={1} style={{ color: 'var(--accent-red)' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 600 }}>System Secure & Idle</h3>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500, textAlign: 'center', maxWidth: '350px' }}>
                  There are no active blood requests at this time. Use the "New Request" button to alert donors.
                </p>
              </div>
            ) : (
              activeRequests.map(req => (
              <div key={req.id} className={`ui-panel data-row ${expandedId === req.id ? 'active' : ''}`} onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}>
                <div className="flex-center" style={{ gap: '24px' }}>
                  <div className="blood-tag">{req.blood_group}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '18px' }}>{req.component}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {req.units_needed} Units Required • {req.delivery_point ? `Deliver to: ${req.delivery_point}` : timeAgo(req.created_at)}
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
                              <div className="flex-between" style={{ marginTop: '8px' }}>
                                <div style={{ fontSize: '12px', color: dr.status === 'accepted' ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 600 }}>{dr.status.toUpperCase()}</div>
                                {dr.status === 'accepted' && dr.donors?.phone && (
                                  <a href={`tel:${dr.donors.phone}`} className="btn-solid" style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '8px', textDecoration: 'none' }}>
                                    <Phone size={12} /> CALL
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                     ) : <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Waiting for donor responses...</p>}
                  </div>
                )}
              </div>
            ))
          )}
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
        <section>
          <div className="flex-between" style={{ marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '24px' }}>Donor Command Center</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage and contact the volunteer donor network.</p>
            </div>
            <div className="flex-center" style={{ gap: '12px' }}>
               <select 
                 className="text-input" 
                 style={{ width: '150px', padding: '8px' }}
                 onChange={(e) => setSelectedDonor(e.target.value === 'All' ? null : e.target.value)}
               >
                 <option>All Blood Groups</option>
                 {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
               </select>
            </div>
          </div>
          
          <div className="ui-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Donor Name</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Type</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>City</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donors.filter(d => !selectedDonor || d.blood_group === selectedDonor).map(donor => (
                  <tr key={donor.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 700 }}>{donor.name}</td>
                    <td style={{ padding: '16px 24px' }}><span className="blood-tag" style={{ padding: '4px 8px', fontSize: '12px' }}>{donor.blood_group}</span></td>
                    <td style={{ padding: '16px 24px' }}>
                      <div className="flex-center" style={{ gap: '6px', fontSize: '13px' }}>
                        <span className={`status-dot ${donor.available ? 'active' : 'offline'}`}></span>
                        {donor.available ? 'READY' : 'OFFLINE'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{donor.city}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                       {donor.phone && (
                         <a href={`tel:${donor.phone}`} className="btn-solid" style={{ padding: '8px 16px', fontSize: '12px', textDecoration: 'none' }}>
                            <Phone size={14} /> CALL
                         </a>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {donors.length === 0 && (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>No donors found in directory.</div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'history' && (
        <section>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px' }}>Past Deliveries</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Chronological log of fulfilled blood requests and saved lives.</p>
          </div>
          
          <div className="stream-container">
            {historyRequests.length === 0 ? (
              <div className="ui-panel flex-center" style={{ padding: '80px', justifyContent: 'center', color: 'var(--text-muted)' }}>
                 No past records found.
              </div>
            ) : (
              historyRequests.map(req => (
                <div key={req.id} className="ui-panel" style={{ padding: '24px', marginBottom: '12px', background: 'rgba(255,255,255,0.02)' }}>
                   <div className="flex-between">
                      <div className="flex-center" style={{ gap: '20px' }}>
                         <div className="blood-tag">{req.blood_group}</div>
                         <div>
                            <div style={{ fontWeight: 700 }}>{req.component}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(req.created_at).toLocaleDateString()}</div>
                         </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                         <div style={{ fontSize: '14px', fontWeight: 600 }}>{req.notes || 'Fulfilled'}</div>
                         <div style={{ fontSize: '12px', color: 'var(--accent-green)' }}>COMPLETED</div>
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {showModal && <NewRequestModal myHospital={myHospital} onClose={() => setShowModal(false)} />}
    </div>
  )
}