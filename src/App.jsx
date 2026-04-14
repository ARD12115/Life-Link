import React, { useState, useEffect } from 'react'
import HospitalDashboard from './components/HospitalDashboard'
import DonorDashboard    from './components/DonorDashboard'
import VisualEnvironment from './components/VisualEnvironment'
import Auth              from './components/Auth'
import { useTheme }      from './context/ThemeContext'
import { supabase }      from './lib/supabase'
import { Sun, Moon, Monitor, Hospital, Heart, LogOut } from 'lucide-react'

const VIEWS = [
  { key: 'hospital', label: 'Hospital', icon: <Hospital size={16} /> },
  { key: 'donor',    label: 'Donor',    icon: <Heart size={16} /> },
]

const THEMES = [
  { key: 'light',  icon: <Sun size={14} />,     label: 'Light' },
  { key: 'dark',   icon: <Moon size={14} />,    label: 'Dark' },
  { key: 'system', icon: <Monitor size={14} />, label: 'System' },
]

export default function App() {
  const [view, setView] = useState('hospital')
  const [session, setSession] = useState(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = () => supabase.auth.signOut()

  return (
    <div className="app-container">
      <VisualEnvironment />

      <main style={{ paddingBottom: '100px', minHeight: '100vh' }}>
        {!session ? (
          <Auth />
        ) : (
          view === 'hospital' ? <HospitalDashboard user={session.user} /> : <DonorDashboard user={session.user} />
        )}
      </main>

      {session && (
        <div className="floating-nav">
          <div style={{ display: 'flex', borderRight: '1px solid var(--glass-border)', paddingRight: '8px', marginRight: '8px' }}>
            {VIEWS.map(v => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`nav-item ${view === v.key ? 'active' : ''}`}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {v.icon}
                  {v.label}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '4px', borderRight: '1px solid var(--glass-border)', paddingRight: '8px', marginRight: '8px' }}>
            {THEMES.map(t => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                title={`${t.label} mode`}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: theme === t.key ? 'var(--bg-secondary)' : 'transparent',
                  color: theme === t.key ? 'var(--blood-ruby)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                  boxShadow: theme === t.key ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {t.icon}
              </button>
            ))}
          </div>

          <button onClick={handleLogout} className="nav-item" style={{ color: 'var(--text-secondary)' }}>
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  )
}