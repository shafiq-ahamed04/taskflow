// boardController.js — Handles CRUD operations for boards.
// Creates, reads, updates, and deletes boards owned by the authenticated user.

const Board = require('../models/Board');
const Task = require('../models/Task');

// ─── Create Board ───────────────────────────────────────────
// POST /api/boards
const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;

    const board = await Board.create({
      title,
      description,
      owner: req.user._id,
    });

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Get All Boards ─────────────────────────────────────────
// GET /api/boards
const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id },
      ],
    });

    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Get Single Board ───────────────────────────────────────
// GET /api/boards/:id
const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    res.status(200).json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Update Board ───────────────────────────────────────────
// PUT /api/boards/:id
const updateBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Only the owner can update
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    board.title = req.body.title || board.title;
    board.description = req.body.description ?? board.description;

    const updatedBoard = await board.save();
    res.status(200).json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Delete Board ───────────────────────────────────────────
// DELETE /api/boards/:id
const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Only the owner can delete
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all tasks belonging to this board
    await Task.deleteMany({ board: board._id });

    // Delete the board
    await board.deleteOne();

    res.status(200).json({ message: 'Board deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createBoard, getBoards, getBoard, updateBoard, deleteBoard };
