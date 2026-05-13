import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Hospital, ArrowRight, Activity, ShieldCheck, Zap, Droplets, Users, Clock } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section animated-bg" style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative floating blood drop shapes */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,45,85,0.06)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(0,122,255,0.06)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '25%', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(52,199,89,0.06)', filter: 'blur(30px)' }} />

        <div className="fade-in" style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ marginBottom: '32px' }}>
            <img 
              src="/LOGO.png" 
              alt="LifeLink Logo" 
              style={{ height: '80px', marginBottom: '16px' }} 
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
          </div>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '32px', background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.15)', color: 'var(--accent-red)', fontSize: '13px', fontWeight: 600, marginBottom: '32px', letterSpacing: '0.05em' }}>
            <span className="status-dot critical"></span>
            REAL-TIME EMERGENCY NETWORK
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1.05, maxWidth: '850px', marginBottom: '24px', letterSpacing: '-1.5px', fontWeight: 800 }}>
            Every second counts.<br/>
            <span style={{ background: 'linear-gradient(135deg, var(--accent-red), #FF9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Connect. Match. Save.
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto 48px', lineHeight: 1.6 }}>
            LifeLink bridges the critical gap between hospital blood emergencies and volunteer donors through instant, intelligent matching.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/donor')} 
              className="btn-solid" 
              style={{ padding: '18px 36px', fontSize: '16px', borderRadius: '20px' }}
            >
              <Heart size={20} /> Become a Donor <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/hospital')} 
              className="btn-ghost" 
              style={{ padding: '18px 36px', fontSize: '16px', borderRadius: '20px' }}
            >
              <Hospital size={20} /> Hospital Portal
            </button>
          </div>

          {/* Trust Indicators */}
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '48px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
              <ShieldCheck size={16} color="var(--accent-green)" /> End-to-end Encrypted
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
              <Clock size={16} color="var(--accent-blue)" /> Sub-second Alerts
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
              <Droplets size={16} color="var(--accent-red)" /> Smart Compatibility
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '100px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '12px' }}>How LifeLink Works</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>Three steps. Zero friction. Lives saved.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          <div className="ui-panel fade-in" style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,45,85,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Activity size={28} color="var(--accent-red)" />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-red)', letterSpacing: '0.1em', marginBottom: '12px' }}>STEP 01</div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Hospital Broadcasts</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>Medical facilities post emergency blood requests specifying group, component, and urgency level.</p>
          </div>

          <div className="ui-panel fade-in" style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(0,122,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Users size={28} color="var(--accent-blue)" />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-blue)', letterSpacing: '0.1em', marginBottom: '12px' }}>STEP 02</div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Donors Get Alerted</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>Compatible donors instantly receive real-time alerts. Our smart engine matches beyond exact types using medical compatibility rules.</p>
          </div>

          <div className="ui-panel fade-in" style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(52,199,89,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Zap size={28} color="var(--accent-green)" />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '0.1em', marginBottom: '12px' }}>STEP 03</div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Confirm & Save</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>Donors confirm availability with a single tap. The hospital sees the response in real-time — no calls, no delays.</p>
          </div>
        </div>
      </section>

      {/* Two Portals Section */}
      <section style={{ padding: '80px 24px 100px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '12px' }}>Choose Your Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Select how you want to join the LifeLink network.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {/* Donor Card */}
          <div 
            className="ui-panel" 
            onClick={() => navigate('/donor')}
            style={{ padding: '48px 40px', cursor: 'pointer', textAlign: 'center', borderRadius: '28px', transition: 'all 0.4s ease' }}
          >
            <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--accent-red), #FF6B8A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(255,45,85,0.25)' }}>
              <Heart size={36} color="white" />
            </div>
            <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>I'm a Donor</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              No account needed. Register your blood type and get instant alerts when someone needs you.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontWeight: 600, fontSize: '15px' }}>
              Get Started <ArrowRight size={16} />
            </div>
          </div>

          {/* Hospital Card */}
          <div 
            className="ui-panel" 
            onClick={() => navigate('/hospital')}
            style={{ padding: '48px 40px', cursor: 'pointer', textAlign: 'center', borderRadius: '28px', transition: 'all 0.4s ease' }}
          >
            <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--accent-blue), #4DA6FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(0,122,255,0.25)' }}>
              <Hospital size={36} color="white" />
            </div>
            <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Medical Facility</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Secure, authenticated access for hospitals and blood banks. Post emergencies and manage donor responses.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '15px' }}>
              Sign In <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 24px', borderTop: '1px solid var(--border-soft)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <img src="/LOGO.png" alt="LifeLink" style={{ height: '24px' }} onError={(e) => { e.target.style.display = 'none'; }} />
          <span style={{ fontWeight: 700, fontSize: '16px' }}>LifeLink</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Emergency Blood Matching Network — Built to save lives.
        </p>
      </footer>
    </div>
  );
}
