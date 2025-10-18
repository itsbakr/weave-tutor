'use client';

import { ExternalLink, Globe, RefreshCw, Loader2 } from 'lucide-react';

interface SandboxPreviewProps {
  code: string;
  sandboxUrl?: string;
  status?: string;
  attempts?: number;
  isRebuilding?: boolean;
  rebuildMessage?: string;
}

export function SandboxPreview({ 
  code, 
  sandboxUrl, 
  status, 
  attempts,
  isRebuilding = false,
  rebuildMessage = 'Rebuilding sandbox...'
}: SandboxPreviewProps) {
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

      {/* Rebuilding State - Show when redeploying */}
      {isRebuilding && (
        <div className="text-center py-32 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-dashed border-purple-300" style={{ minHeight: '500px' }}>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <RefreshCw className="w-20 h-20 text-purple-400 animate-spin" />
              <Loader2 className="w-10 h-10 text-purple-600 animate-pulse absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {rebuildMessage}
          </h3>
          <p className="text-gray-600 mb-4 text-lg">
            Creating fresh Daytona sandbox from stored code
          </p>
          <div className="text-sm text-gray-500 space-y-2 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Setting up Node.js environment...</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <span>Installing dependencies & Tailwind...</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <span>Starting Vite dev server...</span>
            </div>
          </div>
          <div className="text-base text-purple-700 bg-white px-6 py-3 rounded-lg shadow-sm inline-block mt-6">
            ⏱️ This may take 60-90 seconds
          </div>
        </div>
      )}

      {/* Sandbox Preview - Full Width */}
      {!isRebuilding && sandboxUrl ? (
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
      ) : !isRebuilding && code ? (
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

