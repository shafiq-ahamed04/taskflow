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
    <>
      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between px-4 h-14 bg-[var(--sidebar)] border-b border-[var(--border)] sticky top-0 z-40 w-full shrink-0">
        <span className="text-base font-extrabold tracking-tight text-[var(--text-1)]">
          Task<span className="text-[var(--primary)]">Flow</span>
        </span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-soft)] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {initials}
          </div>
          <button 
            onClick={onLogout} 
            title="Logout"
            className="w-11 h-11 flex items-center justify-center border-none bg-transparent text-[var(--text-3)] hover:text-[var(--danger)] cursor-pointer transition-colors duration-150"
          >
            <span style={{ fontSize: '1.2rem' }}>⏻</span>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] shrink-0 bg-[var(--sidebar)] border-r border-[var(--border)] p-6 h-screen sticky top-0">
        {/* Logo */}
        <div className="pl-2 mb-1">
          <span className="text-xl font-extrabold tracking-tight text-[var(--text-1)]">
            Task<span className="text-[var(--primary)]">Flow</span>
          </span>
          <p className="text-[10px] text-[var(--text-3)] tracking-wider uppercase mt-1">Workspace</p>
        </div>

        <div className="h-[1px] bg-[var(--border)] my-4" />

        {/* Nav list */}
        <nav className="flex flex-col gap-1 flex-1">
          {nav.map(item => {
            const isActive = item.key === active;
            return (
              <div key={item.key} 
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 border-l-4 ${
                  isActive 
                    ? 'bg-[var(--primary-glow)] text-[var(--primary-soft)] font-semibold border-[var(--primary)]' 
                    : 'text-[var(--text-2)] hover:bg-white/[0.04] hover:text-[var(--text-1)] border-transparent'
                }`}
              >
                <span className="text-base w-[18px] text-center">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="h-[1px] bg-[var(--border)] my-3" />
        <div className="flex items-center gap-3 p-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-soft)] flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--text-1)] truncate">{userName || 'User'}</p>
            <p className="text-[10px] text-[var(--text-3)]">Free Plan</p>
          </div>
          <button 
            onClick={onLogout} 
            title="Logout"
            className="w-8 h-8 flex items-center justify-center border-none bg-transparent text-[var(--text-3)] hover:text-[var(--danger)] cursor-pointer transition-colors duration-150"
          >
            ⏻
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--sidebar)] border-t border-[var(--border)] flex md:hidden justify-around items-center h-16 pb-safe">
        {nav.map(item => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] transition-colors duration-150 border-none bg-transparent ${
                isActive ? 'text-[var(--primary-soft)]' : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[9px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

/* ── Stat card ── */
const StatCard = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex-1 min-w-[140px] backdrop-blur-md animate-fade-up">
    <div 
      className="w-10 h-10 rounded-lg flex shrink-0 items-center justify-center text-lg border"
      style={{
        background: `${color}18`,
        borderColor: `${color}30`,
        color: color
      }}
    >{icon}</div>
    <div>
      <p className="text-xl md:text-2xl font-extrabold text-[var(--text-1)] leading-none">{value}</p>
      <p className="text-[10px] md:text-xs text-[var(--text-2)] mt-1 font-medium uppercase tracking-wider">{label}</p>
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
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 cursor-pointer relative backdrop-blur-md transition-all duration-200 hover:-translate-y-1"
      style={{
        animation: `fadeInUp ${0.2 + index * 0.05}s ease`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 8px 28px ${color}25`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Top: icon + title */}
      <div className="flex items-start gap-3 mb-3">
        <div 
          className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-base border"
          style={{
            background: `${color}18`,
            borderColor: `${color}30`,
          }}
        >{icon}</div>
        <h3 className="text-base font-bold text-[var(--text-1)] leading-snug truncate flex-1">{board.title}</h3>
      </div>

      <p className="text-xs md:text-sm text-[var(--text-2)] leading-relaxed line-clamp-2 min-h-[2.5rem] mb-4">
        {board.description || 'No description provided.'}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
        <span 
          className="badge text-[10px] font-bold"
          style={{
            background: `${color}15`,
            color: color,
            border: `1px solid ${color}25`
          }}
        >⊞ Board</span>

        <div className="flex gap-2">
          <button onClick={() => onOpen(board._id)}
            className="bg-[var(--primary-glow)] border-none text-[var(--primary-soft)] rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer min-h-[36px] flex items-center justify-center"
          >Open →</button>
          <button onClick={() => onDelete(board._id)} disabled={isDeleting}
            className="bg-rose-500/10 border border-rose-500/20 text-[var(--danger)] rounded-md px-2.5 py-1.5 text-xs cursor-pointer min-h-[36px] flex items-center justify-center shrink-0 disabled:opacity-50"
          >
            {isDeleting ? '…' : '🗑'}
          </button>
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
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text-1)] font-sans">
      <Sidebar active="boards" onLogout={handleLogout} userName={user?.name} />

      <main className="flex-1 overflow-y-auto relative pb-24 md:pb-0 w-full dot-grid">
        {/* Glow */}
        <div className="fixed top-[-150px] right-[-150px] w-[500px] h-[500px] bg-[radial-gradient(circle,var(--primary-glow)_0%,transparent_70%)] pointer-events-none z-0" />

        <div className="p-4 md:p-8 max-w-[1400px] w-full mx-auto relative z-10">

          {/* Top bar */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-[var(--text-1)] tracking-tight">My Boards</h1>
              <p className="text-xs md:text-sm text-[var(--text-2)] mt-1">Manage and organize your projects</p>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-soft)] border-none text-white rounded-xl px-5 py-3 font-bold text-sm cursor-pointer transition-all duration-200 min-h-[44px] flex items-center justify-center gap-2 shadow-[var(--shadow-glow)] hover:brightness-110 active:scale-95"
            >+ New Board</button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <StatCard icon="▦" label="Total Boards" value={boards.length} color="var(--primary)" />
            <StatCard icon="✓" label="Active Boards" value={boards.length} color="#10B981" />
            <div className="col-span-2 sm:col-span-1">
              <StatCard icon="★" label="This Month" value={boards.filter(b => new Date(b.createdAt) > new Date(Date.now()-30*86400000)).length} color="#F59E0B" />
            </div>
          </div>

          {/* Create form */}
          {showForm && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-6 backdrop-blur-md animate-fade-up shadow-[var(--shadow-card)]">
              <h2 className="text-sm md:text-base font-bold text-[var(--text-1)] mb-4">＋ Create New Board</h2>
              {createError && <div className="bg-rose-500/10 border border-rose-500/20 text-[var(--danger)] rounded-lg p-3 text-xs mb-4">{createError}</div>}
              <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-3">
                <input id="board-title" type="text" required placeholder="Board title *" value={title} onChange={e => setTitle(e.target.value)} disabled={creating} className="flex-1" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                <input id="board-desc" type="text" placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} disabled={creating} className="flex-1 md:flex-[2]" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                <div className="flex gap-2">
                  <button id="create-board-btn" type="submit" disabled={creating || !title.trim()}
                    className="flex-1 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-soft)] border-none text-white rounded-lg px-5 py-3 font-bold text-xs cursor-pointer min-h-[44px] flex items-center justify-center whitespace-nowrap disabled:opacity-50"
                  >{creating ? 'Creating…' : 'Create Board'}</button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="bg-transparent border border-[var(--border)] text-[var(--text-2)] rounded-lg px-4 py-3 text-xs font-semibold cursor-pointer min-h-[44px] flex items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary-soft)]"
                  >Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="spinner" />
              <p className="text-xs md:text-sm text-[var(--text-2)]">Loading your boards…</p>
            </div>
          )}

          {/* Error */}
          {!loading && fetchError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-[var(--danger)] rounded-xl p-6 text-center max-w-sm mx-auto">
              <p className="text-xs md:text-sm mb-4">{fetchError}</p>
              <button onClick={fetchBoards} className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-soft)] border-none text-white rounded-lg px-4 py-2 text-xs font-bold cursor-pointer">Retry</button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !fetchError && boards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 gap-4 text-center">
              <div className="flex gap-3 mb-2">
                {['To Do','In Progress','Done'].map((col, i) => (
                  <div key={col} className="w-[70px] bg-[var(--surface)] border border-dashed border-[var(--primary-glow)] rounded-lg p-2">
                    <div className="h-1 rounded-sm mb-2" style={{ background: ['#3b82f6','#f59e0b','#10b981'][i] }} />
                    {[1,2].map(n => <div key={n} className="h-1 bg-[var(--primary-glow)] rounded-sm mb-1" />)}
                  </div>
                ))}
              </div>
              <h2 className="text-base md:text-lg font-bold text-[var(--text-1)]">No boards yet</h2>
              <p className="text-xs md:text-sm text-[var(--text-2)] max-w-xs">Create your first board and start organizing your work</p>
              <button onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-soft)] border-none text-white rounded-xl px-5 py-3 font-bold text-sm cursor-pointer shadow-[var(--shadow-glow)] min-h-[44px] flex items-center justify-center"
              >+ Create your first board</button>
            </div>
          )}

          {/* Boards grid */}
          {!loading && !fetchError && boards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
