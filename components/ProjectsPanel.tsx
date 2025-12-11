// ProjectsPanel.tsx - Claude AI Style Projects Panel
import React, { useState, memo } from 'react';
import { Search, FolderPlus, Folder, FolderOpen, Settings, Users, FileText, MoreVertical, Star, StarOff, Trash2, Edit, Clock, ChevronRight } from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description?: string;
    chatCount: number;
    lastActive: number;
    isPinned?: boolean;
    color?: string;
    members?: number;
}

interface ProjectsPanelProps {
    projects: Project[];
    activeProjectId?: string | null;
    onSelectProject: (projectId: string) => void;
    onCreateProject?: () => void;
    onDeleteProject?: (projectId: string) => void;
    onPinProject?: (projectId: string) => void;
    onRenameProject?: (projectId: string, newName: string) => void;
}

export const ProjectsPanel: React.FC<ProjectsPanelProps> = memo(({
    projects, activeProjectId, onSelectProject, onCreateProject, onDeleteProject, onPinProject, onRenameProject
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 86400000) return 'Today';
        if (diff < 172800000) return 'Yesterday';
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
        return date.toLocaleDateString();
    };

    const pinnedProjects = projects.filter(p => p.isPinned);
    const recentProjects = projects.filter(p => !p.isPinned).sort((a, b) => b.lastActive - a.lastActive);
    const filteredPinned = pinnedProjects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredRecent = recentProjects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const projectColors = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'];

    const ProjectItem = ({ project }: { project: Project }) => (
        <div
            onClick={() => onSelectProject(project.id)}
            className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${activeProjectId === project.id ? 'bg-orange-500/10 border border-orange-500/30' : 'hover:bg-slate-800 border border-transparent'
                }`}
        >
            <div className={`w-10 h-10 rounded-lg ${project.color || projectColors[Math.floor(Math.random() * projectColors.length)]}/20 flex items-center justify-center`}>
                {activeProjectId === project.id ? (
                    <FolderOpen className="w-5 h-5 text-orange-400" />
                ) : (
                    <Folder className="w-5 h-5 text-slate-400" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className={`font-medium truncate ${activeProjectId === project.id ? 'text-orange-400' : 'text-slate-200'}`}>{project.name}</h3>
                    {project.isPinned && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{project.chatCount} chats</span>
                    <span>•</span>
                    <span>{formatDate(project.lastActive)}</span>
                </div>
            </div>
            <div className="relative">
                <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === project.id ? null : project.id); }}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-slate-700 rounded-lg transition-all"
                >
                    <MoreVertical className="w-4 h-4 text-slate-500" />
                </button>
                {menuOpenId === project.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 py-1">
                        <button onClick={(e) => { e.stopPropagation(); onPinProject?.(project.id); setMenuOpenId(null); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-sm text-slate-300">
                            {project.isPinned ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                            {project.isPinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onRenameProject?.(project.id, project.name); setMenuOpenId(null); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-sm text-slate-300">
                            <Edit className="w-4 h-4" />Rename
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteProject?.(project.id); setMenuOpenId(null); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-sm text-red-400">
                            <Trash2 className="w-4 h-4" />Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-900">
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-100">Projects</h2>
                    <button onClick={onCreateProject} className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors">
                        <FolderPlus className="w-4 h-4" /><span>New</span>
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {filteredPinned.length > 0 && (
                    <div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">Pinned</h3>
                        <div className="space-y-1">{filteredPinned.map(project => <ProjectItem key={project.id} project={project} />)}</div>
                    </div>
                )}
                {filteredRecent.length > 0 && (
                    <div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">Recent</h3>
                        <div className="space-y-1">{filteredRecent.map(project => <ProjectItem key={project.id} project={project} />)}</div>
                    </div>
                )}
                {filteredPinned.length === 0 && filteredRecent.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Folder className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm">{searchQuery ? 'No projects found' : 'No projects yet'}</p>
                        {!searchQuery && <button onClick={onCreateProject} className="mt-3 text-sm text-orange-400 hover:text-orange-300">Create your first project</button>}
                    </div>
                )}
            </div>
        </div>
    );
});

ProjectsPanel.displayName = 'ProjectsPanel';
export default ProjectsPanel;
