// src/app.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Body parser for JSON

// Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/workspaces', require('./routes/workspace.routes')); 
app.use('/api/documents', require('./routes/document.routes'));

module.exports = app;