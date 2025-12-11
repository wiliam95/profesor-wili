import React, { useEffect, useState } from 'react';
import { Activity, FileText, Zap, Globe, Image as ImageIcon, Mic, Database, Code, Search } from 'lucide-react';

interface RightPanelProps {
  onQuickAction: (actionId: string) => void;
  onToolToggle: (toolId: string) => void;
  onRecentFileOpen: (fileId: string) => void;
  onPopularCommandSelect: (commandId: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ onQuickAction, onToolToggle, onRecentFileOpen, onPopularCommandSelect }) => {
  const [metrics, setMetrics] = useState<{ts:number; model:string; input:number; output:number; latency:number}[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('wili.metrics');
      setMetrics(raw ? JSON.parse(raw) : []);
    } catch {}
    const id = setInterval(() => {
      try {
        const raw = localStorage.getItem('wili.metrics');
        setMetrics(raw ? JSON.parse(raw) : []);
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="w-full h-full bg-slate-950 border-l border-slate-900 flex flex-col p-5 text-slate-200 overflow-y-auto custom-scrollbar">
      
      {/* System Status */}
      <div className="mb-8">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">SYSTEM STATUS</div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold flex items-center gap-2"><Activity size={14} className="text-primary-500" /> CONTEXT MEMORY</span>
          </div>
          <div className="text-[10px] text-slate-400 mb-2 font-mono">Responses: {metrics.length}</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
            <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, metrics.length)}%` }}></div>
          </div>
          <div className="text-[10px] font-mono text-primary-400 tracking-tighter">Latest Latency: {metrics.length ? metrics[metrics.length-1].latency : 0}ms</div>
        </div>
      </div>

      {/* Active Tools */}
      <div className="mb-8">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">⚡ ACTIVE TOOLS</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'python', name: 'Python', icon: Code }, 
            { id: 'browser', name: 'Browser', icon: Globe }, 
            { id: 'dalle', name: 'DALL-E', icon: ImageIcon }, 
            { id: 'data', name: 'Data Analysis', icon: Database }, 
            { id: 'voice', name: 'Voice', icon: Mic }, 
            { id: 'web', name: 'Web Search', icon: Search }
          ].map((tool) => (
            <button key={tool.id} onClick={() => onToolToggle(tool.id)} className="bg-slate-900 border border-slate-800 p-2 rounded-lg flex items-center gap-2 hover:border-primary-500/50 transition-colors group cursor-pointer">
              <tool.icon size={12} className="text-slate-500 group-hover:text-primary-500" />
              <span className="text-[10px] font-medium text-slate-300">{tool.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">🚀 QUICK ACTIONS</div>
        <ul className="space-y-2">
          {[
            { id: 'summarize', label: 'Summarize Chat' },
            { id: 'export_pdf', label: 'Export to PDF' },
            { id: 'create_workflow', label: 'Create Workflow' },
            { id: 'generate_report', label: 'Generate Report' },
            { id: 'schedule_task', label: 'Schedule Task' }
          ].map(action => (
            <li key={action.id} onClick={() => onQuickAction(action.id)} className="text-xs text-slate-400 hover:text-white hover:bg-slate-900 p-2 rounded-lg cursor-pointer flex items-center gap-3 transition-colors">
              <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span> {action.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Files */}
      <div className="mb-8">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">📁 RECENT FILES</div>
        <div className="space-y-3">
          <button onClick={() => onRecentFileOpen('data_report.csv')} className="w-full flex items-center gap-3 p-2 hover:bg-slate-900 rounded-lg cursor-pointer group border border-transparent hover:border-slate-800 transition-all text-left">
             <div className="p-2 bg-blue-500/10 rounded text-blue-400 group-hover:bg-blue-500/20"><FileText size={16}/></div>
             <div className="overflow-hidden">
               <div className="text-xs font-medium text-slate-200 truncate">data_report.csv</div>
               <div className="text-[10px] text-slate-500">24 MB</div>
             </div>
          </button>
          <button onClick={() => onRecentFileOpen('screenshot_01.png')} className="w-full flex items-center gap-3 p-2 hover:bg-slate-900 rounded-lg cursor-pointer group border border-transparent hover:border-slate-800 transition-all text-left">
             <div className="p-2 bg-purple-500/10 rounded text-purple-400 group-hover:bg-purple-500/20"><ImageIcon size={16}/></div>
             <div className="overflow-hidden">
               <div className="text-xs font-medium text-slate-200 truncate">screenshot_01.png</div>
               <div className="text-[10px] text-slate-500">1.1 MB</div>
             </div>
          </button>
          <button onClick={() => onRecentFileOpen('presentation.pdf')} className="w-full flex items-center gap-3 p-2 hover:bg-slate-900 rounded-lg cursor-pointer group border border-transparent hover:border-slate-800 transition-all text-left">
             <div className="p-2 bg-red-500/10 rounded text-red-400 group-hover:bg-red-500/20"><FileText size={16}/></div>
             <div className="overflow-hidden">
               <div className="text-xs font-medium text-slate-200 truncate">presentation.pdf</div>
               <div className="text-[10px] text-slate-500">5.3 MB</div>
             </div>
          </button>
        </div>
      </div>

      {/* Popular Commands */}
      <div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">🔥 POPULAR COMMANDS</div>
        <div className="space-y-2 text-xs font-mono text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800">
          {metrics.slice(-5).reverse().map((m, i) => (
            <button key={i} onClick={() => onPopularCommandSelect('regenerate')} className="w-full flex justify-between text-left hover:bg-slate-800 p-2 rounded">
              <span>{new Date(m.ts).toLocaleTimeString()} • {m.model}</span>
              <span className="text-slate-600">{m.output} tok • {m.latency}ms</span>
            </button>
          ))}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button onClick={()=>onPopularCommandSelect('web_google')} className="px-2 py-1 bg-slate-800 rounded hover:bg-slate-700">/web</button>
            <button onClick={()=>onPopularCommandSelect('calc_demo')} className="px-2 py-1 bg-slate-800 rounded hover:bg-slate-700">/calc</button>
            <button onClick={()=>onPopularCommandSelect('fetch_demo')} className="px-2 py-1 bg-slate-800 rounded hover:bg-slate-700">/fetch</button>
          </div>
        </div>
      </div>

    </div>
  );
};
