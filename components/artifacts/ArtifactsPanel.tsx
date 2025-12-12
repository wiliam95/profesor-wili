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

    // CLAUDE AI ARTIFACTS DESIGN (December 2025)
    const mode = isMobile ? 'mobile' : 'desktop';

    return (
        <div
            className={`
                artifacts-panel-claude claude-scrollbar
                ${isMobile || isFixed
                    ? 'fixed inset-0 z-[9999]'
                    : 'relative w-full h-full'
                }
                flex flex-col
                bg-white dark:bg-[#1A1A1A]
            `}
            data-artifact-panel="claude-style"
            data-mode={mode}
        >
            {/* HEADER - Claude AI Style with Orange Accent */}
            <div className="artifacts-header flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1A] flex-shrink-0 min-h-[56px]">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {(isMobile || isFixed) && (
                        <button
                            onClick={onClose}
                            className="claude-icon-btn flex-shrink-0"
                            aria-label="Close artifact panel"
                        >
                            <X size={20} />
                        </button>
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
                            {selectedArtifact?.title || 'Artifacts'}
                        </h2>
                        {selectedArtifact && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {selectedArtifact.type.toUpperCase()} • {selectedArtifact.language || 'text'}
                            </p>
                        )}
                    </div>
                </div>

                {selectedArtifact && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={handleCopy}
                            className="claude-icon-btn relative"
                            title="Copy code"
                        >
                            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="claude-icon-btn"
                            title="Download artifact"
                        >
                            <Download size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* TABS - Claude AI Orange Accent */}
            {selectedArtifact && (
                <div className="artifacts-tabs flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0F0F0F] flex-shrink-0">
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`artifacts-tab ${activeTab === 'preview' ? 'active' : ''} flex-1 px-4 py-3 font-medium text-sm transition-all flex items-center justify-center gap-2 relative`}
                    >
                        <Eye size={16} />
                        <span>Preview</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`artifacts-tab ${activeTab === 'code' ? 'active' : ''} flex-1 px-4 py-3 font-medium text-sm transition-all flex items-center justify-center gap-2 relative`}
                    >
                        <Code size={16} />
                        <span>Code</span>
                    </button>
                </div>
            )}

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-[#1A1A1A] relative claude-scrollbar">
                {!selectedArtifact ? (
                    // EMPTY STATE - Claude AI Style 
                    <div className="empty-state flex flex-col items-center justify-center h-full p-8">
                        <div className="empty-state-icon flex items-center justify-center mb-4">
                            <Code size={32} className="text-gray-400 dark:text-gray-600" />
                        </div>
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No artifact selected</p>
                        <p className="text-sm text-center text-gray-500 dark:text-gray-500 max-w-xs">
                            Ask me to create code, React components, or visualizations and they'll appear here.
                        </p>
                    </div>
                ) : activeTab === 'preview' ? (
                    // PREVIEW TAB
                    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-[#0F0F0F] claude-scrollbar">
                        <ArtifactRenderer
                            artifact={selectedArtifact}
                            isMobile={isMobile}
                        />
                    </div>
                ) : (
                    // CODE TAB - Claude Style Syntax Highlighting
                    <div className="code-view w-full h-full overflow-auto claude-scrollbar">
                        <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words m-0 leading-relaxed">
                            <code>{selectedArtifact.content}</code>
                        </pre>
                    </div>
                )}
            </div>

            {/* ARTIFACT NAVIGATION - Bottom Tabs (if multiple) */}
            {artifacts.length > 1 && (
                <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0F0F0F] p-3 overflow-x-auto flex-shrink-0">
                    <div className="flex gap-2">
                        {artifacts.map((artifact) => (
                            <button
                                key={artifact.id}
                                onClick={() => onSelectArtifact(artifact)}
                                className={`artifact-card px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border flex-shrink-0 ${selectedArtifact?.id === artifact.id
                                    ? 'bg-[#EA580C] text-white border-[#EA580C] claude-shadow-sm'
                                    : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-[#EA580C] dark:hover:border-[#EA580C]'
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