// --- English Comments Only ---
import React, { useState, useEffect } from 'react'; 
import { Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client'; 

// --- FIX: Use absolute paths starting from /src/ ---
import ProtectedRoute from '/src/components/ProtectedRoute.jsx';
import Register from '/src/pages/Register.jsx';
import Login from '/src/pages/Login.jsx';
import Dashboard from '/src/pages/Dashboard.jsx';
import WorkspaceView from '/src/pages/WorkspaceView.jsx';
import DocumentEditor from '/src/pages/DocumentEditor.jsx';
import LoadingSpinner from '/src/components/LoadingSpinner.jsx';
import AnalyticsView from '/src/pages/AnalyticsView.jsx';

// --- IMPORT our new SocketContext (Absolute Path) ---
import { SocketContext } from '/src/context/SocketContext.jsx';

// Socket.IO Server URL (Port 8000, not 1234)
const SOCKET_URL = import.meta.env.VITE_APP_API_URL;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  // --- State to hold the socket instance ---
  const [socket, setSocket] = useState(null);

  const handleSetToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setToken(newToken);
  };

  // --- useEffect to manage Socket.IO connection ---
  useEffect(() => {
    // This effect runs whenever the 'token' state changes
    
    if (token) {
      // If we have a token (user is logged in)
      // Create a new socket connection
      const newSocket = io(SOCKET_URL, {
        // Send the token in the 'auth' handshake
        // This is what our server's io.use() middleware expects
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket.IO connected:', newSocket.id);
      });

      newSocket.on('connect_error', (err) => {
        // This will fire if the token is invalid or expired
        console.error('Socket.IO connection error:', err.message);
        // If auth fails, log the user out
        if (err.message === 'Authentication error: Invalid token.') {
          handleSetToken(null); 
        }
      });
      
      setSocket(newSocket);

      // Cleanup function:
      // This runs when token changes (logout) or component unmounts
      return () => {
        console.log('Socket.IO disconnecting...');
        newSocket.disconnect();
      };

    } else {
      // If there is no token (user logged out)
      if (socket) {
        // Disconnect any existing socket
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [token]); // The dependency array ensures this runs when 'token' changes

  const isAuthReady = true;
  if (!isAuthReady) {
    return <LoadingSpinner />;
  }

  return (
    // --- Provide the socket to the entire app ---
    <SocketContext.Provider value={socket}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 font-inter text-white relative overflow-hidden">
        {/* ... (Animated background elements remain unchanged) ... */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-bounce-slow"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-ping-slow"></div>
          <div className="absolute top-20 left-20 w-10 h-10 bg-cyan-400/30 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-32 right-32 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-float-delayed"></div>
          <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-emerald-400/25 rounded-full blur-lg animate-float-slow"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
        </div>
        <div className="fixed inset-0 border-2 border-purple-500/10 rounded-none pointer-events-none -z-5 animate-border-glow"></div>

        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!token ? <Login setToken={handleSetToken} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!token ? <Register setToken={handleSetToken} /> : <Navigate to="/" />} 
          />

          {/* Protected Routes (Unchanged) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute token={token}>
                <Dashboard token={token} onLogout={() => handleSetToken(null)} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workspace/:workspaceId" 
            element={
              <ProtectedRoute token={token}>
                <WorkspaceView token={token} onLogout={() => handleSetToken(null)} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/document/:documentId" 
            element={
              <ProtectedRoute token={token}>
                <DocumentEditor token={token} onLogout={() => handleSetToken(null)} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workspace/:workspaceId/analytics" 
            element={
              <ProtectedRoute token={token}>
                <AnalyticsView token={token} onLogout={() => handleSetToken(null)} />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback (Unchanged) */}
          <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
        </Routes>
      </div>
    </SocketContext.Provider>
  );
}

export default App;