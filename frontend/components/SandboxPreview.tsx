'use client';

import { ExternalLink, Globe } from 'lucide-react';

interface SandboxPreviewProps {
  code: string;
  sandboxUrl?: string;
  status?: string;
  attempts?: number;
}

export function SandboxPreview({ code, sandboxUrl, status, attempts }: SandboxPreviewProps) {
  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-gray-900">Interactive Activity</h2>
        {sandboxUrl && (
          <a
            href={sandboxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Window
          </a>
        )}
      </div>

      {/* Status Info */}
      {status && (
        <div
          className={`p-4 rounded-lg ${
            status === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              {status === 'success' ? '✅ Deployed Successfully' : '❌ Deployment Failed'}
            </span>
            {attempts && attempts > 1 && (
              <span className="text-sm text-gray-600">
                {attempts} attempt{attempts > 1 ? 's' : ''} (auto-fixed!)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Sandbox Preview - Full Width */}
      {sandboxUrl ? (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg" style={{ height: '80vh', minHeight: '600px' }}>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
            <Globe className="w-6 h-6 text-white" />
            <span className="text-base font-semibold text-white">Live Activity Preview</span>
            <a
              href={sandboxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-sm bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
            >
              Open Fullscreen
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="h-full bg-gray-50">
            <iframe
              src={sandboxUrl}
              className="w-full h-full border-0"
              title="Activity Sandbox"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        </div>
      ) : code ? (
        <div className="text-center py-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200" style={{ minHeight: '500px' }}>
          <Globe className="w-20 h-20 mx-auto text-blue-400 mb-6 animate-pulse" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Deploying to Daytona Sandbox...
          </h3>
          <p className="text-gray-600 mb-6 text-lg">
            Creating secure environment for your activity
          </p>
          <div className="text-base text-gray-500 bg-white px-6 py-3 rounded-lg shadow-sm inline-block">
            ⏱️ This may take 30-60 seconds
          </div>
        </div>
      ) : null}

      {/* Warning if no sandbox URL after completion */}
      {!sandboxUrl && status === 'failed' && (
        <div className="mt-4 text-center py-8 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-700 font-semibold mb-2">⚠️ Sandbox Deployment Failed</p>
          <p className="text-sm text-red-600">
            The activity code was generated, but deployment to Daytona failed.
            <br />
            <span className="text-xs text-gray-600 mt-2 inline-block">
              Check that DAYTONA_API_KEY is configured in backend/.env
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

