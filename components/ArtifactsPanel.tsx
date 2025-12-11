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
}

interface ArtifactsPanelProps {
    artifacts: Artifact[];
    selectedArtifact?: Artifact | null;
    isOpen: boolean;
    onClose: () => void;
    onToggle: () => void;
    onSelectArtifact: (artifact: Artifact) => void;
    isFixed?: boolean;
}

export const ArtifactsPanel: React.FC<ArtifactsPanelProps> = memo(({
    artifacts, selectedArtifact, isOpen, onClose, onToggle, onSelectArtifact, isFixed = true
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

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

    const getIcon = (type: string) => {
        switch (type) {
            case 'code': return <Code size={14} />;
            case 'image': case 'svg': return <Image size={14} />;
            default: return <FileText size={14} />;
        }
    };

    const renderPreview = () => {
        if (!selectedArtifact) return null;
        if (selectedArtifact.type === 'html' || selectedArtifact.type === 'react') {
            return (
                <iframe
                    srcDoc={selectedArtifact.content}
                    className="artifacts-iframe w-full h-full border-none rounded-lg bg-white"
                    sandbox="allow-scripts allow-same-origin"
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
        return (
            <pre className="w-full h-full overflow-auto p-4 text-sm font-mono text-[--text-primary] bg-[--bg-tertiary] rounded-lg">
                <code>{selectedArtifact.content}</code>
            </pre>
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
        ? 'fixed inset-0 z-50'
        : 'artifacts-panel open fixed right-0 top-14 w-[400px] h-[calc(100vh-56px)] border-l border-[--border-primary] z-100';

    return (
        <div className={`${containerClasses} bg-[--bg-secondary] flex flex-col`}>
            {/* Header - 56px */}
            <div className="artifacts-header h-14 px-5 flex items-center justify-between border-b border-[--border-subtle]">
                <span className="artifacts-title text-base font-medium text-[--text-primary]">
                    {selectedArtifact?.title || 'Artifact'}
                </span>
                <div className="artifacts-actions flex gap-1">
                    <button onClick={handleCopy} className="panel-btn w-8 h-8 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted] transition-colors">
                        {copied ? <Check size={20} className="text-[--success]" /> : <Copy size={20} />}
                    </button>
                    <button className="panel-btn w-8 h-8 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted] transition-colors">
                        <Edit size={20} />
                    </button>
                    <button onClick={() => setIsFullscreen(!isFullscreen)} className="panel-btn w-8 h-8 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted] transition-colors">
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    <button onClick={onClose} className="panel-btn w-8 h-8 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted] transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="artifacts-content p-5 flex-1 overflow-y-auto">
                {selectedArtifact ? (
                    renderPreview()
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
