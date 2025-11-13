import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import TiptapEditor from '../components/TiptapEditor';

// FIXED: 'process.env' ko 'import.meta.env' kiya
const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:8000/api';

function DocumentEditor({ token }) {
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  
  // New states for collaborative editing
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(0);

  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Refs for Yjs
  const ydocRef = useRef(null);
  const providerRef = useRef(null);

  // Navigation state se metadata lein
  const documentTitle = location.state?.documentTitle || document?.title || 'Document';
  const workspaceId = location.state?.workspaceId || (document ? document.workspace : null);
  const workspaceName = location.state?.workspaceName || 'Workspace';

  // Initialize Collaborative Editing
  const initializeCollaborativeEditing = async () => {
    try {
      // Dynamic imports for Yjs
      const Y = await import('yjs');
      const { SocketIOProvider } = await import('y-socket.io');

      // Create Yjs document
      const ydoc = new Y.Doc();
      
      // Connect to collaborative server
      const provider = new SocketIOProvider(
        'http://localhost:8000',
        documentId, // Use documentId as room name
        ydoc,
        { autoConnect: true }
      );

      // Store references
      ydocRef.current = ydoc;
      providerRef.current = provider;

      // Get shared text
      const ytext = ydoc.getText('content');

      // Set initial content from database
      if (content) {
        ytext.delete(0, ytext.length);
        ytext.insert(0, content);
      }

      // Listen for changes from other users
      ytext.observe(event => {
        const newContent = ytext.toString();
        if (newContent !== content) {
          setContent(newContent);
          setSaveStatus('Real-time update');
          setTimeout(() => setSaveStatus(''), 1000);
        }
      });

      // Listen for connection events
      provider.on('sync', (isSynced) => {
        setIsCollaborative(isSynced);
      });

      provider.on('status', (event) => {
        console.log('Collaboration status:', event);
      });

      // Listen for awareness (connected users)
      provider.awareness.on('change', () => {
        const usersCount = Array.from(provider.awareness.getStates().keys()).length;
        setConnectedUsers(usersCount);
      });

      setIsCollaborative(true);

    } catch (error) {
      console.error('Failed to initialize collaborative editing:', error);
      setIsCollaborative(false);
    }
  };

  // Update content in Yjs when user types
  const updateCollaborativeContent = (newContent) => {
    if (ydocRef.current && isCollaborative) {
      const ytext = ydocRef.current.getText('content');
      
      // Calculate changes and update Yjs
      const currentContent = ytext.toString();
      
      // Simple approach: replace entire content
      // For better performance, you might want to calculate diffs
      if (newContent !== currentContent) {
        ytext.delete(0, ytext.length);
        ytext.insert(0, newContent);
      }
    }
  };

  // Page load par document content fetch karein
  useEffect(() => {
    const fetchDocument = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/documents/${documentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to fetch document');
        }
        const data = await res.json();
        setDocument(data);
        setContent(data.content || '');
        
        // Initialize collaborative editing after content is loaded
        await initializeCollaborativeEditing();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocument();
  }, [token, documentId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
      }
    };
  }, []);

  // Document Save karne ka function (Manual save for backup)
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveStatus('Saving to database...');
    try {
      const res = await fetch(`${API_URL}/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: content }),
      });
      if (!res.ok) {
         const errData = await res.json();
         throw new Error(errData.message || 'Failed to save document');
      }
      setSaveStatus('Saved to database');
    } catch (err) {
      setError(err.message);
      setSaveStatus('Save failed');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  // Handle content changes from TiptapEditor
  const handleContentChange = (newContent) => {
    setContent(newContent);
    setSaveStatus(''); // Type karte hi 'Saved' message hata dein
    
    // Update collaborative content
    updateCollaborativeContent(newContent);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
       <header className="p-4 sm:p-6 bg-white/5 backdrop-blur-md border-b border-white/20 flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate(`/workspace/${workspaceId}`, { state: { workspaceName: workspaceName } })}
            className="text-sm text-purple-400 hover:text-purple-300 mb-2 disabled:opacity-50"
            disabled={!workspaceId}
          >
            &larr; Back to {workspaceName}
          </button>
          <h1 className="text-2xl font-bold text-white truncate">{documentTitle}</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Collaboration Status */}
          {isCollaborative && (
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${connectedUsers > 1 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-gray-300">
                {connectedUsers > 1 ? `${connectedUsers - 1} others editing` : 'Only you'}
              </span>
            </div>
          )}
          
          <span className="text-gray-300">
            {saveStatus}
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="bg-purple-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-purple-600 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Backup'}
          </button>
        </div>
      </header>
      

      {/* Editor Area */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="flex-1 p-4 sm:p-8">
          {error && <div className="text-red-400 mb-4 text-center">{error}</div>}
          
          {/* Collaborative Status Info */}
          {isCollaborative && (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                ✅ Real-time collaboration enabled - Changes sync automatically with other users
              </p>
            </div>
          )}
          
          <TiptapEditor 
            content={content} 
            onChange={handleContentChange}
          />

        </div>
      )}
    </div>
  );
}

export default DocumentEditor;