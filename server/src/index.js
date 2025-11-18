// --- English Comments Only ---
// Use CommonJS 'require' syntax
require('dotenv').config();
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); // <-- 1. IMPORTED jwt

// 1. Create the HTTP server
const httpServer = http.createServer(app);

// 2. Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'https://notion-clone-motion.netlify.app/'],
    methods: ['GET', 'POST'],
  },
});

// --- 3. ADDED: Socket.io Authentication Middleware ---
// This function runs for *every* new socket connection
io.use((socket, next) => {
  // Get the token from the client's handshake
  const token = socket.handshake.auth.token;

  if (!token) {
    // If no token, reject the connection
    return next(new Error('Authentication error: No token provided.'));
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Token is valid! Attach user ID to the socket object
    socket.userId = decoded.id; // 'id' is what we stored in 'generateToken'
    next(); // Continue to the 'connection' event

  } catch (err) {
    // If token is invalid or expired
    return next(new Error('Authentication error: Invalid token.'));
  }
});
// --- End of Added Code ---

// 4. Handle the connection *after* authentication
io.on('connection', (socket) => {
  // 'socket.userId' was attached by our middleware
  console.log(`New client connected: ${socket.id}, UserID: ${socket.userId}`);

  // --- 5. ADDED: Join personal notification room ---
  // The 'socket.userId' was attached by our middleware
  if (socket.userId) {
    socket.join(socket.userId);
    console.log(`Socket ${socket.id} joined personal room: ${socket.userId}`);
  }
  // --- End of Added Code ---

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// 6. Start the server
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`API Server (Express) running on port ${PORT}`);
});