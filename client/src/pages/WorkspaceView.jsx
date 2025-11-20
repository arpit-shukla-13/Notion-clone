import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const BASE_URL = import.meta.env.VITE_APP_API_URL;
const API_URL = `${BASE_URL}/api`;

function WorkspaceView({ token, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [activeHover, setActiveHover] = useState(null);

  const { workspaceId } = useParams();
  const location = useLocation();
  const workspaceName = location.state?.workspaceName || 'Workspace';
  const navigate = useNavigate();

  // Fetch documents for this workspace
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/documents/ws/${workspaceId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        if (!res.ok) throw new Error('Failed to fetch documents');
        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, [token, workspaceId]);

  // Handle creating a new document
  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (newDocTitle.trim() === '') return;
    try {
      const res = await fetch(`${API_URL}/documents`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newDocTitle, workspace: workspaceId }),
      });
      if (!res.ok) throw new Error('Failed to create document');
      const newDoc = await res.json();
      
      navigate(`/document/${newDoc._id}`, { 
        state: { 
          documentTitle: newDoc.title,
          workspaceId: workspaceId,
          workspaceName: workspaceName 
        } 
      });

    } catch (err) {
      setError(err.message);
    }
  };

  // Handle the invite submission
  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteMessage('');
    setError(null);

    try {
      const res = await fetch(`${API_URL}/workspaces/${workspaceId}/invite`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send invite.');
      }

      setInviteMessage(`Successfully invited ${inviteEmail}!`);
      setInviteEmail('');
      setIsInviting(false);
      
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteMessage('');
      }, 2000);

    } catch (err) {
      setInviteMessage(err.message);
      setIsInviting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
        
        {[...Array(20)].map((_, i) => (
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

      <div className="max-w-6xl mx-auto p-4 sm:p-8 relative z-10">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
          <div className="flex-1">
            <button
              onClick={() => navigate('/')} 
              className="group flex items-center gap-2 text-cyan-300 hover:text-cyan-200 mb-4 transition-all duration-300 hover:translate-x-1"
            >
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Workspaces
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-cyan-300">Workspace</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent animate-gradient">
              {workspaceName}
            </h1>
            <p className="text-gray-300 mt-2 text-lg">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'} in this workspace
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate(`/workspace/${workspaceId}/analytics`)}
              className="group flex items-center gap-3 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-semibold border border-white/20 hover:bg-white/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-cyan-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </button>

            <button
              onClick={() => {
                setShowInviteModal(true); 
                setError(null);
                setInviteMessage('');
              }}
              className="group flex items-center gap-3 bg-gradient-to-r from-green-600 to-cyan-600 text-white px-6 py-3 rounded-2xl font-semibold border border-green-400/50  transition-all duration-300 shadow-lg hover:shadow-green-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invite User
            </button>

            <button
              onClick={onLogout}
              className="group flex items-center gap-3 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-semibold border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <span>Logout</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-dark rounded-2xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Total Documents</p>
            <p className="text-2xl font-bold text-white">{documents.length}</p>
          </div>
          <div className="glass-dark rounded-2xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Recently Active</p>
            <p className="text-2xl font-bold text-white">
              {documents.filter(doc => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return new Date(doc.updatedAt) > oneWeekAgo;
              }).length}
            </p>
          </div>
          <div className="glass-dark rounded-2xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">This Month</p>
            <p className="text-2xl font-bold text-white">
              {documents.filter(doc => {
                const thisMonth = new Date();
                thisMonth.setDate(1);
                return new Date(doc.updatedAt) > thisMonth;
              }).length}
            </p>
          </div>
          <div className="glass-dark rounded-2xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-lg font-bold text-white">Active</p>
            </div>
          </div>
        </div>

        {/* Create Document Card */}
        <div className="glass-dark rounded-3xl p-8 mb-8 border border-white/10 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-pulse"></div>
              Create New Document
            </h2>
            
            <form onSubmit={handleCreateDocument} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-gray-300 text-sm mb-2 block font-medium">Document Title</label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Enter a title for your new document..."
                  className="w-full p-4 bg-black/30 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-md"
                />
              </div>
              <button
                type="submit"
                disabled={!newDocTitle.trim()}
                className="group relative bg-gradient-to-r from-cyan-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 overflow-hidden shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Document
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 backdrop-blur-md flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Documents List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="text-center py-16 glass-dark rounded-3xl border border-white/10">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/5 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No documents yet</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Create your first document to start collaborating with your team.
                </p>
              </div>
            ) : (
              documents.map((doc, index) => (
                <div
                  key={doc._id}
                  onMouseEnter={() => setActiveHover(doc._id)}
                  onMouseLeave={() => setActiveHover(null)}
                  onClick={() => navigate(`/document/${doc._id}`, { 
                    state: { 
                      documentTitle: doc.title,
                      workspaceId: workspaceId,
                      workspaceName: workspaceName
                    } 
                  })}
                  className="group relative glass-dark rounded-3xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Animated Gradient Border */}
                  <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r from-cyan-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-cyan-500/30 group-hover:via-purple-500/30 group-hover:to-pink-500/30 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                  
                  <div className="relative z-10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                          {doc.title}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          Last updated: {new Date(doc.updatedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                        Open
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 -left-full group-hover:left-full transition-all duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                  
                  {/* Active Indicator */}
                  {activeHover === doc._id && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Invite User Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="glass-dark rounded-3xl p-8 border border-white/10 w-full max-w-md relative overflow-hidden">
              {/* Modal Background */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500 rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Invite Team Member</h2>
                  <button 
                    onClick={() => setShowInviteModal(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleInviteUser}>
                  <div className="mb-6">
                    <label className="text-gray-300 text-sm mb-2 block font-medium">Email Address</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter team member's email..."
                      className="w-full p-4 bg-black/30 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 backdrop-blur-md"
                      required
                    />
                  </div>
                  <button
  type="submit"
  disabled={isInviting}
  className="w-full bg-gradient-to-r from-green-600 to-cyan-600 text-white px-8 py-4 rounded-2xl font-semibold disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 h-14"
>
  {isInviting ? (
    <div className="flex items-center justify-center gap-2">
      <div className="w-5 h-5">
        <LoadingSpinner size="small" />
      </div>
      <span>Sending Invite...</span>
    </div>
  ) : (
    <div className="flex items-center justify-center gap-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
      <span>Send Invite</span>
    </div>
  )}
</button>
                </form>
                
                {inviteMessage && (
                  <p className={`mt-4 text-center text-sm font-medium ${inviteMessage.startsWith('Successfully') ? 'text-green-400' : 'text-red-400'}`}>
                    {inviteMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkspaceView;