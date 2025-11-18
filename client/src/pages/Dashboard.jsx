import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '/src/components/LoadingSpinner';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:8000/api';

function Dashboard({ token, onLogout }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const navigate = useNavigate();

  // Fetch workspaces on load
  useEffect(() => {
    const fetchWorkspaces = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/workspaces`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        if (!res.ok) throw new Error('Failed to fetch workspaces');
        const data = await res.json();
        setWorkspaces(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkspaces();
  }, [token]);

  // Handle creating a new workspace
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (newWorkspaceName.trim() === '') return;
    
    setIsCreating(true);
    try {
      const res = await fetch(`${API_URL}/workspaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newWorkspaceName }),
      });
      if (!res.ok) throw new Error('Failed to create workspace');
      const newWorkspace = await res.json();
      setWorkspaces([newWorkspace, ...workspaces]);
      setNewWorkspaceName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 relative">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
            Your Workspaces
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Collaborate in real-time with your team
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Connected</span>
          </div>
          <button
            onClick={onLogout}
            className="group flex items-center gap-3 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-semibold border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/20"
          >
            <span>Logout</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Create Workspace Card */}
      <div className="glass-dark rounded-3xl p-8 mb-12 border border-white/10 hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          Create New Workspace
        </h2>
        
        <form onSubmit={handleCreateWorkspace} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-gray-400 text-sm mb-2 block">Workspace Name</label>
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Enter workspace name..."
              className="w-full p-4 bg-black/30 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              disabled={isCreating}
            />
          </div>
          <button
            type="submit"
            disabled={isCreating || !newWorkspaceName.trim()}
            className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2">
              {isCreating ? (
                <>
                  <LoadingSpinner size="small" />
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Workspace
                </>
              )}
            </span>
          </button>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Workspaces Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {workspaces.map((ws, index) => (
            <div
              key={ws._id}
              onClick={() => navigate(`/workspace/${ws._id}`, { state: { workspaceName: ws.name } })}
              className="group relative glass-dark rounded-3xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
              
              {/* Workspace Icon */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-purple-400 transition-colors">
                    <span>{ws.documents ? ws.documents.length : 0} docs</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white truncate mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
                  {ws.name}
                </h2>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  Collaborative workspace with real-time editing
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Owner: {ws.owner && ws.owner.email ? ws.owner.email.split('@')[0] : 'N/A'}
                  </span>
                  <span className="group-hover:text-purple-400 transition-colors">
                    Click to open →
                  </span>
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 -left-full group-hover:left-full transition-all duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && workspaces.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-3xl flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No workspaces yet</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Create your first workspace to start collaborating with your team in real-time.
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;