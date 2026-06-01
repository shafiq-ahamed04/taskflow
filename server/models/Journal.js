// Journal.js — Mongoose schema for user journal entries.
// Each entry belongs to a user, has a title, content, and a date string ('YYYY-MM-DD').

const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Journal title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Journal content is required'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: [true, 'Journal date is required'], // 'YYYY-MM-DD'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Journal', journalSchema);
