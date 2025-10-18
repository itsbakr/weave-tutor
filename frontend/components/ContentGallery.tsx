'use client';

import { Calendar, ExternalLink, Sparkles, Play } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  created_at: string;
  [key: string]: any;
}

interface ContentGalleryProps {
  title: string;
  items: GalleryItem[];
  type: 'strategy' | 'lesson' | 'activity';
  onItemClick?: (item: GalleryItem) => void;
  onPreview?: (item: GalleryItem) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function ContentGallery({
  title,
  items,
  type,
  onItemClick,
  onPreview,
  loading = false,
  emptyMessage = 'No content yet. Generate your first one above!',
}: ContentGalleryProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScore = (item: GalleryItem) => {
    if (item.self_evaluation?.overall_score) {
      return item.self_evaluation.overall_score.toFixed(1);
    }
    return null;
  };

  const getStatusBadge = (item: GalleryItem) => {
    if (type === 'activity') {
      const status = item.deployment_status || 'unknown';
      const statusColors: Record<string, string> = {
        success: 'bg-green-100 text-green-800',
        running: 'bg-blue-100 text-blue-800',
        failed: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800',
        unknown: 'bg-gray-100 text-gray-800',
      };
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status] || statusColors.unknown}`}>
          {status}
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="mt-8 border-t pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t pt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      
      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onItemClick?.(item)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm flex-1 line-clamp-2">
                  {item.title}
                </h3>
                {getScore(item) && (
                  <div className={`ml-2 text-sm font-bold ${getScoreColor(parseFloat(getScore(item)!))}`}>
                    {getScore(item)}/10
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(item.created_at)}
                </div>
                
                {type === 'activity' && (
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item)}
                    {item.type && (
                      <span className="text-xs text-gray-600 capitalize">{item.type}</span>
                    )}
                    {item.duration && (
                      <span className="text-xs text-gray-600">{item.duration} min</span>
                    )}
                  </div>
                )}
                
                {type === 'lesson' && item.strategy_week_number && (
                  <div className="text-xs text-blue-600 font-medium">
                    Week {item.strategy_week_number}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemClick?.(item);
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </button>
                
                {type === 'activity' && onPreview && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(item);
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Preview
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

