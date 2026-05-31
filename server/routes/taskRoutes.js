// taskRoutes.js — Defines task CRUD API routes.
// All routes are protected by JWT auth middleware.

const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addComment,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Apply protect middleware to all routes
router.use(protect);

// Board-scoped task routes
router.route('/board/:boardId').get(getTasks).post(createTask);

// Individual task routes
router.route('/:id').put(updateTask).delete(deleteTask);

// Task comment route
router.post('/:id/comment', addComment);

module.exports = router;
