import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, DragOverlay, useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Sidebar } from './Dashboard';

/* ── Constants ── */
const COLUMNS = [
  { id: 'todo',       title: 'To Do',       color: '#3b82f6', badge: 'rgba(59,130,246,0.15)',  badgeText: '#60a5fa' },
  { id: 'inprogress', title: 'In Progress',  color: '#f59e0b', badge: 'rgba(245,158,11,0.15)',  badgeText: '#fbbf24' },
  { id: 'done',       title: 'Done',         color: '#10b981', badge: 'rgba(16,185,129,0.15)',  badgeText: '#34d399' },
];
const PRIORITY = {
  low:    { bg: 'rgba(16,185,129,0.15)',  color: '#34d399', label: 'Low'    },
  medium: { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', label: 'Medium' },
  high:   { bg: 'rgba(244,63,94,0.15)',   color: '#fb7185', label: 'High'   },
};

/* ── TaskCard ── */
const TaskCard = ({ task, onDelete, deletingId, dragProps = {}, isDragging = false, isOverlay = false }) => {
  const isDeleting = deletingId === task._id;
  const p = PRIORITY[task.priority] || PRIORITY.medium;

  return (
    <div {...dragProps} style={{
      background: isOverlay ? 'rgba(30,30,50,0.98)' : 'var(--surface)',
      border: isOverlay ? '1px solid var(--primary)' : '1px solid var(--border)',
      borderRadius: '10px', padding: '0.85rem', marginBottom: '0.5rem',
      cursor: isOverlay ? 'grabbing' : isDragging ? 'grabbing' : 'grab',
      position: 'relative', userSelect: 'none',
      backdropFilter: 'blur(8px)',
      boxShadow: isOverlay ? '0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(99,102,241,0.2)' : isDragging ? 'none' : 'var(--shadow-card)',
      opacity: isDragging ? 0.4 : 1,
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}>
      {/* Top-light shimmer */}
      <div style={{ position: 'absolute', top: 0, left: '12px', right: '12px', height: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '1px' }} />

      {/* Delete btn */}
      {!isOverlay && (
        <button
          id={`delete-task-${task._id}`}
          onClick={e => { e.stopPropagation(); onDelete(task._id); }}
          disabled={isDeleting}
          style={{
            position: 'absolute', top: '0.6rem', right: '0.6rem',
            background: 'none', border: 'none', color: 'var(--text-3)',
            cursor: isDeleting ? 'not-allowed' : 'pointer', fontSize: '0.75rem',
            padding: '2px 4px', borderRadius: '4px', transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { if (!isDeleting) { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; } }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
        >{isDeleting ? '…' : '✕'}</button>
      )}

      <p style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.4, paddingRight: '1.5rem', marginBottom: '0.55rem', wordBreak: 'break-word' }}>
        {task.title}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span style={{ background: p.bg, color: p.color, borderRadius: '999px', padding: '0.12rem 0.55rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {p.label}
        </span>
        {task.createdAt && (
          <span style={{ color: 'var(--text-3)', fontSize: '0.68rem' }}>
            {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
};

/* ── SortableTaskCard ── */
const SortableTaskCard = ({ task, onDelete, deletingId }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <TaskCard task={task} onDelete={onDelete} deletingId={deletingId} dragProps={{ ...attributes, ...listeners }} isDragging={isDragging} />
    </div>
  );
};

/* ── AddTaskForm ── */
const AddTaskForm = ({ columnId, boardId, onAdded }) => {
  const [open, setOpen]         = useState(false);
  const [title, setTitle]       = useState('');
  const [priority, setPriority] = useState('medium');
  const [adding, setAdding]     = useState(false);
  const [error, setError]       = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true); setError(null);
    try {
      await API.post(`/tasks/board/${boardId}`, { title: title.trim(), priority, status: columnId });
      setTitle(''); setPriority('medium'); setOpen(false);
      await onAdded();
    } catch (err) { setError(err.response?.data?.message || 'Failed to add task.'); }
    finally { setAdding(false); }
  };

  if (!open) return (
    <button id={`add-task-btn-${columnId}`} onClick={() => setOpen(true)}
      className="min-h-[44px] flex items-center justify-center gap-1 w-full bg-transparent border border-dashed border-[var(--border)] rounded-lg py-2.5 text-[var(--text-2)] text-xs cursor-pointer mt-2 transition-all duration-150 hover:border-[var(--primary)] hover:text-[var(--primary-soft)]"
    >+ Add task</button>
  );

  const inp = { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-1)', fontSize: '0.82rem', padding: '0.6rem 0.7rem', outline: 'none', transition: 'border-color 0.2s', minHeight: '44px' };
  const onFocus = e => e.target.style.borderColor = 'var(--primary)';
  const onBlur  = e => e.target.style.borderColor = 'var(--border)';

  return (
    <form onSubmit={handleSubmit} className="mt-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 flex flex-col gap-2.5 animate-fade-up">
      {error && <p className="text-rose-500 text-[10px]">{error}</p>}
      <input id={`task-title-${columnId}`} type="text" placeholder="Task title *" required autoFocus value={title} onChange={e => setTitle(e.target.value)} disabled={adding} style={inp} onFocus={onFocus} onBlur={onBlur} />
      <select id={`task-priority-${columnId}`} value={priority} onChange={e => setPriority(e.target.value)} disabled={adding} style={{ ...inp, cursor: 'pointer' }}>
        <option value="low">🟢 Low</option>
        <option value="medium">🟡 Medium</option>
        <option value="high">🔴 High</option>
      </select>
      <div className="flex gap-2">
        <button id={`submit-task-${columnId}`} type="submit" disabled={adding || !title.trim()}
          className="flex-1 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-soft)] border-none text-white rounded-lg px-3 font-bold text-xs cursor-pointer min-h-[44px] flex items-center justify-center disabled:opacity-50"
        >{adding ? 'Adding…' : 'Add Task'}</button>
        <button type="button" onClick={() => { setOpen(false); setError(null); setTitle(''); }}
          className="bg-transparent border border-[var(--border)] text-[var(--text-2)] rounded-lg px-3 text-xs font-semibold cursor-pointer min-h-[44px] flex items-center justify-center"
        >Cancel</button>
      </div>
    </form>
  );
};

/* ── KanbanColumn ── */
const KanbanColumn = ({ col, tasks, boardId, onAdded, onDelete, deletingId, activeCol }) => {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  const isSelected = col.id === activeCol;

  return (
    <div 
      className={`w-full md:w-[300px] shrink-0 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col backdrop-blur-md transition-all duration-150 animate-fade-up ${
        isSelected ? 'block' : 'hidden md:flex'
      }`}
      style={{
        borderColor: isOver ? col.color : 'var(--border)',
        boxShadow: isOver ? `0 0 20px ${col.color}25` : 'none',
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full display-inline-block" style={{ background: col.color, boxShadow: `0 0 6px ${col.color}` }} />
          <h3 className="font-extrabold text-sm text-[var(--text-1)] tracking-tight">{col.title}</h3>
        </div>
        <span className="badge text-[10px]" style={{ background: col.badge, color: col.badgeText }}>
          {tasks.length}
        </span>
      </div>

      {/* Droppable zone */}
      <div id={col.id} ref={setNodeRef} className="flex-1 min-h-[220px]">
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div 
              className="text-center py-10 px-2 text-xs rounded-xl border border-dashed transition-all duration-150"
              style={{
                color: isOver ? col.badgeText : 'var(--text-3)',
                borderColor: isOver ? col.color : 'var(--border)'
              }}
            >
              {isOver ? '📥 Drop here' : 'No tasks yet'}
            </div>
          ) : (
            tasks.map(task => (
              <SortableTaskCard key={task._id} task={task} onDelete={onDelete} deletingId={deletingId} />
            ))
          )}
        </SortableContext>
      </div>

      <AddTaskForm columnId={col.id} boardId={boardId} onAdded={onAdded} />
    </div>
  );
};

/* ── BoardPage ── */
const BoardPage = () => {
  const { id: boardId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [board, setBoard]         = useState(null);
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [activeCol, setActiveCol]   = useState('todo');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchData = useCallback(async () => {
    setLoading(true); setFetchError(null);
    try {
      const [bRes, tRes] = await Promise.all([API.get(`/boards/${boardId}`), API.get(`/tasks/board/${boardId}`)]);
      setBoard(bRes.data); setTasks(tRes.data);
    } catch (e) { setFetchError(e.response?.data?.message || 'Failed to load board.'); }
    finally { setLoading(false); }
  }, [boardId]);

  const refreshTasks = useCallback(async () => {
    try { const r = await API.get(`/tasks/board/${boardId}`); setTasks(r.data); } catch {}
  }, [boardId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async id => {
    if (!window.confirm('Delete this task?')) return;
    setDeletingId(id);
    try { await API.delete(`/tasks/${id}`); await refreshTasks(); }
    catch {}
    finally { setDeletingId(null); }
  };

  const onDragStart = e => setActiveTask(tasks.find(t => t._id === e.active.id) || null);

  const onDragEnd = async event => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id;
    const validCols = ['todo','inprogress','done'];
    let targetCol = null;
    if (validCols.includes(over.id)) { targetCol = over.id; }
    else { const ot = tasks.find(t => t._id === over.id); if (ot) targetCol = ot.status; }
    if (!targetCol) return;
    const dragged = tasks.find(t => t._id === taskId);
    if (!dragged || dragged.status === targetCol) return;
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: targetCol } : t));
    try { await API.put(`/tasks/${taskId}`, { status: targetCol }); }
    catch { setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: dragged.status } : t)); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text-1)] font-sans">
      <Sidebar active="boards" onLogout={handleLogout} userName={user?.name} />

      <div className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0 relative">
        {/* Glow */}
        <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] bg-[radial-gradient(circle,var(--primary-glow)_0%,transparent_70%)] pointer-events-none z-0" />

        {/* Topbar */}
        <div className="flex items-center justify-between px-4 md:px-8 h-16 shrink-0 bg-[var(--surface)] border-b border-[var(--border)] backdrop-blur-md relative z-10">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <button onClick={() => navigate('/')}
              className="bg-transparent border border-[var(--border)] text-[var(--text-2)] rounded-lg px-2.5 py-1.5 text-xs font-bold cursor-pointer transition-all hover:border-[var(--primary)] hover:text-[var(--primary-soft)] min-h-[36px] flex items-center justify-center shrink-0"
            >←</button>
            <span className="text-[10px] md:text-xs text-[var(--text-3)] truncate shrink-0">My Boards /</span>
            <h1 className="text-xs md:text-sm font-extrabold text-[var(--text-1)] truncate max-w-[120px] sm:max-w-[240px]">
              {loading ? 'Loading…' : board?.title || 'Board'}
            </h1>
          </div>
          {!loading && board?.description && (
            <p className="hidden sm:block text-xs text-[var(--text-3)] max-w-[200px] md:max-w-[320px] truncate">{board.description}</p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="spinner" />
            <p className="text-xs text-[var(--text-2)]">Loading board…</p>
          </div>
        )}

        {/* Error */}
        {!loading && fetchError && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="bg-rose-500/10 border border-rose-500/20 text-[var(--danger)] rounded-xl p-6 text-center max-w-sm w-full">
              <p className="text-xs mb-4">{fetchError}</p>
              <button onClick={fetchData} className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-soft)] border-none text-white rounded-lg px-4 py-2 text-xs font-bold cursor-pointer">Retry</button>
            </div>
          </div>
        )}

        {/* Kanban Content Area */}
        {!loading && !fetchError && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-8">
            
            {/* Column switcher tabs for mobile */}
            <div className="flex md:hidden bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1 mb-4 w-full shrink-0">
              {COLUMNS.map(col => {
                const isActive = activeCol === col.id;
                return (
                  <button
                    key={col.id}
                    onClick={() => setActiveCol(col.id)}
                    className="flex-1 text-center py-2.5 rounded-lg border-none text-xs font-bold transition-all min-h-[44px]"
                    style={{
                      background: isActive ? col.color : 'transparent',
                      color: isActive ? '#fff' : 'var(--text-2)'
                    }}
                  >
                    {col.title}
                  </button>
                );
              })}
            </div>

            {/* Kanban columns view */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
              <div className="flex-1 flex flex-col md:flex-row gap-5 overflow-y-auto md:overflow-x-auto items-start w-full relative z-1 pb-4">
                {COLUMNS.map(col => (
                  <KanbanColumn
                    key={col.id} col={col}
                    tasks={tasks.filter(t => t.status === col.id)}
                    boardId={boardId}
                    onAdded={refreshTasks}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                    activeCol={activeCol}
                  />
                ))}
              </div>

              <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
                {activeTask ? <TaskCard task={activeTask} onDelete={() => {}} deletingId={null} isOverlay /> : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardPage;
