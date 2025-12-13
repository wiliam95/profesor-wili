import React, { useState, useEffect } from 'react';
import { Artifact } from '../../types/artifacts';
import ArtifactRenderer from './ArtifactRenderer';
import { X, Copy, Download, Code, Eye, Check } from 'lucide-react';

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
                setIsMobile(window.innerWidth < 1024);
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

    // FIXED: Desktop = side panel (relative), Mobile = fullscreen (fixed)
    return (
        <div
            className={`
        artifacts-panel-claude
        ${isMobile
                    ? 'fixed inset-0 z-[9999]'
                    : 'relative h-full'
                }
        flex flex-col
        bg-[var(--bg-primary)] dark:bg-[#1A1A1A]
        border-l border-[var(--border-primary)]
      `}
            data-mode={isMobile ? 'mobile' : 'desktop'}
            style={{
                // Desktop: 35% width, min 420px, max 600px
                width: isMobile ? '100%' : 'clamp(420px, 35vw, 600px)',
            }}
        >
            {/* ===== HEADER ===== */}
            <div className="artifacts-header flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-primary)] flex-shrink-0 min-h-[56px]">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {isMobile && (
                        <button
                            onClick={onClose}
                            className="claude-icon-btn flex-shrink-0"
                            aria-label="Close artifact panel"
                        >
                            <X size={20} />
                        </button>
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold truncate text-[var(--text-primary)]">
                            {selectedArtifact?.title || 'Artifacts'}
                        </h2>
                        {selectedArtifact && (
                            <p className="text-xs text-[var(--text-muted)] truncate">
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
                            {copied ? (
                                <Check size={18} className="text-green-600" />
                            ) : (
                                <Copy size={18} />
                            )}
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

            {/* ===== TABS (CLAUDE ORANGE) ===== */}
            {selectedArtifact && (
                <div className="artifacts-tabs flex border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] flex-shrink-0">
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`
              artifacts-tab flex-1 px-4 py-3 font-medium text-sm 
              transition-all flex items-center justify-center gap-2 relative
              ${activeTab === 'preview'
                                ? 'text-[var(--accent-primary)] bg-[var(--bg-primary)]'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                            }
            `}
                    >
                        <Eye size={16} />
                        <span>Preview</span>
                        {activeTab === 'preview' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`
              artifacts-tab flex-1 px-4 py-3 font-medium text-sm 
              transition-all flex items-center justify-center gap-2 relative
              ${activeTab === 'code'
                                ? 'text-[var(--accent-primary)] bg-[var(--bg-primary)]'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                            }
            `}
                    >
                        <Code size={16} />
                        <span>Code</span>
                        {activeTab === 'code' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]" />
                        )}
                    </button>
                </div>
            )}

            {/* ===== CONTENT AREA ===== */}
            <div className="flex-1 overflow-hidden bg-[var(--bg-primary)] relative">
                {!selectedArtifact ? (
                    // EMPTY STATE
                    <div className="empty-state flex flex-col items-center justify-center h-full p-8">
                        <div className="empty-state-icon flex items-center justify-center mb-4 w-16 h-16 bg-[var(--bg-tertiary)] rounded-full">
                            <Code size={32} className="text-[var(--text-muted)]" />
                        </div>
                        <p className="text-lg font-medium text-[var(--text-secondary)] mb-2">
                            No artifact selected
                        </p>
                        <p className="text-sm text-center text-[var(--text-muted)] max-w-xs">
                            Ask me to create code, React components, or visualizations and they'll appear here.
                        </p>
                    </div>
                ) : activeTab === 'preview' ? (
                    // PREVIEW TAB
                    <div className="w-full h-full overflow-auto bg-[var(--bg-secondary)]">
                        <ArtifactRenderer
                            artifact={selectedArtifact}
                            isMobile={isMobile}
                        />
                    </div>
                ) : (
                    // CODE TAB
                    <div className="code-view w-full h-full overflow-auto bg-[#1E293B]">
                        <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words m-0 leading-relaxed text-[#E2E8F0]">
                            <code>{selectedArtifact.content}</code>
                        </pre>
                    </div>
                )}
            </div>

            {/* ===== ARTIFACT NAVIGATION (Bottom Tabs) ===== */}
            {artifacts.length > 1 && (
                <div className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] p-3 overflow-x-auto flex-shrink-0">
                    <div className="flex gap-2">
                        {artifacts.map((artifact) => (
                            <button
                                key={artifact.id}
                                onClick={() => onSelectArtifact(artifact)}
                                className={`
                  artifact-card px-3 py-2 rounded-lg text-xs font-medium 
                  whitespace-nowrap transition-all border flex-shrink-0
                  ${selectedArtifact?.id === artifact.id
                                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                                        : 'bg-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
                                    }
                `}
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