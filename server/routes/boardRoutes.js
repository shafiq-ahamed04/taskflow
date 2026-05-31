// boardRoutes.js — Defines board CRUD API routes.
// All routes are protected by JWT auth middleware.

const express = require('express');
const router = express.Router();
const {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
} = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');

// Apply protect middleware to all routes
router.use(protect);

router.route('/').get(getBoards).post(createBoard);
router.route('/:id').get(getBoard).put(updateBoard).delete(deleteBoard);

module.exports = router;
