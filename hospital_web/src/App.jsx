import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import HospitalDashboard from './components/HospitalDashboard'
import DonorDashboard    from './components/DonorDashboard'
import AdminDashboard    from './components/AdminDashboard'
import Auth              from './components/Auth'
import LandingPage       from './components/LandingPage'
import { useTheme }      from './context/ThemeContext'
import { useAdmin }      from './hooks/useAdmin'
import { supabase }      from './lib/supabase'
import { Toaster }       from 'react-hot-toast'
import { Sun, Moon, Monitor, LogOut, ShieldCheck } from 'lucide-react'

// Layout wrapper for consistent theme dock and controls
function AppLayout({ children, session, isAdmin }) {
  const { theme, setTheme } = useTheme()
  const handleLogout = () => supabase.auth.signOut()

  return (
    <div className="app-container">
      <header className="top-nav fade-in">
        <Toaster position="top-right" />
        <Link to="/" className="flex-center" style={{ gap: '12px', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '10px', 
            overflow: 'hidden', 
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <img 
              src="/LOGO.png" 
              alt="LifeLink Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              onError={(e) => { e.target.parentElement.style.display = 'none'; }} 
            />
          </div>
          <h1 style={{ fontSize: '20px', letterSpacing: '-0.5px', fontWeight: 800 }}>LifeLink</h1>
        </Link>
        
        <div className="nav-actions">
          <div className="theme-dock">
            <button onClick={() => setTheme('light')} className={`theme-btn ${theme === 'light' ? 'active' : ''}`} title="Light Mode"><Sun size={14} /></button>
            <button onClick={() => setTheme('dark')} className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} title="Dark Mode"><Moon size={14} /></button>
            <button onClick={() => setTheme('system')} className={`theme-btn ${theme === 'system' ? 'active' : ''}`} title="System Mode"><Monitor size={14} /></button>
          </div>
          {session && (
            <>
              {isAdmin && (
                <a href="/admin" className="nav-item text-accent" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                  <ShieldCheck size={16} /> Control Panel
                </a>
              )}
              <button onClick={handleLogout} className="nav-item" title="Sign Out"><LogOut size={16} /> Sign Out</button>
            </>
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
  const { isAdmin } = useAdmin(session?.user)

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
      <AppLayout session={session} isAdmin={isAdmin}>
        <Routes>
          <Route path="/" element={
            session ? <Navigate to={isAdmin ? "/admin" : "/hospital"} replace /> : <LandingPage />
          } />
          
          {/* Hospital flow: Requires auth + NOT an admin (to prevent mixup) */}
          <Route path="/hospital" element={
            session && !isAdmin ? <HospitalDashboard user={session.user} /> : <Navigate to="/" replace />
          } />
          
          {/* Donor flow: Handles its own session / anonymous auth */}
          <Route path="/donor" element={<DonorDashboard user={session?.user || null} />} />

          {/* Admin flow: Protected by useAdmin */}
          <Route path="/admin" element={
            session && isAdmin ? <AdminDashboard user={session.user} /> : <Navigate to="/" replace />
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}