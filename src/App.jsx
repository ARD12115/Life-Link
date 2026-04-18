import React, { useState, useEffect } from 'react'
import HospitalDashboard from './components/HospitalDashboard'
import DonorDashboard    from './components/DonorDashboard'
import RoleSelector      from './components/RoleSelector'
import VisualEnvironment from './components/VisualEnvironment'
import Auth              from './components/Auth'
import DebugDashboard    from './components/DebugDashboard'
import { useTheme }      from './context/ThemeContext'
import { supabase }      from './lib/supabase'
import { Sun, Moon, Monitor, LogOut } from 'lucide-react'

const THEMES = [
  { key: 'light',  icon: <Sun size={14} />,     label: 'Light' },
  { key: 'dark',   icon: <Moon size={14} />,    label: 'Dark' },
  { key: 'system', icon: <Monitor size={14} />, label: 'System' },
]

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const loadProfile = async (user) => {
      if (!user) {
        setProfile(null)
        setProfileLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
      }

      setProfile(data || null)
      setProfileLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      loadProfile(session?.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      loadProfile(session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = () => supabase.auth.signOut()

  return (
    <div className="app-container">
      <VisualEnvironment />
      {process.env.NODE_ENV === 'development' && <DebugDashboard />}

      <main style={{ paddingBottom: '100px', minHeight: '100vh' }}>
        {!session ? (
          <Auth />
        ) : profileLoading ? (
          <div className="loading-text">Loading your secure profile...</div>
        ) : !profile ? (
          <RoleSelector user={session.user} onProfileCreated={setProfile} />
        ) : profile.role === 'hospital' ? (
          <HospitalDashboard user={session.user} profile={profile} />
        ) : profile.role === 'donor' ? (
          <DonorDashboard user={session.user} profile={profile} />
        ) : (
          <div className="loading-text">Role not recognized. Contact support.</div>
        )}
      </main>

      {session && (
        <div className="floating-nav">
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