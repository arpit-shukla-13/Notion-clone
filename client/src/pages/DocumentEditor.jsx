// --- English Comments Only ---
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import TiptapEditor from '../components/TiptapEditor.jsx'; 
// --- 1. Import Y.js and HocuspocusProvider ---
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:8000/api';

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
  const [editorInstance, setEditorInstance] = useState(null);
  
  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const documentTitle = location.state?.documentTitle || document?.title || 'Document';
  const workspaceId = location.state?.workspaceId || (document ? document.workspace : null);
  const workspaceName = location.state?.workspaceName || 'Workspace';

  // --- 2. INITIALIZE Y.JS & HocuspocusProvider ---
  useEffect(() => {
    const doc = new Y.Doc();
    
    // --- Use HocuspocusProvider instead of SocketIOProvider ---
    const hocuspocusProvider = new HocuspocusProvider({
      url: 'ws://localhost:1234', // WebSocket URL (matches new server port)
      name: documentId, // The documentId acts as the room name
      document: doc,
      token: token, // Send auth token (server can use this later)
    });
    
    hocuspocusProvider.on('status', (event) => {
      setSaveStatus(event.status);
    });

    // --- Fix for Render Loop ---
    hocuspocusProvider.on('awareness', (event) => {
      setTimeout(() => {
        const usersCount = hocuspocusProvider.awareness.getStates().size;
        setConnectedUsers(usersCount);
      }, 0);
    });
    
    setYdoc(doc);
    setProvider(hocuspocusProvider);
    
    // Cleanup on component unmount
    return () => {
      hocuspocusProvider.destroy();
      doc.destroy();
    };
  }, [documentId, token]); // Runs only when documentId/token changes

  // --- 3. LOAD DATABASE CONTENT ---
  useEffect(() => {
    if (!ydoc || !token || !provider || !editorInstance) {
      return; // Wait for all dependencies
    }

    // Hocuspocus uses 'synced', y-socket.io uses 'sync'
    const syncHandler = (isSynced) => {
      if (isSynced && isLoading) { 
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
            
            // Get the Y.js data type that Tiptap uses
            const yFragment = ydoc.getXmlFragment('content');
            
            // Check if Y.js doc is empty AND we have content from DB
            if (yFragment.length === 0 && data.content) {
              // Use editor.commands.setContent
              editorInstance.commands.setContent(data.content, false);
            }
            
          } catch (err) {
            setError(err.message);
          } finally {
            setIsLoading(false); // We are done loading
          }
        };
        fetchDocument();
      }
    };

    provider.on('synced', syncHandler); // Listen for 'synced'

    return () => {
      provider.off('synced', syncHandler);
    };

  }, [documentId, token, ydoc, provider, isLoading, editorInstance]);

  // --- 4. MANUAL SAVE (BACKUP) (Unchanged) ---
  const handleSave = async () => {
    if (!editorInstance) return; 
    setIsSaving(true);
    setError(null);
    setSaveStatus('Saving to database...');
    const currentContent = editorInstance.getHTML();
    try {
      const res = await fetch(`${API_URL}/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: currentContent }), 
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

      {/* --- Updated loading logic --- */}
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