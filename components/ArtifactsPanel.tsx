// ArtifactsPanel.tsx - Claude AI 2025 (400px)
import React, { useState, memo } from 'react';
import {
    X, ChevronRight, Code, FileText, Image,
    Download, Copy, Maximize2, Minimize2, Edit, Check, ExternalLink
} from 'lucide-react';

export interface Artifact {
    id: string;
    type: 'code' | 'document' | 'image' | 'html' | 'react' | 'svg';
    title: string;
    content: string;
    language?: string;
    createdAt: number;
    versions?: {
        id: string;
        content: string;
        timestamp: number;
        title?: string;
    }[];
    currentVersionIndex?: number; // 0 = latest, 1 = previous, etc. Or maybe reverse? Let's say index in versions array.
}

interface ArtifactsPanelProps {
    artifacts: Artifact[];
    selectedArtifact?: Artifact | null;
    isOpen: boolean;
    onClose: () => void;
    onToggle: () => void;
    onSelectArtifact: (artifact: Artifact) => void;
    onUpdateArtifact?: (id: string, updates: Partial<Artifact>) => void; // Added for Editing
    isFixed?: boolean;
}

export const ArtifactsPanel: React.FC<ArtifactsPanelProps> = memo(({
    artifacts, selectedArtifact, isOpen, onClose, onToggle, onSelectArtifact, onUpdateArtifact, isFixed = true
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

    const [editContent, setEditContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Update edit content when selected artifact changes
    React.useEffect(() => {
        if (selectedArtifact) {
            setEditContent(selectedArtifact.content);
        }
    }, [selectedArtifact]);

    const handleSaveEdit = () => {
        if (!selectedArtifact) return;
        onUpdateArtifact?.(selectedArtifact.id, { content: editContent });
        // Optional: Show toast or feedback
    };

    // NOTE: ArtifactsPanel needs onUpdate prop to support editing.
    // I will insert the prop in the next tool call. I'll write the logic assuming it exists.

    const handleCopy = async () => {
        if (selectedArtifact) {
            await navigator.clipboard.writeText(selectedArtifact.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (!selectedArtifact) return;
        const blob = new Blob([selectedArtifact.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedArtifact.title}.${selectedArtifact.language || 'txt'}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const renderPreview = () => {
        if (!selectedArtifact) return null;

        // REACT RUNNER (CDN Injection) - Improved Version 2025
        if (selectedArtifact.type === 'react' || selectedArtifact.type === 'html') {
            const isReact = selectedArtifact.type === 'react';

            // Pre-process React code for iframe execution
            const processReactCode = (code: string) => {
                // Remove all import statements (single and multi-line)
                let processed = code.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '// [Removed Import]');
                processed = processed.replace(/import\s+['"][^'"]+['"];?/g, '// [Removed Import]');

                // Handle various export patterns
                processed = processed.replace(/export\s+default\s+function\s+(\w+)/g, 'function $1');
                processed = processed.replace(/export\s+default\s+(\w+);?/g, 'const App = $1;');
                processed = processed.replace(/export\s+default\s+\(([^)]*?)\)\s*=>/g, 'const App = ($1) =>');
                processed = processed.replace(/export\s+const\s+(\w+)/g, 'const $1');
                processed = processed.replace(/export\s+function\s+(\w+)/g, 'function $1');

                return processed;
            };

            // Generate robust HTML shell
            const srcDoc = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <script src="https://cdn.tailwindcss.com"></script>
                    ${isReact ? `
                    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
                    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
                    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                    <script src="https://unpkg.com/lucide@latest"></script>
                    ` : ''}
                    <style>
                        body { background-color: white; margin: 0; padding: 1rem; font-family: system-ui, sans-serif; }
                        .error-display { color: #dc2626; padding: 20px; border: 1px solid #dc2626; background: #fef2f2; border-radius: 8px; white-space: pre-wrap; font-family: monospace; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div id="root"></div>
                    <script type="${isReact ? 'text/babel' : 'text/javascript'}">
                        ${isReact ? `
                            // React Hooks available globally
                            const { useState, useEffect, useRef, useMemo, useCallback, useContext, useReducer } = React;
                            
                            try {
                                ${processReactCode(selectedArtifact.content)}
                                
                                // Try to render App component
                                const root = ReactDOM.createRoot(document.getElementById('root'));
                                if (typeof App !== 'undefined') {
                                    root.render(React.createElement(App));
                                } else {
                                    // Look for any capitalized function that could be a component
                                    const componentNames = Object.keys(window).filter(k => /^[A-Z]/.test(k) && typeof window[k] === 'function');
                                    if (componentNames.length > 0) {
                                        root.render(React.createElement(window[componentNames[0]]));
                                    } else {
                                        document.getElementById('root').innerHTML = '<div class="error-display">No React component found. Make sure you have an "App" function or export default.</div>';
                                    }
                                }
                            } catch (err) {
                                document.getElementById('root').innerHTML = '<div class="error-display">Runtime Error:\\n' + err.message + '</div>';
                                console.error('[Artifact Preview Error]', err);
                            }
                        ` : selectedArtifact.content}
                    </script>
                </body>
                </html>
            `;

            return (
                <iframe
                    srcDoc={srcDoc}
                    className="artifacts-iframe w-full h-full border-none rounded-lg bg-white"
                    sandbox="allow-scripts allow-same-origin allow-modals"
                    title={selectedArtifact.title}
                />
            );
        }

        if (selectedArtifact.type === 'svg') {
            return (
                <div
                    className="w-full h-full flex items-center justify-center p-4 bg-white rounded-lg"
                    dangerouslySetInnerHTML={{ __html: selectedArtifact.content }}
                />
            );
        }

        // TEXT/CODE in Preview Mode (Just view)
        return (
            <pre className="w-full h-full overflow-auto p-4 text-sm font-mono text-[--text-primary] bg-[--bg-tertiary] rounded-lg">
                <code>{selectedArtifact.content}</code>
            </pre>
        );
    };

    const renderCodeEditor = () => {
        if (!selectedArtifact) return null;
        return (
            <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-full p-4 bg-[--bg-tertiary] text-[--text-primary] font-mono text-sm resize-none focus:outline-none"
                spellCheck={false}
            />
        );
    };

    if (!isOpen) {
        if (!isFixed) return null;
        return (
            <button
                onClick={onToggle}
                className="fixed right-0 top-1/2 -translate-y-1/2 px-1 py-6 bg-[--bg-tertiary] border border-[--border-primary] border-r-0 rounded-l-lg hover:bg-[--bg-hover] transition-colors z-30"
                aria-label="Open artifacts"
            >
                <ChevronRight size={14} className="text-[--text-muted] rotate-180" />
            </button>
        );
    }

    const containerClasses = isFullscreen
        ? 'fixed inset-0 z-[200]'
        : 'artifacts-panel open fixed right-0 top-14 w-full sm:w-[400px] h-[calc(100vh-56px)] border-l border-[--border-primary] z-[150]';

    return (
        <div
            className={`${containerClasses} bg-[--bg-secondary] flex flex-col`}
            style={{ transform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' }}
        >
            {/* MOBILE: Close button (Fix 2) */}
            <div className="lg:hidden flex items-center justify-between p-3 border-b border-[--border-subtle] bg-[--bg-secondary]">
                <h2 className="text-sm font-semibold text-[--text-primary]">
                    {selectedArtifact?.title || 'Artifact'}
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-[--bg-hover] rounded-lg text-[--text-muted]"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Header - 56px (Desktop) */}
            <div className="artifacts-header h-14 px-5 flex items-center justify-between border-b border-[--border-subtle] hidden lg:flex">
                <div className="flex items-center gap-3 overflow-hidden">
                    <span className="artifacts-title text-sm font-medium text-[--text-primary] truncate">
                        {selectedArtifact?.title || 'Artifact'}
                    </span>
                    {selectedArtifact?.versions && selectedArtifact.versions.length > 0 && (
                        <span className="text-xs text-[--text-muted} px-2 py-0.5 bg-[--bg-tertiary] rounded-full border border-[--border-subtle]">
                            V{selectedArtifact.versions.length + 1}
                        </span>
                    )}
                </div>

                <div className="artifacts-actions flex gap-1">
                    <button onClick={() => setIsFullscreen(!isFullscreen)} className="panel-btn w-8 h-8 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted] transition-colors">
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <button onClick={onClose} className="panel-btn w-8 h-8 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted] transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* TAB SWITCHER */}
            <div className="px-5 py-3 border-b border-[--border-subtle] flex items-center justify-between bg-[--bg-secondary]">
                <div className="flex p-1 bg-[--bg-tertiary] rounded-lg border border-[--border-primary]">
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'preview' ? 'bg-white text-black shadow-sm' : 'text-[--text-muted] hover:text-[--text-primary]'}`}
                    >
                        Preview
                    </button>
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'code' ? 'bg-white text-black shadow-sm' : 'text-[--text-muted] hover:text-[--text-primary]'}`}
                    >
                        Code
                    </button>
                </div>

                {/* Action Buttons (Save/Download/Copy) */}
                <div className="flex items-center gap-1">
                    {activeTab === 'code' && selectedArtifact && editContent !== selectedArtifact.content && (
                        <button
                            onClick={handleSaveEdit}
                            className="flex items-center gap-1 px-2 py-1.5 bg-green-600 text-white text-xs font-bold rounded-md hover:bg-green-500 shadow-sm"
                        >
                            <Check size={14} /> Save
                        </button>
                    )}
                    <button onClick={handleCopy} className="panel-btn w-8 h-8 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted] transition-colors">
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    <button onClick={handleDownload} className="panel-btn w-8 h-8 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted] transition-colors">
                        <Download size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="artifacts-content flex-1 overflow-hidden relative">
                {selectedArtifact ? (
                    activeTab === 'preview' ? renderPreview() : renderCodeEditor()
                ) : (
                    <div className="h-full flex items-center justify-center text-[--text-muted]">
                        <div className="text-center">
                            <FileText size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No artifact selected</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

ArtifactsPanel.displayName = 'ArtifactsPanel';
export default ArtifactsPanel;
