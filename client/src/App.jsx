import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkspaceView from './pages/WorkspaceView';
import DocumentEditor from './pages/DocumentEditor';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleSetToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setToken(newToken);
  };

  const isAuthReady = true;
  if (!isAuthReady) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 font-inter text-white relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Animated Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-bounce-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-ping-slow"></div>
        
        {/* Additional Floating Elements */}
        <div className="absolute top-20 left-20 w-10 h-10 bg-cyan-400/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-32 right-32 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-emerald-400/25 rounded-full blur-lg animate-float-slow"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      </div>

      {/* Animated Border Glow */}
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

        {/* Protected Routes */}
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
        
        {/* Fallback for any other route */}
        <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;