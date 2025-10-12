'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2,
  Undo,
  Redo,
  Save
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface RichTextEditorProps {
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  editNotes: string;
  onEditNotesChange: (notes: string) => void;
  saving: boolean;
}

export function RichTextEditor({ 
  initialContent, 
  onSave, 
  editNotes, 
  onEditNotesChange, 
  saving 
}: RichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [hasContentChanged, setHasContentChanged] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editable: isEditing,
    immediatelyRender: false,  // Fix SSR hydration mismatch
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-6',
      },
    },
    onUpdate: ({ editor }) => {
      // Track if content has changed from initial
      const currentContent = editor.getHTML();
      setHasContentChanged(currentContent !== initialContent);
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [isEditing, editor]);

  const handleSave = async () => {
    if (!editor) return;
    
    // Validate that content has changed
    if (!hasContentChanged) {
      alert('⚠️ No changes detected. Please make some edits before saving.');
      return;
    }
    
    // Validate that edit notes are provided
    if (!editNotes.trim()) {
      alert('⚠️ Please explain why you made these changes. This helps the AI learn and improve!');
      return;
    }
    
    const content = editor.getHTML();
    await onSave(content);
    setIsEditing(false);
    setHasContentChanged(false);
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2.5 rounded-xl">
            <span className="text-white text-xl">📝</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Collaborative Canvas</h3>
            <p className="text-sm text-gray-500">Google Doc-like editing with version history</p>
          </div>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            ✏️ Edit Content
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            ❌ Cancel
          </button>
        )}
      </div>

      {/* Toolbar (only show when editing) */}
      {isEditing && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border-2 border-gray-200 mb-4 flex-wrap">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('bold') ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-100'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('italic') ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-100'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-100'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-100'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('bulletList') ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-100'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('orderedList') ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-100'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Content */}
      <div className={`bg-white rounded-2xl border-2 ${isEditing ? 'border-purple-300' : 'border-gray-100'} transition-colors`}>
        <EditorContent editor={editor} />
      </div>

      {/* Edit Notes (only show when editing) */}
      {isEditing && (
        <div className="mt-6 space-y-4">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
            <label className="block text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Why are you making these changes? (Helps AI improve!)
            </label>
            <textarea
              value={editNotes}
              onChange={(e) => onEditNotesChange(e.target.value)}
              className="w-full h-24 px-4 py-3 border-2 border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 bg-white transition-colors resize-none"
              placeholder="e.g., 'Student needs more visual examples' or 'Content was too theoretical, added practical activities'"
              required
            />
            <p className="text-xs text-amber-700 mt-2">
              ⚠️ This feedback is crucial! It helps the AI understand what to improve in future generations.
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !hasContentChanged || !editNotes.trim()}
            className="w-full px-6 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            title={
              !hasContentChanged 
                ? 'Make some changes first' 
                : !editNotes.trim() 
                ? 'Add edit notes to explain your changes' 
                : 'Save your changes'
            }
          >
            {saving ? (
              <>
                <Undo className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes (Creates New Version)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

