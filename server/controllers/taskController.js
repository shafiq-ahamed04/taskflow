// taskController.js — Handles CRUD operations for tasks within a board.
// Manages task creation, updates (status, priority, due date), deletion, and comment handling.

const Task = require('../models/Task');
const Board = require('../models/Board');

// ─── Create Task ────────────────────────────────────────────
// POST /api/tasks/board/:boardId
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, status } = req.body;
    const { boardId } = req.params;

    // Verify board exists
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      status,
      board: boardId,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Get Tasks by Board ─────────────────────────────────────
// GET /api/tasks/board/:boardId
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ board: req.params.boardId })
      .populate('assignee', 'name email')
      .populate('comments.author', 'name');

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Update Task ────────────────────────────────────────────
// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update fields if provided
    task.title = req.body.title || task.title;
    task.description = req.body.description ?? task.description;
    task.status = req.body.status || task.status;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate ?? task.dueDate;
    task.assignee = req.body.assignee ?? task.assignee;

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Delete Task ────────────────────────────────────────────
// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Add Comment ────────────────────────────────────────────
// POST /api/tasks/:id/comment
const addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({
      text: req.body.text,
      author: req.user._id,
    });

    const updatedTask = await task.save();

    // Populate author info before returning
    await updatedTask.populate('comments.author', 'name');

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, addComment };
