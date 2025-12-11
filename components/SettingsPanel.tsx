import React, { useState } from 'react';
import { Key, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SettingsPanelProps {
    onBack: () => void;
    onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onBack, onShowToast }) => {
    const [googleKey, setGoogleKey] = useState(() => {
        try { return typeof window !== 'undefined' ? (localStorage.getItem('wili.googleKey') || "") : ""; } catch { return ""; }
    });
    const [msKey, setMsKey] = useState(() => {
        try { return typeof window !== 'undefined' ? (localStorage.getItem('wili.openrouterKey') || "") : ""; } catch { return ""; }
    });
    const [hfKey, setHfKey] = useState(() => {
        try { return typeof window !== 'undefined' ? (localStorage.getItem('wili.hfToken') || "") : ""; } catch { return ""; }
    });
    const [openaiKey, setOpenaiKey] = useState(() => {
        try { return typeof window !== 'undefined' ? (localStorage.getItem('wili.openaiKey') || "") : ""; } catch { return ""; }
    });

    const testGoogleKey = async () => {
        if (!googleKey) {
            onShowToast('Masukkan API Key terlebih dahulu!', 'error');
            return;
        }

        onShowToast('Sedang memeriksa kunci...', 'info');

        try {
            // Simple fetch to list models to check auth
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${googleKey}`);
            const data = await res.json();

            if (res.ok) {
                onShowToast('✅ API Key Valid! Token aktif.', 'success');
            } else {
                const errorMsg = data.error?.message || 'Unknown error';
                if (data.error?.code === 403 || errorMsg.includes('leaked') || errorMsg.includes('expired')) {
                    onShowToast('❌ Key Kadaluarsa / Bocor / Tidak Valid (403).', 'error');
                } else {
                    onShowToast(`❌ Gagal: ${errorMsg}`, 'error');
                }
            }
        } catch (e) {
            onShowToast('❌ Error jaringan / koneksi.', 'error');
        }
    };

    const handleSaveSettings = () => {
        try {
            localStorage.setItem('wili.googleKey', googleKey);
            localStorage.setItem('wili.openrouterKey', msKey);
            localStorage.setItem('wili.hfToken', hfKey);
            localStorage.setItem('wili.openaiKey', openaiKey);
            onShowToast('Pengaturan disimpan', 'success');
            onBack();
        } catch {
            onShowToast('Gagal menyimpan pengaturan', 'error');
        }
    };

    return (
        <div className="p-6 md:p-10 text-white max-w-4xl mx-auto overflow-y-auto h-full">
            <header className="mb-8 border-b border-slate-800 pb-4">
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Key className="text-primary-500" /> Pengaturan API Key
                </h2>
                <p className="text-slate-400">Kelola kunci akses untuk berbagai provider model AI.</p>
            </header>

            <div className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">Google Gemini API</h3>
                            <p className="text-xs text-slate-500">Required for all Gemini models (2.x & 3.x)</p>
                        </div>
                        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20">Connected</span>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={googleKey}
                            onChange={(e) => setGoogleKey(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-400 font-mono text-sm focus:outline-none focus:border-primary-500"
                            placeholder="Masukkan Gemini API Key Baru..."
                        />
                        <button
                            onClick={testGoogleKey}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 font-medium text-sm transition-colors"
                        >
                            Tes Token
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">OpenRouter API</h3>
                            <p className="text-xs text-slate-500">Optional - For OpenRouter models</p>
                        </div>
                        <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded border border-slate-700">Optional</span>
                    </div>
                    <input
                        type="password"
                        placeholder="Enter OpenRouter API Key..."
                        value={msKey}
                        onChange={(e) => setMsKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-700"
                    />
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">Hugging Face Token</h3>
                            <p className="text-xs text-slate-500">Optional - For HF models</p>
                        </div>
                        <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded border border-slate-700">Optional</span>
                    </div>
                    <input
                        type="password"
                        placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxx"
                        value={hfKey}
                        onChange={(e) => setHfKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-yellow-500 placeholder:text-slate-700"
                    />
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">OpenAI API Key</h3>
                            <p className="text-xs text-slate-500">Optional - For OpenAI GPT-4o/4o-mini</p>
                        </div>
                        <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded border border-slate-700">Optional</span>
                    </div>
                    <input
                        type="password"
                        placeholder="sk-..."
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-700"
                    />
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">Web Search Keys</h3>
                            <p className="text-xs text-slate-500">Optional - Serper (Google), Tavily, atau SerpAPI</p>
                        </div>
                        <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded border border-slate-700">Optional</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="VITE_GOOGLE_CSE_KEY"
                            onChange={(e) => { try { localStorage.setItem('wili.googleCseKey', e.target.value) } catch { } }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-green-500 placeholder:text-slate-700"
                        />
                        <input
                            type="text"
                            placeholder="Serper API Key (Recommended)"
                            onChange={(e) => { try { localStorage.setItem('wili.serperKey', e.target.value) } catch { } }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-green-500 placeholder:text-slate-700"
                        />
                        <input
                            type="text"
                            placeholder="Tavily API Key (AI Optimized)"
                            onChange={(e) => { try { localStorage.setItem('wili.tavilyKey', e.target.value) } catch { } }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-700"
                        />
                        <input
                            type="text"
                            placeholder="VITE_SERPAPI_KEY"
                            onChange={(e) => { try { localStorage.setItem('wili.serpapiKey', e.target.value) } catch { } }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-purple-500 placeholder:text-slate-700"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button onClick={handleSaveSettings} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 active:scale-95">
                        <Save size={18} /> Simpan Pengaturan
                    </button>
                </div>
            </div>
        </div>
    );
};
