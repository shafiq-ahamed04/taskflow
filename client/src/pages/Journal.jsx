import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';
import { Sidebar } from './Dashboard';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/journal');
      setEntries(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load journal entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !date) return;
    setSaving(true);
    setError(null);
    try {
      await API.post('/journal', {
        title: title.trim(),
        content: content.trim(),
        date
      });
      setTitle('');
      setContent('');
      setDate(new Date().toISOString().split('T')[0]);
      await fetchEntries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Delete this journal entry permanently?')) return;
    setDeletingId(id);
    try {
      await API.delete(`/journal/${id}`);
      await fetchEntries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete journal entry.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const inputStyle = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '9px',
    color: 'var(--text-1)',
    fontSize: '0.875rem',
    padding: '0.65rem 0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    minHeight: '44px',
  };

  const onFocus = e => {
    e.target.style.borderColor = 'var(--primary)';
    e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)';
  };

  const onBlur = e => {
    e.target.style.borderColor = 'var(--border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text-1)] font-sans">
      <Sidebar active="journal" onLogout={handleLogout} userName={user?.name} />

      <main className="flex-1 overflow-y-auto relative pb-24 md:pb-0 w-full dot-grid">
        {/* Glow */}
        <div className="fixed top-[-150px] right-[-150px] w-[500px] h-[500px] bg-[radial-gradient(circle,var(--primary-glow)_0%,transparent_70%)] pointer-events-none z-0" />

        <div className="p-4 md:p-8 max-w-[900px] w-full mx-auto relative z-10">
          
          {/* Top Bar */}
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-extrabold text-[var(--text-1)] tracking-tight">My Journal</h1>
            <p className="text-xs md:text-sm text-[var(--text-2)] mt-1">Your secure private space for daily reflections and thoughts</p>
          </div>

          {/* Form */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 md:p-6 mb-8 backdrop-blur-md shadow-[var(--shadow-card)] animate-fade-up">
            <h2 className="text-sm md:text-base font-bold text-[var(--text-1)] mb-4 flex items-center gap-2">
              📝 New Reflection
            </h2>
            
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-[var(--danger)] rounded-lg p-3 text-xs mb-4">{error}</div>
            )}

            <form onSubmit={handleSaveEntry} className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] md:text-xs font-bold text-[var(--text-2)] mb-2 uppercase tracking-wider">TITLE</label>
                  <input
                    id="journal-title-input"
                    type="text"
                    required
                    placeholder="Entry title..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={saving}
                    style={{ ...inputStyle, width: '100%' }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div className="w-full sm:w-[180px]">
                  <label className="block text-[10px] md:text-xs font-bold text-[var(--text-2)] mb-2 uppercase tracking-wider">DATE</label>
                  <input
                    id="journal-date-input"
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    disabled={saving}
                    style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-bold text-[var(--text-2)] mb-2 uppercase tracking-wider">CONTENT</label>
                <textarea
                  id="journal-content-textarea"
                  required
                  rows={4}
                  placeholder="How was your day? What's on your mind?..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  disabled={saving}
                  style={{
                    ...inputStyle,
                    width: '100%',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: '1.6'
                  }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              <button
                id="save-journal-btn"
                type="submit"
                disabled={saving || !title.trim() || !content.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-[var(--primary)] to-[var(--primary-soft)] border-none text-white rounded-lg px-6 py-3 text-xs font-bold cursor-pointer min-h-[44px] flex items-center justify-center shadow-[var(--shadow-glow)] disabled:opacity-50 transition-all duration-150 hover:brightness-110 active:scale-95"
              >
                {saving ? 'Saving…' : 'Save Entry →'}
              </button>
            </form>
          </div>

          {/* Past Entries Heading */}
          <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-3">
            <h2 className="text-base md:text-lg font-bold text-[var(--text-1)]">Past Entries</h2>
            <span className="bg-[var(--border)] text-[var(--text-2)] rounded-full px-2.5 py-1 text-[10px] md:text-xs font-bold">
              {entries.length} entries
            </span>
          </div>

          {/* Loading / Empty States */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="spinner" />
              <p className="text-xs text-[var(--text-2)]">Loading entries…</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 gap-4 text-center">
              <div className="text-4xl">📓</div>
              <h2 className="text-base md:text-lg font-bold text-[var(--text-1)]">No journal entries yet</h2>
              <p className="text-xs md:text-sm text-[var(--text-2)] max-w-xs">Start documenting your journey. Add your thoughts above to build a beautiful repository of daily memories.</p>
            </div>
          ) : (
            /* Journal Entries List */
            <div className="flex flex-col gap-4">
              {entries.map((entry, idx) => {
                const isDeleting = deletingId === entry._id;
                
                // Format Date nicely
                let formattedDate = entry.date;
                try {
                  const [yr, mo, dy] = entry.date.split('-');
                  const dObj = new Date(yr, mo - 1, dy);
                  formattedDate = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                } catch (e) {}

                return (
                  <div
                    key={entry._id}
                    className="flex flex-col gap-2 bg-[var(--surface)] border border-[var(--border)] border-l-4 rounded-xl p-4 md:p-5 backdrop-blur-md transition-all duration-200"
                    style={{
                      borderLeftColor: 'var(--primary)',
                      animation: `fadeInUp ${0.2 + idx * 0.05}s ease`
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-soft)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    {/* Header: Date + Title + Delete */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <span className="bg-[var(--primary-glow)] border border-[var(--primary-glow)] text-[var(--primary-soft)] rounded-full px-2 py-0.5 text-[9px] md:text-[10px] font-bold tracking-wider uppercase mb-2 inline-block">
                          {formattedDate}
                        </span>
                        <h3 className="text-sm md:text-base font-bold text-[var(--text-1)] leading-snug truncate pr-4">
                          {entry.title}
                        </h3>
                      </div>

                      <button
                        id={`delete-entry-${entry._id}`}
                        onClick={() => handleDeleteEntry(entry._id)}
                        disabled={isDeleting}
                        className="bg-rose-500/5 border border-rose-500/15 text-[var(--danger)] rounded-lg px-3.5 py-2.5 text-xs cursor-pointer min-h-[44px] flex items-center justify-center shrink-0 disabled:opacity-50 transition-colors hover:bg-rose-500/20"
                      >
                        {isDeleting ? '…' : '🗑'}
                      </button>
                    </div>

                    {/* Content */}
                    <p className="text-xs md:text-sm text-[var(--text-2)] leading-relaxed whitespace-pre-wrap mt-1">
                      {entry.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Journal;
