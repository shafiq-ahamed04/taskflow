// index.js — Entry point for the Express.js backend server.
// Initializes Express app, connects to MongoDB, applies middleware, and mounts API routes.

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 1. Load environment variables FIRST
dotenv.config();

// 2. Initialize Express app
const app = express();

// 3. Middleware (BEFORE routes)
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Routes (AFTER middleware)
const authRoutes   = require('./routes/authRoutes');
const boardRoutes  = require('./routes/boardRoutes');
const taskRoutes   = require('./routes/taskRoutes');
const habitRoutes  = require('./routes/habitRoutes');
const journalRoutes = require('./routes/journalRoutes');

app.use('/api/auth',    authRoutes);
app.use('/api/boards',  boardRoutes);
app.use('/api/tasks',   taskRoutes);
app.use('/api/habits',  habitRoutes);
app.use('/api/journal', journalRoutes);

// 5. Root Health Check
app.get('/', (req, res) => {
  res.json({ message: 'TaskFlow API Running' });
});

// 6. MongoDB Connection & Server Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => 
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
