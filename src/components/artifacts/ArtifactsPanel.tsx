import React, { useState } from 'react';
import { X, Copy, Download, Code, Eye, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { Artifact } from '../../types/artifacts';
import { ArtifactRenderer } from './ArtifactRenderer';

interface ArtifactsPanelProps {
  artifact: Artifact | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const ArtifactsPanel: React.FC<ArtifactsPanelProps> = ({
  artifact,
  onClose,
  onDelete,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const [showCode, setShowCode] = useState(false);

  if (!artifact) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-400">No artifact selected</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    alert('Copied to clipboard!');
  };

  const handleDownload = () => {
    const ext = artifact.language || artifact.type;
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (confirm(`Delete artifact "${artifact.title}"?`)) {
      onDelete?.(artifact.id);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {artifact.title}
          </h3>
          <p className="text-xs text-gray-500">
            {artifact.type} {artifact.language && `• ${artifact.language}`}
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {/* Toggle Code/Preview */}
          {(artifact.type === 'html' || artifact.type === 'react' || artifact.type === 'svg') && (
            <button
              onClick={() => setShowCode(!showCode)}
              className="p-2 hover:bg-gray-100 rounded"
              title={showCode ? 'Show Preview' : 'Show Code'}
            >
              {showCode ? <Eye size={18} /> : <Code size={18} />}
            </button>
          )}
          
          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-100 rounded"
            title="Copy Code"
          >
            <Copy size={18} />
          </button>
          
          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-100 rounded"
            title="Download"
          >
            <Download size={18} />
          </button>
          
          {/* Delete */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-100 text-red-600 rounded"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          )}
          
          {/* Fullscreen */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-2 hover:bg-gray-100 rounded"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          )}
          
          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {showCode ? (
          <pre className="p-4 text-sm bg-gray-50 h-full overflow-auto">
            <code>{artifact.content}</code>
          </pre>
        ) : (
          <ArtifactRenderer artifact={artifact} />
        )}
      </div>
    </div>
  );
};
