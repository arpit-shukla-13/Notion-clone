// --- English Comments Only ---
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
// --- 1. Import Collaboration Extensions ---
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';

// Toolbar Component (Unchanged)
const Toolbar = ({ editor }) => {
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

  return (
    <div className="p-2 bg-white/10 border-b border-white/20 rounded-t-xl flex flex-wrap gap-2">
      {/* ... (All buttons: Bold, Italic, Strike, H1, H2, Lists) ... */}
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
    </div>
  );
};

// --- This is now the COLLABORATIVE editor ---
// It expects a ydoc and provider
const TiptapEditor = ({ ydoc, provider, onEditorReady }) => {

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable history extension because Y.js handles history
        history: false,
      }),
      // --- 2. Add Collaboration Extensions ---
      Collaboration.configure({
        document: ydoc, // Pass the Y.Doc
        field: 'content', // Specify the field name
      }),
      CollaborationCursor.configure({
        provider: provider, // Pass the HocuspocusProvider
        user: {
          name: `User ${Math.floor(Math.random() * 100)}`,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none p-4 focus:outline-none min-h-[50vh]',
      },
    },
  });

  // --- Fix for React Render Loop ---
  useEffect(() => {
    if (editor && onEditorReady) {
      setTimeout(() => {
        onEditorReady(editor);
      }, 0);
    }
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor, onEditorReady]);


  return (
    <div className="bg-slate-800 border border-white/20 rounded-xl">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
};

export default TiptapEditor;