import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';

/* ── Sidebar shared component ── */
const Sidebar = ({ active = 'boards', onLogout, userName }) => {
  const nav = [
    { key: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { key: 'boards',    icon: '▦', label: 'My Boards' },
    { key: 'tasks',     icon: '✓', label: 'My Tasks'  },
    { key: 'analytics', icon: '↗', label: 'Analytics' },
    { key: 'settings',  icon: '⚙', label: 'Settings'  },
  ];
  const initials = userName ? userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'TF';

  return (
    <aside style={{
      width: '240px', flexShrink: 0,
      background: '#080810',
      borderRight: '1px solid #1E1E2E',
      display: 'flex', flexDirection: 'column',
      padding: '1.5rem 0.75rem',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ paddingLeft: '0.5rem', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#F8FAFC' }}>
          Task<span style={{ color: '#6366F1' }}>Flow</span>
        </span>
        <p style={{ fontSize: '0.65rem', color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '1px' }}>Workspace</p>
      </div>

      <div style={{ height: '1px', background: '#1E1E2E', margin: '1rem 0' }} />

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {nav.map(item => {
          const isActive = item.key === active;
          return (
            <div key={item.key} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.75rem', borderRadius: '8px', cursor: 'pointer',
              background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: isActive ? '#a5b4fc' : '#94A3B8',
              fontWeight: isActive ? 600 : 400, fontSize: '0.875rem',
              borderLeft: isActive ? '3px solid #6366F1' : '3px solid transparent',
              transition: 'all 0.15s ease',
            }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#F8FAFC'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}
            >
              <span style={{ fontSize: '1rem', width: '18px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </nav>

      {/* User profile */}
      <div style={{ height: '1px', background: '#1E1E2E', margin: '0.75rem 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 0.5rem' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #6366F1, #818CF8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', fontWeight: 700, color: '#fff',
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName || 'User'}</p>
          <p style={{ fontSize: '0.7rem', color: '#475569' }}>Free Plan</p>
        </div>
        <button onClick={onLogout} title="Logout"
          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1rem', padding: '2px', borderRadius: '4px', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#F43F5E'}
          onMouseLeave={e => e.currentTarget.style.color = '#475569'}
        >⏻</button>
      </div>
    </aside>
  );
};

/* ── Stat card ── */
const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'rgba(19,19,26,0.8)', border: '1px solid #1E1E2E', borderRadius: '14px',
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
      <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>{label}</p>
    </div>
  </div>
);

/* ── Board card ── */
const BOARD_COLORS = ['#6366F1','#10B981','#F59E0B','#F43F5E','#06B6D4','#8B5CF6'];
const BOARD_ICONS  = ['📋','🚀','🐛','🎨','🔗','🎯'];

const BoardCard = ({ board, index, onOpen, onDelete, deleting }) => {
  const color = BOARD_COLORS[index % BOARD_COLORS.length];
  const icon  = BOARD_ICONS[index % BOARD_ICONS.length];
  const isDeleting = deleting === board._id;

  return (
    <div
      onClick={() => onOpen(board._id)}
      style={{
        background: 'rgba(19,19,26,0.85)', border: '1px solid #1E1E2E', borderRadius: '14px',
        padding: '1.4rem', cursor: 'pointer', position: 'relative',
        backdropFilter: 'blur(8px)', transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        animation: `fadeInUp ${0.2 + index * 0.05}s ease`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${color}25`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E1E2E'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Top: icon + title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.6rem' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
        }}>{icon}</div>
        <h3 style={{
          fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>{board.title}</h3>
      </div>

      <p style={{
        fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.55,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        minHeight: '2.5rem', marginBottom: '1rem',
      }}>
        {board.description || 'No description provided.'}
      </p>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onClick={e => e.stopPropagation()}>
        <span style={{
          background: `${color}15`, color, borderRadius: '999px',
          padding: '0.2rem 0.7rem', fontSize: '0.72rem', fontWeight: 700,
          border: `1px solid ${color}25`,
        }}>⊞ Board</span>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => onOpen(board._id)}
            style={{
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              color: '#818CF8', borderRadius: '7px', padding: '0.3rem 0.75rem',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
          >Open →</button>
          <button onClick={() => onDelete(board._id)} disabled={isDeleting}
            style={{
              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
              color: '#fb7185', borderRadius: '7px', padding: '0.3rem 0.6rem',
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
    background: '#0A0A0F', border: '1px solid #1E1E2E', borderRadius: '9px',
    color: '#F8FAFC', fontSize: '0.875rem', padding: '0.6rem 0.875rem', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const onFocus = e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; };
  const onBlur  = e => { e.target.style.borderColor = '#1E1E2E'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0A0A0F', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar active="boards" onLogout={handleLogout} userName={user?.name} />

      <main style={{
        flex: 1, overflowY: 'auto', position: 'relative',
        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}>
        {/* Glow */}
        <div style={{ position: 'fixed', top: '-150px', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem', maxWidth: '1400px' }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em' }}>My Boards</h1>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '2px' }}>Manage and organize your projects</p>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              style={{
                background: 'linear-gradient(135deg,#6366F1,#818CF8)', border: 'none', color: '#fff',
                borderRadius: '10px', padding: '0.65rem 1.25rem', fontWeight: 700, fontSize: '0.9rem',
                cursor: 'pointer', boxShadow: '0 0 18px rgba(99,102,241,0.35)', transition: 'box-shadow 0.2s',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.55)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 18px rgba(99,102,241,0.35)'}
            >+ New Board</button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <StatCard icon="▦" label="Total Boards" value={boards.length} color="#6366F1" />
            <StatCard icon="✓" label="Active Boards" value={boards.length} color="#10B981" />
            <StatCard icon="★" label="This Month" value={boards.filter(b => new Date(b.createdAt) > new Date(Date.now()-30*86400000)).length} color="#F59E0B" />
          </div>

          {/* Create form */}
          {showForm && (
            <div style={{
              background: 'rgba(19,19,26,0.9)', border: '1px solid #1E1E2E', borderRadius: '14px',
              padding: '1.5rem', marginBottom: '2rem', backdropFilter: 'blur(12px)',
              animation: 'fadeInUp 0.25s ease',
            }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1rem' }}>＋ Create New Board</h2>
              {createError && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', borderRadius: '8px', padding: '0.65rem 1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>{createError}</div>}
              <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input id="board-title" type="text" required placeholder="Board title *" value={title} onChange={e => setTitle(e.target.value)} disabled={creating} style={{ ...inputStyle, flex: '1 1 180px' }} onFocus={onFocus} onBlur={onBlur} />
                <input id="board-desc" type="text" placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} disabled={creating} style={{ ...inputStyle, flex: '2 1 260px' }} onFocus={onFocus} onBlur={onBlur} />
                <button id="create-board-btn" type="submit" disabled={creating || !title.trim()}
                  style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', border: 'none', color: '#fff', borderRadius: '9px', padding: '0.6rem 1.25rem', fontSize: '0.875rem', fontWeight: 700, cursor: creating || !title.trim() ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1, whiteSpace: 'nowrap', boxShadow: '0 0 14px rgba(99,102,241,0.3)', transition: 'box-shadow 0.2s' }}
                >{creating ? 'Creating…' : 'Create Board'}</button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ background: 'transparent', border: '1px solid #1E1E2E', color: '#94A3B8', borderRadius: '9px', padding: '0.6rem 1rem', fontSize: '0.875rem', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.color = '#818CF8'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E1E2E'; e.currentTarget.style.color = '#94A3B8'; }}
                >Cancel</button>
              </form>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
              <div className="spinner" />
              <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Loading your boards…</p>
            </div>
          )}

          {/* Error */}
          {!loading && fetchError && (
            <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ marginBottom: '0.75rem' }}>{fetchError}</p>
              <button onClick={fetchBoards} style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Retry</button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !fetchError && boards.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', gap: '1rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                {['To Do','In Progress','Done'].map((col, i) => (
                  <div key={col} style={{ width: '80px', background: 'rgba(19,19,26,0.7)', border: '1px dashed rgba(99,102,241,0.2)', borderRadius: '8px', padding: '0.5rem 0.4rem' }}>
                    <div style={{ height: '4px', background: ['#3b82f6','#f59e0b','#10b981'][i], borderRadius: '2px', marginBottom: '0.4rem', boxShadow: `0 0 6px ${['#3b82f6','#f59e0b','#10b981'][i]}` }} />
                    {[1,2].map(n => <div key={n} style={{ height: '8px', background: 'rgba(99,102,241,0.12)', borderRadius: '3px', marginBottom: '4px' }} />)}
                  </div>
                ))}
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#F8FAFC' }}>No boards yet</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Create your first board and start organizing your work</p>
              <button onClick={() => setShowForm(true)}
                style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', border: 'none', color: '#fff', borderRadius: '10px', padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 0 20px rgba(99,102,241,0.35)', marginTop: '0.5rem', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 32px rgba(99,102,241,0.55)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.35)'}
              >+ Create your first board</button>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['⚡ Takes 30 seconds','🔒 Private by default','🤝 Invite team later'].map(p => (
                  <span key={p} style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '999px', padding: '0.25rem 0.8rem', fontSize: '0.75rem', fontWeight: 500 }}>{p}</span>
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
