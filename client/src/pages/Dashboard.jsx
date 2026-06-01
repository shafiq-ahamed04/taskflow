import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';

/* ── Sidebar shared component ── */
const Sidebar = ({ active = 'boards', onLogout, userName }) => {
  const navigate = useNavigate();
  const nav = [
    { key: 'boards',    icon: '📋', label: 'Boards',    path: '/' },
    { key: 'habits',    icon: '✅', label: 'Habits',    path: '/habits' },
    { key: 'journal',   icon: '📓', label: 'Journal',   path: '/journal' },
    { key: 'analytics', icon: '📊', label: 'Analytics', path: '/analytics' },
    { key: 'settings',  icon: '⚙️', label: 'Settings',  path: '/settings' },
  ];
  const initials = userName ? userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'TF';

  return (
    <aside style={{
      width: '220px', flexShrink: 0,
      background: 'var(--sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '1.5rem 0.75rem',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ paddingLeft: '0.5rem', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)' }}>
          Task<span style={{ color: 'var(--primary)' }}>Flow</span>
        </span>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '1px' }}>Workspace</p>
      </div>

      <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {nav.map(item => {
          const isActive = item.key === active;
          return (
            <div key={item.key} 
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 0.75rem', borderRadius: '8px', cursor: 'pointer',
                background: isActive ? 'var(--primary-glow)' : 'transparent',
                color: isActive ? 'var(--primary-soft)' : 'var(--text-2)',
                fontWeight: isActive ? 600 : 400, fontSize: '0.875rem',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-1)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; } }}
            >
              <span style={{ fontSize: '1rem', width: '18px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </nav>

      {/* User profile */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '0.75rem 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 0.5rem' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--primary), var(--primary-soft))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', fontWeight: 700, color: '#fff',
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName || 'User'}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Free Plan</p>
        </div>
        <button onClick={onLogout} title="Logout"
          style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '1rem', padding: '2px', borderRadius: '4px', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >⏻</button>
      </div>
    </aside>
  );
};

/* ── Stat card ── */
const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px',
    padding: '1.25rem 1.5rem', flex: 1, minWidth: '140px',
    display: 'flex', alignItems: 'center', gap: '1rem',
    backdropFilter: 'blur(8px)', animation: 'fadeInUp 0.3s ease',
  }}>
    <div style={{
      width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
      background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.2rem', border: `1px solid ${color}30`,
    }}>{icon}</div>
    <div>
      <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '2px' }}>{label}</p>
    </div>
  </div>
);

/* ── Board card ── */
const BOARD_COLORS = ['var(--primary)','#10B981','#F59E0B','#F43F5E','#06B6D4','#8B5CF6'];
const BOARD_ICONS  = ['📋','🚀','🐛','🎨','🔗','🎯'];

const BoardCard = ({ board, index, onOpen, onDelete, deleting }) => {
  const color = BOARD_COLORS[index % BOARD_COLORS.length];
  const icon  = BOARD_ICONS[index % BOARD_ICONS.length];
  const isDeleting = deleting === board._id;

  return (
    <div onClick={() => onOpen(board._id)}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px',
        padding: '1.4rem', cursor: 'pointer', position: 'relative',
        backdropFilter: 'blur(8px)', transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        animation: `fadeInUp ${0.2 + index * 0.05}s ease`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${color}25`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Top: icon + title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.6rem' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
        }}>{icon}</div>
        <h3 style={{
          fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>{board.title}</h3>
      </div>

      <p style={{
        fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.55,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        minHeight: '2.5rem', marginBottom: '1rem',
      }}>
        {board.description || 'No description provided.'}
      </p>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between' }}
        onClick={e => e.stopPropagation()}>
        <span style={{
          background: `${color}15`, color, borderRadius: '999px',
          padding: '0.2rem 0.7rem', fontSize: '0.72rem', fontWeight: 700,
          border: `1px solid ${color}25`,
        }}>⊞ Board</span>

        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          <button onClick={() => onOpen(board._id)}
            style={{
              background: 'var(--primary-glow)', border: '1px solid var(--primary-glow)',
              color: 'var(--primary-soft)', borderRadius: '7px', padding: '0.3rem 0.75rem',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-glow)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary-glow)'; }}
          >Open →</button>
          <button onClick={() => onDelete(board._id)} disabled={isDeleting}
            style={{
              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
              color: 'var(--danger)', borderRadius: '7px', padding: '0.3rem 0.6rem',
              fontSize: '0.82rem', cursor: isDeleting ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s', opacity: isDeleting ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!isDeleting) e.currentTarget.style.background = 'rgba(244,63,94,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; }}
          >{isDeleting ? '…' : '🗑'}</button>
        </div>
      </div>
    </div>
  );
};

/* ── Dashboard ── */
const Dashboard = () => {
  const [boards, setBoards]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [title, setTitle]           = useState('');
  const [desc, setDesc]             = useState('');
  const [creating, setCreating]     = useState(false);
  const [createError, setCreateError] = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const [showForm, setShowForm]     = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const fetchBoards = async () => {
    setLoading(true); setFetchError(null);
    try { const r = await API.get('/boards'); setBoards(r.data); }
    catch (e) { setFetchError(e.response?.data?.message || 'Failed to load boards.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBoards(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true); setCreateError(null);
    try {
      await API.post('/boards', { title: title.trim(), description: desc.trim() });
      setTitle(''); setDesc(''); setShowForm(false);
      await fetchBoards();
    } catch (e) { setCreateError(e.response?.data?.message || 'Failed to create board.'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this board?')) return;
    setDeleting(id);
    try { await API.delete(`/boards/${id}`); await fetchBoards(); }
    catch { /* silent */ }
    finally { setDeleting(null); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const inputStyle = {
    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '9px',
    color: 'var(--text-1)', fontSize: '0.875rem', padding: '0.6rem 0.875rem', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const onFocus = e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; };
  const onBlur  = e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', color: 'var(--text-1)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar active="boards" onLogout={handleLogout} userName={user?.name} />

      <main style={{
        flex: 1, overflowY: 'auto', position: 'relative',
        backgroundImage: 'radial-gradient(circle, var(--primary-glow) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}>
        {/* Glow */}
        <div style={{ position: 'fixed', top: '-150px', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem', maxWidth: '1400px' }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>My Boards</h1>
              <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginTop: '2px' }}>Manage and organize your projects</p>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-soft))', border: 'none', color: '#fff',
                borderRadius: '10px', padding: '0.65rem 1.25rem', fontWeight: 700, fontSize: '0.9rem',
                cursor: 'pointer', boxShadow: 'var(--shadow-glow)', transition: 'box-shadow 0.2s',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px var(--primary-glow)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-glow)'}
            >+ New Board</button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <StatCard icon="▦" label="Total Boards" value={boards.length} color="var(--primary)" />
            <StatCard icon="✓" label="Active Boards" value={boards.length} color="#10B981" />
            <StatCard icon="★" label="This Month" value={boards.filter(b => new Date(b.createdAt) > new Date(Date.now()-30*86400000)).length} color="#F59E0B" />
          </div>

          {/* Create form */}
          {showForm && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px',
              padding: '1.5rem', marginBottom: '2rem', backdropFilter: 'blur(12px)',
              animation: 'fadeInUp 0.25s ease',
            }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '1rem' }}>＋ Create New Board</h2>
              {createError && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: 'var(--danger)', borderRadius: '8px', padding: '0.65rem 1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>{createError}</div>}
              <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input id="board-title" type="text" required placeholder="Board title *" value={title} onChange={e => setTitle(e.target.value)} disabled={creating} style={{ ...inputStyle, flex: '1 1 180px' }} onFocus={onFocus} onBlur={onBlur} />
                <input id="board-desc" type="text" placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} disabled={creating} style={{ ...inputStyle, flex: '2 1 260px' }} onFocus={onFocus} onBlur={onBlur} />
                <button id="create-board-btn" type="submit" disabled={creating || !title.trim()}
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-soft))', border: 'none', color: '#fff', borderRadius: '9px', padding: '0.6rem 1.25rem', fontSize: '0.875rem', fontWeight: 700, cursor: creating || !title.trim() ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1, whiteSpace: 'nowrap', boxShadow: 'var(--shadow-glow)', transition: 'box-shadow 0.2s' }}
                >{creating ? 'Creating…' : 'Create Board'}</button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: '9px', padding: '0.6rem 1rem', fontSize: '0.875rem', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary-soft)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
                >Cancel</button>
              </form>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
              <div className="spinner" />
              <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Loading your boards…</p>
            </div>
          )}

          {/* Error */}
          {!loading && fetchError && (
            <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: 'var(--danger)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ marginBottom: '0.75rem' }}>{fetchError}</p>
              <button onClick={fetchBoards} style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-soft))', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Retry</button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !fetchError && boards.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', gap: '1rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                {['To Do','In Progress','Done'].map((col, i) => (
                  <div key={col} style={{ width: '80px', background: 'var(--surface)', border: '1px dashed var(--primary-glow)', borderRadius: '8px', padding: '0.5rem 0.4rem' }}>
                    <div style={{ height: '4px', background: ['#3b82f6','#f59e0b','#10b981'][i], borderRadius: '2px', marginBottom: '0.4rem', boxShadow: `0 0 6px ${['#3b82f6','#f59e0b','#10b981'][i]}` }} />
                    {[1,2].map(n => <div key={n} style={{ height: '8px', background: 'var(--primary-glow)', borderRadius: '3px', marginBottom: '4px' }} />)}
                  </div>
                ))}
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-1)' }}>No boards yet</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Create your first board and start organizing your work</p>
              <button onClick={() => setShowForm(true)}
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-soft))', border: 'none', color: '#fff', borderRadius: '10px', padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: 'var(--shadow-glow)', marginTop: '0.5rem', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 32px var(--primary-glow)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-glow)'}
              >+ Create your first board</button>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['⚡ Takes 30 seconds','🔒 Private by default','🤝 Invite team later'].map(p => (
                  <span key={p} style={{ background: 'var(--primary-glow)', color: 'var(--primary-soft)', border: '1px solid var(--primary-glow)', borderRadius: '999px', padding: '0.25rem 0.8rem', fontSize: '0.75rem', fontWeight: 500 }}>{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Boards grid */}
          {!loading && !fetchError && boards.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px,1fr))', gap: '1.25rem' }}>
              {boards.map((board, i) => (
                <BoardCard key={board._id} board={board} index={i} onOpen={id => navigate(`/board/${id}`)} onDelete={handleDelete} deleting={deleting} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export { Sidebar };
export default Dashboard;
