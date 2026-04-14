// src/components/HospitalDashboard.jsx

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRequests } from '../hooks/useRequests'
import { useHospitals, useDonors } from '../hooks/useDonors'
import {
  AlertCircle, Clock, CheckCircle, Plus, X,
  Activity, ChevronDown, ChevronUp, Phone, User,
} from 'lucide-react'

const BLOOD_GROUPS  = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const COMPONENTS    = ['Whole blood', 'Platelets', 'Plasma', 'RBC']
const URGENCY_OPTS  = ['Routine', 'Urgent', 'Critical']

const URGENCY_STYLE = {
  Routine:  { bg: '#eaf3de', color: '#3b6d11', border: '#c0dd97' },
  Urgent:   { bg: '#faeeda', color: '#854f0b', border: '#fac775' },
  Critical: { bg: '#fde8e8', color: '#a32d2d', border: '#f7c1c1' },
}

const STATUS_STYLE = {
  open:        { bg: '#fde8e8', color: '#a32d2d', label: 'Open' },
  in_progress: { bg: '#faeeda', color: '#854f0b', label: 'In progress' },
  filled:      { bg: '#eaf3de', color: '#3b6d11', label: 'Filled' },
  cancelled:   { bg: '#f1efe8', color: '#5f5e5a', label: 'Cancelled' },
}

const DONOR_STATUS_STYLE = {
  alerted:   { bg: '#faeeda', color: '#854f0b', label: 'Alerted' },
  confirmed: { bg: '#e6f1fb', color: '#185fa5', label: 'Confirmed' },
  declined:  { bg: '#fde8e8', color: '#a32d2d', label: 'Declined' },
  donated:   { bg: '#eaf3de', color: '#3b6d11', label: 'Donated' },
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

/* ─── New Request Modal ─────────────────────────────────────── */
function NewRequestModal({ hospitals, onClose }) {
  const { donors } = useDonors()

  const [form, setForm] = useState({
    hospital_id:  hospitals[0]?.id || '',
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

  // Live match count when modal opens
  const currentMatch = donors.filter(
    d => d.blood_group === form.blood_group && d.available
  ).length

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Modal header */}
        <div style={styles.modalHeader}>
          <span style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
            New blood request
          </span>
          <button onClick={onClose} style={styles.iconBtn}><X size={16} /></button>
        </div>

        {/* Hospital selector */}
        <div style={styles.field}>
          <label style={styles.label}>Hospital</label>
          <select style={styles.select}
            value={form.hospital_id}
            onChange={e => setForm(f => ({ ...f, hospital_id: e.target.value }))}>
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
            ))}
          </select>
        </div>

        {/* Blood group chips */}
        <div style={styles.field}>
          <label style={styles.label}>Blood group needed</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {BLOOD_GROUPS.map(bg => (
              <button key={bg} onClick={() => handleBloodGroupChange(bg)}
                style={{
                  ...styles.chip,
                  ...(form.blood_group === bg
                    ? { background: '#fde8e8', borderColor: '#c0392b', color: '#a32d2d', fontWeight: 700 }
                    : {}),
                }}>
                {bg}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 7, fontSize: 11, color: (matchCount ?? currentMatch) > 0 ? '#3b6d11' : '#a32d2d' }}>
            {(matchCount ?? currentMatch) > 0
              ? `✓ ${matchCount ?? currentMatch} available donor${(matchCount ?? currentMatch) > 1 ? 's' : ''} will be alerted`
              : '⚠ No available donors for this blood group right now'}
          </div>
        </div>

        {/* Component + units */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={styles.field}>
            <label style={styles.label}>Component</label>
            <select style={styles.select}
              value={form.component}
              onChange={e => setForm(f => ({ ...f, component: e.target.value }))}>
              {COMPONENTS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Units needed</label>
            <input type="number" min={1} max={10}
              style={styles.input}
              value={form.units_needed}
              onChange={e => setForm(f => ({ ...f, units_needed: parseInt(e.target.value) || 1 }))} />
          </div>
        </div>

        {/* Urgency chips */}
        <div style={styles.field}>
          <label style={styles.label}>Urgency</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {URGENCY_OPTS.map(u => {
              const urg = URGENCY_STYLE[u]
              return (
                <button key={u}
                  onClick={() => setForm(f => ({ ...f, urgency: u }))}
                  style={{
                    ...styles.chip, flex: 1,
                    ...(form.urgency === u
                      ? { background: urg.bg, borderColor: urg.border, color: urg.color, fontWeight: 600 }
                      : {}),
                  }}>
                  {u}
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div style={styles.field}>
          <label style={styles.label}>Notes (optional)</label>
          <input style={styles.input}
            placeholder="Patient condition, ward number, contact info…"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>

        {/* Submit row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button onClick={onClose} style={{ ...styles.btnSecondary, flex: 1 }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ ...styles.btnPrimary, flex: 2, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Sending alerts…' : 'Post request & alert donors'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Hospital Dashboard ────────────────────────────────────── */
export default function HospitalDashboard() {
  const { requests, loading } = useRequests()
  const { hospitals }         = useHospitals()
  const [showModal, setShowModal]   = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  // Stats
  const open        = requests.filter(r => r.status === 'open').length
  const inProgress  = requests.filter(r => r.status === 'in_progress').length
  const filled      = requests.filter(r => r.status === 'filled').length
  const totalAlerted = requests.reduce((acc, r) => acc + (r.donor_responses?.length || 0), 0)

  const updateStatus = async (id, status, e) => {
    e?.stopPropagation()
    await supabase
      .from('blood_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  const toggleExpand = (id) => setExpandedId(prev => (prev === id ? null : id))

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={styles.logoDot} />
          <span style={styles.logoText}>Life Link</span>
          <span style={styles.roleBadge}>Hospital dashboard</span>
        </div>
        <button onClick={() => setShowModal(true)} style={styles.btnPrimary}>
          <Plus size={14} style={{ marginRight: 5 }} />New request
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div style={styles.statsRow}>
        {[
          { label: 'Open requests',  value: open,         color: '#c0392b', icon: <AlertCircle size={16} /> },
          { label: 'In progress',    value: inProgress,   color: '#ba7517', icon: <Clock size={16} /> },
          { label: 'Filled today',   value: filled,       color: '#3b6d11', icon: <CheckCircle size={16} /> },
          { label: 'Donors alerted', value: totalAlerted, color: '#185fa5', icon: <Activity size={16} /> },
        ].map(s => (
          <div key={s.label} style={styles.statCard}>
            <div style={{ color: s.color, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 600, color: s.color, fontFamily: "'Georgia', serif", lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Request list ── */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Active requests</div>

        {loading && <div style={styles.empty}>Loading…</div>}

        {!loading && requests.length === 0 && (
          <div style={styles.emptyState}>
            <AlertCircle size={24} style={{ color: '#ddd', marginBottom: 10 }} />
            <div style={{ fontSize: 13, color: '#888' }}>No requests yet.</div>
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
              Click "New request" to post the first blood request.
            </div>
          </div>
        )}

        {requests.map(req => {
          const st        = STATUS_STYLE[req.status] || STATUS_STYLE.open
          const urg       = URGENCY_STYLE[req.urgency] || URGENCY_STYLE.Urgent
          const confirmed = req.donor_responses?.filter(
            r => r.status === 'confirmed' || r.status === 'donated'
          ).length || 0
          const alerted   = req.donor_responses?.length || 0
          const isOpen    = expandedId === req.id

          return (
            <div key={req.id}
              style={{ ...styles.reqCard, ...(isOpen ? { borderColor: '#c0392b' } : {}) }}
              onClick={() => toggleExpand(req.id)}>

              {/* Card top row */}
              <div style={styles.reqTop}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    ...styles.bloodPill,
                    background: urg.bg, color: urg.color, borderColor: urg.border,
                  }}>
                    {req.blood_group}
                  </div>
                  <div>
                    <div style={styles.reqTitle}>
                      {req.hospitals?.name}
                      <span style={{ color: '#888', fontWeight: 400 }}> — {req.component}</span>
                    </div>
                    <div style={styles.reqMeta}>
                      {req.units_needed} unit{req.units_needed > 1 ? 's' : ''}
                      &nbsp;·&nbsp;{timeAgo(req.created_at)}
                      &nbsp;·&nbsp;{alerted} alerted
                      &nbsp;·&nbsp;{confirmed} confirmed
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ ...styles.statusPill, background: st.bg, color: st.color }}>{st.label}</span>
                  <span style={{ ...styles.statusPill, background: urg.bg, color: urg.color }}>{req.urgency}</span>
                  {isOpen
                    ? <ChevronUp size={14} style={{ color: '#888', flexShrink: 0 }} />
                    : <ChevronDown size={14} style={{ color: '#888', flexShrink: 0 }} />}
                </div>
              </div>

              {/* Notes */}
              {req.notes && (
                <div style={styles.reqNotes}>{req.notes}</div>
              )}

              {/* Expanded: responding donors */}
              {isOpen && req.donor_responses?.length > 0 && (
                <div style={styles.donorList}>
                  <div style={styles.donorListTitle}>Responding donors</div>
                  {req.donor_responses.map(dr => {
                    const dst = DONOR_STATUS_STYLE[dr.status] || DONOR_STATUS_STYLE.alerted
                    return (
                      <div key={dr.id} style={styles.donorRow}>
                        <div style={{ ...styles.avatar, background: dst.bg, color: dst.color }}>
                          {(dr.donors?.name || 'D').slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a' }}>
                            {dr.donors?.name}
                          </div>
                          <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>
                            {dr.donors?.blood_group}
                            {dr.donors?.city ? ` · ${dr.donors.city}` : ''}
                            {dr.donors?.phone ? ` · ${dr.donors.phone}` : ''}
                          </div>
                        </div>
                        {dr.eta_minutes && (
                          <div style={{ fontSize: 11, color: '#185fa5', whiteSpace: 'nowrap' }}>
                            ETA {dr.eta_minutes} min
                          </div>
                        )}
                        <span style={{ ...styles.statusPill, background: dst.bg, color: dst.color }}>
                          {dst.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {isOpen && req.donor_responses?.length === 0 && (
                <div style={{ ...styles.donorList, color: '#aaa', fontSize: 12 }}>
                  No donors alerted yet for this request.
                </div>
              )}

              {/* Expanded: status buttons */}
              {isOpen && (
                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}
                  onClick={e => e.stopPropagation()}>
                  <span style={{ fontSize: 11, color: '#888', alignSelf: 'center', marginRight: 4 }}>
                    Set status:
                  </span>
                  {['open', 'in_progress', 'filled', 'cancelled'].map(s => (
                    <button key={s}
                      onClick={(e) => updateStatus(req.id, s, e)}
                      style={{
                        ...styles.chip,
                        ...(req.status === s
                          ? { background: STATUS_STYLE[s].bg, color: STATUS_STYLE[s].color, borderColor: STATUS_STYLE[s].color, fontWeight: 600 }
                          : {}),
                      }}>
                      {STATUS_STYLE[s].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showModal && (
        <NewRequestModal
          hospitals={hospitals}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

/* ─── Styles ────────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    background: '#fafaf8',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    borderBottom: '0.5px solid #e0ddd6',
    background: '#fff',
  },
  logoDot:  { width: 10, height: 10, borderRadius: '50%', background: '#c0392b' },
  logoText: { fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 600, color: '#1a1a1a' },
  roleBadge: {
    fontSize: 11, padding: '3px 9px', borderRadius: 20,
    background: '#fde8e8', color: '#a32d2d', border: '0.5px solid #f7c1c1',
  },
  btnPrimary: {
    display: 'flex', alignItems: 'center',
    background: '#c0392b', color: '#fff',
    border: 'none', borderRadius: 8,
    padding: '8px 16px', fontSize: 12,
    fontWeight: 500, cursor: 'pointer', transition: 'opacity 0.15s',
  },
  btnSecondary: {
    background: '#fff', color: '#444',
    border: '0.5px solid #ddd', borderRadius: 8,
    padding: '8px 16px', fontSize: 12, cursor: 'pointer',
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12, padding: '16px 24px',
  },
  statCard: {
    background: '#fff', border: '0.5px solid #e8e6e0',
    borderRadius: 12, padding: '16px 18px',
  },
  section:      { padding: '0 24px 28px' },
  sectionTitle: {
    fontFamily: "'Georgia', serif",
    fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 12,
  },
  empty: { color: '#888', fontSize: 13, padding: '20px 0', textAlign: 'center' },
  emptyState: {
    background: '#fff', border: '0.5px solid #e8e6e0',
    borderRadius: 12, padding: 32, textAlign: 'center',
  },
  reqCard: {
    background: '#fff', border: '0.5px solid #e8e6e0',
    borderRadius: 12, padding: '14px 16px',
    marginBottom: 8, cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  reqTop: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
  },
  bloodPill: {
    fontSize: 13, fontWeight: 700,
    padding: '4px 10px', borderRadius: 20,
    border: '0.5px solid',
    minWidth: 40, textAlign: 'center',
    fontFamily: "'Georgia', serif",
    flexShrink: 0,
  },
  reqTitle:  { fontSize: 13, fontWeight: 600, color: '#1a1a1a' },
  reqMeta:   { fontSize: 11, color: '#888', marginTop: 2 },
  reqNotes: {
    fontSize: 11, color: '#666', marginTop: 8,
    padding: '6px 10px', background: '#fafaf8',
    borderRadius: 6, fontStyle: 'italic',
  },
  statusPill: { fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 500 },
  donorList:  { marginTop: 12, borderTop: '0.5px solid #f0ede6', paddingTop: 10 },
  donorListTitle: {
    fontSize: 10, color: '#aaa', marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  donorRow: {
    display: 'flex', alignItems: 'center',
    gap: 8, paddingBottom: 8, marginBottom: 8,
    borderBottom: '0.5px solid #f5f3ee',
  },
  avatar: {
    width: 28, height: 28, borderRadius: '50%',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10, fontWeight: 700, flexShrink: 0,
  },
  chip: {
    fontSize: 11, padding: '5px 11px',
    borderRadius: 20, border: '0.5px solid #ddd',
    background: '#fff', color: '#555', cursor: 'pointer',
    transition: 'all 0.1s',
  },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.38)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 100,
  },
  modal: {
    background: '#fff', borderRadius: 14,
    padding: 26, width: 490,
    maxHeight: '92vh', overflowY: 'auto',
    boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 18,
  },
  iconBtn:  { background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 },
  field:    { marginBottom: 14 },
  label: {
    display: 'block', fontSize: 10, color: '#888',
    marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  input: {
    width: '100%', padding: '8px 10px',
    border: '0.5px solid #ddd', borderRadius: 8,
    fontSize: 13, color: '#1a1a1a',
    background: '#fafaf8', boxSizing: 'border-box',
    outline: 'none',
  },
  select: {
    width: '100%', padding: '8px 10px',
    border: '0.5px solid #ddd', borderRadius: 8,
    fontSize: 13, color: '#1a1a1a', background: '#fafaf8',
    outline: 'none',
  },
}