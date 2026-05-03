// src/components/DonorDashboard.jsx

import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useRequests } from '../hooks/useRequests'
import { useHospitals } from '../hooks/useDonors'
import { Heart, MapPin, CheckCircle, Bell, Phone, Activity, ShieldCheck, Droplets, Hospital } from 'lucide-react'

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
    await supabase.from('donor_responses').update({
      status,
      eta_minutes: status === 'confirmed' ? eta : null,
      responded_at: new Date().toISOString(),
    }).eq('id', response.id)

    if (status === 'confirmed') {
      await supabase.from('blood_requests').update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', request.id).eq('status', 'open')
    }
    setLoading(false)
    onRespond()
  }, [response.id, request.id, eta, onRespond])

  if (!request) return null
  const isOpen = response.status === 'alerted'
  const isConfirmed = response.status === 'confirmed'

  return (
    <div className={`ui-panel data-row ${isConfirmed ? 'active' : ''}`} style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <div className="flex-center" style={{ gap: '24px' }}>
          <div className="blood-tag">{request.blood_group}</div>
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>{request.hospitals?.name}</h3>
            <div className="flex-center" style={{ gap: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
              <span className="flex-center" style={{ gap: '4px' }}><Droplets size={14} /> {request.component}</span>
              <span className="flex-center" style={{ gap: '4px' }}><MapPin size={14} /> {request.hospitals?.city}</span>
              <span>• {timeAgo(request.created_at)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex-center" style={{ gap: '20px' }}>
           <span className={`badge ${request.urgency === 'Critical' ? 'badge-high' : 'badge-mid'}`}>{request.urgency}</span>
           {isOpen && (
             <div style={{ display: 'flex', gap: '12px' }}>
               <button onClick={() => respond('declined')} disabled={loading} className="btn-ghost" style={{ padding: '10px 20px' }}>Decline</button>
               <button onClick={() => respond('confirmed')} disabled={loading} className="btn-solid" style={{ padding: '10px 20px' }}>I'll Donate</button>
             </div>
           )}
           {isConfirmed && (
             <div className="flex-center" style={{ gap: '8px', color: 'var(--accent-green)', fontWeight: 700 }}>
               <CheckCircle size={20} /> Confirmed (ETA {eta}m)
             </div>
           )}
        </div>
      </div>
    </div>
  )
}

export default function DonorDashboard({ user }) {
  const [donor, setDonor] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const { requests, loading, refetch } = useRequests()
  const { hospitals } = useHospitals()
  const [activeTab, setActiveTab] = useState('alerts')
  const [selectedHospital, setSelectedHospital] = useState(null)

  useEffect(() => {
    async function loadDonorProfile() {
      if (!user) {
        const { error } = await supabase.auth.signInAnonymously()
        if (error) {
          console.error("Anonymous auth failed. Please enable Anonymous Sign-Ins in Supabase:", error)
          setProfileLoading(false)
        }
        return // App.jsx will pass the new user once session updates
      }
      const { data } = await supabase.from('donors').select('*').eq('user_id', user.id).single()
      if (data) setDonor(data)
      setProfileLoading(false)
    }
    loadDonorProfile()
  }, [user])

  const toggleAvailable = useCallback(async () => {
    if (!donor) return
    const { data } = await supabase.from('donors').update({ available: !donor.available }).eq('id', donor.id).select().single()
    if (data) setDonor(data)
  }, [donor])

  const myResponses = useMemo(() => {
    if (!donor) return []
    return requests.map(req => ({ request: req, response: req.donor_responses?.find(r => r.donor_id === donor.id) }))
      .filter(x => x.response)
  }, [requests, donor])

  const pendingAlerts = useMemo(() => myResponses.filter(r => r.response.status === 'alerted').length, [myResponses])

  if (profileLoading) return <div className="flex-center" style={{ height: '80vh', justifyContent: 'center', fontSize: '18px', fontWeight: 600 }}>Connecting to Emergency Network...</div>

  if (!donor) {
    return (
      <div className="flex-center" style={{ minHeight: '90vh', justifyContent: 'center' }}>
        <form className="ui-panel fade-in" style={{ padding: '60px', maxWidth: '500px', width: '90%' }} 
          onSubmit={async (e) => {
            e.preventDefault()
            const fd = new FormData(e.target)
            if (!user) return alert("Anonymous authentication failed. Please check console.")
            const { data } = await supabase.from('donors').insert([{ user_id: user.id, name: fd.get('name'), blood_group: fd.get('blood_group'), city: fd.get('city'), phone: fd.get('phone') }]).select().single()
            if (data) setDonor(data)
          }}>
          <h1 style={{ marginBottom: '12px', fontSize: '32px' }}>Donor Registration</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Join the network of life-savers. Receive instant alerts when your blood type is needed.</p>
          <div className="form-field"><label className="field-label">Full Name</label><input name="name" required className="text-input" /></div>
          <div className="form-field">
            <label className="field-label">Blood Group</label>
            <select name="blood_group" className="text-input">
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
            <div className="form-field"><label className="field-label">City</label><input name="city" required className="text-input" /></div>
            <div className="form-field"><label className="field-label">Phone</label><input name="phone" required className="text-input" /></div>
          </div>
          <button type="submit" className="btn-solid" style={{ width: '100%' }}>Become a Hero</button>
        </form>
      </div>
    )
  }

  return (
    <div className="dashboard-page fade-in">
      <header className="header-section">
        <div>
          <h1 style={{ fontSize: '42px', marginBottom: '8px' }}>Donor Hub</h1>
          <div className="flex-center" style={{ gap: '16px', color: 'var(--text-muted)', fontSize: '15px' }}>
             <span className="flex-center" style={{ gap: '6px' }}><ShieldCheck size={16} color="var(--accent-green)" /> Verified Donor</span>
             <span className="flex-center" style={{ gap: '6px' }}><Activity size={16} /> Ready to Assist</span>
          </div>
        </div>
        <div className="flex-center" style={{ gap: '12px' }}>
          {pendingAlerts > 0 && (
            <div className="badge badge-high" style={{ padding: '12px 24px', borderRadius: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={14} /> {pendingAlerts} Urgent Requests
            </div>
          )}
          <div className="blood-tag" style={{ border: '2px solid white' }}>{donor.blood_group}</div>
        </div>
      </header>

      <div className="ui-panel" style={{ padding: '40px', marginBottom: '60px', background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-app) 100%)' }}>
        <div className="flex-between">
          <div className="flex-center" style={{ gap: '32px' }}>
             <div className="blood-tag" style={{ width: '80px', height: '80px', fontSize: '32px', borderRadius: '24px' }}>{donor.name[0]}</div>
             <div>
               <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>{donor.name}</h2>
               <div style={{ color: 'var(--text-muted)', display: 'flex', gap: '16px', fontSize: '15px' }}>
                 <span className="flex-center" style={{ gap: '6px' }}><MapPin size={16} /> {donor.city}</span>
                 <span className="flex-center" style={{ gap: '6px' }}><Phone size={16} /> {donor.phone}</span>
               </div>
             </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <p className="stat-label" style={{ marginBottom: '16px' }}>Network Visibility</p>
            <div className="flex-center" style={{ gap: '16px', justifyContent: 'flex-end' }}>
               <span style={{ fontSize: '15px', fontWeight: 700, color: donor.available ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                 {donor.available ? 'AVAILABLE' : 'OFFLINE'}
               </span>
               <div onClick={toggleAvailable} className={`toggle-switch ${donor.available ? 'active' : ''}`}>
                 <div className="toggle-thumb" />
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="view-tabs">
        <button className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>
          <Bell size={18} /> Emergency Alerts
        </button>
        <button className={`tab-btn ${activeTab === 'directory' ? 'active' : ''}`} onClick={() => setActiveTab('directory')}>
          <Hospital size={18} /> Network Hospitals
        </button>
      </div>

      {activeTab === 'alerts' && (
        <section className="fade-in">
          <h2 style={{ fontSize: '24px', marginBottom: '32px' }}>Emergency Alerts</h2>
          <div className="stream-container">
            {loading ? (
               <div style={{ color: 'var(--text-muted)' }}>Scanning network frequency...</div>
            ) : myResponses.length === 0 ? (
               <div className="ui-panel flex-center" style={{ padding: '80px', borderStyle: 'dashed', background: 'transparent' }}>
                 <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No matching alerts in your area</p>
               </div>
            ) : (
              myResponses.map(({ response, request }) => (
                <AlertCard key={response.id} response={response} request={request} onRespond={refetch} />
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === 'directory' && (
        <section className="fade-in">
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px' }}>Registered Hospitals</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Medical facilities connected to the LifeLink network.</p>
          </div>
          
          <div className="master-detail-container">
            <div className="master-list">
              {hospitals.length === 0 ? (
                <div className="ui-panel flex-center" style={{ padding: '40px', justifyContent: 'center', borderStyle: 'dashed', background: 'transparent' }}>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No hospitals registered yet.</p>
                </div>
              ) : (
                hospitals.map(hospital => (
                  <div 
                    key={hospital.id} 
                    className={`ui-panel directory-card master-item ${selectedHospital?.id === hospital.id ? 'active' : ''}`}
                    onClick={() => setSelectedHospital(hospital)}
                    style={{ cursor: 'pointer', padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}
                  >
                    <div className="blood-tag flex-center" style={{ minWidth: '48px', height: '48px', justifyContent: 'center', background: 'var(--bg-app)', color: 'var(--accent-blue)', boxShadow: 'none', border: '1px solid var(--border-soft)' }}>
                      <Hospital size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{hospital.name}</h3>
                      <div className="flex-center" style={{ gap: '6px', fontSize: '13px', marginTop: '4px', color: 'var(--text-muted)' }}>
                        <span className="status-dot active"></span> Active Facility
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="detail-pane ui-panel" style={{ padding: '32px', minHeight: '400px' }}>
              {selectedHospital ? (
                <div className="fade-in">
                  <div className="flex-between" style={{ marginBottom: '32px' }}>
                    <div className="flex-center" style={{ gap: '20px' }}>
                      <div className="blood-tag flex-center" style={{ width: '64px', height: '64px', fontSize: '24px', borderRadius: '16px', background: 'var(--bg-app)', color: 'var(--accent-blue)', boxShadow: 'none', border: '1px solid var(--border-soft)' }}>
                        <Hospital size={32} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>{selectedHospital.name}</h2>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                          Registered Medical Facility
                        </div>
                      </div>
                    </div>
                    <div className="flex-center" style={{ gap: '8px', fontSize: '14px', fontWeight: 600, padding: '8px 16px', borderRadius: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-soft)' }}>
                      <span className="status-dot active"></span>
                      Verified
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                    <div className="ui-panel" style={{ background: 'var(--bg-app)', padding: '20px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Location</div>
                      <div className="flex-center" style={{ gap: '8px', fontSize: '16px', fontWeight: 500 }}><MapPin size={18} /> {selectedHospital.city}</div>
                    </div>
                    <div className="ui-panel" style={{ background: 'var(--bg-app)', padding: '20px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Contact Number</div>
                      <div className="flex-center" style={{ gap: '8px', fontSize: '16px', fontWeight: 500 }}><Phone size={18} /> {selectedHospital.phone || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="ui-panel" style={{ background: 'var(--bg-app)', padding: '24px' }}>
                    <div className="flex-between" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-soft)', marginBottom: '16px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Contact Person</span>
                      <strong style={{ fontSize: '16px' }}>{selectedHospital.contact_person || 'N/A'}</strong>
                    </div>
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)' }}>Joined Network</span>
                      <strong style={{ fontSize: '16px' }}>{new Date(selectedHospital.created_at).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '16px', color: 'var(--text-muted)' }}>
                  <Hospital size={48} strokeWidth={1} style={{ opacity: 0.5 }} />
                  <p style={{ fontSize: '16px' }}>Select a hospital to view details</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}