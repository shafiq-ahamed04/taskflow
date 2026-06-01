// habitController.js — Controller logic for Habit CRUD and completion toggling with Kanban synchronization.

const Habit = require('../models/Habit');
const Board = require('../models/Board');
const Task = require('../models/Task');

// GET /api/habits — return all habits belonging to the authenticated user
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching habits', error: err.message });
  }
};

// POST /api/habits — create a new habit & auto-create synchronization task under "Daily Habits" board
const createHabit = async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Habit title is required' });
  }
  try {
    // 1. Find or create the special "Daily Habits" board for the user
    let board = await Board.findOne({ owner: req.user._id, title: 'Daily Habits' });
    if (!board) {
      board = await Board.create({
        title: 'Daily Habits',
        description: 'Auto-synchronized daily routine and habit tracking column.',
        owner: req.user._id
      });
    }

    // 2. Create the linked Task in the Kanban board (defaults to 'todo')
    const task = await Task.create({
      title: title.trim(),
      description: 'Auto-generated sync task for habit tracker.',
      status: 'todo',
      priority: 'medium',
      board: board._id
    });

    // 3. Create the Habit record pointing to the board and task
    const habit = await Habit.create({
      title: title.trim(),
      user: req.user._id,
      board: board._id,
      task: task._id
    });

    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating habit', error: err.message });
  }
};

// DELETE /api/habits/:id — delete a habit & its linked synchronization task
const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this habit' });
    }

    // Delete linked task if it exists
    if (habit.task) {
      await Task.deleteOne({ _id: habit.task });
    }

    await habit.deleteOne();
    res.json({ message: 'Habit and synchronization task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting habit', error: err.message });
  }
};

// POST /api/habits/:id/complete — toggle today's date and auto-update the Kanban task's status
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
      
      // Sync Task -> 'todo'
      if (habit.task) {
        await Task.findByIdAndUpdate(habit.task, { status: 'todo' });
      }
    } else {
      // Add today — mark complete
      habit.completedDates.push(today);

      // Sync Task -> 'done'
      if (habit.task) {
        await Task.findByIdAndUpdate(habit.task, { status: 'done' });
      }
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
