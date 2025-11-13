require('dotenv').config();
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

async function startServer() {
  const server = http.createServer(app);
  
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // Y-socket.io setup
  const { SocketIOProvider } = await import('y-socket.io');
  const { Doc } = await import('yjs');

  // Store active documents
  const documents = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join-document', (documentId) => {
      console.log(`Client ${socket.id} joining document: ${documentId}`);
      socket.join(documentId);

      // Create document if it doesn't exist
      if (!documents.has(documentId)) {
        const doc = new Doc();
        const provider = new SocketIOProvider(io, documentId, doc, {
          autoConnect: true
        });
        documents.set(documentId, { doc, provider });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => {
    console.log(`Server (with Y-socket.io) running on port ${PORT}`);
  });
}

startServer();