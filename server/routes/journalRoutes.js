// journalRoutes.js — Express router for journal entry endpoints.
// All routes are protected via the 'protect' auth middleware.

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getEntries,
  createEntry,
  deleteEntry,
} = require('../controllers/journalController');

// GET    /api/journal        — fetch all journal entries for the current user
router.get('/', protect, getEntries);

// POST   /api/journal        — create a new journal entry { title, content, date }
router.post('/', protect, createEntry);

// DELETE /api/journal/:id    — delete a journal entry by ID
router.delete('/:id', protect, deleteEntry);

module.exports = router;
