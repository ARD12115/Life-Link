// src/components/DonorDashboard.jsx

import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useRequests } from '../hooks/useRequests'
import { useDonors, useHospitals } from '../hooks/useDonors'
import { Heart, MapPin, CheckCircle, Bell, Phone, Activity, ShieldCheck, Droplets, Hospital, Navigation } from 'lucide-react'
import EmergencyMap from './EmergencyMap'
import { useNotifications } from '../hooks/useNotifications'

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
  const { donors } = useDonors()
  const [activeTab, setActiveTab] = useState('alerts')
  const [selectedHospital, setSelectedHospital] = useState(null)
  const { permission, subscribe } = useNotifications(user)

  useEffect(() => {
    async function loadDonorProfile() {
      if (!user) {
        setProfileLoading(false)
        return 
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
            
            let currentUser = user;
            // Handle anonymous sign-in for new visitors seamlessly
            if (!currentUser) {
              const { data, error } = await supabase.auth.signInAnonymously()
              if (error) {
                console.error("Anonymous Auth Error:", error)
                return alert(`Authentication failed: ${error.message}. Please check if Anonymous Sign-In is enabled in Supabase.`)
              }
              currentUser = data.session?.user
            }

            if (!currentUser) return alert("System error: Authentication failed.")

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

            // Create donor record
            const { data } = await supabase.from('donors').insert([{ 
              user_id: currentUser.id, 
              name: fd.get('name'), 
              blood_group: fd.get('blood_group'), 
              city: fd.get('city'), 
              phone: fd.get('phone'),
              latitude: lat,
              longitude: lng
            }]).select().single()
            
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

  // MAIN DASHBOARD
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
          <button 
            onClick={subscribe} 
            className={`btn-${permission === 'granted' ? 'solid' : 'ghost'}`} 
            style={{ padding: '10px 24px', fontSize: '14px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Bell size={16} /> 
            {permission === 'granted' ? 'Alerts Active' : 'Enable Desktop Alerts'}
          </button>
          <div className="blood-tag" style={{ border: '2px solid white', width: '50px', height: '50px', fontSize: '20px' }}>{donor.blood_group}</div>
        </div>
      </header>

      {/* Impact Section: Mirroring Mobile Hero UI */}
      <div className="ui-panel" style={{ 
        padding: '60px', 
        marginBottom: '60px', 
        background: 'linear-gradient(135deg, var(--accent-red) 0%, #FF6B8A 100%)',
        borderRadius: '32px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(255,45,85,0.2)'
      }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.1em', opacity: 0.8, marginBottom: '12px' }}>YOUR MISSION IMPACT</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '72px', fontWeight: 900 }}>{donor.total_donations || 0}</span>
              <span style={{ fontSize: '24px', fontWeight: 700, opacity: 0.9 }}>Lives Saved</span>
            </div>
            <p style={{ marginTop: '24px', fontSize: '16px', fontWeight: 500, opacity: 0.9, maxWidth: '400px' }}>
               You are an active part of the LifeLink emergency network in {donor.city}.
            </p>
          </div>
          <div className="flex-center" style={{ gap: '60px' }}>
             <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '32px', fontWeight: 800 }}>{donor.blood_group}</div>
               <div style={{ fontSize: '12px', fontWeight: 700, opacity: 0.8 }}>BLOOD TYPE</div>
             </div>
             <div style={{ height: '60px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />
             <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800 }}>{myResponses.length}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, opacity: 0.8 }}>ACTIVE ALERTS</div>
             </div>
          </div>
        </div>
        {/* Decorative backdrop icon */}
        <Heart size={300} style={{ position: 'absolute', right: '-40px', bottom: '-80px', opacity: 0.1, color: 'white' }} />
      </div>

      <div className="view-tabs">
        <button className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>
          <Bell size={18} /> Active Missions
        </button>
        <button className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
          <Navigation size={18} /> Mission Map
        </button>
        <button className={`tab-btn ${activeTab === 'directory' ? 'active' : ''}`} onClick={() => setActiveTab('directory')}>
          <Hospital size={18} /> Network Hospitals
        </button>
      </div>

      {activeTab === 'alerts' && (
        <section className="fade-in">
          <div className="flex-between" style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px' }}>Active Mission Stream</h2>
            <div className="flex-center" style={{ gap: '16px' }}>
               <div className="flex-center" style={{ gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <span className="status-dot active"></span> Tracking Live
               </div>
               <button onClick={refetch} className="btn-ghost" style={{ padding: '8px 16px', fontSize: '12px' }}>Force Sync</button>
            </div>
          </div>
          
          <div className="stream-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' }}>
            {loading ? (
               <div style={{ color: 'var(--text-muted)' }}>Syncing mission frequencies...</div>
            ) : myResponses.length === 0 ? (
               <div className="ui-panel flex-center" style={{ gridColumn: '1/-1', padding: '100px', borderStyle: 'dashed', background: 'transparent', flexDirection: 'column', gap: '20px' }}>
                 <ShieldCheck size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
                 <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '18px' }}>No active emergencies requiring {donor.blood_group} in your sector.</p>
               </div>
            ) : (
              myResponses.map(({ response, request }) => (
                <AlertCard key={response.id} response={response} request={request} onRespond={refetch} />
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === 'map' && (
        <section className="fade-in">
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px' }}>Real-time Emergency Map</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Locate urgent needs and see your contribution to the network.</p>
          </div>
          <EmergencyMap donors={donors} hospitals={hospitals} requests={requests} donorView={true} />
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