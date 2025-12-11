// ToolsPanel.tsx - Claude AI Style Tools Panel
import React, { useState, memo } from 'react';
import { Search, Globe, Code, Calculator, FileText, Image, Terminal, Database, Zap, Settings2, ChevronRight, Check, X, AlertCircle, Info } from 'lucide-react';

interface Tool {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: string;
    enabled: boolean;
    status?: 'active' | 'error' | 'disabled';
    badge?: string;
}

interface ToolsPanelProps {
    tools?: Tool[];
    onToolToggle: (toolId: string) => void;
    onToolSettings?: (toolId: string) => void;
}

const DEFAULT_TOOLS: Tool[] = [
    { id: 'web-search', name: 'Web Search', description: 'Search the internet for information', icon: <Globe className="w-5 h-5" />, category: 'Search', enabled: true, status: 'active' },
    { id: 'code-exec', name: 'Code Execution', description: 'Run Python code in sandbox', icon: <Terminal className="w-5 h-5" />, category: 'Development', enabled: true, status: 'active' },
    { id: 'calculator', name: 'Calculator', description: 'Perform mathematical calculations', icon: <Calculator className="w-5 h-5" />, category: 'Utilities', enabled: true, status: 'active' },
    { id: 'image-gen', name: 'Image Generation', description: 'Generate images from text', icon: <Image className="w-5 h-5" />, category: 'Creative', enabled: false, badge: 'PRO' },
    { id: 'doc-analysis', name: 'Document Analysis', description: 'Analyze and extract from documents', icon: <FileText className="w-5 h-5" />, category: 'Analysis', enabled: true, status: 'active' },
    { id: 'database', name: 'Database Query', description: 'Query SQL databases', icon: <Database className="w-5 h-5" />, category: 'Development', enabled: false },
    { id: 'code-interpreter', name: 'Code Interpreter', description: 'Advanced code analysis', icon: <Code className="w-5 h-5" />, category: 'Development', enabled: true, status: 'active', badge: 'BETA' },
];

export const ToolsPanel: React.FC<ToolsPanelProps> = memo(({
    tools = DEFAULT_TOOLS, onToolToggle, onToolSettings
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Search', 'Development']));

    const categories = [...new Set(tools.map(t => t.category))];
    const filteredTools = tools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const toggleCategory = (category: string) => {
        const newSet = new Set(expandedCategories);
        if (newSet.has(category)) newSet.delete(category);
        else newSet.add(category);
        setExpandedCategories(newSet);
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-900">
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-400" />Tools & Capabilities
                    </h2>
                    <span className="px-2 py-1 bg-slate-800 rounded-full text-xs text-slate-400">{tools.filter(t => t.enabled).length} active</span>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Search tools..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {categories.map(category => {
                    const categoryTools = filteredTools.filter(t => t.category === category);
                    if (categoryTools.length === 0) return null;
                    const isExpanded = expandedCategories.has(category);

                    return (
                        <div key={category} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                            <button onClick={() => toggleCategory(category)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-2">
                                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                    <span className="font-medium text-slate-200">{category}</span>
                                    <span className="text-xs text-slate-500">({categoryTools.length})</span>
                                </div>
                                <span className="text-xs text-slate-500">{categoryTools.filter(t => t.enabled).length} enabled</span>
                            </button>

                            {isExpanded && (
                                <div className="px-2 pb-2 space-y-1">
                                    {categoryTools.map(tool => (
                                        <div key={tool.id} className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${tool.enabled ? 'bg-slate-800/80' : 'bg-slate-900/50 opacity-60'}`}>
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tool.enabled ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-500'}`}>
                                                {tool.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-slate-200">{tool.name}</h3>
                                                    {tool.badge && <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-semibold rounded">{tool.badge}</span>}
                                                    {tool.status === 'active' && <span className={`w-2 h-2 rounded-full ${getStatusColor(tool.status)}`} />}
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">{tool.description}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={tool.enabled} onChange={() => onToolToggle(tool.id)} className="sr-only peer" />
                                                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-800/30">
                <div className="flex items-start gap-2 text-xs text-slate-500">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>Tools extend Claude's capabilities. Some tools may require additional setup or API keys.</p>
                </div>
            </div>
        </div>
    );
});

ToolsPanel.displayName = 'ToolsPanel';
export default ToolsPanel;
