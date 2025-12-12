import React, { useState, useEffect } from 'react';
import { Artifact } from '../../types/artifacts';
import ArtifactRenderer from './ArtifactRenderer';
import { X, Maximize2, Minimize2, Copy, Download, Code, Eye } from 'lucide-react';

interface ArtifactsPanelProps {
    artifacts: Artifact[];
    selectedArtifact: Artifact | null;
    onSelectArtifact: (artifact: Artifact) => void;
    isOpen: boolean;
    onClose: () => void;
    onToggle?: () => void; // Added for compatibility with existing App usage
    onUpdateArtifact?: (id: string, updates: Partial<Artifact>) => void; // Added for compatibility
    isFixed?: boolean; // Added for compatibility
}

export const ArtifactsPanel: React.FC<ArtifactsPanelProps> = ({
    artifacts,
    selectedArtifact,
    onSelectArtifact,
    isOpen,
    onClose,
    isFixed = false
}) => {
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsMobile(/Android|iPhone|iPad/i.test(navigator.userAgent));
        }
    }, []);

    if (!isOpen) return null;

    return (
        <div
            className={`
        ${isMobile || isFixed
                    ? 'fixed inset-0 z-[9999] bg-white flex flex-col'
                    : 'relative w-full h-full bg-[#fbfbfa] border-l border-gray-200 flex flex-col'
                }
        artifacts-panel open
      `}
            data-artifact-panel
        >
            {/* HEADER */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white shrinking-0 h-14">
                <div className="flex items-center gap-3 overflow-hidden">
                    {(isMobile || isFixed) && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    )}
                    <h2 className="text-sm font-semibold truncate text-gray-800">
                        {selectedArtifact?.title || 'Artifacts'}
                    </h2>
                </div>

                {selectedArtifact && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setActiveTab(activeTab === 'preview' ? 'code' : 'preview')}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 lg:hidden"
                            title={activeTab === 'preview' ? "View Code" : "View Preview"}
                        >
                            {activeTab === 'preview' ? <Code size={18} /> : <Eye size={18} />}
                        </button>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(selectedArtifact.content);
                                // toast? alert?
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                            title="Copy code"
                        >
                            <Copy size={18} />
                        </button>
                        <button
                            onClick={() => {
                                const blob = new Blob([selectedArtifact.content], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${selectedArtifact.title}.${selectedArtifact.language || 'txt'}`;
                                a.click();
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                            title="Download"
                        >
                            <Download size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* TABS (Desktop Only, or if space permits) */}
            {selectedArtifact && !isMobile && (
                <div className="flex border-b border-gray-200 bg-white shrinking-0">
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`flex-1 px-4 py-3 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'preview'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Eye size={16} /> Preview
                    </button>
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`flex-1 px-4 py-3 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'code'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Code size={16} /> Code
                    </button>
                </div>
            )}

            {/* CONTENT */}
            <div className="flex-1 overflow-auto bg-white relative">
                {!selectedArtifact ? (
                    // EMPTY STATE
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Code size={32} className="text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-600">No artifact selected</p>
                        <p className="text-sm mt-2 text-center text-gray-500">Generate code or select an artifact from the list to view it.</p>
                    </div>
                ) : activeTab === 'preview' ? (
                    // PREVIEW
                    <ArtifactRenderer
                        artifact={selectedArtifact}
                        isMobile={isMobile}
                    />
                ) : (
                    // CODE VIEW
                    <pre className="p-4 text-sm bg-gray-900 text-gray-100 overflow-auto h-full w-full m-0 whitespace-pre-wrap break-all font-mono">
                        <code>{selectedArtifact.content}</code>
                    </pre>
                )}
            </div>

            {/* ARTIFACT LIST (if multiple) */}
            {artifacts.length > 1 && (
                <div className="border-t border-gray-200 bg-gray-50 p-2 overflow-x-auto shrinking-0">
                    <div className="flex gap-2">
                        {artifacts.map((artifact) => (
                            <button
                                key={artifact.id}
                                onClick={() => onSelectArtifact(artifact)}
                                className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors border ${selectedArtifact?.id === artifact.id
                                        ? 'bg-white border-blue-500 text-blue-700 font-medium shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {artifact.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtifactsPanel;
