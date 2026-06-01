// habitRoutes.js — Express router for habit tracking endpoints.
// All routes are protected via the 'protect' auth middleware.

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getHabits,
  createHabit,
  deleteHabit,
  toggleComplete,
} = require('../controllers/habitController');

// GET    /api/habits          — fetch all habits for the current user
router.get('/', protect, getHabits);

// POST   /api/habits          — create a new habit { title }
router.post('/', protect, createHabit);

// DELETE /api/habits/:id      — delete a habit by ID
router.delete('/:id', protect, deleteHabit);

// POST   /api/habits/:id/complete — toggle today's completion for a habit
router.post('/:id/complete', protect, toggleComplete);

module.exports = router;
