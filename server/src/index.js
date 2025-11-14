// --- English Comments Only ---
// Use CommonJS 'require' syntax
require('dotenv').config();
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

// --- 1. Import Hocuspocus Server ---
const { Server: HocuspocusServer } = require('@hocuspocus/server');

// --- 2. Create the HTTP server ---
const httpServer = http.createServer(app);

// --- 3. Create the Hocuspocus Server Instance ---
// We use 'new' because it's a class
const hocuspocusServer = new HocuspocusServer({
  port: 1234, // Hocuspocus will run on a separate port
  // We will add authentication and database logic here later
});

// --- 4. Start the Hocuspocus Server ---
hocuspocusServer.listen();


// --- 5. Create Socket.IO server (for notifications) ---
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // Your client URL
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('New client connected (for notifications):', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// --- 6. Start the Express API server ---
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`API Server (Express) running on port ${PORT}`);
  console.log(`Collab Server (Hocuspocus) running on port 1234`);
});