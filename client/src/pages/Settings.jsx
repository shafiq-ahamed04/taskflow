import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';
import { Sidebar } from './Dashboard';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || 'indigo');
  const [rating, setRating] = useState(() => Number(localStorage.getItem('appRating')) || 4);
  const [hoverRating, setHoverRating] = useState(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Apply theme to document element
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.classList.remove('light-mode');
      document.documentElement.style.colorScheme = 'dark';
    }
  }, [theme]);

  // Apply accent color preference
  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const handleRateApp = (stars) => {
    setRating(stars);
    localStorage.setItem('appRating', stars);
    setRatingSubmitted(true);
    setTimeout(() => setRatingSubmitted(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'TF';

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0A0A0F', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar active="settings" onLogout={handleLogout} userName={user?.name} />

      <main style={{
        flex: 1,
        overflowY: 'auto',
        position: 'relative',
        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}>
        {/* Glow */}
        <div style={{ position: 'fixed', top: '-150px', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem', maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Top Bar */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em' }}>Settings</h1>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '2px' }}>Customize your workspace experience and profile preferences</p>
          </div>

          {/* Section Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Profile Section */}
            <div style={{
              background: 'rgba(19, 19, 26, 0.85)',
              border: '1px solid #1E1E2E',
              borderRadius: '16px',
              padding: '1.5rem',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              flexWrap: 'wrap',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#fff',
                  boxShadow: '0 0 16px rgba(99,102,241,0.4)',
                  flexShrink: 0
                }}>{initials}</div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>{user?.name || 'Developer Account'}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px', wordBreak: 'break-all' }}>{user?.email || 'shafiq@example.com'}</p>
                </div>
              </div>
              <span style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#A5B4FC',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '999px',
                padding: '0.3rem 0.8rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                alignSelf: 'center'
              }}>
                Free Tier Active
              </span>
            </div>

            {/* Appearance Section */}
            <div style={{
              background: 'rgba(19, 19, 26, 0.85)',
              border: '1px solid #1E1E2E',
              borderRadius: '16px',
              padding: '1.5rem',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', borderBottom: '1px solid #1E1E2E', paddingBottom: '0.75rem', margin: 0 }}>
                🎨 UI Preference & Appearance
              </h2>

              {/* Theme Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E2E8F0', margin: 0 }}>Interface Theme</h3>
                  <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>Choose light theme or premium dark interface</p>
                </div>
                <div style={{
                  display: 'flex',
                  background: '#0A0A0F',
                  border: '1px solid #1E1E2E',
                  borderRadius: '9px',
                  padding: '3px'
                }}>
                  <button
                    onClick={() => setTheme('dark')}
                    style={{
                      border: 'none',
                      background: theme === 'dark' ? '#6366F1' : 'transparent',
                      color: theme === 'dark' ? '#fff' : '#475569',
                      borderRadius: '6px',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    🌙 Dark
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    style={{
                      border: 'none',
                      background: theme === 'light' ? '#6366F1' : 'transparent',
                      color: theme === 'light' ? '#fff' : '#475569',
                      borderRadius: '6px',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    ☀️ Light
                  </button>
                </div>
              </div>

              {/* Color Accents selection */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E2E8F0', margin: 0 }}>Brand Accent</h3>
                  <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>Personalize buttons, highlights and indicators</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['indigo', 'emerald', 'amber', 'rose', 'cyan'].map((col) => {
                    const colMap = {
                      indigo: '#6366F1',
                      emerald: '#10B981',
                      amber: '#F59E0B',
                      rose: '#F43F5E',
                      cyan: '#06B6D4'
                    };
                    const hex = colMap[col];
                    const isSelected = accentColor === col;
                    return (
                      <div
                        key={col}
                        onClick={() => setAccentColor(col)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: hex,
                          border: isSelected ? '2px solid #F8FAFC' : '1px solid #1E1E2E',
                          boxShadow: isSelected ? `0 0 10px ${hex}` : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* App info */}
            <div style={{
              background: 'rgba(19, 19, 26, 0.85)',
              border: '1px solid #1E1E2E',
              borderRadius: '16px',
              padding: '1.5rem',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', borderBottom: '1px solid #1E1E2E', paddingBottom: '0.75rem', margin: 0 }}>
                ⚙️ Application Specifications
              </h2>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94A3B8' }}>Application Version</span>
                <span style={{ color: '#F8FAFC', fontWeight: 700 }}>v1.0.0 (Stable Production)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94A3B8' }}>Hosting & CDN Platform</span>
                <a href="https://taskflow-dun-xi.vercel.app" target="_blank" rel="noreferrer" style={{ color: '#818CF8', fontWeight: 700, textDecoration: 'none' }}>
                  Vercel SPA Network ↗
                </a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94A3B8' }}>Render API Server</span>
                <a href="https://taskflow-98es.onrender.com" target="_blank" rel="noreferrer" style={{ color: '#818CF8', fontWeight: 700, textDecoration: 'none' }}>
                  Render Cloud Web ↗
                </a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94A3B8' }}>Relational Data Engine</span>
                <span style={{ color: '#10B981', fontWeight: 700 }}>🍃 MongoDB Atlas (Cloud Cluster)</span>
              </div>
            </div>

            {/* Rate this App */}
            <div style={{
              background: 'rgba(19, 19, 26, 0.85)',
              border: '1px solid #1E1E2E',
              borderRadius: '16px',
              padding: '1.5rem',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>⭐ Rate TaskFlow</h2>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', maxWidth: '340px', margin: 0 }}>
                Your feedback keeps us going! How would you rate your workspace experience?
              </p>

              {/* Star Rating Grid */}
              <div style={{ display: 'flex', gap: '0.4rem', margin: '0.5rem 0' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = hoverRating !== null ? star <= hoverRating : star <= rating;
                  return (
                    <span
                      key={star}
                      onClick={() => handleRateApp(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      style={{
                        fontSize: '1.8rem',
                        cursor: 'pointer',
                        color: active ? '#F59E0B' : '#2A2A3E',
                        textShadow: active ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none',
                        transition: 'transform 0.15s, color 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      ★
                    </span>
                  );
                })}
              </div>

              {ratingSubmitted && (
                <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700, animation: 'fadeInUp 0.2s' }}>
                  ✓ Feedback submitted. Thank you!
                </span>
              )}
            </div>

            {/* Danger Zone */}
            <div style={{
              background: 'rgba(244, 63, 94, 0.03)',
              border: '1px dashed rgba(244, 63, 94, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#FB7185', margin: 0 }}>Danger Zone</h2>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>Sign out of this session completely. Clean local cached keys.</p>
              </div>
              <button
                id="settings-logout-btn"
                onClick={handleLogout}
                style={{
                  background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '9px',
                  padding: '0.6rem 1.75rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(244, 63, 94, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(244, 63, 94, 0.5)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(244, 63, 94, 0.3)'}
              >
                Sign out of Account →
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Settings;
