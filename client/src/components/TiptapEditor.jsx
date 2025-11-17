// --- English Comments Only ---
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Image from '@tiptap/extension-image'; // For Requirement 4

// --- Toolbar Component (Includes Image Button) ---
const Toolbar = ({ editor, token }) => { 
  if (!editor) {
    return null;
  }
  const getButtonClass = (name, options = {}) => {
    return `p-2 rounded ${
      editor.isActive(name, options) 
        ? 'bg-purple-900 text-white' 
        : 'hover:bg-white/10'
    }`;
  };

  // --- Image Upload Logic ---
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('image', file); 

    // Hardcoded URL (as per our setup)
    const API_URL = 'http://localhost:8000/api'; 

    const tempUrl = URL.createObjectURL(file);
    editor.chain().focus().setImage({ src: tempUrl }).run();

    fetch(`${API_URL}/uploads/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
    .then(res => res.json())
    .then(data => {
      if (data.url) {
        // Replace temporary image with permanent one
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        editor.chain().focus().undo().run(); 
        console.error('File upload failed:', data.message);
      }
    })
    .catch(error => {
      editor.chain().focus().undo().run();
      console.error('Error uploading image:', error);
    });
  };

  // Helper to trigger the hidden file input
  const triggerFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleImageUpload;
    input.click();
  };

  return (
    <div className="p-2 bg-white/10 border-b border-white/20 rounded-t-xl flex flex-wrap gap-2">
      {/* --- Standard Buttons --- */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={getButtonClass('bold')}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={getButtonClass('italic')}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={getButtonClass('strike')}
      >
        Strike
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={getButtonClass('heading', { level: 1 })}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={getButtonClass('heading', { level: 2 })}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={getButtonClass('bulletList')}
      >
        Bullet List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={getButtonClass('orderedList')}
      >
        Numbered List
      </button>

      {/* --- Image Upload Button --- */}
      <button
        onClick={triggerFileInput}
        className={getButtonClass('image')}
      >
        Image
      </button>
    </div>
  );
};

// --- Main Collaborative Editor ---
const TiptapEditor = ({ ydoc, provider, onEditorReady, token }) => { 

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable history extension because Y.js handles history
        history: false,
      }),
      // --- Collaboration Extensions (for y-socket.io) ---
      Collaboration.configure({
        document: ydoc,     // Pass the entire Y.Doc
        field: 'content',   // This field name must match DocumentEditor's Y.XmlFragment
      }),
      CollaborationCursor.configure({
        provider: provider, // This is the SocketIOProvider
        user: {
          // Send user info for the cursor
          name: `User ${Math.floor(Math.random() * 100)}`,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        },
      }),
      // --- Image Upload Extension ---
      Image.configure({
        // Config options
      }),
    ],
    
    editorProps: {
      attributes: {
        // Use the 'prose' classes for styling
        class: 'prose prose-invert max-w-none p-4 focus:outline-none min-h-[50vh]',
      },
    },
  });

  // --- FIX for React Render Loop ---
  useEffect(() => {
    if (editor && onEditorReady) {
      // Use setTimeout to prevent React's "cannot update component while rendering" error
      setTimeout(() => {
        onEditorReady(editor);
      }, 0);
    }
    return () => {
      // Clean up the editor instance
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor, onEditorReady]);

  return (
    <div className="bg-slate-800 border border-white/20 rounded-xl">
      <Toolbar editor={editor} token={token} />
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
};

export default TiptapEditor;