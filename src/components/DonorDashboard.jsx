// src/components/DonorDashboard.jsx

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useRequests } from '../hooks/useRequests'
import { useDonors } from '../hooks/useDonors'
import { Heart, MapPin, CheckCircle, X, Bell, Phone } from 'lucide-react'

const URGENCY_STYLE = {
  Routine:  { bg: '#eaf3de', color: '#3b6d11', border: '#c0dd97' },
  Urgent:   { bg: '#faeeda', color: '#854f0b', border: '#fac775' },
  Critical: { bg: '#fde8e8', color: '#a32d2d', border: '#f7c1c1' },
}

const ETA_OPTIONS = [8, 12, 15, 20, 25, 30]

function daysSince(dateStr) {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000)
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

// Stable ETA: derive from the response id so it doesn't change per render
function stableEta(id) {
  const charSum = (id || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  return ETA_OPTIONS[charSum % ETA_OPTIONS.length]
}

function AlertCard({ response, request, onRespond }) {
  const urg = URGENCY_STYLE[request?.urgency] || URGENCY_STYLE.Urgent
  const [loading, setLoading] = useState(false)
  const eta = response.eta_minutes ?? stableEta(response.id)

  const respond = async (status) => {
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
      // Only move to in_progress if request was still open
      await supabase
        .from('blood_requests')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', request.id)
        .eq('status', 'open')
    }

    if (status === 'donated') {
      // Update request to filled if this was the last one needed
      await supabase
        .from('blood_requests')
        .update({ status: 'filled', updated_at: new Date().toISOString() })
        .eq('id', request.id)
        .eq('status', 'in_progress')
    }

    setLoading(false)
    onRespond()
  }

  if (!request) return null

  const isOpen      = response.status === 'alerted'
  const isConfirmed = response.status === 'confirmed'
  const isDeclined  = response.status === 'declined'
  const isDonated   = response.status === 'donated'

  return (
    <div style={{
      ...styles.alertCard,
      borderColor: isDeclined ? '#e0ddd6' : urg.border,
      background: isDeclined ? '#fafaf8' : '#fff',
      opacity: isDeclined ? 0.65 : 1,
    }}>
      {/* Card top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            ...styles.bloodBadge,
            background: urg.bg, color: urg.color, borderColor: urg.border,
          }}>
            {request.blood_group}
          </div>
          <div>
            <div style={styles.alertTitle}>{request.hospitals?.name}</div>
            <div style={styles.alertSub}>{request.hospitals?.city}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ ...styles.urgencyPill, background: urg.bg, color: urg.color }}>
            {request.urgency}
          </span>
          <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
            {timeAgo(request.created_at)}
          </div>
        </div>
      </div>

      {/* Details row */}
      <div style={styles.alertDetails}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Heart size={11} />
          {request.component} · {request.units_needed} unit{request.units_needed > 1 ? 's' : ''}
        </span>
        {request.hospitals?.contact_person && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={11} />
            {request.hospitals.contact_person}
          </span>
        )}
        {request.hospitals?.phone && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Phone size={11} />
            {request.hospitals.phone}
          </span>
        )}
        {request.notes && (
          <span style={{ color: '#888', fontStyle: 'italic' }}>{request.notes}</span>
        )}
      </div>

      {/* CTA */}
      {isOpen && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={() => respond('declined')} disabled={loading}
            style={{ ...styles.btnDecline, flex: 1 }}>
            <X size={13} style={{ marginRight: 4 }} />Not available
          </button>
          <button onClick={() => respond('confirmed')} disabled={loading}
            style={{ ...styles.btnAccept, flex: 2 }}>
            <CheckCircle size={13} style={{ marginRight: 4 }} />I can donate
          </button>
        </div>
      )}

      {isConfirmed && (
        <div style={styles.confirmBannerGreen}>
          <CheckCircle size={14} />
          <span>Confirmed · ETA {eta} min · hospital notified</span>
          <button onClick={() => respond('donated')} disabled={loading} style={styles.donatedBtn}>
            Mark as donated
          </button>
        </div>
      )}

      {isDeclined && (
        <div style={styles.confirmBannerRed}>
          <X size={14} />
          <span>You declined this request</span>
        </div>
      )}

      {isDonated && (
        <div style={styles.confirmBannerGreen}>
          <Heart size={14} />
          <span>Donation recorded — thank you for saving a life! 🩸</span>
        </div>
      )}
    </div>
  )
}

export default function DonorDashboard() {
  const { requests, loading, refetch } = useRequests()
  const { donors, refetch: refetchDonors } = useDonors()
  const [selectedDonorId, setSelectedDonorId] = useState('')
  const [togglingAvail, setTogglingAvail] = useState(false)

  useEffect(() => {
    if (donors.length > 0 && !selectedDonorId) {
      setSelectedDonorId(donors[0].id)
    }
  }, [donors])

  const donor = donors.find(d => d.id === selectedDonorId)
  const daysSinceDonation = daysSince(donor?.last_donated)
  const eligible = daysSinceDonation === null || daysSinceDonation >= 56

  // Collect this donor's alerts
  const myResponses = []
  requests.forEach(req => {
    const dr = req.donor_responses?.find(r => r.donor_id === selectedDonorId)
    if (dr) myResponses.push({ response: dr, request: req })
  })

  const pendingAlerts  = myResponses.filter(r => r.response.status === 'alerted').length
  const confirmedToday = myResponses.filter(r => r.response.status === 'confirmed').length
  const donatedCount   = myResponses.filter(r => r.response.status === 'donated').length

  const toggleAvailable = async () => {
    if (!donor || togglingAvail) return
    setTogglingAvail(true)
    await supabase
      .from('donors')
      .update({ available: !donor.available })
      .eq('id', donor.id)
    // Realtime will update; refetch as backup
    await refetchDonors()
    setTogglingAvail(false)
  }

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={styles.logoDot} />
          <span style={styles.logoText}>Life Link</span>
          <span style={styles.roleBadge}>Donor view</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {pendingAlerts > 0 && (
            <div style={styles.alertBadge}>
              <Bell size={12} />
              <span>{pendingAlerts} new alert{pendingAlerts > 1 ? 's' : ''}</span>
            </div>
          )}
          <select style={styles.donorSelect}
            value={selectedDonorId}
            onChange={e => setSelectedDonorId(e.target.value)}>
            {donors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.blood_group})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.body}>
        {/* ── Profile Card ── */}
        {donor && (
          <div style={styles.profileCard}>
            <div style={styles.profileTop}>
              <div style={styles.avatar}>
                {donor.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.profileName}>{donor.name}</div>
                <div style={styles.profileSub}>{donor.city} · {donor.phone}</div>
              </div>
              <div style={{
                ...styles.bloodBadge,
                fontSize: 20, padding: '6px 16px',
                background: '#fde8e8', color: '#a32d2d',
                borderColor: '#f7c1c1',
              }}>
                {donor.blood_group}
              </div>
            </div>

            <div style={styles.profileStats}>
              {[
                { label: 'Total donations', value: donor.total_donations + donatedCount, color: '#c0392b' },
                { label: 'Days since last',  value: daysSinceDonation ?? '—',             color: eligible ? '#3b6d11' : '#ba7517' },
                { label: 'Eligibility',      value: eligible ? 'Eligible' : 'Wait',       color: eligible ? '#3b6d11' : '#ba7517' },
                { label: 'Confirmed today',  value: confirmedToday,                        color: '#185fa5' },
              ].map(s => (
                <div key={s.label} style={styles.miniStat}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: s.color, fontFamily: "'Georgia', serif" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={styles.availRow}>
              <span style={{ fontSize: 12, color: '#444' }}>Available to donate</span>
              <div onClick={toggleAvailable} style={{
                ...styles.toggle,
                background: donor.available ? '#3b6d11' : '#ccc',
                opacity: togglingAvail ? 0.6 : 1,
              }}>
                <div style={{
                  ...styles.toggleThumb,
                  transform: donor.available ? 'translateX(16px)' : 'translateX(0)',
                }} />
              </div>
              <span style={{ fontSize: 11, color: donor.available ? '#3b6d11' : '#888' }}>
                {togglingAvail ? 'Saving…' : donor.available ? 'Active' : 'Off'}
              </span>
            </div>
          </div>
        )}

        {/* ── My Alerts ── */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            Blood requests for your group
            {pendingAlerts > 0 && (
              <span style={styles.badge}>{pendingAlerts} pending</span>
            )}
          </div>

          {loading && <div style={styles.empty}>Loading…</div>}

          {!loading && myResponses.length === 0 && (
            <div style={styles.emptyCard}>
              <Bell size={22} style={{ color: '#ccc', marginBottom: 8 }} />
              <div style={{ fontSize: 13, color: '#888' }}>No alerts yet for your blood group.</div>
              <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
                When hospitals post a matching request, you'll see it here.
              </div>
            </div>
          )}

          {myResponses
            .sort((a, b) => {
              const o = { alerted: 0, confirmed: 1, donated: 2, declined: 3 }
              return (o[a.response.status] ?? 9) - (o[b.response.status] ?? 9)
            })
            .map(({ response, request }) => (
              <AlertCard
                key={response.id}
                response={response}
                request={request}
                onRespond={refetch}
              />
            ))}
        </div>

        {/* ── All Open Requests (non-matching) ── */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>All open requests nearby</div>
          {requests
            .filter(r =>
              r.status === 'open' &&
              !myResponses.find(m => m.request.id === r.id)
            )
            .map(req => {
              const urg = URGENCY_STYLE[req.urgency] || URGENCY_STYLE.Urgent
              return (
                <div key={req.id} style={{
                  ...styles.alertCard,
                  borderColor: '#e0ddd6', opacity: 0.7,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{
                        ...styles.bloodBadge,
                        background: urg.bg, color: urg.color, borderColor: urg.border,
                      }}>
                        {req.blood_group}
                      </div>
                      <div>
                        <div style={styles.alertTitle}>
                          {req.hospitals?.name} — {req.component}
                        </div>
                        <div style={styles.alertSub}>
                          {req.units_needed} unit{req.units_needed > 1 ? 's' : ''} · {timeAgo(req.created_at)}
                        </div>
                      </div>
                    </div>
                    <span style={{ ...styles.urgencyPill, background: urg.bg, color: urg.color }}>
                      {req.urgency}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
                    Requires {req.blood_group} · your group is {donor?.blood_group}
                  </div>
                </div>
              )
            })}
          {!loading && requests.filter(r => r.status === 'open' && !myResponses.find(m => m.request.id === r.id)).length === 0 && (
            <div style={{ ...styles.empty, fontSize: 12 }}>No other open requests right now.</div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', background: '#fafaf8',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    borderBottom: '0.5px solid #e0ddd6',
    background: '#fff',
  },
  logoDot: { width: 10, height: 10, borderRadius: '50%', background: '#c0392b' },
  logoText: {
    fontFamily: "'Georgia', serif",
    fontSize: 16, fontWeight: 600, color: '#1a1a1a',
  },
  roleBadge: {
    fontSize: 11, padding: '3px 9px', borderRadius: 20,
    background: '#e6f1fb', color: '#185fa5',
    border: '0.5px solid #b5d4f4',
  },
  alertBadge: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#fde8e8', color: '#a32d2d',
    fontSize: 11, padding: '4px 10px',
    borderRadius: 20, fontWeight: 500,
  },
  donorSelect: {
    padding: '6px 10px', border: '0.5px solid #ddd',
    borderRadius: 8, fontSize: 12,
    background: '#fafaf8', color: '#1a1a1a',
  },
  body:        { padding: '16px 24px' },
  profileCard: {
    background: '#fff',
    border: '0.5px solid #e8e6e0',
    borderRadius: 14, padding: 18, marginBottom: 18,
  },
  profileTop: {
    display: 'flex', alignItems: 'center',
    gap: 12, marginBottom: 16,
  },
  avatar: {
    width: 44, height: 44, borderRadius: '50%',
    background: '#e6f1fb', color: '#185fa5',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15, fontWeight: 700, flexShrink: 0,
  },
  profileName: {
    fontFamily: "'Georgia', serif",
    fontSize: 16, fontWeight: 600, color: '#1a1a1a',
  },
  profileSub:   { fontSize: 11, color: '#888', marginTop: 2 },
  profileStats: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8, marginBottom: 14,
  },
  miniStat: {
    background: '#fafaf8', borderRadius: 8,
    padding: '10px 10px', textAlign: 'center',
    border: '0.5px solid #f0ede6',
  },
  availRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    paddingTop: 12, borderTop: '0.5px solid #f0ede6',
  },
  toggle: {
    width: 36, height: 20, borderRadius: 20,
    cursor: 'pointer', position: 'relative',
    transition: 'background 0.2s', flexShrink: 0,
  },
  toggleThumb: {
    position: 'absolute', top: 2, left: 2,
    width: 16, height: 16, borderRadius: '50%',
    background: '#fff', transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  section:      { marginBottom: 22 },
  sectionTitle: {
    fontFamily: "'Georgia', serif",
    fontSize: 14, fontWeight: 600, color: '#1a1a1a',
    marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  badge: {
    fontSize: 10, padding: '2px 8px', borderRadius: 20,
    background: '#fde8e8', color: '#a32d2d', fontWeight: 500,
  },
  alertCard: {
    background: '#fff', border: '0.5px solid',
    borderRadius: 12, padding: '14px 16px', marginBottom: 8,
  },
  bloodBadge: {
    fontSize: 14, fontWeight: 700,
    padding: '4px 10px', borderRadius: 20,
    border: '0.5px solid', minWidth: 40, textAlign: 'center',
    fontFamily: "'Georgia', serif",
  },
  alertTitle:   { fontSize: 13, fontWeight: 500, color: '#1a1a1a' },
  alertSub:     { fontSize: 11, color: '#888', marginTop: 2 },
  urgencyPill:  { fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 500 },
  alertDetails: {
    display: 'flex', gap: 14, flexWrap: 'wrap',
    fontSize: 11, color: '#555', alignItems: 'center',
  },
  btnAccept: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#3b6d11', color: '#fff',
    border: 'none', borderRadius: 8,
    padding: '8px 14px', fontSize: 12,
    fontWeight: 500, cursor: 'pointer',
  },
  btnDecline: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#fff', color: '#888',
    border: '0.5px solid #ddd', borderRadius: 8,
    padding: '8px 14px', fontSize: 12, cursor: 'pointer',
  },
  confirmBannerGreen: {
    display: 'flex', alignItems: 'center', gap: 6,
    marginTop: 10, background: '#eaf3de', color: '#3b6d11',
    fontSize: 11, fontWeight: 500,
    padding: '8px 12px', borderRadius: 8,
  },
  confirmBannerRed: {
    display: 'flex', alignItems: 'center', gap: 6,
    marginTop: 10, background: '#fde8e8', color: '#a32d2d',
    fontSize: 11, fontWeight: 500,
    padding: '8px 12px', borderRadius: 8,
  },
  donatedBtn: {
    marginLeft: 'auto', background: '#fff', color: '#3b6d11',
    border: '0.5px solid #c0dd97', borderRadius: 6,
    padding: '4px 9px', fontSize: 10, cursor: 'pointer',
  },
  emptyCard: {
    background: '#fff', border: '0.5px solid #e8e6e0',
    borderRadius: 12, padding: 28, textAlign: 'center',
  },
  empty: {
    color: '#888', fontSize: 13,
    padding: '12px 0', textAlign: 'center',
  },
}