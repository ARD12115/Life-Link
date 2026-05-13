import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HospitalDashboard from './components/HospitalDashboard'
import DonorDashboard    from './components/DonorDashboard'
import Auth              from './components/Auth'
import LandingPage       from './components/LandingPage'
import { useTheme }      from './context/ThemeContext'
import { supabase }      from './lib/supabase'
import { Sun, Moon, Monitor, LogOut, RotateCcw } from 'lucide-react'

// Layout wrapper for consistent theme dock and controls
function AppLayout({ children, session }) {
  const { theme, setTheme } = useTheme()
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
      <header className="top-nav fade-in">
        <div className="flex-center" style={{ gap: '12px' }}>
          <img src="/LOGO.png" alt="LifeLink Logo" style={{ height: '32px' }} onError={(e) => { e.target.style.display = 'none'; }} />
          <h1 style={{ fontSize: '20px', letterSpacing: '-0.5px' }}>LifeLink</h1>
        </div>
        
        <div className="nav-actions">
          <div className="theme-dock">
            <button onClick={() => setTheme('light')} className={`theme-btn ${theme === 'light' ? 'active' : ''}`} title="Light Mode"><Sun size={14} /></button>
            <button onClick={() => setTheme('dark')} className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} title="Dark Mode"><Moon size={14} /></button>
            <button onClick={() => setTheme('system')} className={`theme-btn ${theme === 'system' ? 'active' : ''}`} title="System Mode"><Monitor size={14} /></button>
          </div>
          <button onClick={handleReset} className="nav-item" title="Reset Application"><RotateCcw size={16} /></button>
          {session && (
            <button onClick={handleLogout} className="nav-item" title="Sign Out"><LogOut size={16} /> Sign Out</button>
          )}
        </div>
      </header>

      {children}
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Explicitly handle anonymous sign-in for donors if no session exists
  const handleDonorAccess = async () => {
    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) console.error("Anonymous auth failed:", error)
      return data.session
    }
    return session
  }

  if (loading) return null

  return (
    <BrowserRouter>
      <AppLayout session={session}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Hospital flow: Requires auth */}
          <Route path="/hospital" element={
            session ? <HospitalDashboard user={session.user} /> : <Auth />
          } />
          
          {/* Donor flow: Handles its own session / anonymous auth */}
          <Route path="/donor" element={<DonorDashboard user={session?.user || null} />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}