// --- English Comments Only ---
require('dotenv').config();
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

// We use an async function to allow dynamic 'import()'
async function startServer() {
  const server = http.createServer(app);
  
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // --- Y-socket.io setup ---
  // We must dynamically import these ESM packages into our CJS server
  const { SocketIOProvider } = await import('y-socket.io');
  const { Doc } = await import('yjs');

  // Store active documents (this is a good approach)
  const documents = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // This is your custom logic for joining rooms
    socket.on('join-document', (documentId) => {
      console.log(`Client ${socket.id} joining document: ${documentId}`);
      socket.join(documentId);

      // Create document provider on the server if it doesn't exist
      if (!documents.has(documentId)) {
        const doc = new Doc();
        // This provider syncs the server-side doc with clients in the room
        const provider = new SocketIOProvider(io, documentId, doc, {
          autoConnect: true
        });
        documents.set(documentId, { doc, provider });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // We can add logic here to leave rooms if needed
    });
  });

  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => {
    console.log(`Server (with Y-socket.io) running on port ${PORT}`);
  });
}

// Start the server
startServer();