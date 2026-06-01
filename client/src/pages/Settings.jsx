import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';
import { Sidebar } from './Dashboard';
import { applyThemeAndAccent } from '../App';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || 'indigo');
  const [rating, setRating] = useState(() => Number(localStorage.getItem('appRating')) || 4);
  const [hoverRating, setHoverRating] = useState(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Apply theme immediately on changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    applyThemeAndAccent();
  }, [theme]);

  // Apply accent color preference immediately on changes
  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    applyThemeAndAccent();
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
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text-1)] font-sans">
      <Sidebar active="settings" onLogout={handleLogout} userName={user?.name} />

      <main className="flex-1 overflow-y-auto relative pb-24 md:pb-0 w-full dot-grid">
        {/* Glow */}
        <div className="fixed top-[-150px] right-[-150px] w-[500px] h-[500px] bg-[radial-gradient(circle,var(--primary-glow)_0%,transparent_70%)] pointer-events-none z-0" />

        <div className="p-4 md:p-8 max-w-[800px] w-full mx-auto relative z-10 animate-fade-in">
          
          {/* Top Bar */}
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Settings</h1>
            <p className="text-xs md:text-sm text-[var(--text-2)] mt-1">Customize your workspace experience and profile preferences</p>
          </div>

          {/* Section Grid */}
          <div className="flex flex-col gap-5">
            
            {/* Profile Section */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 md:p-6 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[var(--shadow-card)] animate-fade-up">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-soft)] flex items-center justify-center text-lg font-bold text-white shadow-[var(--shadow-glow)] shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm md:text-base font-bold text-[var(--text-1)] truncate">{user?.name || 'Developer Account'}</h3>
                  <p className="text-xs text-[var(--text-2)] truncate mt-0.5">{user?.email || 'shafiq@example.com'}</p>
                </div>
              </div>
              <span className="bg-[var(--primary-glow)] border border-[var(--primary-glow)] text-[var(--primary-soft)] rounded-full px-3.5 py-1 text-xs font-bold shrink-0 w-fit">
                Free Tier Active
              </span>
            </div>

            {/* Appearance Section */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 md:p-6 backdrop-blur-md flex flex-col gap-5 shadow-[var(--shadow-card)] animate-fade-up">
              <h2 className="text-sm md:text-base font-bold text-[var(--text-1)] border-b border-[var(--border)] pb-3">
                🎨 UI Preference & Appearance
              </h2>

              {/* Theme Toggle */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-[var(--text-1)]">Interface Theme</h3>
                  <p className="text-[10px] md:text-xs text-[var(--text-2)] mt-0.5">Choose light theme or premium dark interface</p>
                </div>
                <div className="flex bg-[var(--bg)] border border-[var(--border)] rounded-xl p-1 w-full sm:w-auto">
                  <button
                    onClick={() => setTheme('dark')}
                    className="flex-1 sm:flex-initial border-none rounded-lg py-2 px-4 text-xs font-bold cursor-pointer transition-all duration-150 min-h-[38px] flex items-center justify-center"
                    style={{
                      background: theme === 'dark' ? 'var(--primary)' : 'transparent',
                      color: theme === 'dark' ? '#fff' : 'var(--text-3)',
                    }}
                  >
                    🌙 Dark
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className="flex-1 sm:flex-initial border-none rounded-lg py-2 px-4 text-xs font-bold cursor-pointer transition-all duration-150 min-h-[38px] flex items-center justify-center"
                    style={{
                      background: theme === 'light' ? 'var(--primary)' : 'transparent',
                      color: theme === 'light' ? '#fff' : 'var(--text-3)',
                    }}
                  >
                    ☀️ Light
                  </button>
                </div>
              </div>

              {/* Color Accents selection */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-[var(--text-1)]">Brand Accent</h3>
                  <p className="text-[10px] md:text-xs text-[var(--text-2)] mt-0.5">Personalize buttons, highlights and indicators</p>
                </div>
                <div className="flex gap-2.5 flex-wrap items-center">
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
                        className="w-[32px] h-[32px] rounded-full cursor-pointer transition-all duration-150"
                        style={{
                          background: hex,
                          border: isSelected ? '2px solid var(--text-1)' : '1px solid var(--border)',
                          boxShadow: isSelected ? `0 0 10px ${hex}` : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* App info */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 md:p-6 backdrop-blur-md flex flex-col gap-4 shadow-[var(--shadow-card)] animate-fade-up">
              <h2 className="text-sm md:text-base font-bold text-[var(--text-1)] border-b border-[var(--border)] pb-3">
                ⚙️ Application Specifications
              </h2>

              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-[var(--text-2)]">Version</span>
                <span className="text-[var(--text-1)] font-bold">v1.0.0 (Stable Production)</span>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-[var(--text-2)]">Hosting Platform</span>
                <a href="https://taskflow-dun-xi.vercel.app" target="_blank" rel="noreferrer" className="text-[var(--primary-soft)] font-bold">
                  Vercel SPA Network ↗
                </a>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-[var(--text-2)]">Server</span>
                <a href="https://taskflow-98es.onrender.com" target="_blank" rel="noreferrer" className="text-[var(--primary-soft)] font-bold">
                  Render Cloud Web ↗
                </a>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-[var(--text-2)]">Database</span>
                <span className="text-[var(--success)] font-bold">🍃 MongoDB Atlas</span>
              </div>
            </div>

            {/* Rate this App */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 md:p-6 backdrop-blur-md flex flex-col gap-3 items-center text-center shadow-[var(--shadow-card)] animate-fade-up">
              <h2 className="text-sm md:text-base font-bold text-[var(--text-1)]">⭐ Rate TaskFlow</h2>
              <p className="text-xs text-[var(--text-2)] max-w-sm">
                Your feedback keeps us going! How would you rate your workspace experience?
              </p>

              {/* Star Rating Grid */}
              <div className="flex gap-2 my-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = hoverRating !== null ? star <= hoverRating : star <= rating;
                  return (
                    <span
                      key={star}
                      onClick={() => handleRateApp(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="text-3xl cursor-pointer transition-transform duration-150"
                      style={{
                        color: active ? '#F59E0B' : 'var(--border-hover)',
                        textShadow: active ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none',
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
                <span className="text-[10px] md:text-xs text-[var(--success)] font-bold animate-fade-up">
                  ✓ Feedback submitted. Thank you!
                </span>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-rose-500/[0.02] border border-dashed border-rose-500/25 rounded-2xl p-4 md:p-6 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[var(--shadow-card)] animate-fade-up">
              <div>
                <h2 className="text-sm md:text-base font-bold text-[var(--danger)]">Danger Zone</h2>
                <p className="text-[10px] md:text-xs text-[var(--text-2)] mt-0.5">Sign out of this session completely. Clean local cached keys.</p>
              </div>
              <button
                id="settings-logout-btn"
                onClick={handleLogout}
                className="w-full sm:w-auto bg-gradient-to-r from-[var(--danger)] to-[#E11D48] border-none text-white rounded-lg px-6 py-3 text-xs font-bold cursor-pointer min-h-[44px] flex items-center justify-center shadow-[0_0_16px_rgba(244,63,94,0.3)] transition-all duration-150 hover:brightness-110 active:scale-95"
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
