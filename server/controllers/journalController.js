// journalController.js — Controller logic for Journal entry CRUD.

const Journal = require('../models/Journal');

// GET /api/journal — return all journal entries for the authenticated user, newest first
const getEntries = async (req, res) => {
  try {
    const entries = await Journal.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching journal entries', error: err.message });
  }
};

// POST /api/journal — create a new journal entry { title, content, date }
const createEntry = async (req, res) => {
  const { title, content, date } = req.body;

  if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required' });
  if (!content || !content.trim()) return res.status(400).json({ message: 'Content is required' });
  if (!date) return res.status(400).json({ message: 'Date is required (YYYY-MM-DD)' });

  // Basic date format validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
  }

  try {
    const entry = await Journal.create({
      title: title.trim(),
      content: content.trim(),
      date,
      user: req.user._id,
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating journal entry', error: err.message });
  }
};

// DELETE /api/journal/:id — delete a journal entry (must belong to authenticated user)
const deleteEntry = async (req, res) => {
  try {
    const entry = await Journal.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Journal entry not found' });
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }
    await entry.deleteOne();
    res.json({ message: 'Journal entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting journal entry', error: err.message });
  }
};

module.exports = { getEntries, createEntry, deleteEntry };
