import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

// FIXED: 'process.env' ko 'import.meta.env' kiya
const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:8000/api';

function WorkspaceView({ token, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { workspaceId } = useParams();
  const location = useLocation();
  const workspaceName = location.state?.workspaceName || 'Workspace';
  const navigate = useNavigate();

  // Fetch documents for this workspace
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        // FIXED: API Route ko humare banaye hue route se match kiya
        const res = await fetch(`${API_URL}/documents/ws/${workspaceId}`, {
          headers: {
            // FIXED: 'x-auth-token' ko 'Authorization' kiya
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
      const res = await fetch(`${API_URL}/documents`, { // Yeh route (POST /api/documents) humne banaya tha, yeh sahi hai
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // FIXED: 'x-auth-token' ko 'Authorization' kiya
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

  // ----- YAHAN SE POORA UI ADD KIYA GAYA HAI -----
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      <header className="flex justify-between items-center mb-12">
        <div>
          <button
            onClick={() => navigate('/')} // Navigate to Dashboard
            className="text-sm text-purple-400 hover:text-purple-300 mb-2"
          >
            &larr; Back to Workspaces
          </button>
          <h1 className="text-4xl font-bold text-white truncate">{workspaceName}</h1>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition-all"
        >
          Logout
        </button>
      </header>

      {/* Create Document Form */}
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

      {/* Documents List */}
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
              // Navigate to the document editor page
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
    </div>
  );
}

export default WorkspaceView;