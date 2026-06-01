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
    name: tData.boardTitle.length > 12 ? tData.boardTitle.substring(0, 12) + '…' : tData.boardTitle,
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
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '0.5rem 0.75rem',
          boxShadow: 'var(--shadow-card)',
        }}>
          <p style={{ color: 'var(--text-1)', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>{payload[0].name}</p>
          <p style={{ color: 'var(--primary-soft)', fontSize: '0.85rem', fontWeight: 700, margin: '2px 0 0' }}>Tasks: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const StatCard = ({ icon, label, value, color }) => (
    <div className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 md:p-4 backdrop-blur-md shadow-[var(--shadow-card)] animate-fade-up">
      <div 
        className="w-10 h-10 rounded-lg flex shrink-0 items-center justify-center text-base border"
        style={{
          background: `${color}18`,
          borderColor: `${color}30`,
          color: color
        }}
      >{icon}</div>
      <div className="min-w-0">
        <p className="text-base md:text-xl font-extrabold text-[var(--text-1)] leading-none truncate">{value}</p>
        <p className="text-[9px] md:text-[10px] text-[var(--text-2)] mt-1 font-bold uppercase tracking-wider truncate">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text-1)] font-sans">
      <Sidebar active="analytics" onLogout={handleLogout} userName={user?.name} />

      <main className="flex-1 overflow-y-auto relative pb-24 md:pb-0 w-full dot-grid">
        {/* Glow */}
        <div className="fixed top-[-150px] right-[-150px] w-[500px] h-[500px] bg-[radial-gradient(circle,var(--primary-glow)_0%,transparent_70%)] pointer-events-none z-0" />

        <div className="p-4 md:p-8 max-w-[1200px] w-full mx-auto relative z-10">
          
          {/* Top Bar */}
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Analytics</h1>
            <p className="text-xs md:text-sm text-[var(--text-2)] mt-1">A dynamic workspace health report & productivity statistics</p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="spinner" />
              <p className="text-xs text-[var(--text-2)]">Gathering workspace metrics…</p>
            </div>
          ) : error ? (
            /* Error */
            <div className="bg-rose-500/10 border border-rose-500/20 text-[var(--danger)] rounded-xl p-6 text-center max-w-sm mx-auto animate-fade-up">
              <p className="text-xs mb-4">{error}</p>
              <button onClick={fetchData} className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-soft)] border-none text-white rounded-lg px-4 py-2 text-xs font-bold cursor-pointer">Retry</button>
            </div>
          ) : (
            /* Main Analytics Display */
            <div className="flex flex-col gap-6">
              
              {/* Stat Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon="▦" label="Total Boards" value={totalBoards} color="var(--primary)" />
                <StatCard icon="📋" label="Total Tasks" value={totalTasks} color="#3B82F6" />
                <StatCard icon="✅" label="Completed" value={completedTasks} color="#10B981" />
                <StatCard icon="⏳" label="Pending" value={pendingTasks} color="#F59E0B" />
                <StatCard icon="🔥" label="Habits Done" value={`${completedHabitsToday}/${totalHabits}`} color="#EC4899" />
                <StatCard icon="📈" label="Completion %" value={`${completionRate}%`} color="#8B5CF6" />
              </div>

              {/* Chart Section */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 md:p-6 backdrop-blur-md shadow-[var(--shadow-card)] animate-fade-up">
                <h2 className="text-sm md:text-base font-bold text-[var(--text-1)] mb-4 flex items-center gap-2">📊 Tasks per Board</h2>
                {chartData.length === 0 ? (
                  <div className="text-center py-12 px-4 text-xs text-[var(--text-3)]">
                    No board data to map. Create boards and add tasks to see analysis.
                  </div>
                ) : (
                  <div className="w-full h-[200px] md:h-[280px]">
                    <ResponsiveContainer>
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-2)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-2)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--primary-glow)' }} />
                        <Bar dataKey="Tasks" fill="url(#colorTasks)" radius={[6, 6, 0, 0]} maxBarSize={45}>
                          <defs>
                            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="var(--primary-soft)" stopOpacity={0.2}/>
                            </linearGradient>
                          </defs>
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Habit Streak Heatmap */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 md:p-6 backdrop-blur-md shadow-[var(--shadow-card)] animate-fade-up">
                <h2 className="text-sm md:text-base font-bold text-[var(--text-1)] mb-4 flex items-center gap-2">🔥 7-Day Habit Completion Heatmap</h2>
                {habits.length === 0 ? (
                  <div className="text-center py-8 px-4 text-xs text-[var(--text-3)]">
                    No habits created yet. Track streaks on the habits screen first.
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full pb-2">
                    <div className="min-w-[480px] flex flex-col gap-3">
                      {/* Header Row */}
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                        <span className="text-[10px] md:text-xs text-[var(--text-3)] font-bold uppercase tracking-wider w-[40%]">HABIT NAME</span>
                        <div className="flex gap-2 justify-end w-[60%]">
                          {last7Days.map(dateStr => {
                            const parts = dateStr.split('-');
                            const label = `${parts[1]}/${parts[2]}`;
                            return (
                              <span key={dateStr} className="text-[9px] md:text-[10px] text-[var(--text-3)] font-bold w-8 text-center shrink-0">
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Habit Heatmap list */}
                      {habits.map(habit => (
                        <div key={habit._id} className="flex items-center justify-between">
                          <span className="text-xs md:text-sm text-[var(--text-1)] font-semibold w-[40%] truncate pr-4">
                            {habit.title}
                          </span>
                          <div className="flex gap-2 justify-end w-[60%]">
                            {last7Days.map(dateStr => {
                              const isDone = habit.completedDates.includes(dateStr);
                              return (
                                <div
                                  key={dateStr}
                                  title={`${habit.title} on ${dateStr}: ${isDone ? 'COMPLETED' : 'MISSED'}`}
                                  className="w-8 h-4 rounded shrink-0 transition-transform duration-150 cursor-help"
                                  style={{
                                    background: isDone ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(255, 255, 255, 0.03)',
                                    border: isDone ? 'none' : '1px solid var(--border)',
                                    boxShadow: isDone ? '0 0 6px rgba(16, 185, 129, 0.4)' : 'none',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
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
