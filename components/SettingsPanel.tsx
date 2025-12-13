import React, { useState, useEffect } from 'react';
import { ArrowLeft, Key, Save } from 'lucide-react';

interface SettingsPanelProps {
    onBack: () => void;
    onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onBack, onShowToast }) => {
    const [geminiKey, setGeminiKey] = useState('');
    const [openrouterKey, setOpenrouterKey] = useState('');
    const [openaiKey, setOpenaiKey] = useState('');
    const [hfToken, setHfToken] = useState('');

    useEffect(() => {
        try {
            setGeminiKey(localStorage.getItem('GEMINI_API_KEY') || '');
            setOpenrouterKey(localStorage.getItem('OPENROUTER_API_KEY') || '');
            setOpenaiKey(localStorage.getItem('OPENAI_API_KEY') || '');
            setHfToken(localStorage.getItem('HF_TOKEN') || '');
        } catch (error) {
            console.error('Failed to load API keys:', error);
        }
    }, []);

    const handleSave = () => {
        try {
            if (geminiKey) localStorage.setItem('GEMINI_API_KEY', geminiKey);
            if (openrouterKey) localStorage.setItem('OPENROUTER_API_KEY', openrouterKey);
            if (openaiKey) localStorage.setItem('OPENAI_API_KEY', openaiKey);
            if (hfToken) localStorage.setItem('HF_TOKEN', hfToken);

            onShowToast('Settings saved successfully', 'success');
        } catch (error) {
            onShowToast('Failed to save settings', 'error');
        }
    };

    return (
        <div className="h-full overflow-y-auto bg-[--bg-secondary] p-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted] transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-[--text-primary]">Settings</h1>
                </div>

                <div className="space-y-6">
                    <div className="bg-[--bg-primary] rounded-xl p-6 border border-[--border-primary]">
                        <h2 className="text-lg font-semibold text-[--text-primary] mb-4 flex items-center gap-2">
                            <Key size={20} />
                            API Keys
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                                    Google Gemini API Key
                                </label>
                                <input
                                    type="password"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="AIza..."
                                    className="w-full px-4 py-3 bg-[--bg-tertiary] border border-[--border-primary] rounded-lg text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--accent-primary] transition-colors"
                                />
                                <p className="mt-1 text-xs text-[--text-muted]">
                                    Get your key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[--accent-primary] hover:underline">Google AI Studio</a>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                                    OpenRouter API Key
                                </label>
                                <input
                                    type="password"
                                    value={openrouterKey}
                                    onChange={(e) => setOpenrouterKey(e.target.value)}
                                    placeholder="sk-or-..."
                                    className="w-full px-4 py-3 bg-[--bg-tertiary] border border-[--border-primary] rounded-lg text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--accent-primary] transition-colors"
                                />
                                <p className="mt-1 text-xs text-[--text-muted]">
                                    Get your key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-[--accent-primary] hover:underline">OpenRouter</a>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                                    OpenAI API Key
                                </label>
                                <input
                                    type="password"
                                    value={openaiKey}
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full px-4 py-3 bg-[--bg-tertiary] border border-[--border-primary] rounded-lg text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--accent-primary] transition-colors"
                                />
                                <p className="mt-1 text-xs text-[--text-muted]">
                                    Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[--accent-primary] hover:underline">OpenAI</a>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                                    HuggingFace Token
                                </label>
                                <input
                                    type="password"
                                    value={hfToken}
                                    onChange={(e) => setHfToken(e.target.value)}
                                    placeholder="hf_..."
                                    className="w-full px-4 py-3 bg-[--bg-tertiary] border border-[--border-primary] rounded-lg text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--accent-primary] transition-colors"
                                />
                                <p className="mt-1 text-xs text-[--text-muted]">
                                    Get your token from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-[--accent-primary] hover:underline">HuggingFace</a>
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            className="mt-6 w-full h-12 flex items-center justify-center gap-2 bg-[--accent-primary] hover:bg-[--accent-hover] text-white rounded-xl font-semibold transition-all active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Settings
                        </button>
                    </div>

                    <div className="bg-[--bg-primary] rounded-xl p-6 border border-[--border-primary]">
                        <h2 className="text-lg font-semibold text-[--text-primary] mb-4">
                            About
                        </h2>
                        <div className="space-y-2 text-sm text-[--text-secondary]">
                            <p><strong>Version:</strong> 2.0.0</p>
                            <p><strong>Build:</strong> Claude AI Style (December 2025)</p>
                            <p><strong>Status:</strong> <span className="text-[--accent-primary]">● Online</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};