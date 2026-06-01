// Habit.js — Mongoose schema for user habit tracking.
// Stores habit title, owning user, and array of completed dates ('YYYY-MM-DD').

const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Habit title is required'],
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  completedDates: [{ type: String }], // stored as 'YYYY-MM-DD'
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Habit', habitSchema);
