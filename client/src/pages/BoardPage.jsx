import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const COLUMNS = [
  { id: 'todo',       title: 'To Do',       color: 'blue'   },
  { id: 'inprogress', title: 'In Progress',  color: 'yellow' },
  { id: 'done',       title: 'Done',         color: 'green'  },
];

const COLUMN_DOT_COLORS = {
  blue:   '#3b82f6',
  yellow: '#f59e0b',
  green:  '#22c55e',
};

const COLUMN_BADGE_STYLES = {
  blue:   { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  yellow: { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
  green:  { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
};

const PRIORITY_STYLES = {
  low:    { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80',  label: 'Low'    },
  medium: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24',  label: 'Medium' },
  high:   { bg: 'rgba(239,68,68,0.15)',  color: '#f87171',  label: 'High'   },
};

/* ─────────────────────────────────────────────
   Global keyframes injected once
───────────────────────────────────────────── */
const KEYFRAMES = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0);    }
}
`;

/* ─────────────────────────────────────────────
   SortableTaskCard — individual draggable card
───────────────────────────────────────────── */
const SortableTaskCard = ({ task, onDelete, deletingId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        onDelete={onDelete}
        deletingId={deletingId}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────
   TaskCard — visual card (also used in DragOverlay)
───────────────────────────────────────────── */
const TaskCard = ({ task, onDelete, deletingId, dragHandleProps = {}, isDragging = false, isOverlay = false }) => {
  const isDeleting = deletingId === task._id;
  const priority   = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

  return (
    <div
      {...dragHandleProps}
      style={{
        backgroundColor: isOverlay ? '#4b5563' : '#374151', // gray-600 overlay / gray-700 normal
        borderRadius: '10px',
        padding: '0.75rem',
        marginBottom: '0.5rem',
        cursor: isOverlay ? 'grabbing' : 'grab',
        position: 'relative',
        border: isOverlay ? '2px solid #3b82f6' : '1px solid #4b5563',
        boxShadow: isOverlay
          ? '0 20px 40px rgba(0,0,0,0.5)'
          : isDragging
          ? 'none'
          : '0 1px 3px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        animation: 'fadeInUp 0.25s ease',
        userSelect: 'none',
      }}
    >
      {/* Delete button */}
      {!isOverlay && (
        <button
          id={`delete-task-${task._id}`}
          onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
          disabled={isDeleting}
          title="Delete task"
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: isDeleting ? '#6b7280' : '#6b7280',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            lineHeight: 1,
            padding: 0,
            transition: 'color 0.15s ease, background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b7280';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {isDeleting ? '…' : '✕'}
        </button>
      )}

      {/* Task title */}
      <p
        style={{
          color: '#f9fafb',
          fontWeight: 600,
          fontSize: '0.875rem',
          margin: 0,
          paddingRight: '1.5rem',
          lineHeight: 1.4,
          wordBreak: 'break-word',
        }}
      >
        {task.title}
      </p>

      {/* Priority badge */}
      <div style={{ marginTop: '0.5rem' }}>
        <span
          style={{
            display: 'inline-block',
            backgroundColor: priority.bg,
            color: priority.color,
            borderRadius: '999px',
            padding: '0.15rem 0.55rem',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          {priority.label}
        </span>
      </div>

      {/* Created date */}
      {task.createdAt && (
        <p
          style={{
            color: '#6b7280',
            fontSize: '0.7rem',
            margin: '0.4rem 0 0',
          }}
        >
          {new Date(task.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   AddTaskForm — inline form at column bottom
───────────────────────────────────────────── */
const AddTaskForm = ({ columnId, boardId, onTaskAdded }) => {
  const [title,    setTitle]    = useState('');
  const [priority, setPriority] = useState('medium');
  const [adding,   setAdding]   = useState(false);
  const [error,    setError]    = useState(null);
  const [open,     setOpen]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await API.post(`/tasks/board/${boardId}`, {
        title: title.trim(),
        priority,
        status: columnId,
      });
      setTitle('');
      setPriority('medium');
      setOpen(false);
      await onTaskAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task.');
    } finally {
      setAdding(false);
    }
  };

  if (!open) {
    return (
      <button
        id={`add-task-btn-${columnId}`}
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          backgroundColor: 'transparent',
          border: '1px dashed #4b5563',
          borderRadius: '8px',
          padding: '0.55rem',
          color: '#6b7280',
          fontSize: '0.825rem',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, color 0.2s ease',
          marginTop: '0.5rem',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.color = '#60a5fa';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#4b5563';
          e.currentTarget.style.color = '#6b7280';
        }}
      >
        + Add Task
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: '0.75rem',
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '10px',
        padding: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        animation: 'fadeInUp 0.2s ease',
      }}
    >
      {error && (
        <p style={{ color: '#f87171', fontSize: '0.75rem', margin: 0 }}>{error}</p>
      )}

      {/* Title */}
      <input
        id={`task-title-input-${columnId}`}
        type="text"
        placeholder="Task title *"
        required
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={adding}
        style={{
          backgroundColor: '#374151',
          border: '1px solid #4b5563',
          borderRadius: '6px',
          padding: '0.45rem 0.65rem',
          color: '#f9fafb',
          fontSize: '0.825rem',
          outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
        onBlur={(e)  => (e.currentTarget.style.borderColor = '#4b5563')}
      />

      {/* Priority select */}
      <select
        id={`task-priority-select-${columnId}`}
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        disabled={adding}
        style={{
          backgroundColor: '#374151',
          border: '1px solid #4b5563',
          borderRadius: '6px',
          padding: '0.45rem 0.65rem',
          color: '#f9fafb',
          fontSize: '0.825rem',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        <option value="low">🟢 Low</option>
        <option value="medium">🟡 Medium</option>
        <option value="high">🔴 High</option>
      </select>

      {/* Buttons row */}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button
          id={`submit-task-btn-${columnId}`}
          type="submit"
          disabled={adding || !title.trim()}
          style={{
            flex: 1,
            backgroundColor: adding || !title.trim() ? '#1d4ed8aa' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.45rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: adding || !title.trim() ? 'not-allowed' : 'pointer',
            opacity: adding ? 0.7 : 1,
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => { if (!adding && title.trim()) e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
          onMouseLeave={(e) => { if (!adding && title.trim()) e.currentTarget.style.backgroundColor = '#2563eb'; }}
        >
          {adding ? 'Adding…' : 'Add Task'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); setTitle(''); setPriority('medium'); }}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            padding: '0.45rem 0.65rem',
            color: '#9ca3af',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6b7280'; e.currentTarget.style.color = '#d1d5db'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#4b5563'; e.currentTarget.style.color = '#9ca3af'; }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

/* ─────────────────────────────────────────────
   KanbanColumn
───────────────────────────────────────────── */
const KanbanColumn = ({ column, tasks, boardId, onTaskAdded, onDeleteTask, deletingId }) => {
  const badgeStyle = COLUMN_BADGE_STYLES[column.color];
  const taskIds    = tasks.map((t) => t._id);

  // Register this column div as a droppable target with its column id
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      style={{
        backgroundColor: '#1f2937', // gray-800
        borderRadius: '14px',
        padding: '1rem',
        minWidth: '300px',
        width: '300px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        border: isOver ? '1px solid #3b82f6' : '1px solid #374151',
        animation: 'slideIn 0.3s ease',
        transition: 'border-color 0.15s ease',
      }}
    >
      {/* Column header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Colored dot */}
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: COLUMN_DOT_COLORS[column.color],
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <h3
            style={{
              color: '#e5e7eb',
              fontWeight: 700,
              fontSize: '0.9rem',
              margin: 0,
              letterSpacing: '0.01em',
            }}
          >
            {column.title}
          </h3>
        </div>
        {/* Task count badge */}
        <span
          style={{
            backgroundColor: badgeStyle.bg,
            color: badgeStyle.color,
            borderRadius: '999px',
            padding: '0.15rem 0.6rem',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Droppable task list — ref registered here so the whole area is a drop target */}
      <div
        id={column.id}
        ref={setNodeRef}
        style={{
          flexGrow: 1,
          minHeight: '200px',
        }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '1.5rem 0.5rem',
                color: isOver ? '#60a5fa' : '#4b5563',
                fontSize: '0.8rem',
                border: isOver ? '1px dashed #3b82f6' : '1px dashed #374151',
                borderRadius: '8px',
                transition: 'color 0.15s ease, border-color 0.15s ease',
              }}
            >
              {isOver ? 'Drop here' : 'No tasks yet'}
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task._id}
                task={task}
                onDelete={onDeleteTask}
                deletingId={deletingId}
              />
            ))
          )}
        </SortableContext>
      </div>

      {/* Add task form */}
      <AddTaskForm
        columnId={column.id}
        boardId={boardId}
        onTaskAdded={onTaskAdded}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────
   BoardPage — main component
───────────────────────────────────────────── */
const BoardPage = () => {
  const { id: boardId } = useParams();
  const navigate        = useNavigate();

  // ── State ──────────────────────────────────
  const [board,       setBoard]       = useState(null);
  const [tasks,       setTasks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [activeTask,  setActiveTask]  = useState(null); // for DragOverlay

  // ── Inject keyframes once ──────────────────
  useEffect(() => {
    const tag = document.createElement('style');
    tag.textContent = KEYFRAMES;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  // ── DnD sensors ───────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // prevents accidental drags on click
    })
  );

  // ── Fetch board + tasks ────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [boardRes, tasksRes] = await Promise.all([
        API.get(`/boards/${boardId}`),
        API.get(`/tasks/board/${boardId}`),
      ]);
      setBoard(boardRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      setFetchError(
        err.response?.data?.message || 'Failed to load board. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Refresh only tasks (used after add/delete) ──
  const refreshTasks = useCallback(async () => {
    try {
      const res = await API.get(`/tasks/board/${boardId}`);
      setTasks(res.data);
    } catch {
      // silent — full fetchData can be used for retry
    }
  }, [boardId]);

  // ── Delete task ────────────────────────────
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    setDeletingId(taskId);
    setDeleteError(null);
    try {
      await API.delete(`/tasks/${taskId}`);
      await refreshTasks();
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || 'Failed to delete task.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ── Drag & Drop handlers ───────────────────
  const handleDragStart = (event) => {
    const dragged = tasks.find((t) => t._id === event.active.id);
    setActiveTask(dragged || null);
  };

  const onDragEnd = async (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const validColumns = ['todo', 'inprogress', 'done'];

    // Resolve target column — over.id is either a column id or a task id
    let targetColumn = null;
    if (validColumns.includes(over.id)) {
      targetColumn = over.id;
    } else {
      // Dropped on another task — use that task's current column
      const overTask = tasks.find((t) => t._id === over.id);
      if (overTask) targetColumn = overTask.status;
    }

    if (!targetColumn) return;

    const draggedTask = tasks.find((t) => t._id === taskId);
    if (!draggedTask || draggedTask.status === targetColumn) return;

    // Optimistically update UI
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: targetColumn } : t))
    );

    // Persist to backend
    try {
      await API.put(`/tasks/${taskId}`, { status: targetColumn });
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: draggedTask.status } : t))
      );
    }
  };

  // ── Group tasks by column ──────────────────
  const tasksByColumn = (columnId) => tasks.filter((t) => t.status === columnId);

  // ── Render ─────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#111827', // gray-900
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Navbar ─────────────────────────── */}
      <nav
        style={{
          backgroundColor: '#1f2937',
          borderBottom: '1px solid #374151',
          padding: '0 1.5rem',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
        }}
      >
        {/* Left: back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            id="back-to-dashboard-btn"
            onClick={() => navigate('/')}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '0.35rem 0.65rem',
              fontSize: '1rem',
              lineHeight: 1,
              transition: 'border-color 0.2s ease, color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Back to Dashboard"
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#60a5fa'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.color = '#9ca3af'; }}
          >
            ←
          </button>

          <h1
            style={{
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.1rem',
              margin: 0,
              letterSpacing: '-0.01em',
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Loading…' : (board?.title ?? 'Board')}
          </h1>
        </div>

        {/* Right: description */}
        {!loading && board?.description && (
          <p
            style={{
              color: '#6b7280',
              fontSize: '0.825rem',
              margin: 0,
              maxWidth: '350px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {board.description}
          </p>
        )}
      </nav>

      {/* ── Delete error banner ────────────── */}
      {deleteError && (
        <div
          style={{
            backgroundColor: 'rgba(239,68,68,0.1)',
            borderBottom: '1px solid #ef4444',
            color: '#f87171',
            padding: '0.6rem 1.5rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Loading Spinner ────────────────── */}
      {loading && (
        <div
          style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 0.75s linear infinite',
            }}
          />
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Loading board…</p>
        </div>
      )}

      {/* ── Fetch Error ────────────────────── */}
      {!loading && fetchError && (
        <div
          style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid #ef4444',
              color: '#f87171',
              borderRadius: '10px',
              padding: '1.5rem 2rem',
              textAlign: 'center',
              maxWidth: '400px',
            }}
          >
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>{fetchError}</p>
            <button
              onClick={fetchData}
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
        </div>
      )}

      {/* ── Kanban Board ──────────────────── */}
      {!loading && !fetchError && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={onDragEnd}
        >
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              padding: '2rem',
              overflowX: 'auto',
              flexGrow: 1,
              alignItems: 'flex-start',
              // Custom scrollbar
              scrollbarWidth: 'thin',
              scrollbarColor: '#374151 transparent',
            }}
          >
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasksByColumn(column.id)}
                boardId={boardId}
                onTaskAdded={refreshTasks}
                onDeleteTask={handleDeleteTask}
                deletingId={deletingId}
              />
            ))}
          </div>

          {/* ── Drag Overlay (ghost card while dragging) ── */}
          <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                onDelete={() => {}}
                deletingId={null}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

export default BoardPage;
