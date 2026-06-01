import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';
import { Sidebar } from './Dashboard';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const fetchHabits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/habits');
      setHabits(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load habits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await API.post('/habits', { title: title.trim() });
      setTitle('');
      await fetchHabits();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add habit.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm('Delete this habit?')) return;
    setDeletingId(id);
    try {
      await API.delete(`/habits/${id}`);
      await fetchHabits();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete habit.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      // Optimistically toggle status locally
      const todayStr = new Date().toISOString().split('T')[0];
      setHabits(prev => prev.map(h => {
        if (h._id === id) {
          const completed = h.completedDates.includes(todayStr);
          const newDates = completed
            ? h.completedDates.filter(d => d !== todayStr)
            : [...h.completedDates, todayStr];
          return { ...h, completedDates: newDates };
        }
        return h;
      }));

      await API.post(`/habits/${id}/complete`);
    } catch (err) {
      // Fetch fresh copy to revert on failure
      fetchHabits();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const calculateStreak = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return 0;
    const dates = [...new Set(completedDates)].sort((a, b) => new Date(b) - new Date(a));
    
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }
    
    let streak = 0;
    let currentDate = new Date(dates[0]);
    
    // Safety break at 1000 days
    for (let i = 0; i < 1000; i++) {
      const expectedStr = currentDate.toISOString().split('T')[0];
      if (dates.includes(expectedStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const completedTodayCount = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const progressPercent = habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0;

  const inputStyle = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '9px',
    color: 'var(--text-1)',
    fontSize: '0.875rem',
    padding: '0.6rem 0.875rem',
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
      <Sidebar active="habits" onLogout={handleLogout} userName={user?.name} />

      <main style={{
        flex: 1,
        overflowY: 'auto',
        position: 'relative',
        backgroundImage: 'radial-gradient(circle, var(--primary-glow) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}>
        {/* Glow */}
        <div style={{ position: 'fixed', top: '-150px', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem', maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Top Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Daily Habits</h1>
              <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginTop: '2px' }}>Track daily routines and build perfect streaks</p>
            </div>
            {habits.length > 0 && (
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34D399',
                borderRadius: '999px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                🔥 {completedTodayCount} / {habits.length} Done Today
              </span>
            )}
          </div>

          {/* Add Habit Card */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '1.25rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(8px)',
          }}>
            <form onSubmit={handleAddHabit} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                id="habit-title-input"
                type="text"
                required
                placeholder="Enter a daily habit (e.g., Drink water, Gym, Read)..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={adding}
                style={{ ...inputStyle, flex: 1 }}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <button
                id="add-habit-btn"
                type="submit"
                disabled={adding || !title.trim()}
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-soft))',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '9px',
                  padding: '0.6rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: (adding || !title.trim()) ? 'not-allowed' : 'pointer',
                  opacity: adding ? 0.7 : 1,
                  boxShadow: 'var(--shadow-glow)',
                  transition: 'box-shadow 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {adding ? 'Adding…' : 'Add Habit'}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)',
              color: 'var(--danger)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              marginBottom: '1.5rem'
            }}>{error}</div>
          )}

          {/* Progress Bar */}
          {habits.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-2)', marginBottom: '0.4rem', fontWeight: 600 }}>
                <span>Today's Progress</span>
                <span>{progressPercent}% Completed</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--primary), #10B981)', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem' }}>
              <div className="spinner" />
              <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Loading habits…</p>
            </div>
          ) : habits.length === 0 ? (
            /* Empty State */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', gap: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>🌱</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-1)' }}>No habits yet</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', maxWidth: '360px' }}>Add your first habit above to track routines and build consistent daily streaks!</p>
            </div>
          ) : (
            /* Habits List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {habits.map((habit, idx) => {
                const isCompletedToday = habit.completedDates.includes(todayStr);
                const streak = calculateStreak(habit.completedDates);
                const isDeleting = deletingId === habit._id;

                return (
                  <div
                    key={habit._id}
                    style={{
                      background: isCompletedToday ? 'rgba(16, 185, 129, 0.04)' : 'var(--surface)',
                      border: isCompletedToday ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.2s ease',
                      animation: `fadeInUp ${0.2 + idx * 0.05}s ease`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                      {/* Checkbox */}
                      <div
                        onClick={() => handleToggleComplete(habit._id)}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          border: isCompletedToday ? '2px solid #10B981' : '2px solid var(--primary)',
                          background: isCompletedToday ? '#10B981' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          flexShrink: 0
                        }}
                      >
                        {isCompletedToday && (
                           <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 900 }}>✓</span>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: isCompletedToday ? '#A7F3D0' : 'var(--text-1)',
                          textDecoration: isCompletedToday ? 'line-through' : 'none',
                          opacity: isCompletedToday ? 0.75 : 1,
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {habit.title}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                          🔥 {streak} day streak
                        </span>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      id={`delete-habit-${habit._id}`}
                      onClick={() => handleDeleteHabit(habit._id)}
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
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => { if (!isDeleting) e.currentTarget.style.background = 'rgba(244, 63, 94, 0.18)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244, 63, 94, 0.05)'; }}
                    >
                      {isDeleting ? '…' : '🗑'}
                    </button>
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

export default Habits;
