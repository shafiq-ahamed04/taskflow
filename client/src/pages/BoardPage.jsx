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
      background: isOverlay ? 'rgba(30,30,50,0.98)' : 'rgba(19,19,26,0.9)',
      border: isOverlay ? '1px solid #6366F1' : '1px solid #1E1E2E',
      borderRadius: '10px', padding: '0.85rem', marginBottom: '0.5rem',
      cursor: isOverlay ? 'grabbing' : isDragging ? 'grabbing' : 'grab',
      position: 'relative', userSelect: 'none',
      backdropFilter: 'blur(8px)',
      boxShadow: isOverlay ? '0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(99,102,241,0.2)' : isDragging ? 'none' : '0 2px 8px rgba(0,0,0,0.3)',
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
            background: 'none', border: 'none', color: '#475569',
            cursor: isDeleting ? 'not-allowed' : 'pointer', fontSize: '0.75rem',
            padding: '2px 4px', borderRadius: '4px', transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { if (!isDeleting) { e.currentTarget.style.color = '#fb7185'; e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; } }}
          onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'none'; }}
        >{isDeleting ? '…' : '✕'}</button>
      )}

      <p style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.4, paddingRight: '1.5rem', marginBottom: '0.55rem', wordBreak: 'break-word' }}>
        {task.title}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span style={{ background: p.bg, color: p.color, borderRadius: '999px', padding: '0.12rem 0.55rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {p.label}
        </span>
        {task.createdAt && (
          <span style={{ color: '#475569', fontSize: '0.68rem' }}>
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
      style={{ width: '100%', background: 'transparent', border: '1px dashed #1E1E2E', borderRadius: '8px', padding: '0.55rem', color: '#475569', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem', transition: 'border-color 0.2s, color 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.color = '#818CF8'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E1E2E'; e.currentTarget.style.color = '#475569'; }}
    >+ Add task</button>
  );

  const inp = { width: '100%', background: '#0A0A0F', border: '1px solid #1E1E2E', borderRadius: '8px', color: '#F8FAFC', fontSize: '0.82rem', padding: '0.5rem 0.7rem', outline: 'none', transition: 'border-color 0.2s' };
  const onFocus = e => e.target.style.borderColor = '#6366F1';
  const onBlur  = e => e.target.style.borderColor = '#1E1E2E';

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '0.6rem', background: 'rgba(8,8,16,0.8)', border: '1px solid #1E1E2E', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', animation: 'fadeInUp 0.2s ease' }}>
      {error && <p style={{ color: '#fb7185', fontSize: '0.75rem' }}>{error}</p>}
      <input id={`task-title-${columnId}`} type="text" placeholder="Task title *" required autoFocus value={title} onChange={e => setTitle(e.target.value)} disabled={adding} style={inp} onFocus={onFocus} onBlur={onBlur} />
      <select id={`task-priority-${columnId}`} value={priority} onChange={e => setPriority(e.target.value)} disabled={adding} style={{ ...inp, cursor: 'pointer' }}>
        <option value="low">🟢 Low</option>
        <option value="medium">🟡 Medium</option>
        <option value="high">🔴 High</option>
      </select>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button id={`submit-task-${columnId}`} type="submit" disabled={adding || !title.trim()}
          style={{ flex: 1, background: 'linear-gradient(135deg,#6366F1,#818CF8)', border: 'none', color: '#fff', borderRadius: '7px', padding: '0.45rem', fontSize: '0.78rem', fontWeight: 700, cursor: adding || !title.trim() ? 'not-allowed' : 'pointer', opacity: adding ? 0.7 : 1 }}
        >{adding ? 'Adding…' : 'Add Task'}</button>
        <button type="button" onClick={() => { setOpen(false); setError(null); setTitle(''); }}
          style={{ background: 'transparent', border: '1px solid #1E1E2E', color: '#94A3B8', borderRadius: '7px', padding: '0.45rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer' }}
        >Cancel</button>
      </div>
    </form>
  );
};

/* ── KanbanColumn ── */
const KanbanColumn = ({ col, tasks, boardId, onAdded, onDelete, deletingId }) => {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <div style={{
      width: '300px', flexShrink: 0,
      background: 'rgba(13,13,24,0.7)', border: `1px solid ${isOver ? col.color : '#1E1E2E'}`,
      borderRadius: '14px', padding: '1rem',
      backdropFilter: 'blur(10px)',
      display: 'flex', flexDirection: 'column',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      boxShadow: isOver ? `0 0 20px ${col.color}25` : 'none',
      animation: 'fadeInUp 0.3s ease',
    }}>
      {/* Column header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: col.color, display: 'inline-block', boxShadow: `0 0 6px ${col.color}` }} />
          <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#E2E8F0', letterSpacing: '0.01em' }}>{col.title}</h3>
        </div>
        <span style={{ background: col.badge, color: col.badgeText, borderRadius: '999px', padding: '0.12rem 0.6rem', fontSize: '0.7rem', fontWeight: 700 }}>
          {tasks.length}
        </span>
      </div>

      {/* Droppable zone */}
      <div id={col.id} ref={setNodeRef} style={{ flex: 1, minHeight: '200px' }}>
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '2rem 0.5rem',
              color: isOver ? col.badgeText : '#2E2E45',
              fontSize: '0.8rem', border: `1px dashed ${isOver ? col.color : '#1E1E2E'}`,
              borderRadius: '8px', transition: 'all 0.15s',
            }}>
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
    <div style={{ display: 'flex', height: '100vh', background: '#0A0A0F', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar active="boards" onLogout={handleLogout} userName={user?.name} />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px',
        position: 'relative',
      }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.75rem', height: '60px', flexShrink: 0,
          background: 'rgba(8,8,16,0.8)', borderBottom: '1px solid #1E1E2E',
          backdropFilter: 'blur(12px)', position: 'relative', zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => navigate('/')}
              style={{ background: 'transparent', border: '1px solid #1E1E2E', color: '#94A3B8', borderRadius: '7px', padding: '0.35rem 0.7rem', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.color = '#818CF8'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E1E2E'; e.currentTarget.style.color = '#94A3B8'; }}
            >←</button>
            <span style={{ color: '#475569', fontSize: '0.85rem' }}>My Boards /</span>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
              {loading ? 'Loading…' : board?.title || 'Board'}
            </h1>
          </div>
          {!loading && board?.description && (
            <p style={{ color: '#475569', fontSize: '0.8rem', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{board.description}</p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div className="spinner" />
            <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Loading board…</p>
          </div>
        )}

        {/* Error */}
        {!loading && fetchError && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', borderRadius: '12px', padding: '1.5rem 2rem', textAlign: 'center', maxWidth: '380px' }}>
              <p style={{ marginBottom: '0.75rem' }}>{fetchError}</p>
              <button onClick={fetchData} style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Retry</button>
            </div>
          </div>
        )}

        {/* Kanban board */}
        {!loading && !fetchError && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div style={{
              display: 'flex', gap: '1.25rem', padding: '1.5rem 2rem',
              overflowX: 'auto', flex: 1, alignItems: 'flex-start',
              scrollbarWidth: 'thin', scrollbarColor: '#1E1E2E transparent',
              position: 'relative', zIndex: 1,
            }}>
              {COLUMNS.map(col => (
                <KanbanColumn
                  key={col.id} col={col}
                  tasks={tasks.filter(t => t.status === col.id)}
                  boardId={boardId}
                  onAdded={refreshTasks}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                />
              ))}
            </div>

            <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
              {activeTask ? <TaskCard task={activeTask} onDelete={() => {}} deletingId={null} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default BoardPage;
