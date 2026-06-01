import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';
import { Sidebar } from './Dashboard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Analytics = () => {
  const [boards, setBoards] = useState([]);
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch all boards
      const boardsRes = await API.get('/boards');
      const fetchedBoards = boardsRes.data;
      setBoards(fetchedBoards);

      // 2. Fetch all habits
      const habitsRes = await API.get('/habits');
      setHabits(habitsRes.data);

      // 3. Fetch all tasks for every board in parallel
      const taskPromises = fetchedBoards.map(board =>
        API.get(`/tasks/board/${board._id}`).then(res => ({
          boardId: board._id,
          boardTitle: board.title,
          tasks: res.data
        }))
      );
      
      const allTaskData = await Promise.all(taskPromises);
      setTasks(allTaskData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculations
  const totalBoards = boards.length;
  
  // Flatten tasks to analyze all of them together
  const allTasksFlat = tasks.flatMap(tData => tData.tasks);
  const totalTasks = allTasksFlat.length;
  
  const completedTasks = allTasksFlat.filter(t => t.status === 'done').length;
  const pendingTasks = allTasksFlat.filter(t => t.status === 'todo' || t.status === 'inprogress').length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Habits today completed count
  const todayStr = new Date().toISOString().split('T')[0];
  const completedHabitsToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const totalHabits = habits.length;

  // Chart data formatting: tasks count per board
  const chartData = tasks.map(tData => ({
    name: tData.boardTitle.length > 15 ? tData.boardTitle.substring(0, 15) + '…' : tData.boardTitle,
    Tasks: tData.tasks.length,
  }));

  // Heatmap helper for past 7 days completion status
  const getPastSevenDays = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };
  const last7Days = getPastSevenDays();

  // Custom tooltips
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(19, 19, 26, 0.95)',
          border: '1px solid #1E1E2E',
          borderRadius: '8px',
          padding: '0.5rem 0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}>
          <p style={{ color: '#F8FAFC', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>{payload[0].name}</p>
          <p style={{ color: '#6366F1', fontSize: '0.85rem', fontWeight: 700, margin: '2px 0 0' }}>Tasks: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const StatCard = ({ icon, label, value, color }) => (
    <div style={{
      background: 'rgba(19, 19, 26, 0.85)',
      border: '1px solid #1E1E2E',
      borderRadius: '14px',
      padding: '1.25rem',
      flex: '1 1 200px',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      animation: 'fadeInUp 0.3s ease',
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        flexShrink: 0,
        background: `${color}18`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.3rem',
        border: `1px solid ${color}30`,
      }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1.1 }}>{value}</p>
        <p style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0A0A0F', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar active="analytics" onLogout={handleLogout} userName={user?.name} />

      <main style={{
        flex: 1,
        overflowY: 'auto',
        position: 'relative',
        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}>
        {/* Glow */}
        <div style={{ position: 'fixed', top: '-150px', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Top Bar */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em' }}>Analytics</h1>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '2px' }}>A dynamic workspace health report & productivity statistics</p>
          </div>

          {/* Loading */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
              <div className="spinner" />
              <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Gathering workspace metrics…</p>
            </div>
          ) : error ? (
            /* Error */
            <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ marginBottom: '0.75rem' }}>{error}</p>
              <button onClick={fetchData} style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Retry</button>
            </div>
          ) : (
            /* Main Analytics Display */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Stat Grid */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <StatCard icon="▦" label="Total Boards" value={totalBoards} color="#6366F1" />
                <StatCard icon="📋" label="Total Tasks" value={totalTasks} color="#3B82F6" />
                <StatCard icon="✅" label="Completed Tasks" value={completedTasks} color="#10B981" />
                <StatCard icon="⏳" label="Pending Tasks" value={pendingTasks} color="#F59E0B" />
                <StatCard icon="🔥" label="Habits Done Today" value={`${completedHabitsToday} / ${totalHabits}`} color="#EC4899" />
                <StatCard icon="📈" label="Completion %" value={`${completionRate}%`} color="#8B5CF6" />
              </div>

              {/* Chart Section */}
              <div style={{
                background: 'rgba(19, 19, 26, 0.85)',
                border: '1px solid #1E1E2E',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1.5rem' }}>📊 Tasks per Board</h2>
                {chartData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#475569', fontSize: '0.85rem' }}>
                    No board data to map. Create boards and add tasks to see analysis.
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                        <Bar dataKey="Tasks" fill="url(#colorTasks)" radius={[6, 6, 0, 0]} maxBarSize={45}>
                          <defs>
                            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#818CF8" stopOpacity={0.2}/>
                            </linearGradient>
                          </defs>
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Habit Streak Heatmap */}
              <div style={{
                background: 'rgba(19, 19, 26, 0.85)',
                border: '1px solid #1E1E2E',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1.25rem' }}>🔥 7-Day Habit Completion Heatmap</h2>
                {habits.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#475569', fontSize: '0.85rem' }}>
                    No habits created yet. Track streaks on the habits screen first.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Header Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #1E1E2E' }}>
                      <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, width: '40%' }}>HABIT NAME</span>
                      <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', width: '60%' }}>
                        {last7Days.map(dateStr => {
                          const parts = dateStr.split('-');
                          const label = `${parts[1]}/${parts[2]}`;
                          return (
                            <span key={dateStr} style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 700, width: '28px', textAlign: 'center' }}>
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Habit Heatmap list */}
                    {habits.map(habit => (
                      <div key={habit._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem', color: '#F8FAFC', fontWeight: 600, width: '40%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {habit.title}
                        </span>
                        <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', width: '60%' }}>
                          {last7Days.map(dateStr => {
                            const isDone = habit.completedDates.includes(dateStr);
                            return (
                              <div
                                key={dateStr}
                                title={`${habit.title} on ${dateStr}: ${isDone ? 'COMPLETED' : 'MISSED'}`}
                                style={{
                                  width: '28px',
                                  height: '16px',
                                  borderRadius: '4px',
                                  background: isDone ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(255, 255, 255, 0.03)',
                                  border: isDone ? 'none' : '1px solid #1E1E2E',
                                  boxShadow: isDone ? '0 0 6px rgba(16, 185, 129, 0.4)' : 'none',
                                  transition: 'transform 0.15s ease',
                                  cursor: 'help'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                                line-height="none"
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Analytics;
