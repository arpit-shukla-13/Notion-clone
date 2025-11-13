import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Yeh humara Toolbar hai
const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  // Helper function for button styling
  const getButtonClass = (name, options = {}) => {
    return `p-2 rounded ${
      editor.isActive(name, options) 
        ? 'bg-purple-900 text-white' 
        : 'hover:bg-white/10'
    }`;
  };

  return (
    <div className="p-2 bg-white/10 border-b border-white/20 rounded-t-xl flex flex-wrap gap-2">
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

// Yeh humara main Editor Component hai
const TiptapEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Aap yahan extensions ko disable ya configure kar sakte hain
        // e.g., heading: { levels: [1, 2, 3] }
      }),
    ],
    content: content, // Initial content jo database se aaya
    
    // Jab user type kare, toh yeh function call hoga
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // Content ko HTML string ke roop mein bhej rahe hain
    },
    
    // Editor ko styles dene ke liye
    editorProps: {
      attributes: {
        // Tailwind 'prose' classes styling apply karengi
        class: 'prose prose-invert max-w-none p-4 focus:outline-none min-h-[50vh]',
      },
    },
  });

  return (
    <div className="bg-white/5 border border-white/20 rounded-xl">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
};

export default TiptapEditor;