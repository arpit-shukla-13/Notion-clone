// --- English Comments Only ---
// Use CommonJS 'require' syntax
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js'); // Assuming db.js also uses module.exports

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

// Routes (Use require)
app.use('/api/auth', require('./routes/auth.routes.js'));
app.use('/api/workspaces', require('./routes/workspace.routes.js')); 
app.use('/api/documents', require('./routes/document.routes.js'));

// --- 1. ADDED: Register the new Analytics route (Requirement 5) ---
// We are NOT adding the file upload (Requirement 4) code yet.
app.use('/api/analytics', require('./routes/analytics.routes.js'));
// --- End of Added Code ---

// Use CommonJS 'module.exports'
module.exports = app;