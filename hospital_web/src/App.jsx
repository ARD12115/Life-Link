import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import HospitalDashboard from './components/HospitalDashboard';
import DonorDashboard from './components/DonorDashboard';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import { Helmet } from 'react-helmet';
import { useTheme } from './context/ThemeContext';
import { useAdmin } from './hooks/useAdmin';
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';
import { Sun, Moon, Monitor, LogOut, ShieldCheck } from 'lucide-react';

// Layout wrapper for consistent theme dock and controls
function AppLayout({ children, session, isAdmin }) {
  const { theme, setTheme } = useTheme();
  const handleLogout = () => supabase.auth.signOut();

  return (
    <div className="app-container">
      <header className="top-nav fade-in">
        <Toaster position="top-right" />
        <Link
          to="/"
          className="flex-center"
          style={{ gap: '12px', textDecoration: 'none', color: 'inherit' }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              overflow: 'hidden',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <img
              src="/LOGO.png"
              alt="LifeLink Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => {
                e.target.parentElement.style.display = 'none';
              }}
            />
          </div>
          <h1 style={{ fontSize: '20px', letterSpacing: '-0.5px', fontWeight: 800 }}>LifeLink</h1>
        </Link>

        <div className="nav-actions">
          <div className="theme-dock">
            <button
              onClick={() => setTheme('light')}
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
              title="Light Mode"
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              title="Dark Mode"
            >
              <Moon size={14} />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
              title="System Mode"
            >
              <Monitor size={14} />
            </button>
          </div>
          {session && (
            <>
              {isAdmin && (
                <a
                  href="/admin"
                  className="nav-item text-accent"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                  }}
                >
                  <ShieldCheck size={16} /> Control Panel
                </a>
              )}
              <button onClick={handleLogout} className="nav-item" title="Sign Out">
                <LogOut size={16} /> Sign Out
              </button>
            </>
          )}
        </div>
      </header>

      {children}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAdmin(session?.user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Explicitly handle anonymous sign-in for donors if no session exists
  const handleDonorAccess = async () => {
    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) console.error('Anonymous auth failed:', error);
      return data.session;
    }
    return session;
  };

  if (loading) return null;

  return (
    <BrowserRouter>
      <AppLayout session={session} isAdmin={isAdmin}>
        <ErrorBoundary>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Helmet>
                    <title>LifeLink - Emergency Blood Donor Network</title>
                    <meta name="description" content="LifeLink bridges the critical gap between hospital blood emergencies and volunteer donors through instant, intelligent matching. Save lives in seconds." />
                    <meta property="og:title" content="LifeLink - Emergency Blood Donor Network" />
                    <meta property="og:description" content="LifeLink bridges the critical gap between hospital blood emergencies and volunteer donors through instant, intelligent matching." />
                    <meta property="og:image" content="https://lifelink.example/og-image.jpg" />
                    <meta property="og:url" content="https://lifelink.example/" />
                    <meta property="og:type" content="website" />
                    <meta name="twitter:card" content="summary_large_image" />
                  </Helmet>
                  {session ? (
                    <Navigate to={isAdmin ? '/admin' : '/hospital'} replace />
                  ) : (
                    <LandingPage />
                  )}
                </>
              }
            />

            {/* Hospital flow: Show Auth if not logged in, otherwise check role */}
            <Route
              path="/hospital"
              element={
                <>
                  <Helmet>
                    <title>Hospital Portal - LifeLink</title>
                    <meta name="description" content="Hospital portal for managing blood requests and donor responses in real-time." />
                    <meta property="og:title" content="Hospital Portal - LifeLink" />
                    <meta property="og:description" content="Manage emergency blood requests and track donor responses." />
                    <meta property="og:image" content="https://lifelink.example/og-hospital.jpg" />
                    <meta property="og:url" content="https://lifelink.example/hospital" />
                    <meta property="og:type" content="website" />
                  </Helmet>
                  {!session ? (
                    <Auth />
                  ) : !isAdmin ? (
                    <HospitalDashboard user={session.user} />
                  ) : (
                    <Navigate to="/admin" replace />
                  )}
                </>
              }
            />

            {/* Donor flow: Handles its own session */}
            <Route
              path="/donor"
              element={
                <>
                  <Helmet>
                    <title>Donor Dashboard - LifeLink</title>
                    <meta name="description" content="Donor dashboard for tracking blood donation opportunities and impact." />
                    <meta property="og:title" content="Donor Dashboard - LifeLink" />
                    <meta property="og:description" content="Track your donation impact and find opportunities to help." />
                    <meta property="og:image" content="https://lifelink.example/og-donor.jpg" />
                    <meta property="og:url" content="https://lifelink.example/donor" />
                    <meta property="og:type" content="website" />
                  </Helmet>
                  <DonorDashboard user={session?.user || null} />
                </>
              }
            />

            {/* Admin flow: Show Auth if not logged in, otherwise check admin status */}
            <Route
              path="/admin"
              element={
                <>
                  <Helmet>
                    <title>Admin Panel - LifeLink</title>
                    <meta name="description" content="Administrative panel for managing the LifeLink emergency blood network." />
                    <meta property="og:title" content="Admin Panel - LifeLink" />
                    <meta property="og:description" content="Manage users, hospitals, and system settings." />
                    <meta property="og:image" content="https://lifelink.example/og-admin.jpg" />
                    <meta property="og:url" content="https://lifelink.example/admin" />
                    <meta property="og:type" content="website" />
                  </Helmet>
                  {!session ? (
                    <Auth />
                  ) : isAdmin ? (
                    <AdminDashboard user={session.user} />
                  ) : (
                    <Navigate to="/hospital" replace />
                  )}
                </>
              }
            />

            <Route path="/privacy" element={<Navigate to="/privacy.html" replace />} />
            <Route path="/terms" element={<Navigate to="/terms.html" replace />} />
            <Route path="/affiliations" element={<Navigate to="/affiliations.html" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </AppLayout>
    </BrowserRouter>
  );
}
