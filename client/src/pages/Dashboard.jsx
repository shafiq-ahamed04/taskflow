import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';

/* ─────────────────────────────────────────────
   Inline styles / keyframes for the spinner
   (keeps the component self-contained without
   needing a separate CSS file change)
───────────────────────────────────────────── */
const spinnerStyle = {
  width: '2.5rem',
  height: '2.5rem',
  border: '3px solid rgba(255,255,255,0.1)',
  borderTopColor: '#3b82f6',
  borderRadius: '50%',
  animation: 'spin 0.75s linear infinite',
};

const globalKeyframes = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

/* ─────────────────────────────────────────────
   Dashboard Component
───────────────────────────────────────────── */
const Dashboard = () => {
  // ── State ──────────────────────────────────
  const [boards, setBoards]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating]     = useState(false);
  const [createError, setCreateError] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // ── Hooks ──────────────────────────────────
  const navigate  = useNavigate();
  const { user, logout } = useAuthStore();

  // ── Inject keyframes once ──────────────────
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = globalKeyframes;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  // ── Fetch boards on mount ──────────────────
  useEffect(() => {
    fetchBoards();
  }, []);

  // ── API helpers ────────────────────────────
  const fetchBoards = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await API.get('/boards');
      setBoards(res.data);
    } catch (err) {
      setFetchError(
        err.response?.data?.message || 'Failed to load boards. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    setCreateError(null);
    try {
      await API.post('/boards', { title: title.trim(), description: description.trim() });
      setTitle('');
      setDescription('');
      await fetchBoards();
    } catch (err) {
      setCreateError(
        err.response?.data?.message || 'Failed to create board. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBoard = async (id) => {
    if (!window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) return;

    setDeletingId(id);
    setDeleteError(null);
    try {
      await API.delete(`/boards/${id}`);
      await fetchBoards();
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || 'Failed to delete board. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── Render ─────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#111827', // gray-900
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        color: '#f9fafb',
      }}
    >
      {/* ── Navbar ─────────────────────────── */}
      <nav
        style={{
          backgroundColor: '#1f2937', // gray-800
          borderBottom: '1px solid #374151', // gray-700
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          style={{ textDecoration: 'none' }}
        >
          <span
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            Task<span style={{ color: '#3b82f6' }}>Flow</span>
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user && (
            <span
              style={{
                fontSize: '0.875rem',
                color: '#9ca3af', // gray-400
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              👤 {user.name}
            </span>
          )}
          <button
            id="logout-btn"
            onClick={handleLogout}
            style={{
              backgroundColor: '#dc2626', // red-600
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.45rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── Main Content ───────────────────── */}
      <main style={{ padding: '2rem' }}>

        {/* Page heading */}
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: '2rem',
            letterSpacing: '-0.02em',
          }}
        >
          My Boards
        </h1>

        {/* ── Create Board Form ─────────────── */}
        <div
          style={{
            backgroundColor: '#1f2937', // gray-800
            border: '1px solid #374151', // gray-700
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2.5rem',
            animation: 'slideDown 0.3s ease',
          }}
        >
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#e5e7eb',
              marginBottom: '1rem',
            }}
          >
            ＋ Create New Board
          </h2>

          {createError && (
            <div
              style={{
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid #ef4444',
                color: '#f87171',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}
            >
              {createError}
            </div>
          )}

          <form
            id="create-board-form"
            onSubmit={handleCreateBoard}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Title input */}
              <input
                id="board-title-input"
                type="text"
                placeholder="Board title *"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={creating}
                style={{
                  flex: '1 1 200px',
                  backgroundColor: '#374151', // gray-700
                  border: '1px solid #4b5563', // gray-600
                  borderRadius: '8px',
                  padding: '0.6rem 0.875rem',
                  color: '#f9fafb',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  minWidth: '180px',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#4b5563')}
              />

              {/* Description input */}
              <input
                id="board-description-input"
                type="text"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={creating}
                style={{
                  flex: '2 1 280px',
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '8px',
                  padding: '0.6rem 0.875rem',
                  color: '#f9fafb',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  minWidth: '200px',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#4b5563')}
              />

              {/* Submit button */}
              <button
                id="create-board-btn"
                type="submit"
                disabled={creating || !title.trim()}
                style={{
                  backgroundColor: creating || !title.trim() ? '#1d4ed8aa' : '#2563eb', // blue-700 / blue-600
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: creating || !title.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  whiteSpace: 'nowrap',
                  opacity: creating ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!creating && title.trim()) e.currentTarget.style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  if (!creating && title.trim()) e.currentTarget.style.backgroundColor = '#2563eb';
                }}
              >
                {creating ? 'Creating…' : 'Create Board'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Delete error banner ────────────── */}
        {deleteError && (
          <div
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid #ef4444',
              color: '#f87171',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}
          >
            {deleteError}
          </div>
        )}

        {/* ── Loading Spinner ────────────────── */}
        {loading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 0',
              gap: '1rem',
            }}
          >
            <div style={spinnerStyle} />
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Loading your boards…</p>
          </div>
        )}

        {/* ── Fetch Error ────────────────────── */}
        {!loading && fetchError && (
          <div
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid #ef4444',
              color: '#f87171',
              borderRadius: '8px',
              padding: '1.25rem',
              textAlign: 'center',
              fontSize: '0.9rem',
            }}
          >
            <p style={{ marginBottom: '0.75rem' }}>{fetchError}</p>
            <button
              onClick={fetchBoards}
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Empty State ───────────────────── */}
        {!loading && !fetchError && boards.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5rem 2rem',
              color: '#6b7280', // gray-500
              gap: '0.75rem',
            }}
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4b5563"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#9ca3af' }}>
              No boards yet.
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              Create your first board using the form above!
            </p>
          </div>
        )}

        {/* ── Boards Grid ───────────────────── */}
        {!loading && !fetchError && boards.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {boards.map((board) => (
              <BoardCard
                key={board._id}
                board={board}
                deletingId={deletingId}
                onDelete={handleDeleteBoard}
                onOpen={() => navigate(`/board/${board._id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

/* ─────────────────────────────────────────────
   BoardCard Sub-component
───────────────────────────────────────────── */
const BoardCard = ({ board, deletingId, onDelete, onOpen }) => {
  const isDeleting = deletingId === board._id;

  return (
    <div
      style={{
        backgroundColor: '#1f2937', // gray-800
        border: '1px solid #374151', // gray-700
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        animation: 'fadeIn 0.35s ease',
        transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#374151';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Board title */}
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#ffffff',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={board.title}
      >
        {board.title}
      </h3>

      {/* Board description */}
      <p
        style={{
          fontSize: '0.875rem',
          color: '#9ca3af', // gray-400
          margin: 0,
          flexGrow: 1,
          lineHeight: 1.6,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.8rem',
        }}
      >
        {board.description || 'No description provided.'}
      </p>

      {/* Created date */}
      {board.createdAt && (
        <p
          style={{
            fontSize: '0.75rem',
            color: '#6b7280', // gray-500
            margin: 0,
          }}
        >
          Created {new Date(board.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      )}

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #374151',
        }}
      >
        {/* Open Board */}
        <button
          id={`open-board-${board._id}`}
          onClick={onOpen}
          disabled={isDeleting}
          style={{
            flex: 1,
            backgroundColor: '#2563eb', // blue-600
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.55rem 0',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease',
            opacity: isDeleting ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isDeleting) e.currentTarget.style.backgroundColor = '#1d4ed8';
          }}
          onMouseLeave={(e) => {
            if (!isDeleting) e.currentTarget.style.backgroundColor = '#2563eb';
          }}
        >
          Open Board
        </button>

        {/* Delete */}
        <button
          id={`delete-board-${board._id}`}
          onClick={() => onDelete(board._id)}
          disabled={isDeleting}
          style={{
            flex: 1,
            backgroundColor: isDeleting ? 'rgba(220,38,38,0.5)' : 'rgba(220,38,38,0.15)',
            color: isDeleting ? '#fca5a5' : '#f87171',
            border: '1px solid rgba(220,38,38,0.4)',
            borderRadius: '8px',
            padding: '0.55rem 0',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.3)';
              e.currentTarget.style.color = '#fca5a5';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.15)';
              e.currentTarget.style.color = '#f87171';
            }
          }}
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
