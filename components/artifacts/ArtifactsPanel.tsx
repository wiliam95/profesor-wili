import React, { useState, useEffect } from 'react';
import { Artifact } from '../../types/artifacts';
import ArtifactRenderer from './ArtifactRenderer';
import { X, Maximize2, Minimize2, Copy, Download, Code, Eye, Check } from 'lucide-react';

interface ArtifactsPanelProps {
    artifacts: Artifact[];
    selectedArtifact: Artifact | null;
    onSelectArtifact: (artifact: Artifact) => void;
    isOpen: boolean;
    onClose: () => void;
    onToggle?: () => void;
    onUpdateArtifact?: (id: string, updates: Partial<Artifact>) => void;
    isFixed?: boolean;
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
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const checkMobile = () => {
                setIsMobile(window.innerWidth < 1024 || /Android|iPhone|iPad/i.test(navigator.userAgent));
            };
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }
    }, []);

    // Auto-switch to preview when new artifact selected
    useEffect(() => {
        if (selectedArtifact) {
            setActiveTab('preview');
        }
    }, [selectedArtifact?.id]);

    const handleCopy = async () => {
        if (!selectedArtifact) return;
        try {
            await navigator.clipboard.writeText(selectedArtifact.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const handleDownload = () => {
        if (!selectedArtifact) return;
        const blob = new Blob([selectedArtifact.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = selectedArtifact.language || selectedArtifact.type || 'txt';
        a.download = `${selectedArtifact.title.replace(/[^a-z0-9]/gi, '_')}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    // CLAUDE-STYLE DESIGN
    return (
        <div
            className={`
                ${isMobile || isFixed
                    ? 'fixed inset-0 z-[9999] bg-white'
                    : 'relative w-full h-full bg-white border-l border-gray-200'
                }
                flex flex-col
                artifacts-panel-claude
            `}
            data-artifact-panel="claude-style"
        >
            {/* HEADER - Claude Style */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0 min-h-[56px]">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {(isMobile || isFixed) && (
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 flex-shrink-0 transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold truncate text-gray-800">
                            {selectedArtifact?.title || 'Artifacts'}
                        </h2>
                        {selectedArtifact && (
                            <p className="text-xs text-gray-500 truncate">
                                {selectedArtifact.type.toUpperCase()} • {selectedArtifact.language || 'text'}
                            </p>
                        )}
                    </div>
                </div>

                {selectedArtifact && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={handleCopy}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors relative"
                            title="Copy code"
                        >
                            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                            title="Download"
                        >
                            <Download size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* TABS - Claude Style Toggle */}
            {selectedArtifact && (
                <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`flex-1 px-4 py-3 font-medium text-sm transition-all flex items-center justify-center gap-2 relative ${activeTab === 'preview'
                                ? 'text-orange-600 bg-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        <Eye size={16} />
                        <span>Preview</span>
                        {activeTab === 'preview' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`flex-1 px-4 py-3 font-medium text-sm transition-all flex items-center justify-center gap-2 relative ${activeTab === 'code'
                                ? 'text-orange-600 bg-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        <Code size={16} />
                        <span>Code</span>
                        {activeTab === 'code' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
                        )}
                    </button>
                </div>
            )}

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden bg-white relative">
                {!selectedArtifact ? (
                    // EMPTY STATE - Claude Style
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <Code size={32} className="text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-600 mb-2">No artifact selected</p>
                        <p className="text-sm text-center text-gray-500 max-w-xs">
                            Ask me to create code, React components, or visualizations and they'll appear here.
                        </p>
                    </div>
                ) : activeTab === 'preview' ? (
                    // PREVIEW TAB
                    <div className="w-full h-full overflow-auto bg-gray-50">
                        <ArtifactRenderer
                            artifact={selectedArtifact}
                            isMobile={isMobile}
                        />
                    </div>
                ) : (
                    // CODE TAB - Syntax Highlighted
                    <div className="w-full h-full overflow-auto bg-gray-900">
                        <pre className="p-4 text-sm text-gray-100 font-mono whitespace-pre-wrap break-words m-0 leading-relaxed">
                            <code>{selectedArtifact.content}</code>
                        </pre>
                    </div>
                )}
            </div>

            {/* ARTIFACT TABS - Bottom Navigation (if multiple artifacts) */}
            {artifacts.length > 1 && (
                <div className="border-t border-gray-200 bg-gray-50 p-3 overflow-x-auto flex-shrink-0">
                    <div className="flex gap-2">
                        {artifacts.map((artifact) => (
                            <button
                                key={artifact.id}
                                onClick={() => onSelectArtifact(artifact)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border flex-shrink-0 ${selectedArtifact?.id === artifact.id
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
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