// ArtifactsSpace.tsx - Claude AI Style Artifacts Workspace
import React, { useState, memo } from 'react';
import { Search, Grid, List, Filter, Plus, FileText, Code, Image, Trash2, Download, MoreVertical, Clock, Tag } from 'lucide-react';
import { Artifact } from '../types/artifacts';

interface ArtifactsSpaceProps {
    artifacts: Artifact[];
    onSelectArtifact: (artifact: Artifact) => void;
    onDeleteArtifact?: (id: string) => void;
    onCreateArtifact?: () => void;
}

export const ArtifactsSpace: React.FC<ArtifactsSpaceProps> = memo(({
    artifacts, onSelectArtifact, onDeleteArtifact, onCreateArtifact
}) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');

    const filteredArtifacts = artifacts
        .filter(a => filterType === 'all' || a.type === filterType)
        .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'date') return b.timestamp - a.timestamp;
            if (sortBy === 'name') return a.title.localeCompare(b.title);
            return a.type.localeCompare(b.type);
        });

    const getArtifactIcon = (type: string) => {
        switch (type) {
            case 'code': return <Code className="w-5 h-5" />;
            case 'image': case 'svg': return <Image className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 86400000) return 'Today';
        if (diff < 172800000) return 'Yesterday';
        return date.toLocaleDateString();
    };

    return (
        <div className="h-full flex flex-col bg-slate-900">
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold text-slate-100">Artifacts Space</h1>
                    <button onClick={onCreateArtifact} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                        <Plus className="w-4 h-4" /><span>New Artifact</span>
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="Search artifacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50" />
                    </div>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none">
                        <option value="all">All Types</option>
                        <option value="code">Code</option>
                        <option value="document">Documents</option>
                        <option value="html">HTML</option>
                        <option value="svg">SVG</option>
                    </select>
                    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-700 text-slate-200' : 'text-slate-500'}`}>
                            <Grid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-700 text-slate-200' : 'text-slate-500'}`}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {filteredArtifacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <FileText className="w-16 h-16 mb-4 opacity-30" />
                        <p className="text-lg mb-2">No artifacts found</p>
                        <p className="text-sm">{searchQuery ? 'Try a different search term' : 'Create your first artifact'}</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredArtifacts.map((artifact) => (
                            <div key={artifact.id} onClick={() => onSelectArtifact(artifact)}
                                className="group bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-orange-500/50 hover:bg-slate-800/80 transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${artifact.type === 'code' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        {getArtifactIcon(artifact.type)}
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteArtifact?.(artifact.id); }} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-700 rounded transition-all">
                                        <Trash2 className="w-4 h-4 text-slate-500" />
                                    </button>
                                </div>
                                <h3 className="font-medium text-slate-200 truncate mb-1">{artifact.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Clock className="w-3 h-3" /><span>{formatDate(artifact.timestamp)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredArtifacts.map((artifact) => (
                            <div key={artifact.id} onClick={() => onSelectArtifact(artifact)}
                                className="group flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-lg p-3 cursor-pointer hover:border-orange-500/50 transition-all">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${artifact.type === 'code' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {getArtifactIcon(artifact.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-slate-200 truncate">{artifact.title}</h3>
                                    <p className="text-xs text-slate-500">{artifact.type} â€¢ {formatDate(artifact.timestamp)}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); onDeleteArtifact?.(artifact.id); }} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-slate-700 rounded-lg transition-all">
                                    <Trash2 className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

ArtifactsSpace.displayName = 'ArtifactsSpace';
export default ArtifactsSpace;