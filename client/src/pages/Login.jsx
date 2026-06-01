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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Left panel ── */}
      <div style={{
        width: '50%', minHeight: '100vh',
        background: 'radial-gradient(ellipse at top left, rgba(99,102,241,0.18) 0%, #0A0A0F 60%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '2.5rem', position: 'relative', overflow: 'hidden',
      }}>
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
          <h1 style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#F8FAFC', marginBottom: '1rem' }}>
            Manage work.<br />
            <span style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Ship faster.
            </span>
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
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

      {/* ── Right panel ── */}
      <div style={{
        width: '50%', minHeight: '100vh',
        background: '#0D0D18',
        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}>
        <div style={{
          width: '100%', maxWidth: '420px',
          background: 'rgba(19,19,26,0.9)', border: '1px solid #1E1E2E',
          borderRadius: '18px', padding: '2.5rem',
          backdropFilter: 'blur(12px)', boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
          animation: 'fadeInUp 0.35s ease',
        }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.35rem' }}>Welcome back</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1.75rem' }}>Sign in to your workspace</p>

          {error && (
            <div style={{
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
              color: '#fb7185', borderRadius: '8px', padding: '0.75rem 1rem',
              fontSize: '0.85rem', marginBottom: '1.25rem',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
                EMAIL
              </label>
              <input id="login-email" type="email" required placeholder="you@company.com"
                value={email} onChange={e => setEmail(e.target.value)} className="input"
                style={{ width: '100%', background: '#0A0A0F', border: '1px solid #1E1E2E', borderRadius: '10px', color: '#F8FAFC', fontSize: '0.9rem', padding: '0.65rem 0.875rem', outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = '#1E1E2E'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.02em' }}>PASSWORD</label>
                <span style={{ fontSize: '0.78rem', color: '#6366F1', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input id="login-password" type={showPwd ? 'text' : 'password'} required placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', background: '#0A0A0F', border: '1px solid #1E1E2E', borderRadius: '10px', color: '#F8FAFC', fontSize: '0.9rem', padding: '0.65rem 2.5rem 0.65rem 0.875rem', outline: 'none' }}
                  onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#1E1E2E'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1rem', padding: 0 }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700, borderRadius: '10px', marginTop: '0.25rem',
                background: 'linear-gradient(135deg, #6366F1, #818CF8)', border: 'none', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                boxShadow: '0 0 20px rgba(99,102,241,0.3)', transition: 'box-shadow 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 0 32px rgba(99,102,241,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.3)'; }}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#1E1E2E' }} />
            <span style={{ color: '#475569', fontSize: '0.78rem' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#1E1E2E' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#94A3B8' }}>
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
