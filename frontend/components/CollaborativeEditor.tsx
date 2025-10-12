'use client';

import { useState } from 'react';
import { Save, Clock, Edit3 } from 'lucide-react';
import { strategyApi, lessonApi } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

interface CollaborativeEditorProps {
  contentType: 'strategy' | 'lesson';
  contentId: string;
  initialContent: string;
  tutorId: string;
  onSaved?: () => void;
}

export function CollaborativeEditor({
  contentType,
  contentId,
  initialContent,
  tutorId,
  onSaved,
}: CollaborativeEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editNotes.trim()) {
      alert('Please explain why you made these changes (helps the AI learn!)');
      return;
    }

    setSaving(true);
    try {
      const api = contentType === 'strategy' ? strategyApi : lessonApi;
      await api.saveVersion({
        content_type: contentType,
        content_id: contentId,
        content: { content, format: 'markdown' },
        changes_summary: `Tutor edited ${contentType}`,
        edit_notes: editNotes,
        tutor_id: tutorId,
      });

      alert('✅ Saved successfully! Your edits will help the AI improve future generations.');
      setIsEditing(false);
      setEditNotes('');
      if (onSaved) onSaved();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2.5 rounded-xl">
            <Edit3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Collaborative Editor</h3>
            <p className="text-sm text-gray-500">Google Doc-like editing with version history</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-colors ${
            isEditing
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isEditing ? 'Cancel' : 'Edit Content'}
        </button>
      </div>

      {/* Content Area */}
      {isEditing ? (
        <div className="space-y-4">
          {/* Markdown Editor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Edit Markdown Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[400px] px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-mono text-sm transition-colors resize-none"
              placeholder="Edit your content here..."
            />
          </div>

          {/* Edit Notes - CRITICAL for Learning! */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
            <label className="block text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Why are you making these changes? (Helps AI improve!)
            </label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full h-24 px-4 py-3 border-2 border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 bg-white transition-colors resize-none"
              placeholder="e.g., 'Student needs more visual examples' or 'Content was too theoretical, added practical activities'"
              required
            />
            <p className="text-xs text-amber-700 mt-2">
              ⚠️ This feedback is crucial! It helps the AI understand what to improve in future generations.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !editNotes.trim()}
              className="flex-1 px-6 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              {saving ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
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
        </div>
      ) : (
        /* Preview Mode */
        <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

