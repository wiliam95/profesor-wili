import React from 'react';
import { FileCode, Trash2 } from 'lucide-react';
import { Artifact } from '../../types/artifacts';

interface ArtifactsSpaceProps {
  artifacts: Artifact[];
  currentArtifactId: string | null;
  onSelectArtifact: (id: string) => void;
  onDeleteArtifact: (id: string) => void;
}

export const ArtifactsSpace: React.FC<ArtifactsSpaceProps> = ({
  artifacts,
  currentArtifactId,
  onSelectArtifact,
  onDeleteArtifact
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      code: 'bg-blue-100 text-blue-700',
      react: 'bg-purple-100 text-purple-700',
      html: 'bg-orange-100 text-orange-700',
      svg: 'bg-green-100 text-green-700',
      mermaid: 'bg-pink-100 text-pink-700',
      markdown: 'bg-yellow-100 text-yellow-700',
      text: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">Artifacts</h2>
        <p className="text-xs text-gray-500 mt-1">{artifacts.length} items</p>
      </div>

      <div className="flex-1 overflow-auto">
        {artifacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <FileCode className="text-gray-300 mb-2" size={48} />
            <p className="text-sm text-gray-500">No artifacts yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Artifacts will appear here when AI creates them
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {artifacts.map(artifact => (
              <div
                key={artifact.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentArtifactId === artifact.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => onSelectArtifact(artifact.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {artifact.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(artifact.type)}`}>
                        {artifact.type}
                      </span>
                      {artifact.language && (
                        <span className="text-xs text-gray-500">
                          {artifact.language}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(artifact.updatedAt)}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${artifact.title}"?`)) {
                        onDeleteArtifact(artifact.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-600 rounded transition-opacity"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
