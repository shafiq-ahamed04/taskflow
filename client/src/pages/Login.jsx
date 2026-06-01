import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await API.post('/auth/login', { email, password });
      setUser(res.data, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0A0A0F] text-[#F8FAFC] font-sans">

      {/* ── Left panel (Hidden on Mobile) ── */}
      <div 
        className="hidden md:flex md:w-1/2 flex-col justify-between p-10 relative overflow-hidden min-h-screen shrink-0"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(99,102,241,0.18) 0%, #0A0A0F 60%)'
        }}
      >
        {/* dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px', pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Task<span style={{ color: '#6366F1' }}>Flow</span>
          </span>
          <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Workspace</p>
        </div>

        {/* Hero */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#F8FAFC', marginBottom: '1rem' }}>
            Manage work.<br />
            <span style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Ship faster.
            </span>
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            The Kanban board built for modern teams.
          </p>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {['⚡ Drag & Drop', '🔄 Real-time', '🌙 Dark First'].map(f => (
              <span key={f} style={{
                background: 'rgba(99,102,241,0.12)', color: '#a5b4fc',
                border: '1px solid rgba(99,102,241,0.25)', borderRadius: '999px',
                padding: '0.3rem 0.9rem', fontSize: '0.8rem', fontWeight: 500,
              }}>{f}</span>
            ))}
          </div>
        </div>

        <p style={{ color: '#1E1E2E', fontSize: '0.75rem', position: 'relative', zIndex: 1 }}>
          © 2026 TaskFlow. Ship Faster.
        </p>
      </div>

      {/* ── Right panel (Sign In Card) ── */}
      <div 
        className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#0D0D18] relative z-10"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="w-full max-w-[420px] bg-[#13131A]/90 border border-[#1E1E2E] rounded-2xl p-6 md:p-10 backdrop-blur-md shadow-[0_4px_40px_rgba(0,0,0,0.5)] animate-fade-up">
          <h2 className="text-xl md:text-2xl font-bold text-[#F8FAFC] mb-1">Welcome back</h2>
          <p className="text-xs md:text-sm text-[#94A3B8] mb-6">Sign in to your workspace</p>

          {error && (
            <div style={{
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
              color: '#fb7185', borderRadius: '8px', padding: '0.75rem 1rem',
              fontSize: '0.85rem', marginBottom: '1.25rem',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">
                EMAIL
              </label>
              <input id="login-email" type="email" required placeholder="you@company.com"
                value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', background: '#0A0A0F', border: '1px solid #1E1E2E', borderRadius: '10px', color: '#F8FAFC', fontSize: '0.9rem', padding: '0.65rem 0.875rem', outline: 'none', minHeight: '44px' }}
                onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = '#1E1E2E'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] md:text-xs font-bold text-[#94A3B8] uppercase tracking-wider">PASSWORD</label>
                <span className="text-[10px] md:text-xs text-[#6366F1] cursor-pointer font-bold">Forgot password?</span>
              </div>
              <div className="relative">
                <input id="login-password" type={showPwd ? 'text' : 'password'} required placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', background: '#0A0A0F', border: '1px solid #1E1E2E', borderRadius: '10px', color: '#F8FAFC', fontSize: '0.9rem', padding: '0.65rem 2.5rem 0.65rem 0.875rem', outline: 'none', minHeight: '44px' }}
                  onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#1E1E2E'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
                  className="w-10 h-10 flex items-center justify-center"
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem', fontWeight: 700, borderRadius: '10px', marginTop: '0.25rem',
                background: 'linear-gradient(135deg, #6366F1, #818CF8)', border: 'none', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                boxShadow: '0 0 20px rgba(99,102,241,0.3)', transition: 'box-shadow 0.2s, transform 0.15s', minHeight: '44px'
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 0 32px rgba(99,102,241,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.3)'; }}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-[1px] bg-[#1E1E2E]" />
            <span className="text-[#475569] text-[10px] md:text-xs uppercase font-bold">or</span>
            <div className="flex-1 h-[1px] bg-[#1E1E2E]" />
          </div>

          <p className="text-center text-xs md:text-sm text-[#94A3B8]">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#818CF8', fontWeight: 600, textDecoration: 'none' }}>
              Register free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
