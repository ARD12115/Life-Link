import { useState } from 'react'
import HospitalDashboard from './components/HospitalDashboard'
import DonorDashboard    from './components/DonorDashboard'

const VIEWS = [
  { key: 'hospital', label: '🏥  Hospital staff', activeColor: '#c0392b', activeBg: '#fff1f0' },
  { key: 'donor',    label: '🩸  Blood donor',    activeColor: '#185fa5', activeBg: '#edf4fc' },
]

export default function App() {
  const [view, setView] = useState('hospital')

  return (
    <div>
      {/* ── Sticky top switcher ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#111', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: '9px 16px',
        boxShadow: '0 1px 0 rgba(255,255,255,0.05)',
      }}>
        <span style={{ color: '#555', fontSize: 11, marginRight: 6, letterSpacing: '0.04em' }}>
          VIEW AS
        </span>

        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            style={{
              padding: '5px 18px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.18s',
              background: view === v.key ? v.activeBg : 'transparent',
              color:      view === v.key ? v.activeColor : '#666',
              boxShadow:  view === v.key ? `0 0 0 1px ${v.activeColor}33` : 'none',
            }}>
            {v.label}
          </button>
        ))}

        <span style={{ color: '#333', fontSize: 10, marginLeft: 10, letterSpacing: '0.03em' }}>
          Switch to see realtime sync across tabs
        </span>
      </div>

      {/* ── Dashboard ── */}
      {view === 'hospital'
        ? <HospitalDashboard />
        : <DonorDashboard />}
    </div>
  )
}