// --- English Comments Only ---
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
// --- FIX: Use relative path for component import ---
import LoadingSpinner from '../components/LoadingSpinner.jsx';

// --- FIX: Use hardcoded URL to avoid import.meta warnings ---
const API_URL = 'http://localhost:8000/api';

function WorkspaceView({ token, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- State for the Invite Modal ---
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState(''); // To show success/error
  const [isInviting, setIsInviting] = useState(false);
  // --- End of Invite State ---

  const { workspaceId } = useParams();
  const location = useLocation();
  const workspaceName = location.state?.workspaceName || 'Workspace';
  const navigate = useNavigate();

  // Fetch documents for this workspace (Unchanged)
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

  // Handle creating a new document (Unchanged)
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

  // --- Function to handle the invite submission ---
  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteMessage('');
    setError(null); // Clear main page error

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

      // Success!
      setInviteMessage(`Successfully invited ${inviteEmail}!`);
      setInviteEmail('');
      setIsInviting(false);
      // Automatically close modal after 2 seconds on success
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteMessage('');
      }, 2000);

    } catch (err) {
      setInviteMessage(err.message); // Show error message in the modal
      setIsInviting(false);
    }
  };
  // --- End of Invite Function ---

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
        {/* Left Side: Back button and Title (Unchanged) */}
        <div>
          <button
            onClick={() => navigate('/')} 
            className="text-sm text-purple-400 hover:text-purple-300 mb-2"
          >
            &larr; Back to Workspaces
          </button>
          <h1 className="text-4xl font-bold text-white truncate">{workspaceName}</h1>
        </div>
        
        {/* Right Side: Action Buttons (Updated) */}
        <div className="flex items-center gap-3">
          {/* --- 1. ADDED: Analytics Button --- */}
          <button
            onClick={() => navigate(`/workspace/${workspaceId}/analytics`)}
            className="group flex items-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-2xl font-semibold border border-purple-500 hover:bg-purple-500 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            View Analytics
          </button>
          {/* --- End of Added Code --- */}

          {/* --- 2. ADDED: Invite User Button --- */}
          <button
            onClick={() => {
              setShowInviteModal(true); 
              setError(null); // Clear main page error
              setInviteMessage('');
            }}
            className="group flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-2xl font-semibold border border-green-500 hover:bg-green-500 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Invite User
          </button>
          {/* --- End of Added Code --- */}

          <button
            onClick={onLogout}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ... (Create Document Form and Documents List are Unchanged) ... */}
      <form onSubmit={handleCreateDocument} className="flex gap-4 mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <input
            type="text"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            placeholder="New document title..."
            className="flex-1 p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all"
        >
            Create Document
        </button>
      </form>
      
      {error && <div className="text-red-400 mb-4">{error}</div>}
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {documents.length === 0 && (
            <p className="text-gray-300 text-center py-8">No documents here yet. Create one!</p>
          )}
          {documents.map(doc => (
            <div
              key={doc._id}
              onClick={() => navigate(`/document/${doc._id}`, { 
                state: { 
                  documentTitle: doc.title,
                  workspaceId: workspaceId,
                  workspaceName: workspaceName
                } 
              })}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 cursor-pointer flex justify-between items-center"
            >
              <h2 className="text-xl font-medium text-white truncate">{doc.title}</h2>
              <span className="text-gray-400 text-sm">
                Updated: {new Date(doc.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* --- 4. ADDED: Invite User Modal --- */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="glass-dark rounded-3xl p-8 border border-white/10 w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Invite Member</h2>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleInviteUser}>
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">User Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter user's email..."
                  className="w-full p-4 bg-black/30 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isInviting}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition-all disabled:opacity-50"
              >
                {isInviting ? 'Sending Invite...' : 'Send Invite'}
              </button>
            </form>
            
            {/* Check for inviteMessage */}
            {inviteMessage && (
              <p className={`mt-4 text-center text-sm ${inviteMessage.startsWith('Successfully') ? 'text-green-400' : 'text-red-400'}`}>
                {inviteMessage}
              </p>
            )}
          </div>
        </div>
      )}
      {/* --- End of Invite Modal --- */}
    </div>
  );
}

export default WorkspaceView;