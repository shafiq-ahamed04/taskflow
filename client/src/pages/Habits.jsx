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
      <Sidebar active="habits" onLogout={handleLogout} userName={user?.name} />

      <main className="flex-1 overflow-y-auto relative pb-24 md:pb-0 w-full dot-grid">
        {/* Glow */}
        <div className="fixed top-[-150px] right-[-150px] w-[500px] h-[500px] bg-[radial-gradient(circle,var(--primary-glow)_0%,transparent_70%)] pointer-events-none z-0" />

        <div className="p-4 md:p-8 max-w-[1000px] w-full mx-auto relative z-10">
          
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Daily Habits</h1>
              <p className="text-xs md:text-sm text-[var(--text-2)] mt-1">Track daily routines and build perfect streaks</p>
            </div>
            {habits.length > 0 && (
              <span className="bg-emerald-500/10 border border-emerald-500/25 text-[#34D399] rounded-full px-3 py-1.5 text-xs font-bold w-fit">
                🔥 {completedTodayCount} / {habits.length} Done Today
              </span>
            )}
          </div>

          {/* Add Habit Card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 md:p-5 mb-6 backdrop-blur-md">
            <form onSubmit={handleAddHabit} className="flex flex-col sm:flex-row gap-3">
              <input
                id="habit-title-input"
                type="text"
                required
                placeholder="Enter a daily habit (e.g., Drink water, Gym, Read)..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={adding}
                style={inputStyle}
                className="flex-1"
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <button
                id="add-habit-btn"
                type="submit"
                disabled={adding || !title.trim()}
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-soft)] border-none text-white rounded-lg px-6 py-3 text-xs font-bold cursor-pointer min-h-[44px] flex items-center justify-center whitespace-nowrap shadow-[var(--shadow-glow)] disabled:opacity-50"
              >
                {adding ? 'Adding…' : 'Add Habit'}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-[var(--danger)] rounded-lg p-3 text-xs mb-4">{error}</div>
          )}

          {/* Progress Bar */}
          {habits.length > 0 && (
            <div className="mb-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex justify-between text-[10px] md:text-xs text-[var(--text-2)] mb-2 font-bold uppercase tracking-wider">
                <span>Today's Progress</span>
                <span>{progressPercent}% Completed</span>
              </div>
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[#10B981] transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="spinner" />
              <p className="text-xs text-[var(--text-2)]">Loading habits…</p>
            </div>
          ) : habits.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4 gap-4 text-center">
              <div className="text-4xl">🌱</div>
              <h2 className="text-base md:text-lg font-bold text-[var(--text-1)]">No habits yet</h2>
              <p className="text-xs md:text-sm text-[var(--text-2)] max-w-xs">Add your first habit above to track routines and build consistent daily streaks!</p>
            </div>
          ) : (
            /* Habits List */
            <div className="flex flex-col gap-3">
              {habits.map((habit, idx) => {
                const isCompletedToday = habit.completedDates.includes(todayStr);
                const streak = calculateStreak(habit.completedDates);
                const isDeleting = deletingId === habit._id;

                return (
                  <div
                    key={habit._id}
                    className="flex items-center justify-between bg-[var(--surface)] border rounded-xl p-3 md:px-5 md:py-4 backdrop-blur-md transition-all duration-200"
                    style={{
                      borderColor: isCompletedToday ? 'rgba(16, 185, 129, 0.25)' : 'var(--border)',
                      background: isCompletedToday ? 'rgba(16, 185, 129, 0.04)' : 'var(--surface)',
                      animation: `fadeInUp ${0.2 + idx * 0.05}s ease`
                    }}
                  >
                    <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                      {/* Checkbox Touch Target */}
                      <div
                        onClick={() => handleToggleComplete(habit._id)}
                        className="w-11 h-11 flex items-center justify-center cursor-pointer shrink-0"
                      >
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: isCompletedToday ? '2px solid #10B981' : '2px solid var(--primary)',
                            background: isCompletedToday ? '#10B981' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isCompletedToday && (
                             <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 900 }}>✓</span>
                          )}
                        </div>
                      </div>

                      {/* Content Stacks on Mobile */}
                      <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pr-3">
                        <h3 
                          className="text-xs md:text-sm font-bold truncate max-w-[180px] sm:max-w-[400px]"
                          style={{
                            color: isCompletedToday ? '#A7F3D0' : 'var(--text-1)',
                            textDecoration: isCompletedToday ? 'line-through' : 'none',
                            opacity: isCompletedToday ? 0.75 : 1,
                            transition: 'all 0.2s',
                          }}
                        >
                          {habit.title}
                        </h3>
                        <span className="text-[10px] md:text-xs text-[#F59E0B] font-bold flex items-center gap-1 shrink-0">
                          🔥 {streak} day streak
                        </span>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      id={`delete-habit-${habit._id}`}
                      onClick={() => handleDeleteHabit(habit._id)}
                      disabled={isDeleting}
                      className="bg-rose-500/5 border border-rose-500/15 text-[var(--danger)] rounded-lg px-3.5 py-2.5 text-xs cursor-pointer min-h-[44px] flex items-center justify-center shrink-0 disabled:opacity-50 transition-colors hover:bg-rose-500/20"
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
