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
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', color: 'var(--text-1)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar active="journal" onLogout={handleLogout} userName={user?.name} />

      <main style={{
        flex: 1,
        overflowY: 'auto',
        position: 'relative',
        backgroundImage: 'radial-gradient(circle, var(--primary-glow) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}>
        {/* Glow */}
        <div style={{ position: 'fixed', top: '-150px', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem', maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Top Bar */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>My Journal</h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginTop: '2px' }}>Your secure private space for daily reflections and thoughts</p>
          </div>

          {/* Form */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2.5rem',
            backdropFilter: 'blur(8px)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              📝 New Reflection
            </h2>
            
            {error && (
              <div style={{
                background: 'rgba(244,63,94,0.1)',
                border: '1px solid rgba(244,63,94,0.3)',
                color: 'var(--danger)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>{error}</div>
            )}

            <form onSubmit={handleSaveEntry} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.4rem' }}>TITLE</label>
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
                <div style={{ width: '180px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.4rem' }}>DATE</label>
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
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.4rem' }}>CONTENT</label>
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
                    lineHeight: '1.5'
                  }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              <button
                id="save-journal-btn"
                type="submit"
                disabled={saving || !title.trim() || !content.trim()}
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-soft))',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '9px',
                  padding: '0.7rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: (saving || !title.trim() || !content.trim()) ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  boxShadow: 'var(--shadow-glow)',
                  transition: 'box-shadow 0.2s, transform 0.1s',
                  alignSelf: 'flex-start',
                  paddingLeft: '2rem',
                  paddingRight: '2rem'
                }}
              >
                {saving ? 'Saving…' : 'Save Entry →'}
              </button>
            </form>
          </div>

          {/* Past Entries Heading */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)' }}>Past Entries</h2>
            <span style={{
              background: 'var(--border)',
              color: 'var(--text-2)',
              borderRadius: '999px',
              padding: '0.15rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {entries.length} entries
            </span>
          </div>

          {/* Loading / Empty States */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem' }}>
              <div className="spinner" />
              <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Loading entries…</p>
            </div>
          ) : entries.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>📓</div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-1)' }}>No journal entries yet</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', maxWidth: '320px' }}>Start documenting your journey. Add your thoughts above to build a beautiful repository of daily memories.</p>
            </div>
          ) : (
            /* Journal Entries List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderLeft: '4px solid var(--primary)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      position: 'relative',
                      transition: 'border-color 0.2s, transform 0.2s',
                      animation: `fadeInUp ${0.2 + idx * 0.05}s ease`
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-soft)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    {/* Header: Date + Title + Delete */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ minWidth: 0 }}>
                        <span style={{
                          background: 'var(--primary-glow)',
                          color: 'var(--primary-soft)',
                          border: '1px solid var(--primary-glow)',
                          borderRadius: '999px',
                          padding: '0.15rem 0.6rem',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          display: 'inline-block',
                          marginBottom: '0.4rem',
                          letterSpacing: '0.02em'
                        }}>
                          {formattedDate}
                        </span>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)', wordBreak: 'break-word' }}>
                          {entry.title}
                        </h3>
                      </div>

                      <button
                        id={`delete-entry-${entry._id}`}
                        onClick={() => handleDeleteEntry(entry._id)}
                        disabled={isDeleting}
                        style={{
                          background: 'rgba(244, 63, 94, 0.05)',
                          border: '1px solid rgba(244, 63, 94, 0.15)',
                          color: 'var(--danger)',
                          borderRadius: '7px',
                          padding: '0.35rem 0.55rem',
                          fontSize: '0.78rem',
                          cursor: isDeleting ? 'not-allowed' : 'pointer',
                          opacity: isDeleting ? 0.5 : 1,
                          transition: 'all 0.15s',
                          flexShrink: 0
                        }}
                        onMouseEnter={e => { if (!isDeleting) e.currentTarget.style.background = 'rgba(244, 63, 94, 0.18)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244, 63, 94, 0.05)'; }}
                      >
                        {isDeleting ? '…' : '🗑'}
                      </button>
                    </div>

                    {/* Content */}
                    <p style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-2)',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      marginTop: '0.25rem'
                    }}>
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
