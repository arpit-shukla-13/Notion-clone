import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '/src/components/LoadingSpinner';

const BASE_URL = import.meta.env.VITE_APP_API_URL; // http://localhost:8000
const API_URL = `${BASE_URL}/api`;

function Dashboard({ token, onLogout }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Floating Particles */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${20 + Math.random() * 15}s`,
              opacity: 0.3 + Math.random() * 0.4
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-8 relative z-10">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-cyan-300">Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent animate-gradient mb-3">
              Your Workspaces
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Create and manage collaborative spaces for real-time teamwork and document editing
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Connected</span>
            </div>
            <button
              onClick={onLogout}
              className="group flex items-center gap-3 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-medium border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-cyan-500/20"
            >
              <span>Logout</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-dark rounded-2xl p-5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Workspaces</p>
                <p className="text-3xl font-bold text-white mt-1">{workspaces.length}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="glass-dark rounded-2xl p-5 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Documents</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {workspaces.reduce((total, ws) => total + (ws.documents ? ws.documents.length : 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="glass-dark rounded-2xl p-5 border border-white/10 hover:border-pink-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Members</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {workspaces.length > 0 ? Math.max(...workspaces.map(ws => ws.members ? ws.members.length : 1)) : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Create Workspace Card */}
        <div className="glass-dark rounded-3xl p-8 mb-12 border border-white/10 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-pulse"></div>
              Create New Workspace
            </h2>
            
            <form onSubmit={handleCreateWorkspace} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-gray-300 text-sm mb-2 block font-medium">Workspace Name</label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Enter a name for your new workspace..."
                  className="w-full p-4 bg-black/30 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-md"
                  disabled={isCreating}
                />
              </div>
              <button
  type="submit"
  disabled={isCreating || !newWorkspaceName.trim()}
  className="group relative bg-gradient-to-r from-cyan-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 overflow-hidden shadow-lg min-h-[60px] flex items-center justify-center"
>
  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <span className="relative flex items-center justify-center gap-2 w-full">
    {isCreating ? (
      <div className="flex items-center justify-center gap-2">
        <div className="w-5 h-5">
          <LoadingSpinner size="small" />
        </div>
        <span>Creating...</span>
      </div>
    ) : (
      <div className="flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Create Workspace</span>
      </div>
    )}
  </span>
</button>
            </form>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 backdrop-blur-md flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
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
                onMouseEnter={() => setActiveHover(ws._id)}
                onMouseLeave={() => setActiveHover(null)}
                onClick={() => navigate(`/workspace/${ws._id}`, { state: { workspaceName: ws.name } })}
                className="group relative glass-dark rounded-3xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Animated Gradient Border */}
                <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r from-cyan-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-cyan-500/30 group-hover:via-purple-500/30 group-hover:to-pink-500/30 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
                
                {/* Workspace Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-cyan-400 transition-colors">
                      <span>{ws.documents ? ws.documents.length : 0} {ws.documents && ws.documents.length === 1 ? 'doc' : 'docs'}</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-white truncate mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                    {ws.name}
                  </h2>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    Collaborative workspace with real-time editing and team collaboration features.
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate max-w-[60%]">
                      Owner: {ws.owner && ws.owner.email ? ws.owner.email.split('@')[0] : 'N/A'}
                    </span>
                    <span className="group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                      Open <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 -left-full group-hover:left-full transition-all duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                
                {/* Active Indicator */}
                {activeHover === ws._id && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && workspaces.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10">
              <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">No workspaces yet</h3>
            <p className="text-gray-300 max-w-md mx-auto mb-8">
              Create your first workspace to start collaborating with your team in real-time.
            </p>
            <button 
              onClick={() => document.querySelector('input[type="text"]').focus()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Workspace
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm mt-12">
        <p>Collaborative Workspace Platform • v1.0</p>
      </footer>
    </div>
  );
}


export default Dashboard;