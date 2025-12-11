import React, { useState } from 'react';
import { Persona, ModelType } from '../types';
import { DEFAULT_PERSONAS } from '../constants';
import { Save, RefreshCw, Cpu, BrainCircuit } from 'lucide-react';

interface BotBuilderProps {
  currentPersona: Persona;
  onUpdatePersona: (persona: Persona) => void;
}

export const BotBuilder: React.FC<BotBuilderProps> = ({ currentPersona, onUpdatePersona }) => {
  const [formData, setFormData] = useState<Persona>(currentPersona);
  const [dirty, setDirty] = useState(false);

  const handleChange = (field: keyof Persona, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    onUpdatePersona(formData);
    setDirty(false);
  };

  const handleReset = (presetId: string) => {
    const preset = DEFAULT_PERSONAS.find(p => p.id === presetId);
    if (preset) {
      setFormData(preset);
      setDirty(true);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 border-b border-slate-800 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Bot Studio</h1>
            <p className="text-slate-400">Configure the AI's personality, expertise, and reasoning model.</p>
          </div>
          {dirty && (
            <span className="text-amber-500 text-sm font-medium animate-pulse">
              Unsaved changes
            </span>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <label className="block text-sm font-medium text-slate-300 mb-2">System Instruction (The "Brain")</label>
              <p className="text-xs text-slate-500 mb-3">Define how the model should behave, what it knows, and its tone.</p>
              <textarea
                value={formData.systemInstruction}
                onChange={(e) => handleChange('systemInstruction', e.target.value)}
                className="w-full h-64 bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                placeholder="You are a helpful assistant..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <label className="block text-sm font-medium text-slate-300 mb-3">Persona Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
               <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <label className="block text-sm font-medium text-slate-300 mb-3">Model Engine</label>
                <select
                  value={formData.preferredModel}
                  onChange={(e) => handleChange('preferredModel', e.target.value as ModelType)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 appearance-none"
                >
                  <option value={ModelType.FLASH}>Gemini 2.5 Flash (Fast & Versatile)</option>
                  <option value={ModelType.PRO}>Gemini 3.0 Pro (High Reasoning/Coding)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={!dirty}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  dirty 
                  ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Save size={18} />
                Save Configuration
              </button>
            </div>
          </div>

          {/* Sidebar / Presets */}
          <div className="space-y-6">
             <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BrainCircuit size={20} className="text-purple-400" />
                  Quick Presets
                </h3>
                <div className="space-y-3">
                  {DEFAULT_PERSONAS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleReset(p.id)}
                      className={`w-full flex items-center p-3 rounded-lg border text-left transition-all ${
                        formData.id === p.id 
                          ? 'bg-primary-500/20 border-primary-500/50 text-primary-200' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      <div className="mr-3">
                         {p.preferredModel === ModelType.PRO ? <Cpu size={16} /> : <RefreshCw size={16} />}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{p.name}</div>
                        <div className="text-[10px] opacity-70 truncate max-w-[140px]">{p.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
             </div>

             <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-6 rounded-2xl border border-indigo-500/20">
                <h4 className="text-sm font-bold text-indigo-300 mb-2">Pro Tip</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Use <strong>Gemini 3.0 Pro</strong> for complex tasks like Refactoring Code, Financial Analysis, or Logic Puzzles. Use <strong>Flash</strong> for creative writing and quick chats.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
