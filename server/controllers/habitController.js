// habitController.js — Controller logic for Habit CRUD and completion toggling.

const Habit = require('../models/Habit');

// GET /api/habits — return all habits belonging to the authenticated user
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching habits', error: err.message });
  }
};

// POST /api/habits — create a new habit { title }
const createHabit = async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Habit title is required' });
  }
  try {
    const habit = await Habit.create({ title: title.trim(), user: req.user._id });
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating habit', error: err.message });
  }
};

// DELETE /api/habits/:id — delete a habit (must belong to authenticated user)
const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this habit' });
    }
    await habit.deleteOne();
    res.json({ message: 'Habit deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting habit', error: err.message });
  }
};

// POST /api/habits/:id/complete — toggle today's date in completedDates array
const toggleComplete = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Today's date as 'YYYY-MM-DD' in UTC
    const today = new Date().toISOString().split('T')[0];

    const alreadyCompleted = habit.completedDates.includes(today);
    if (alreadyCompleted) {
      // Remove today — un-complete
      habit.completedDates = habit.completedDates.filter(d => d !== today);
    } else {
      // Add today — mark complete
      habit.completedDates.push(today);
    }

    await habit.save();
    res.json({
      habit,
      toggled: alreadyCompleted ? 'uncompleted' : 'completed',
      date: today,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error toggling habit', error: err.message });
  }
};

module.exports = { getHabits, createHabit, deleteHabit, toggleComplete };
