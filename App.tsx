import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { BotBuilder } from './components/BotBuilder';
import { streamChatResponse } from './services/geminiService';
import { testOpenRouterModel } from './services/openrouterService';
import { testHFModel } from './services/hfService';
import { Message, Role, View, Persona, Attachment, ModelType } from './types';
import { DEFAULT_PERSONAS, FEATURE_CATEGORIES, AI_MODELS } from './constants';
import { v4 as uuidv4 } from 'uuid';
import { Key, Save } from 'lucide-react';
import { LoginPanel } from './components/LoginPanel';

import ArtifactsPanel from './components/ArtifactsPanel';
import ArtifactsSpace from './components/ArtifactsSpace';
import useArtifacts from './hooks/useArtifacts';
import { v4 as uuid } from 'uuid';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  isPinned?: boolean;
  isArchived?: boolean;
}

function App() {
  const [activeView, setActiveView] = useState<View>('chat');
  const [activeModel, setActiveModel] = useState<ModelType>(ModelType.FLASH);
  const [isInternetEnabled, setIsInternetEnabled] = useState(true);
  const [isMemoryEnabled, setIsMemoryEnabled] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stopRequested, setStopRequested] = useState(false);
  const [activePersona, setActivePersona] = useState<Persona>(DEFAULT_PERSONAS[0]);
  const [toasts, setToasts] = useState<{ id: string; text: string; type: 'success' | 'error' | 'info' }[]>([]);

  // Artifacts Management
  const {
    artifacts, selectedArtifact, isPanelOpen,
    addArtifact, updateArtifact, selectArtifact,
    togglePanel, closePanel, extractArtifactFromMessage
  } = useArtifacts();

  // Chat History Management
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');

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
  const [pyReady, setPyReady] = useState(false);
  const ensurePyodide = async (): Promise<any> => {
    if ((window as any).pyodide) return (window as any).pyodide;
    await new Promise<void>((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js';
      s.onload = () => resolve();
      document.head.appendChild(s);
    });
    const py = await (window as any).loadPyodide?.({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/' });
    (window as any).pyodide = py;
    setPyReady(true);
    return py;
  };

  // Load chat sessions on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wili.chatSessions');
      if (saved) {
        setChatSessions(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
    try {
      const params = new URLSearchParams(window.location.search);
      const share = params.get('share');
      if (share) {
        const json = decodeURIComponent(escape(atob(share)));
        const msgs = JSON.parse(json);
        if (Array.isArray(msgs)) {
          const id = uuidv4();
          setCurrentChatId(id);
          setMessages(msgs);
          try {
            const title = msgs.find((m: any) => m.role === 'user')?.text?.substring(0, 50) || 'Shared Chat';
            setChatSessions(prev => {
              const updated = [...prev, { id, title, messages: msgs, timestamp: Date.now() } as any];
              localStorage.setItem('wili.chatSessions', JSON.stringify(updated));
              return updated;
            });
          } catch { }
        }
      }
    } catch { }
  }, []);

  // Auto-save current chat
  useEffect(() => {
    if (messages.length > 0 && currentChatId) {
      const updateSession = () => {
        setChatSessions(prev => {
          const updated = prev.map(session =>
            session.id === currentChatId
              ? { ...session, messages, timestamp: Date.now() }
              : session
          );

          // If session doesn't exist, create it
          if (!updated.find(s => s.id === currentChatId)) {
            const title = messages[0]?.text.substring(0, 50) || 'New Chat';
            updated.push({
              id: currentChatId,
              title,
              messages,
              timestamp: Date.now()
            });
          }

          // Save to localStorage
          try {
            localStorage.setItem('wili.chatSessions', JSON.stringify(updated));
          } catch (error) {
            console.error('Failed to save chat sessions:', error);
          }

          return updated;
        });
      };

      // Debounce save
      const timeout = setTimeout(updateSession, 1000);
      return () => clearTimeout(timeout);
    }
  }, [messages, currentChatId]);

  // Sync chatSessions -> wili.chatHistory
  useEffect(() => {
    try {
      const mapped = (chatSessions || []).map((s: any) => ({
        id: s.id,
        title: s.title || (s.messages?.find((m: any) => m.role === 'user')?.text?.slice(0, 50) || 'Chat'),
        preview: String((s.messages || []).find((m: any) => m.role === 'user')?.text || (s.messages || [])[0]?.text || '')
          .slice(0, 80),
        timestamp: s.timestamp || Date.now(),
        isPinned: !!s.isPinned,
        isArchived: !!s.isArchived,
        folderId: s.folderId,
        tag: s.tag
      }));
      localStorage.setItem('wili.chatHistory', JSON.stringify(mapped));
    } catch { }
  }, [chatSessions]);

  const testGoogleKey = async () => {
    if (!googleKey) {
      const id = uuidv4();
      setToasts(prev => [...prev, { id, text: 'Masukkan API Key terlebih dahulu!', type: 'error' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
      return;
    }

    const loadId = uuidv4();
    setToasts(prev => [...prev, { id: loadId, text: 'Sedang memeriksa kunci...', type: 'info' }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== loadId)), 2000);

    try {
      // Simple fetch to list models to check auth
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${googleKey}`);
      const data = await res.json();

      if (res.ok) {
        const id = uuidv4();
        setToasts(prev => [...prev, { id, text: '✅ API Key Valid! Token aktif.', type: 'success' }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
      } else {
        const errorMsg = data.error?.message || 'Unknown error';
        const id = uuidv4();
        if (data.error?.code === 403 || errorMsg.includes('leaked') || errorMsg.includes('expired')) {
          setToasts(prev => [...prev, { id, text: '❌ Key Kadaluarsa / Bocor / Tidak Valid (403).', type: 'error' }]);
        } else {
          setToasts(prev => [...prev, { id, text: `❌ Gagal: ${errorMsg}`, type: 'error' }]);
        }
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
      }
    } catch (e) {
      const id = uuidv4();
      setToasts(prev => [...prev, { id, text: '❌ Error jaringan / koneksi.', type: 'error' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('wili.googleKey', googleKey);
      localStorage.setItem('wili.openrouterKey', msKey);
      localStorage.setItem('wili.hfToken', hfKey);
      localStorage.setItem('wili.openaiKey', openaiKey);
      setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: '✅ Pengaturan API disimpan.', timestamp: Date.now() }]);
      setActiveView('chat');
      const id = uuid();
      setToasts(prev => [...prev, { id, text: 'Pengaturan disimpan', type: 'success' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    } catch {
      setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: '❌ Gagal menyimpan pengaturan.', timestamp: Date.now(), isError: true }]);
      const id = uuid();
      setToasts(prev => [...prev, { id, text: 'Gagal menyimpan pengaturan', type: 'error' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }
  };

  const handleLoadChat = (chatId: string) => {
    const session = chatSessions.find(s => s.id === chatId);
    if (session) {
      setMessages(session.messages);
      setCurrentChatId(chatId);
      setActiveView('chat');
    }
  };

  const handleNewChat = () => {
    const newId = uuidv4();
    setMessages([]);
    setCurrentChatId(newId);
    setActiveView('chat');
  };

  const handleFeatureSelect = (featureId: string, featureLabel: string) => {
    console.log(`[WILI] Feature clicked: ${featureId} - ${featureLabel}`);
    setActiveView('chat');

    // Special Dashboard Commands
    if (featureId === 'help') {
      let categoryList = "### 📚 DAFTAR LENGKAP 1000+ FITUR WILI\n\n";
      let totalFeatures = 0;

      FEATURE_CATEGORIES.forEach(cat => {
        categoryList += `**${cat.label}** (${cat.items.length} fitur)\n`;
        cat.items.forEach(item => {
          categoryList += `- 🔹 ${item.label}\n`;
        });
        categoryList += "\n";
        totalFeatures += cat.items.length;
      });

      categoryList += `\n**Total: ${totalFeatures} Fitur Aktif** ✅\n\nKlik menu sidebar untuk mengakses setiap kategori.`;

      setMessages(prev => [...prev,
      { id: uuidv4(), role: Role.USER, text: "Tampilkan semua kategori fitur", timestamp: Date.now() },
      { id: uuidv4(), role: Role.MODEL, text: categoryList, timestamp: Date.now() }
      ]);
      return;
    }

    if (featureId === 'api-test') {
      setMessages(prev => [...prev, { id: uuidv4(), role: Role.USER, text: "/test_api_status", timestamp: Date.now() }]);
      (async () => {
        const lines: string[] = [];
        // Gemini test
        try {
          await streamChatResponse(
            ModelType.FLASH,
            [],
            'Ping',
            [],
            activePersona.systemInstruction,
            false,
            () => { },
            (stats) => { lines.push(`> ping_google_gemini... ${stats.latencyMs}ms ✅`); }
          );
        } catch (e: any) {
          lines.push(`> ping_google_gemini... ERROR ❌ (${e?.message || 'Key tidak valid'})`);
        }
        // OpenRouter test
        try {
          const s = await testOpenRouterModel(ModelType.LLAMA_3_3_70B);
          lines.push(`> ping_openrouter... ${s.latencyMs}ms ✅`);
        } catch (e: any) {
          lines.push(`> ping_openrouter... ERROR ❌ (${e?.message || 'Key tidak valid'})`);
        }
        // HuggingFace test
        try {
          const s2 = await testHFModel(ModelType.QWEN_2_5_72B_HF);
          lines.push(`> ping_huggingface... ${s2.latencyMs}ms ✅`);
        } catch (e: any) {
          lines.push(`> ping_huggingface... ERROR ❌ (${e?.message || 'Token tidak valid'})`);
        }
        // OpenAI test
        try {
          const { testOpenAIModel } = await import('./services/openaiService');
          const s3 = await testOpenAIModel(ModelType.OPENAI_GPT_4O_MINI);
          lines.push(`> ping_openai... ${s3.latencyMs}ms ✅`);
        } catch (e: any) {
          lines.push(`> ping_openai... ERROR ❌ (${e?.message || 'Key tidak valid'})`);
        }
        const terminalOutput = `\`\`\`bash
${lines.join('\n')}

STATUS: ONLINE ${lines.every(l => l.includes('✅')) ? '🟢' : '🟡'}
MODEL: ${activeModel}
INTERNET: ${isInternetEnabled ? 'ENABLED' : 'DISABLED'}
MEMORY: ${isMemoryEnabled ? 'ENABLED' : 'DISABLED'}
CHATS SAVED: ${chatSessions.length}
\`\`\`
**✅ Sistem Dicek**`;
        setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: terminalOutput, timestamp: Date.now() }]);
      })();
      return;
    }

    if (featureId === 'model-info') {
      const modelInfo = `### 🤖 MODEL AI AVAILABLE

**✅ VALID MODELS (Dec 2025):**

| Model | Provider | Status | Speed |
|:------|:---------|:-------|:------|
| Gemini 3 Pro | Google | ✅ Active | ⚡ Fast |
| Gemini 2.5 Pro | Google | ✅ Active | ⚡⚡ Very Fast |
| Gemini 2.5 Flash | Google | ✅ Active | ⚡⚡⚡ Ultra Fast |
| Gemini 2.5 Flash-Lite | Google | ✅ Active | ⚡⚡⚡ Ultra Fast |
| Gemini 2.0 Flash | Google | ✅ Active | ⚡⚡ Very Fast |

**❌ DEPRECATED:**
- Gemini 1.5 Pro (Retired April 2025)
- Gemini 1.5 Flash (Retired April 2025)

*Gunakan dropdown di toolbar untuk mengganti model.*`;

      setMessages(prev => [...prev,
      { id: uuidv4(), role: Role.USER, text: "/model_info", timestamp: Date.now() },
      { id: uuidv4(), role: Role.MODEL, text: modelInfo, timestamp: Date.now() }
      ]);
      return;
    }

    // Standard Feature Activation
    const prompt = `🎯 **MODE ACTIVATED: ${featureLabel}**

Saya sekarang dalam mode "${featureLabel}". 

Apa yang bisa saya bantu untuk Anda hari ini? Berikan detail atau pertanyaan spesifik yang ingin Anda kerjakan dengan fitur ini.

💡 **Tips:** Semakin detail informasi yang Anda berikan, semakin akurat hasil yang saya berikan.`;

    setMessages(prev => [...prev,
    { id: uuidv4(), role: Role.USER, text: `Aktifkan: ${featureLabel}`, timestamp: Date.now() },
    { id: uuidv4(), role: Role.MODEL, text: prompt, timestamp: Date.now() }
    ]);
  };

  const getLabelById = (id: string): string => {
    for (const cat of FEATURE_CATEGORIES) {
      if (cat.id === id) return cat.label;
      const found = cat.items.find(i => i.id === id);
      if (found) return found.label;
    }
    return id;
  };

  const handleFeatureLinkClick = (featureId: string) => {
    const label = getLabelById(featureId);
    handleFeatureSelect(featureId, label);
  };

  const handleQuickAction = (actionId: string) => {
    setActiveView('chat');
    if (actionId === 'summarize') {
      handleSendMessage('Ringkas percakapan ini menjadi poin-poin utama.', []);
      return;
    }
    if (actionId === 'export_pdf') {
      const md = '### Export PDF\n\nSimulasi ekspor PDF. Salin konten ini lalu cetak sebagai PDF.';
      setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() }]);
      return;
    }
    if (actionId === 'create_workflow') {
      const md = '### Workflow\n\n- Tujuan\n- Langkah 1\n- Langkah 2\n- Evaluasi';
      setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() }]);
      return;
    }
    if (actionId === 'generate_report') {
      const md = '### Report Template\n\nRingkasan\n\nTemuan\n\nRekomendasi';
      setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() }]);
      return;
    }
    if (actionId === 'schedule_task') {
      const md = '### Schedule Task\n\nMasukkan detail tugas dan waktu yang diinginkan.';
      setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() }]);
      return;
    }
  };

  const handleToolToggle = (toolId: string) => {
    setActiveView('chat');
    if (toolId === 'python') {
      ensurePyodide().then(() => {
        const id = uuid();
        setToasts(prev => [...prev, { id, text: 'Python aktif', type: 'success' }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
      });
      return;
    }
    if (toolId === 'browser') {
      setIsInternetEnabled(true);
      const id = uuid();
      setToasts(prev => [...prev, { id, text: 'Web ON', type: 'success' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
      return;
    }
    if (toolId === 'dalle') {
      try { localStorage.setItem('wili.tools.imagegen', 'true'); } catch { }
      const id = uuid();
      setToasts(prev => [...prev, { id, text: 'Image Gen aktif', type: 'success' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
      return;
    }
    if (toolId === 'data') {
      try { localStorage.setItem('wili.tools.data', 'true'); } catch { }
      const id = uuid();
      setToasts(prev => [...prev, { id, text: 'Data Analysis aktif', type: 'success' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
      return;
    }
    if (toolId === 'voice') {
      const next = localStorage.getItem('wili.tts.enabled') === 'true' ? 'false' : 'true';
      try { localStorage.setItem('wili.tts.enabled', next); } catch { }
      const id = uuid();
      setToasts(prev => [...prev, { id, text: next === 'true' ? 'Voice Out ON' : 'Voice Out OFF', type: 'info' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
      return;
    }
    if (toolId === 'web') {
      setIsInternetEnabled(true);
      const id = uuid();
      setToasts(prev => [...prev, { id, text: 'Web Search aktif', type: 'success' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
      return;
    }
  };

  const handleRecentFileOpen = (fileId: string) => {
    setActiveView('chat');
    if (fileId === 'data_report.csv') {
      const csv = 'a,b,c\n1,2,3\n4,5,6\n7,8,9';
      const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
      const headers = lines[0].split(',');
      const rows = lines.slice(1).map(l => l.split(','));
      const numericIdx = headers.map((h, idx) => ({ idx, isNum: rows.every(r => !isNaN(parseFloat(r[idx] || ''))) }));
      const stats = numericIdx.filter(n => n.isNum).map(n => {
        const vals = rows.map(r => parseFloat(r[n.idx] || '0'));
        const sum = vals.reduce((a, b) => a + b, 0);
        const mean = vals.length ? sum / vals.length : 0;
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        return { col: headers[n.idx], count: vals.length, mean, min, max };
      });
      let md = '### 📁 data_report.csv\n\n| Kolom | Count | Mean | Min | Max |\n|:------|------:|-----:|-----:|-----:|\n';
      stats.forEach(s => { md += `| ${s.col} | ${s.count} | ${s.mean.toFixed(4)} | ${s.min} | ${s.max} |\n`; });
      setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() }]);
      return;
    }
    if (fileId === 'screenshot_01.png') {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='#0f172a'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#38bdf8' font-size='16' font-family='monospace'>screenshot_01.png</text></svg>`;
      const url = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
      const md = `![Preview](${url})\n\nFile dibuka (demo).`;
      setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() }]);
      return;
    }
    if (fileId === 'presentation.pdf') {
      const md = '### 📄 presentation.pdf\n\nPratinjau tidak tersedia. Gunakan perintah /fetch <url> untuk mengambil konten web.';
      setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() }]);
      return;
    }
  };

  const handlePopularCommandSelect = (commandId: string) => {
    setActiveView('chat');
    if (commandId === 'regenerate') {
      const before = [...messages].reverse();
      const lastUser = before.find(m => m.role === Role.USER);
      if (lastUser) handleSendMessage(lastUser.text, []);
      return;
    }
    if (commandId === 'web_google') {
      handleSendMessage('/web Indonesia', []);
      return;
    }
    if (commandId === 'calc_demo') {
      handleSendMessage('/calc 2+2', []);
      return;
    }
    if (commandId === 'fetch_demo') {
      handleSendMessage('/fetch https://example.com', []);
      return;
    }
  };

  const handleModelChange = async (model: ModelType) => {
    setActiveModel(model);
    const name = AI_MODELS.flatMap(g => g.models).find(m => m.id === model)?.name || String(model);
    setMessages(prev => [...prev, { id: uuidv4(), role: Role.USER, text: `/test_model ${name}`, timestamp: Date.now() }]);

    try {
      if (model === ModelType.THINK_DEEPER) {
        try { localStorage.setItem('wili.gen.temperature', '0.2'); localStorage.setItem('wili.gen.top_p', '0.95'); localStorage.setItem('wili.gen.max_tokens', '4096'); } catch { }
      }
      if (model === ModelType.QUICK_RESPONSE) {
        try { localStorage.setItem('wili.gen.temperature', '0.8'); localStorage.setItem('wili.gen.top_p', '0.9'); localStorage.setItem('wili.gen.max_tokens', '1024'); } catch { }
      }
      if (String(model).startsWith('openrouter:')) {
        const stats = await testOpenRouterModel(model);
        setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `✅ Model ${name} online via OpenRouter. Latency ${stats.latencyMs}ms.`, timestamp: Date.now() }]);
        const id = uuid();
        setToasts(prev => [...prev, { id, text: `Model ${name} online`, type: 'success' }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
      } else {
        await streamChatResponse(
          model,
          messages,
          'Ping',
          [],
          activePersona.systemInstruction,
          isInternetEnabled,
          () => { },
          (stats) => {
            setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `✅ Model ${name} online. Latency ${stats.latencyMs}ms.`, timestamp: Date.now() }]);
            const id = uuid();
            setToasts(prev => [...prev, { id, text: `Model ${name} online`, type: 'success' }]);
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
          },
          () => stopRequested
        );
      }
    } catch (err: any) {
      const msg = err?.message || 'API error';
      setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `⚠️ ${msg}`, timestamp: Date.now(), isError: true }]);
      const id = uuid();
      setToasts(prev => [...prev, { id, text: msg, type: 'error' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }
  };

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    // Create new chat if needed
    if (!currentChatId) {
      setCurrentChatId(uuidv4());
    }

    // Moderation & Rate limit
    try {
      const { canProceed } = await import('./services/rateLimitService');
      if (!canProceed('chat', 40, 60_000)) {
        setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: '⚠️ Rate limit tercapai. Coba lagi nanti.', timestamp: Date.now(), isError: true }]);
        return;
      }
    } catch { }
    try {
      const { moderateText } = await import('./services/moderationService');
      const mod = moderateText(text);
      if (!mod.ok) {
        setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `⚠️ ${mod.reason}`, timestamp: Date.now(), isError: true }]);
        return;
      }
      const { checkPolicy } = await import('./services/policyService');
      const issues = checkPolicy(text);
      if (issues.length) {
        const md = `### ⚖️ Kebijakan\n\n${issues.map(i => `- [${i.category}] ${i.message}`).join('\n')}`;
        setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now(), isError: true }]);
        return;
      }
    } catch { }

    // Quick Commands
    if (text.startsWith('/')) {
      const cmd = text.toLowerCase().trim();
      if (cmd === '/help') { handleFeatureSelect('help', 'Help'); return; }
      if (cmd === '/models') { handleFeatureSelect('model-info', 'Model Info'); return; }
      if (cmd === '/test') { handleFeatureSelect('api-test', 'API Test'); return; }
      if (cmd.startsWith('/login')) {
        try { const name = text.replace(/^\/login\s*/i, '').trim() || 'user'; const { login } = await import('./services/authService'); const u = login(name); setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `✅ Login sebagai ${u.name}`, timestamp: Date.now() }]); } catch { }
        return;
      }
      if (cmd === '/logout') { try { const { logout } = await import('./services/authService'); logout(); setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `✅ Logout`, timestamp: Date.now() }]); } catch { } return; }
      if (cmd.startsWith('/workspace')) { try { const name = text.replace(/^\/workspace\s*/i, '').trim() || 'default'; const { setWorkspace } = await import('./services/workspaceService'); setWorkspace(name); setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `📁 Workspace aktif: ${name}`, timestamp: Date.now() }]); } catch { } return; }
      if (cmd.startsWith('/context_add')) { try { const payload = text.replace(/^\/context_add\s*/i, ''); const { saveDocument } = await import('./services/memoryService'); saveDocument({ id: `ctx-${Date.now()}`, title: 'Context', text: payload }); setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: '✅ Context disimpan', timestamp: Date.now() }]); } catch { } return; }
      if (cmd === '/context_list') { try { const { listDocuments } = await import('./services/memoryService'); const arr = listDocuments(); const md = arr.slice(-10).map(d => `- ${d.title}`).join('\n') || 'Tidak ada context'; setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `### Context\n\n${md}`, timestamp: Date.now() }]); } catch { } return; }
      if (cmd === '/context_clear') { try { localStorage.removeItem('wili.memory.docs'); setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: '✅ Context dihapus', timestamp: Date.now() }]); } catch { } return; }
      if (cmd.startsWith('/prompt')) { try { const name = text.replace(/^\/prompt\s*/i, '').trim(); const { getTemplates } = await import('./services/templates'); const t = getTemplates()[name] || 'Template tidak ditemukan'; setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: t, timestamp: Date.now() }]); } catch { } return; }
      if (cmd.startsWith('/sandbox')) { try { const code = text.replace(/^\/sandbox\s*/i, ''); const { runSandbox } = await import('./services/codeSandboxService'); const out = await runSandbox(code, 1500); setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `### ▶️ Sandbox\n\n${'```'}text\n${out}\n${'```'}`, timestamp: Date.now() }]); } catch (e: any) { setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `⚠️ Sandbox error: ${e?.message || 'error'}`, timestamp: Date.now(), isError: true }]); } return; }
      if (cmd.startsWith('/eda')) {
        try {
          const csvAtt = attachments.find(a => (a.mimeType || '').includes('csv') || (a.name || '').toLowerCase().endsWith('.csv'));
          if (!csvAtt) {
            setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: '⚠️ Tidak ada file CSV terlampir untuk EDA.', timestamp: Date.now(), isError: true }]);
            return;
          }
          const csv = decodeURIComponent(escape(atob(csvAtt.data)));
          const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
          const headers = lines[0].split(',');
          const rows = lines.slice(1).map(l => l.split(','));
          const numericIdx = headers.map((h, idx) => ({ idx, isNum: rows.every(r => !isNaN(parseFloat(r[idx] || ''))) }));
          const stats = numericIdx.filter(n => n.isNum).map(n => {
            const vals = rows.map(r => parseFloat(r[n.idx] || '0'));
            const sum = vals.reduce((a, b) => a + b, 0);
            const mean = vals.length ? sum / vals.length : 0;
            const min = Math.min(...vals);
            const max = Math.max(...vals);
            return { col: headers[n.idx], count: vals.length, mean, min, max };
          });
          let md = `### 📊 EDA Lokal (CSV)\n\nKolom: ${headers.length} • Baris: ${rows.length}\n\n| Kolom | Count | Mean | Min | Max |\n|:------|------:|-----:|-----:|-----:|\n`;
          stats.forEach(s => { md += `| ${s.col} | ${s.count} | ${s.mean.toFixed(4)} | ${s.min} | ${s.max} |\n`; });
          md += `\n#### Bar Chart (Top 5 by Mean)\n`;
          const top = stats.sort((a, b) => b.mean - a.mean).slice(0, 5);
          top.forEach(s => { md += `- ${s.col}: ` + '█'.repeat(Math.max(1, Math.round(s.mean))) + ` (${s.mean.toFixed(2)})\n`; });
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() }]);
          return;
        } catch (e: any) {
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `⚠️ EDA gagal: ${e?.message || 'error'}`, timestamp: Date.now(), isError: true }]);
          return;
        }
      }
      if (cmd.startsWith('/py')) {
        try {
          const code = text.replace(/^\/py\s*/i, '');
          const py = await ensurePyodide();
          let output = '';
          if (!code && attachments.length) {
            const csvAtt = attachments.find(a => (a.mimeType || '').includes('csv') || (a.name || '').toLowerCase().endsWith('.csv'));
            if (csvAtt) {
              const csv = decodeURIComponent(escape(atob(csvAtt.data)));
              py.globals.set('csv_data', csv);
              const edaCode = `import io,csv\nlines=list(csv.reader(io.StringIO(csv_data)))\nheaders=lines[0]\nrows=lines[1:]\nfrom statistics import mean\nnums=[]\nfor j,h in enumerate(headers):\n    try:\n        vals=[float(r[j]) for r in rows]\n        nums.append((h,len(vals),min(vals),max(vals),mean(vals)))\n    except:\n        pass\nprint('Headers:',len(headers),'Rows:',len(rows))\nprint('\n'.join([f"{n[0]} count={n[1]} min={n[2]} max={n[3]} mean={n[4]:.4f}" for n in nums]))`;
              output = String(py.runPython(edaCode));
            } else {
              output = 'Tidak ada kode atau CSV untuk dijalankan.';
            }
          } else {
            output = String(py.runPython(code || '1+1'));
          }
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `### ▶️ Python Output\n\n${'```'}text\n${output}\n${'```'}`, timestamp: Date.now() }]);
          return;
        } catch (e: any) {
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `⚠️ Python error: ${e?.message || 'runtime error'}`, timestamp: Date.now(), isError: true }]);
          return;
        }
      }
      if (cmd === '/plan') {
        const md = '### 🧭 Rencana Kerja\n\n- Tujuan\n- Langkah-langkah\n- Eksekusi\n- Evaluasi';
        setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() }]);
        return;
      }
      if (cmd === '/templates') {
        const md = '### 📚 Template Prompt\n\n- Coding Helper\n- Data Analysis\n- Research Summary\n- Bug Fix\n- Creative Writing';
        setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() }]);
        return;
      }
      if (cmd.startsWith('/mcp_connect')) {
        try {
          const url = text.replace(/^\/mcp_connect\s*/i, '').trim();
          const { connectMCP } = await import('./services/mcpService');
          const st = await connectMCP(url);
          const msg = st.connected ? `✅ MCP terhubung: ${st.url}` : `⚠️ MCP gagal: ${st.message}`;
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: msg, timestamp: Date.now(), isError: !st.connected }]);
        } catch (e: any) {
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `⚠️ MCP error: ${e?.message || 'error'}`, timestamp: Date.now(), isError: true }]);
        }
        return;
      }
      if (cmd.startsWith('/planrun')) {
        try {
          const goal = text.replace(/^\/planrun\s*/i, '').trim();
          const { planAndRun } = await import('./services/plannerService');
          const out = await planAndRun(goal || 'Cari informasi');
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: out, timestamp: Date.now() }]);
        } catch (e: any) {
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `⚠️ Planner error: ${e?.message || 'error'}`, timestamp: Date.now(), isError: true }]);
        }
        return;
      }
      if (cmd.startsWith('/assist')) {
        try {
          const code = text.replace(/^\/assist\s*/i, '');
          const suggestions = [] as string[];
          if (/console\.log/.test(code)) suggestions.push('Gunakan logger terstruktur alih-alih console.log');
          if (/var\s+/.test(code)) suggestions.push('Ganti var dengan let/const');
          if (!/try\s*\{/.test(code) && /fetch\(/.test(code)) suggestions.push('Tambahkan try/catch di pemanggilan fetch');
          const md = suggestions.length ? `### 💡 Saran Kode\n\n- ${suggestions.join('\n- ')}` : 'Tidak ada saran khusus.';
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() }]);
        } catch { }
        return;
      }
      if (cmd.startsWith('/testgen')) {
        try {
          const code = text.replace(/^\/testgen\s*/i, '');
          const funcs = Array.from(code.matchAll(/function\s+(\w+)\s*\(([^)]*)\)/g)).map(m => ({ name: m[1], args: (m[2] || '').split(',').map(s => s.trim()).filter(Boolean) }));
          const cases = funcs.slice(0, 5).map(f => `- ${f.name}(${f.args.join(', ')}) → hasil yang diharapkan`);
          const md = cases.length ? `### 🧪 Test Cases\n\n${cases.join('\n')}` : 'Tidak ada fungsi terdeteksi.';
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() }]);
        } catch { }
        return;
      }
      if (cmd.startsWith('/live')) {
        try {
          const mode = text.replace(/^\/live\s*/i, '').trim().toLowerCase();
          const on = mode !== 'off';
          localStorage.setItem('wili.live', String(on));
          const msg = on ? '🎥🎙️ Live mode aktif. Gunakan Camera Preview dan mic.' : '⏹️ Live mode nonaktif.';
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: msg, timestamp: Date.now() }]);
        } catch { }
        return;
      }
      if (cmd.startsWith('/collab_join')) {
        try {
          const name = text.replace(/^\/collab_join\s*/i, '').trim() || 'default';
          const user = (localStorage.getItem('wili.auth.user') && JSON.parse(localStorage.getItem('wili.auth.user') || '{}')?.name) || 'user';
          const { joinChannel } = await import('./services/collabService');
          joinChannel(name, user);
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `👥 Bergabung ke channel ${name} sebagai ${user}`, timestamp: Date.now() }]);
        } catch { }
        return;
      }
      if (cmd.startsWith('/presence')) {
        try {
          const name = text.replace(/^\/presence\s*/i, '').trim() || 'default';
          const { listPresence } = await import('./services/collabService');
          const arr = listPresence(name).slice(-10);
          const md = arr.length ? arr.map(p => `- ${p.user} @ ${new Date(p.ts).toLocaleTimeString()}`).join('\n') : 'Tidak ada presence';
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `### Presence (${name})\n\n${md}`, timestamp: Date.now() }]);
        } catch { }
        return;
      }
      if (cmd === '/dashboard') {
        try {
          const metricsRaw = localStorage.getItem('wili.metrics');
          const metrics = metricsRaw ? JSON.parse(metricsRaw) : [];
          const byModel: Record<string, { input: number; output: number; calls: number; latency: number[] }> = {};
          metrics.forEach((m: any) => { byModel[m.model] = byModel[m.model] || { input: 0, output: 0, calls: 0, latency: [] }; byModel[m.model].input += m.input || 0; byModel[m.model].output += m.output || 0; byModel[m.model].calls += 1; byModel[m.model].latency.push(m.latency || 0); });
          const lines = Object.keys(byModel).slice(0, 12).map(k => { const v = byModel[k]; const avg = v.latency.length ? Math.round(v.latency.reduce((a, b) => a + b, 0) / v.latency.length) : 0; return `- ${k}: calls=${v.calls} in=${v.input} out=${v.output} avgLatency=${avg}ms`; });
          const { listUsage } = await import('./services/auditService');
          const au = listUsage();
          const byProv: Record<string, number> = {};
          au.forEach(a => { byProv[a.provider] = (byProv[a.provider] || 0) + (a.cost || 0); });
          const costLines = Object.keys(byProv).map(k => `- ${k}: $${byProv[k].toFixed(4)}`);
          const errByProv: Record<string, number> = {};
          au.forEach(a => { if (a.error) errByProv[a.provider] = (errByProv[a.provider] || 0) + 1; });
          const errLines = Object.keys(errByProv).map(k => `- ${k}: ${errByProv[k]} errors`);
          const md = `### 📊 Dashboard\n\n**Models**\n${lines.join('\n')}\n\n**Cost by Provider**\n${costLines.join('\n') || '- n/a'}\n\n**Errors by Provider**\n${errLines.join('\n') || '- n/a'}`;
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() }]);
        } catch { }
        return;
      }
      if (cmd === '/audit_show') {
        try {
          const { listUsage } = await import('./services/auditService');
          const arr = listUsage().slice(-20).reverse();
          const md = arr.length ? arr.map(a => `- ${a.provider}/${a.model}: in=${a.input || 0} out=${a.output || 0} cost=${a.cost || 0} latency=${a.latency || 0}ms`).join('\n') : 'Tidak ada audit';
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `### Audit Usage\n\n${md}`, timestamp: Date.now() }]);
        } catch { }
        return;
      }
      if (cmd.startsWith('/call')) {
        try {
          const json = text.replace(/^\/call\s*/i, '').trim();
          const obj = JSON.parse(json || '{}');
          const name = String(obj.name || '');
          const args = obj.args || {};
          const { runTool } = await import('./services/toolRegistry');
          const out = await runTool(name, args);
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: out, timestamp: Date.now() }]);
          return;
        } catch (e: any) {
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `⚠️ Tool call gagal: ${e?.message || 'error'}`, timestamp: Date.now(), isError: true }]);
          return;
        }
      }
      if (cmd.startsWith('/web')) {
        try {
          const q = text.replace(/^\/web\s*/i, '') || 'Indonesia';
          const { searchWeb } = await import('./services/webSearch');
          const items = await searchWeb(q, 5);
          const md = items.length ? items.map((it: any) => `- [${it.title}](${it.link}) — ${it.source}`).join('\n') : 'Tidak ada hasil';
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `### 🔎 Hasil Web\n\n${md}`, timestamp: Date.now() }]);
          return;
        } catch (e: any) {
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `⚠️ Web search gagal: ${e?.message || 'error'}`, timestamp: Date.now(), isError: true }]);
          return;
        }
      }
      if (cmd.startsWith('/calc')) {
        try {
          const expr = text.replace(/^\/calc\s*/i, '').trim();
          if (!expr) throw new Error('Ekspresi kosong');
          if (!/^[-+/*().0-9^\s]+$/.test(expr)) throw new Error('Hanya angka dan operator sederhana');
          const result = Function(`return (${expr.replace(/\^/g, '**')})`)();
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `### 🧮 Kalkulator\n\n${expr} = **${result}**`, timestamp: Date.now() }]);
          return;
        } catch (e: any) {
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `⚠️ Kalkulator gagal: ${e?.message || 'error'}`, timestamp: Date.now(), isError: true }]);
          return;
        }
      }
      if (cmd.startsWith('/fetch')) {
        try {
          const url = text.replace(/^\/fetch\s*/i, '').trim();
          if (!/^https?:\/\//.test(url)) throw new Error('Masukkan URL lengkap');
          const r = await fetch(`https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`);
          if (!r.ok) throw new Error('Fetch gagal');
          const body = await r.text();
          const snippet = body.slice(0, 1200);
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `### 📥 Fetch\n\nSumber: ${url}\n\n${snippet}`, timestamp: Date.now() }]);
          return;
        } catch (e: any) {
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `⚠️ Fetch gagal: ${e?.message || 'error'}`, timestamp: Date.now(), isError: true }]);
          return;
        }
      }
      if (cmd.startsWith('/image')) {
        try {
          const enabled = localStorage.getItem('wili.tools.imagegen') === 'true';
          if (!enabled) {
            setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: '⚠️ Image Gen belum diaktifkan di Tools.', timestamp: Date.now(), isError: true }]);
            return;
          }
          const prompt = text.replace(/^\/image\s*/i, '') || 'WILI';
          const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='512' height='320'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0' stop-color='#0ea5e9'/><stop offset='1' stop-color='#7c3aed'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='28' font-family='monospace'>${prompt.replace(/[<>]/g, '')}</text></svg>`;
          const url = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
          const md = `![Image](${url})\n\nPrompt: ${prompt}`;
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() }]);
          return;
        } catch (e: any) {
          setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: `⚠️ Image Gen gagal: ${e?.message || 'error'}`, timestamp: Date.now(), isError: true }]);
          return;
        }
      }
    }

    const userMsg: Message = {
      id: uuidv4(),
      role: Role.USER,
      text: text,
      timestamp: Date.now(),
      attachments: attachments
    };

    const historyToSend = isMemoryEnabled ? messages : [];
    setMessages(prev => [...prev, userMsg]);

    const toolOutputs: Message[] = [];

    // URL detection
    const hasUrl = /(https?:\/\/\S+)/i.test(text);

    // Math detection
    const looksMath = /^\s*[-+/*().0-9^\s]+$/.test(text) && /[0-9]/.test(text);

    // IMPROVED: Web search detection (lebih agresif)
    const wantsSearch = /\b(cari|search|apa itu|siapa|kapan|di mana|dimana|bagaimana|kenapa|mengapa|info|berita|news|latest|terbaru|update|who|what|when|where|why|how|president|presiden|pemimpin|ceo|chairman)\b/i.test(text);

    // NEW: Live data detection
    const needsLiveData = /\b(harga|price|kurs|rate|saham|stock|crypto|bitcoin|btc|ethereum|eth|cuaca|weather|temperature|suhu|exchange|convert)\b/i.test(text);

    // NEW: Check if it's a general knowledge question that should search first
    const isQuestion = /^(apa|siapa|kapan|di mana|dimana|bagaimana|kenapa|mengapa|berapa|what|who|when|where|why|how|how much|how many)\b/i.test(text.trim());

    // Force search for questions about current events/people
    const shouldForceSearch = isQuestion || wantsSearch || /\b(saat ini|sekarang|hari ini|today|current|now)\b/i.test(text);
    const hasDocs = attachments.some(a => /application\/(pdf|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/.test(a.mimeType || '') || (a.name || '').match(/\.(pdf|docx|txt|md)$/i));

    // ═══════════════════════════════════════════════════════════
    // PRIORITY 1: Live Data (Crypto, Stocks, Weather, Currency)
    // ═══════════════════════════════════════════════════════════
    if (needsLiveData) {
      try {
        const { autoFetchLiveData } = await import('./services/liveData');
        const liveResult = await autoFetchLiveData(text);

        if (liveResult && liveResult.success) {
          let liveDataMsg = `### 📊 Data Real-Time\n\n`;

          // Crypto
          if (liveResult.symbol && liveResult.coinId) {
            liveDataMsg += `**${liveResult.symbol}** (${liveResult.coinId})\n`;
            liveDataMsg += `💰 **Harga:** ${liveResult.formatted}\n`;
            liveDataMsg += `📈 **Perubahan 24j:** ${liveResult.change24h}%\n`;
            if (liveResult.marketCap) {
              liveDataMsg += `📊 **Market Cap:** ${liveResult.currency} ${liveResult.marketCap.toLocaleString()}\n`;
            }
            if (liveResult.volume24h) {
              liveDataMsg += `💹 **Volume 24j:** ${liveResult.currency} ${liveResult.volume24h.toLocaleString()}\n`;
            }
            liveDataMsg += `\n🕐 **Update:** ${new Date(liveResult.timestamp).toLocaleString('id-ID')}\n`;
            liveDataMsg += `\n*Sumber: CoinGecko API*`;
          }
          // Stock
          else if (liveResult.name) {
            liveDataMsg += `**${liveResult.name}** (${liveResult.symbol})\n`;
            liveDataMsg += `💰 **Harga:** ${liveResult.formatted}\n`;
            liveDataMsg += `📈 **Perubahan:** ${liveResult.change} (${liveResult.changePercent}%)\n`;
            liveDataMsg += `📊 **Open:** ${liveResult.open} | **High:** ${liveResult.high} | **Low:** ${liveResult.low}\n`;
            liveDataMsg += `💹 **Volume:** ${liveResult.volume.toLocaleString()}\n`;
            liveDataMsg += `\n🕐 **Update:** ${new Date(liveResult.timestamp).toLocaleString('id-ID')}\n`;
            liveDataMsg += `\n*Sumber: Yahoo Finance*`;
          }
          // Weather
          else if (liveResult.city) {
            liveDataMsg += `**${liveResult.city}, ${liveResult.country}**\n`;
            liveDataMsg += `🌡️ **Suhu:** ${liveResult.temperature}°C\n`;
            liveDataMsg += `☁️ **Kondisi:** ${liveResult.weatherDescription}\n`;
            liveDataMsg += `📈 **Max:** ${liveResult.tempMax}°C | 📉 **Min:** ${liveResult.tempMin}°C\n`;
            liveDataMsg += `💨 **Angin:** ${liveResult.windSpeed} km/h\n`;
            liveDataMsg += `🌧️ **Presipitasi:** ${liveResult.precipitation} mm\n`;
            liveDataMsg += `\n🕐 **Update:** ${new Date(liveResult.timestamp).toLocaleString('id-ID')}\n`;
            liveDataMsg += `\n*Sumber: Open-Meteo*`;
          }
          // Currency
          else if (liveResult.from && liveResult.to) {
            liveDataMsg += `💱 **Kurs ${liveResult.from}/${liveResult.to}**\n`;
            liveDataMsg += `📊 ${liveResult.formatted}\n`;
            liveDataMsg += `\n🕐 **Update:** ${liveResult.timestamp}\n`;
            liveDataMsg += `\n*Sumber: ExchangeRate-API*`;
          }

          toolOutputs.push({
            id: uuidv4(),
            role: Role.MODEL,
            text: liveDataMsg,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('Live data fetch error:', error);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // PRIORITY 2: Web Search (Force for current events/people)
    // ═══════════════════════════════════════════════════════════
    if (isInternetEnabled && shouldForceSearch && !needsLiveData) {
      try {
        const { searchWeb } = await import('./services/webSearch');
        const items = await searchWeb(text, 5);

        if (items && items.length > 0 && items[0].title !== 'Pencarian Gagal') {
          const md = `### 🔎 Hasil Pencarian Web\n\n` +
            items.map((it: any, idx: number) =>
              `${idx + 1}. **[${it.title}](${it.link})**\n   ${it.snippet}\n   *Sumber: ${it.source}*`
            ).join('\n\n');

          toolOutputs.push({
            id: uuidv4(),
            role: Role.MODEL,
            text: md,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('Web search error:', error);
      }
    }

    if (isInternetEnabled && hasUrl) {
      try {
        const url = (text.match(/https?:\/\/\S+/i) || [])[0] || '';
        const r = await fetch(`https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`);
        if (r.ok) {
          const body = await r.text();
          const snippet = body.slice(0, 1000);
          toolOutputs.push({ id: uuidv4(), role: Role.MODEL, text: `### 📥 Fetch (Auto)\n\nSumber: ${url}\n\n${snippet}`, timestamp: Date.now() });
        }
      } catch { }
    }
    if (looksMath) {
      try {
        const result = Function(`return (${text.replace(/\^/g, '**')})`)();
        toolOutputs.push({ id: uuidv4(), role: Role.MODEL, text: `### 🧮 Hasil (Auto)\n\n${text} = **${result}**`, timestamp: Date.now() });
      } catch { }
    }
    if (isInternetEnabled && wantsSearch) {
      try {
        const { searchWeb } = await import('./services/webSearch');
        const items = await searchWeb(text, 5);
        const md = items.length ? items.map((it: any) => `- [${it.title}](${it.link}) — ${it.source}`).join('\n') : 'Tidak ada hasil';
        toolOutputs.push({ id: uuidv4(), role: Role.MODEL, text: `### 🔎 Hasil Web (Auto)\n\n${md}`, timestamp: Date.now() });
      } catch { }
    }
    if (hasDocs) {
      try {
        const docs = attachments.filter(a => a.type === 'file' || a.type === 'image');
        for (const d of docs) {
          const raw = decodeURIComponent(escape(atob(d.data)));
          const textOnly = raw.replace(/[^\x20-\x7E\n\r]/g, '');
          const chunks: string[] = [];
          for (let i = 0; i < textOnly.length; i += 800) { chunks.push(textOnly.slice(i, i + 800)); }
          const title = d.name || d.mimeType || 'document';
          try {
            const { embedText } = await import('./services/embeddingsService');
            const { saveDocument } = await import('./services/memoryService');
            const emb = await embedText(textOnly.slice(0, 4096));
            saveDocument({ id: `att-${Date.now()}-${title}`, title, text: textOnly, uri: `local://attachment/${encodeURIComponent(title)}`, embedding: emb });
          } catch { }
          try {
            const { parsePDF, parseDOCX, parseImageOCR } = await import('./services/docParserService');
            let parsed = '';
            if ((d.mimeType || '').includes('pdf') || /\.pdf$/i.test(title)) parsed = await parsePDF(d.data);
            else if ((d.mimeType || '').includes('wordprocessingml') || /\.docx$/i.test(title)) parsed = await parseDOCX(d.data);
            else if ((d.mimeType || '').startsWith('image/')) parsed = await parseImageOCR(d.data);
            if (parsed && parsed.length > 60) {
              const heads = Array.from(new Set(parsed.split(/\n+/).filter(l => /^\s*#/.test(l)).slice(0, 6)));
              const citation = heads.length ? heads.map(h => `- ${h.trim()}`).join('\n') : '- (tidak ada heading)';
              toolOutputs.push({ id: uuidv4(), role: Role.MODEL, text: `### 📰 Parser Terstruktur (${title})\n\nHeading:\n${citation}`, timestamp: Date.now() });
            }
          } catch { }
          const md = `### 📄 Analisis Dokumen (${title})\n\nPotongan (${chunks.length}):\n\n` + chunks.slice(0, 3).map((c, i) => `- Chunk ${i + 1}: ${c.slice(0, 240)}...`).join('\n');
          toolOutputs.push({ id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() });
        }
      } catch { }
    }
    // Memory & RAG local
    try {
      const { queryDocumentsAdvanced } = await import('./services/memoryService');
      const hits = await queryDocumentsAdvanced(text, 3);
      if (hits.length) {
        const md = `### 📎 Context (Memory)\n\n` + hits.map(h => `- ${h.doc.title} — ${h.snippet}`).join('\n');
        toolOutputs.push({ id: uuidv4(), role: Role.MODEL, text: md, timestamp: Date.now() });
      }
    } catch { }

    if (toolOutputs.length) {
      setMessages(prev => [...prev, ...toolOutputs]);
    }
    setStopRequested(false);
    setIsLoading(true);

    const aiMsgId = uuidv4();

    // =====================================================
    // 🔧 MOCK RESPONSE MODE - For testing without API key
    // Set to false when API key is ready
    // =====================================================
    const USE_MOCK_RESPONSE = false;

    if (USE_MOCK_RESPONSE) {
      // Simulate typing delay
      setTimeout(() => {
        const mockResponse = `## Hello! 👋

I'm Claude, your AI assistant. You said:

> "${text}"

**This is a mock response for testing.** The actual AI features require a valid API key.

### What I can help with:
- 💬 General questions
- 📝 Writing and editing
- 🧮 Math and calculations
- 💻 Code and programming
- 🔍 Research and analysis

To enable real AI responses:
1. Get a valid API key from Google AI Studio
2. Update the key in settings
3. Set \`USE_MOCK_RESPONSE = false\` in App.tsx (line ~908)

*Response generated at ${new Date().toLocaleTimeString()}*`;

        setMessages(prev => [...prev, {
          id: aiMsgId,
          role: Role.MODEL,
          text: mockResponse,
          timestamp: Date.now(),
          isStreaming: false
        }]);
        setIsLoading(false);

        // Update chat title if first message
        if (messages.length === 0) {
          const title = text.slice(0, 50);
          // Save to localStorage
          const sessions = JSON.parse(localStorage.getItem('wili.chatSessions') || '[]');
          const existingIdx = sessions.findIndex((s: any) => s.id === currentChatId);
          if (existingIdx >= 0) {
            sessions[existingIdx].title = title;
            sessions[existingIdx].messages = [...messages, { id: uuidv4(), role: Role.USER, text, timestamp: Date.now() }, { id: aiMsgId, role: Role.MODEL, text: mockResponse, timestamp: Date.now() }];
            sessions[existingIdx].timestamp = Date.now();
          } else {
            sessions.unshift({
              id: currentChatId,
              title,
              messages: [{ id: uuidv4(), role: Role.USER, text, timestamp: Date.now() }, { id: aiMsgId, role: Role.MODEL, text: mockResponse, timestamp: Date.now() }],
              timestamp: Date.now()
            });
          }
          localStorage.setItem('wili.chatSessions', JSON.stringify(sessions));
          window.dispatchEvent(new Event('chatSessionsUpdated'));
        }
      }, 1000);
      return;
    }
    // =====================================================
    // END MOCK RESPONSE MODE
    // =====================================================

    try {
      let accumalatedText = '';
      let effectiveSystemInstruction = activePersona.systemInstruction;
      try {
        const { queryDocumentsAdvanced } = await import('./services/memoryService');
        const hits = await queryDocumentsAdvanced(text, 3);
        if (hits.length) {
          effectiveSystemInstruction = `${effectiveSystemInstruction}\n\n[CONTEXT]\n${hits.map(h => `- ${h.doc.title}: ${h.snippet}`).join('\n')}`;
        }
      } catch { }

      await streamChatResponse(
        activeModel,
        [...historyToSend, userMsg],
        '',
        attachments,
        effectiveSystemInstruction,
        isInternetEnabled,
        (chunk) => {
          accumalatedText += chunk;
          try {
            const tts = localStorage.getItem('wili.tts.enabled') === 'true';
            if (tts) {
              if (accumalatedText.length > 160) {
                const speak = accumalatedText.slice(0, 160);
                accumalatedText = accumalatedText.slice(160);
                const u = new SpeechSynthesisUtterance(speak);
                u.lang = 'id-ID';
                window.speechSynthesis.speak(u);
              }
            }
          } catch { }
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.id === aiMsgId) {
              return [...prev.slice(0, -1), { ...last, text: accumalatedText, isStreaming: true }];
            } else {
              return [...prev, { id: aiMsgId, role: Role.MODEL, text: accumalatedText, timestamp: Date.now(), isStreaming: true }];
            }
          });

          // Check for artifacts in the accumulated text
          const foundDetails = extractArtifactFromMessage(accumalatedText);
          if (foundDetails && foundDetails.content && foundDetails.content.length > 20) {
            // Avoid adding duplicates or incomplete chunks repeatedly
            // Simple check: if we already have an artifact with this exact content, don't add
            // Better: update the existing artifact if it's the same block
            // For now, we'll simpler logic: if a NEW artifact block finishes closing ``` 
            // extractArtifactFromMessage parses the FIRST block. behavior might need tuning for multiple blocks.
            // But useArtifacts likely handles single extraction.
            // We will try to update if we find one.
            // Actually, `addArtifact` creates a new ID. We should probably only add it once it's "stable" or update the last one.
            // For this MVP step, let's just add it if it doesn't exist? 
            // Or better, let's just pass it to the Artifact Panel to handle?
            // Re-reading useArtifacts: addArtifact creates NEW. 
            // We should debounce or check if we are currently "building" an artifact.
            // For safe implementation in this step, let's just attempt extraction at the END of stream (in the stats callback),
            // or check if it's a complete block during stream.
          }
        },
        (stats, citations) => {
          setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, isStreaming: false, usage: stats, citations } : msg));
          setIsLoading(false);



          // Extract artifact at the end of the stream for stability
          const finalArtifact = extractArtifactFromMessage(accumalatedText);
          if (finalArtifact && finalArtifact.content) {
            // Check if we already have this artifact (simple dedupe by content length/title)
            const exists = artifacts.find(a => a.content === finalArtifact.content && a.title === finalArtifact.title);
            if (!exists) {
              addArtifact({
                type: finalArtifact.type || 'code',
                title: finalArtifact.title || 'Code Snippet',
                content: finalArtifact.content,
                language: finalArtifact.language || 'text'
              });
            }
          }

          try {
            const tts = localStorage.getItem('wili.tts.enabled') === 'true';
            if (tts && accumalatedText) {
              const u = new SpeechSynthesisUtterance(accumalatedText);
              u.lang = 'id-ID';
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(u);
            }
          } catch { }
          try {
            const name = AI_MODELS.flatMap(g => g.models).find(m => m.id === activeModel)?.name || String(activeModel);
            const metricsRaw = localStorage.getItem('wili.metrics');
            const metrics = metricsRaw ? JSON.parse(metricsRaw) : [];
            metrics.push({ ts: Date.now(), model: name, input: stats.inputTokens, output: stats.outputTokens, latency: stats.latencyMs });
            localStorage.setItem('wili.metrics', JSON.stringify(metrics));
            try {
              import('./services/auditService').then(({ logUsage }) => {
                logUsage({ ts: Date.now(), provider: 'auto', model: name, input: stats.inputTokens, output: stats.outputTokens, latency: stats.latencyMs });
              }).catch(() => { });
            } catch { }
          } catch { }
        },
        () => stopRequested
      );
    } catch (error: any) {
      console.error("Chat Error", error);
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          role: Role.MODEL,
          text: `⚠️ **System Error**: ${error?.message || 'Koneksi gagal.'}\n\n💡 **Solusi:**\n1. Periksa API Key di menu Settings\n2. Coba ganti model di dropdown\n3. Refresh halaman`,
          timestamp: Date.now(),
          isError: true
        }
      ]);
      setIsLoading(false);
    }
  };

  const handleReplaceMessage = async (id: string, newText: string) => {
    const idx = messages.findIndex(m => m.id === id);
    if (idx === -1) return;
    const edited = { ...messages[idx], text: newText };
    const base = messages.slice(0, idx);
    setMessages([...base, edited]);
    setStopRequested(false);
    setIsLoading(true);
    const aiMsgId = uuidv4();
    try {
      let accum = '';
      await streamChatResponse(
        activeModel,
        isMemoryEnabled ? base : [],
        edited.text,
        edited.attachments || [],
        activePersona.systemInstruction,
        isInternetEnabled,
        (chunk) => {
          accum += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.id === aiMsgId) {
              return [...prev.slice(0, -1), { ...last, text: accum, isStreaming: true }];
            } else {
              return [...prev, { id: aiMsgId, role: Role.MODEL, text: accum, timestamp: Date.now(), isStreaming: true }];
            }
          });
        },
        (stats, citations) => {
          setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, isStreaming: false, usage: stats, citations } : msg));
          setIsLoading(false);

          // Auto-extract artifacts for edited messages
          const finalArtifact = extractArtifactFromMessage(accum);
          if (finalArtifact && finalArtifact.content && finalArtifact.content.length > 20) {
            const exists = artifacts.find(a => a.content === finalArtifact.content);
            if (!exists) {
              addArtifact({
                type: finalArtifact.type || 'code',
                title: finalArtifact.title || 'Generated Artifact',
                content: finalArtifact.content,
                language: finalArtifact.language
              });
            }
          }
        },
        () => stopRequested
      );
    } catch {
      setIsLoading(false);
    }
  };

  const handleStopGeneration = () => {
    setStopRequested(true);
    setIsLoading(false);
    const id = uuid();
    setToasts(prev => [...prev, { id, text: 'Generasi dihentikan', type: 'info' }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'chat':
        return (
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            activeModel={activeModel}
            isInternetEnabled={isInternetEnabled}
            isMemoryEnabled={isMemoryEnabled}
            onSendMessage={handleSendMessage}
            onClear={() => setMessages([])}
            onToggleInternet={() => setIsInternetEnabled(!isInternetEnabled)}
            onToggleMemory={() => setIsMemoryEnabled(!isMemoryEnabled)}
            onModelChange={handleModelChange}
            onStopGeneration={handleStopGeneration}
            onNewChat={handleNewChat}
            onFeatureClick={handleFeatureLinkClick}
            onOpenSettings={() => setActiveView('settings')}
            onOpenNotifications={() => setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: 'Tidak ada notifikasi baru.', timestamp: Date.now() }])}
            onOpenProfile={() => setMessages(prev => [...prev, { id: uuidv4(), role: Role.MODEL, text: 'Profil pengguna belum dikonfigurasi.', timestamp: Date.now() }])}

          />
        );
      case 'bot-builder':
        return <BotBuilder currentPersona={activePersona} onUpdatePersona={setActivePersona} />;
      case 'analytics':
        return (
          <div className="p-10 text-slate-400">
            <div className="text-xl mb-4">Analytics</div>
            <div className="space-y-2">
              {(() => { try { const raw = localStorage.getItem('wili.metrics'); const arr = raw ? JSON.parse(raw) : []; return arr; } catch { return []; } })().slice(-50).reverse().map((m: any, i: number) => (
                <div key={i} className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm">
                  <div className="text-slate-300">{m.model}</div>
                  <div className="text-slate-500">input {m.input} • output {m.output} • {m.latency}ms</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
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
                    <p className="text-xs text-slate-500">Optional - Google Programmable Search (CSE) atau SerpAPI</p>
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
                    placeholder="VITE_GOOGLE_CSE_CX"
                    onChange={(e) => { try { localStorage.setItem('wili.googleCseCx', e.target.value) } catch { } }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-green-500 placeholder:text-slate-700"
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
      case 'login':
        return (
          <div className="h-full overflow-y-auto">
            {(() => { const uRaw = localStorage.getItem('wili.auth.user'); const u = uRaw ? JSON.parse(uRaw) : null; return u; })() ? (
              <div className="p-10 text-slate-300">Anda sudah login.</div>
            ) : (
              <LoginPanel />
            )}
          </div>
        );
      case 'artifacts':
        return (
          <ArtifactsSpace
            artifacts={artifacts}
            onSelectArtifact={(a) => { selectArtifact(a); togglePanel(); }}
            onDeleteArtifact={(id) => { /* logic to delete if needed */ }}
            onCreateArtifact={() => { setActiveView('chat'); handleSendMessage('Buatkan saya artifact baru', []); }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout sidebar={
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onNewChat={handleNewChat}
        onSelectFeature={handleFeatureSelect}
        onLoadChat={handleLoadChat}
      />
    } onQuickAction={handleQuickAction} onToolToggle={handleToolToggle} onRecentFileOpen={handleRecentFileOpen} onPopularCommandSelect={handlePopularCommandSelect}>

      {/* ULTIMATE WORKSPACE SPLIT LAYOUT */}
      <div className="relative flex h-full w-full overflow-hidden">

        {/* MAIN AREA (Chat/Settings/Builder) */}
        {/* Flex-1 ensures it takes remaining space. On Desktop with Panel Open, it's 70% */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
          {renderContent()}

          {/* Toasts Overlay */}
          <div className="absolute top-4 right-4 z-[100] space-y-2 pointer-events-none">
            {toasts.map(t => (
              <div key={t.id} className={`px-4 py-2 rounded-xl border text-sm shadow-lg pointer-events-auto ${t.type === 'success' ? 'bg-green-500/10 text-green-300 border-green-500/20' : t.type === 'error' ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-slate-800 text-slate-200 border-slate-700'}`}>{t.text}</div>
            ))}
          </div>
        </div>

        {/* DESKTOP SIDE PANEL (Static Split - 30%) */}
        <div className={`hidden lg:block transition-all duration-300 ease-in-out border-l border-[#e5e5e5] bg-[#fbfbfa] ${isPanelOpen ? 'w-[35%] min-w-[420px]' : 'w-0 border-none overflow-hidden'}`}>
          <ArtifactsPanel
            isOpen={isPanelOpen}
            onClose={closePanel}
            onToggle={togglePanel}
            artifacts={artifacts}
            selectedArtifact={selectedArtifact}
            onSelectArtifact={selectArtifact}
            isFixed={false} // Embedded mode
          />
        </div>

        {/* MOBILE OVERLAY PANEL (Fixed) */}
        <div className="lg:hidden">
          <ArtifactsPanel
            isOpen={isPanelOpen}
            onClose={closePanel}
            onToggle={togglePanel}
            artifacts={artifacts}
            selectedArtifact={selectedArtifact}
            onSelectArtifact={selectArtifact}
            isFixed={true} // Fixed overlay mode
          />
        </div>

      </div>
    </Layout>
  );
}

export default App;
