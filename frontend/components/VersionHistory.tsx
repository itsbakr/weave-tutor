'use client';

import { useState, useEffect } from 'react';
import { Clock, FileText, User, Edit } from 'lucide-react';
import { strategyApi, lessonApi } from '@/lib/api';
import type { ContentVersion } from '@/lib/types';

type Version = ContentVersion;

interface VersionHistoryProps {
  contentType: 'strategy' | 'lesson';
  contentId: string;
}

export function VersionHistory({ contentType, contentId }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  useEffect(() => {
    const loadVersions = async () => {
      try {
        const api = contentType === 'strategy' ? strategyApi : lessonApi;
        const response = await api.getVersions(contentId);
        if (response.success) {
          setVersions(response.versions);
        }
      } catch (error) {
        console.error('Failed to load versions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVersions();
  }, [contentType, contentId]);

  if (loading) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <p className="text-center text-gray-500">Loading version history...</p>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <p className="text-center text-gray-500">No version history available</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-t-lg">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Version History
        </h3>
        <p className="text-sm text-indigo-100 mt-1">
          Track changes and learn from tutor edits
        </p>
      </div>

      {/* Version List */}
      <div className="divide-y divide-gray-200">
        {versions.map((version) => (
          <div
            key={version.version_number}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedVersion?.version_number === version.version_number ? 'bg-blue-50' : ''
            }`}
            onClick={() => setSelectedVersion(version)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Version {version.version_number}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      version.edit_type === 'ai_generated'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {version.edit_type === 'ai_generated' ? (
                      <>
                        <FileText className="w-3 h-3 mr-1" />
                        AI Generated
                      </>
                    ) : (
                      <>
                        <Edit className="w-3 h-3 mr-1" />
                        Manual Edit
                      </>
                    )}
                  </span>
                </div>

                {version.changes_summary && (
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    {version.changes_summary}
                  </p>
                )}

                {version.edit_notes && (
                  <div className="mt-2 p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
                    <p className="text-xs font-semibold text-amber-900 mb-1">
                      Why This Edit Was Made:
                    </p>
                    <p className="text-sm text-amber-800">{version.edit_notes}</p>
                    <p className="text-xs text-amber-600 mt-1">
                      💡 This feedback helps the AI improve future generations
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(version.created_at).toLocaleString()}
                  </span>
                  {version.edited_by && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Tutor ID: {version.edited_by.substring(0, 8)}...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Version Preview */}
      {selectedVersion && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-3">
            Version {selectedVersion.version_number} Content Preview
          </h4>
          <div className="bg-white p-4 rounded border border-gray-200 max-h-96 overflow-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(selectedVersion.content, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

