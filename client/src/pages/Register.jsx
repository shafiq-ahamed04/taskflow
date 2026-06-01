import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColor = ['transparent', '#F43F5E', '#F59E0B', '#10B981'][strength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true); setError(null);
    try {
      const res = await API.post('/auth/register', { name, email, password });
      setUser(res.data, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', background: '#0A0A0F', border: '1px solid #1E1E2E',
    borderRadius: '10px', color: '#F8FAFC', fontSize: '0.9rem',
    padding: '0.65rem 0.875rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const onFocus = e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; };
  const onBlur  = e => { e.target.style.borderColor = '#1E1E2E'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Left panel ── */}
      <div style={{
        width: '50%', minHeight: '100vh',
        background: 'radial-gradient(ellipse at top right, rgba(99,102,241,0.18) 0%, #0A0A0F 60%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '2.5rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Task<span style={{ color: '#6366F1' }}>Flow</span>
          </span>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', color: '#F8FAFC', marginBottom: '1rem' }}>
            Start shipping<br />
            <span style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              faster.
            </span>
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Join thousands of teams who trust TaskFlow to manage their work.
          </p>

          {/* Abstract Kanban preview */}
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2.5rem' }}>
            {['To Do', 'In Progress', 'Done'].map((col, i) => (
              <div key={col} style={{
                flex: 1, background: 'rgba(19,19,26,0.7)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '10px', padding: '0.75rem 0.5rem',
                backdropFilter: 'blur(8px)',
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: ['#60a5fa','#fbbf24','#34d399'][i], letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{col}</div>
                {[1,2].map(n => (
                  <div key={n} style={{
                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
                    borderRadius: '6px', padding: '0.4rem 0.5rem', marginBottom: '0.35rem',
                    boxShadow: i===1 ? '0 0 10px rgba(99,102,241,0.2)' : 'none',
                  }}>
                    <div style={{ height: '6px', background: 'rgba(99,102,241,0.3)', borderRadius: '3px', width: `${60+n*15}%` }} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{
            background: 'rgba(19,19,26,0.8)', border: '1px solid #1E1E2E', borderRadius: '12px',
            padding: '1.1rem 1.25rem', backdropFilter: 'blur(8px)',
          }}>
            <p style={{ color: '#CBD5E1', fontSize: '0.875rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '0.75rem' }}>
              "TaskFlow transformed how our team ships. 10x velocity."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: '#fff',
              }}>SK</div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F8FAFC' }}>Sarah K.</p>
                <p style={{ fontSize: '0.72rem', color: '#475569' }}>Engineering Lead</p>
              </div>
            </div>
          </div>
        </div>

        <p style={{ color: '#1E1E2E', fontSize: '0.75rem', position: 'relative', zIndex: 1 }}>© 2026 TaskFlow</p>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        width: '50%', minHeight: '100vh', background: '#0D0D18',
        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}>
        <div style={{
          width: '100%', maxWidth: '440px',
          background: 'rgba(19,19,26,0.9)', border: '1px solid #1E1E2E', borderRadius: '18px',
          padding: '2.5rem', backdropFilter: 'blur(12px)', boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
          animation: 'fadeInUp 0.35s ease',
        }}>
          <h2 style={{ fontSize: '1.55rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.25rem' }}>Create your account</h2>
          <p style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.75rem' }}>✓ Free forever. No credit card.</p>

          {error && (
            <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { id: 'reg-name', label: 'FULL NAME', type: 'text', val: name, set: setName, ph: 'John Smith' },
              { id: 'reg-email', label: 'EMAIL', type: 'email', val: email, set: setEmail, ph: 'you@company.com' },
            ].map(f => (
              <div key={f.id}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>{f.label}</label>
                <input id={f.id} type={f.type} required placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input id="reg-password" type={showPwd ? 'text' : 'password'} required placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, paddingRight: '2.5rem' }} onFocus={onFocus} onBlur={onBlur} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: '0.4rem' }}>
                  <div style={{ height: '2px', background: '#1E1E2E', borderRadius: '1px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(strength/3)*100}%`, background: strengthColor, transition: 'all 0.3s ease', boxShadow: `0 0 6px ${strengthColor}` }} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: strengthColor, marginTop: '3px', fontWeight: 600 }}>{strengthLabel}</p>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>CONFIRM PASSWORD</label>
              <input id="reg-confirm" type="password" required placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            <button id="reg-submit" type="submit" disabled={loading}
              style={{
                width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700,
                borderRadius: '10px', marginTop: '0.25rem', border: 'none', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                boxShadow: '0 0 20px rgba(99,102,241,0.3)', transition: 'box-shadow 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 0 32px rgba(99,102,241,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.3)'; }}
            >
              {loading ? 'Creating account…' : 'Get started free →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#94A3B8', marginTop: '1.5rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818CF8', fontWeight: 600 }}>Sign in →</Link>
          </p>
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#475569', marginTop: '1rem' }}>
            By signing up you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
