// --- English Comments Only ---
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
// --- FIX: Use relative paths ---
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import TiptapEditor from '../components/TiptapEditor.jsx'; 
import * as Y from 'yjs';
import { SocketIOProvider } from 'y-socket.io';

// Use hardcoded URL to avoid import.meta warnings
const API_URL = 'http://localhost:8000/api';

function DocumentEditor({ token, onLogout }) {
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  
  // --- COLLABORATION STATES ---
  const [provider, setProvider] = useState(null);
  const [ydoc, setYdoc] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState(0);

  // --- State to hold the Tiptap editor instance ---
  const [editorInstance, setEditorInstance] = useState(null);
  
  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const documentTitle = location.state?.documentTitle || document?.title || 'Document';
  const workspaceId = location.state?.workspaceId || (document ? document.workspace : null);
  const workspaceName = location.state?.workspaceName || 'Workspace';

  // --- 1. INITIALIZE Y.JS & SocketIOProvider ---
  useEffect(() => {
    // This part is fine, it connects to your server
    const doc = new Y.Doc();
    const socketProvider = new SocketIOProvider(
      'http://localhost:8000', // Your server URL
      documentId, // The documentId acts as the room name
      doc,
      { autoConnect: true }
    );
    
    socketProvider.socket.emit('join-document', documentId);
    
    socketProvider.on('status', (event) => {
      setSaveStatus(event.status);
    });

    socketProvider.awareness.on('change', () => {
      setTimeout(() => {
        const usersCount = socketProvider.awareness.getStates().size;
        setConnectedUsers(usersCount);
      }, 0);
    });
    
    setYdoc(doc);
    setProvider(socketProvider);
    
    return () => {
      socketProvider.destroy();
      doc.destroy();
    };
  }, [documentId]);

  // --- 2. LOAD DATABASE CONTENT INTO Y.JS ---
  useEffect(() => {
    // This effect now waits for the editor instance to be ready
    if (!ydoc || !token || !provider || !editorInstance) {
      // If we don't have these, we are not ready to load content
      return;
    }

    // --- FIX: REMOVED THE 'provider.on('sync', ...)' WRAPPER ---
    // The 'sync' event was never firing because the server is not a real Y.js server.
    // We will now load the content immediately.
    
    const fetchDocument = async () => {
      try {
        const res = await fetch(`${API_URL}/documents/${documentId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to fetch document');
        }
        
        const data = await res.json();
        setDocument(data);

        // Tiptap's collaboration extension uses Y.XmlFragment
        const yFragment = ydoc.getXmlFragment('content');
        
        // Check if Y.js doc is empty AND we have content from DB
        if (yFragment.length === 0 && data.content) {
          
          // Use editor.commands.setContent
          // This correctly parses the HTML and updates Y.js
          editorInstance.commands.setContent(data.content, false);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false); // We are done loading
      }
    };
    
    fetchDocument();
    // --- END OF FIX ---

  }, [documentId, token, ydoc, provider, isLoading, editorInstance]); // Dependency on editorInstance is key

  // --- 3. MANUAL SAVE (BACKUP) ---
  const handleSave = async () => {
    if (!editorInstance) return; // Wait for editor

    setIsSaving(true);
    setError(null);
    setSaveStatus('Saving to database...');
    
    // Get the latest HTML content from the editor
    const currentContent = editorInstance.getHTML();
    
    try {
      const res = await fetch(`${API_URL}/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: currentContent }), // Send correct HTML
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
      setTimeout(() => setSaveStatus(provider?.status || ''), 2000);
    }
  };
  
  // --- RENDER ---
  return (
    <div className="min-h-screen flex flex-col">
       <header className="p-4 sm:p-6 bg-white/5 backdrop-blur-md border-b border-white/20 flex justify-between items-center">
        {/* Header is unchanged */}
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
          {provider && (
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${connectedUsers > 1 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-gray-300">
                {connectedUsers > 1 ? `${connectedUsers} users` : 'Only you'}
              </span>
            </div>
          )}
          
          <span className="text-gray-300">
            {saveStatus}
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading || !provider}
            className="bg-purple-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-purple-600 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Backup'}
          </button>
        </div>
      </header>

      {/* --- FIX: Updated loading logic --- */}
      {/* We show spinner *until* ydoc and provider are ready */}
      {(!ydoc || !provider) ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="flex-1 p-4 sm:p-8">
          {error && <div className="text-red-400 mb-4 text-center">{error}</div>}
          
          <TiptapEditor 
            documentId={documentId}
            ydoc={ydoc}
            provider={provider}
            onEditorReady={setEditorInstance} // Pass the setter
            token={token} // Pass token for image uploads
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50">
              <LoadingSpinner />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DocumentEditor;