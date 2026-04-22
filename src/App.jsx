import React, { useState, useEffect } from 'react'
import HospitalDashboard from './components/HospitalDashboard'
import DonorDashboard    from './components/DonorDashboard'
import Auth              from './components/Auth'
import { useTheme }      from './context/ThemeContext'
import { supabase }      from './lib/supabase'
import { Sun, Moon, Monitor, Hospital, Heart, LogOut, RotateCcw } from 'lucide-react'

const VIEWS = [
  { key: 'hospital', label: 'Hospital', icon: <Hospital size={18} /> },
  { key: 'donor',    label: 'Donor',    icon: <Heart size={18} /> },
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
  const handleReset = async () => {
    if (window.confirm('Reset application? This will log you out and clear all local settings.')) {
      localStorage.clear()
      await supabase.auth.signOut()
      window.location.reload()
    }
  }

  return (
    <div className="app-container">
      <main style={{ minHeight: '100vh' }}>
        {!session ? (
          <Auth />
        ) : (
          view === 'hospital' ? <HospitalDashboard user={session.user} /> : <DonorDashboard user={session.user} />
        )}
      </main>

      <div className="floating-nav fade-in">
        {session && (
          <div style={{ display: 'flex', borderRight: '1px solid var(--border-soft)', paddingRight: '8px', marginRight: '8px' }}>
            {VIEWS.map(v => (
              <button key={v.key} onClick={() => setView(v.key)} className={`nav-item ${view === v.key ? 'active' : ''}`}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="theme-dock">
          <button onClick={() => setTheme('light')} className={`theme-btn ${theme === 'light' ? 'active' : ''}`} title="Light Mode"><Sun size={16} /></button>
          <button onClick={() => setTheme('dark')} className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} title="Dark Mode"><Moon size={16} /></button>
          <button onClick={() => setTheme('system')} className={`theme-btn ${theme === 'system' ? 'active' : ''}`} title="System Mode"><Monitor size={16} /></button>
        </div>

        <button onClick={handleReset} className="nav-item" title="Reset Application" style={{ padding: '12px' }}>
          <RotateCcw size={18} />
        </button>

        {session && (
          <button onClick={handleLogout} className="nav-item" title="Sign Out" style={{ padding: '12px' }}>
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  )
}