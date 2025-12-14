import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, ModelType, Role, Attachment, Citation, UsageStats } from "../types";
import { streamOpenRouterChat } from "./openrouterService";
import { streamHFChat } from "./hfService";
import { streamOpenAIChat } from "./openaiService";
import { getCitationsFromQuery } from "./webSearch";

const getApiKey = (): string | null => {
  if (typeof window === 'undefined') return (import.meta as any)?.env?.VITE_GEMINI_API_KEY || null;

  // Check multiple possible keys for robustness
  const key =
    window.localStorage.getItem('wili.googleKey') ||
    window.localStorage.getItem('GEMINI_API_KEY') ||
    (import.meta as any)?.env?.VITE_GEMINI_API_KEY;

  return key || null;
};

const mapRole = (role: Role): string => {
  return role === Role.USER ? 'user' : 'model';
};

const formatHistory = (messages: Message[]): Content[] => {
  return messages.map((msg) => {
    const parts: Part[] = [];
    if (msg.text) parts.push({ text: msg.text });
    if (msg.attachments && msg.attachments.length > 0) {
      msg.attachments.forEach(att => {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });
    }
    return { role: mapRole(msg.role), parts };
  });
};

const fetchWikipediaCitations = async (query: string): Promise<Citation[] | undefined> => {
  try {
    const q = encodeURIComponent(query.slice(0, 80));
    const r = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&format=json&origin=*`);
    if (!r.ok) return undefined;
    const data = await r.json();
    const items = (data?.query?.search || []).slice(0, 3);
    if (!items.length) return undefined;
    return items.map((it: any) => ({
      title: it?.title || 'Wikipedia',
      uri: `https://en.wikipedia.org/wiki/${encodeURIComponent(it?.title || '')}`,
      source: 'wikipedia.org'
    }));
  } catch { return undefined }
};

/**
 * Resolve which service to use based on model type
 */
const resolveServiceType = (modelType: ModelType): 'gemini' | 'openrouter' | 'huggingface' | 'openai' => {
  const modelString = String(modelType);

  if (modelString.startsWith('openrouter:')) {
    return 'openrouter';
  }

  if (modelString.startsWith('huggingface:')) {
    return 'huggingface';
  }
  if (modelString.startsWith('openai:')) {
    return 'openai';
  }

  return 'gemini';
};

const selectModelByTask = (type: ModelType, text: string, attachments: Attachment[], internet: boolean): ModelType => {
  const hasImage = attachments.some(a => a.type === 'image');
  const looksCode = /\b(function|class|def|public|void|const|let|var|#include|import|export)\b/.test(text) || /[{;}]/.test(text);
  const longForm = text.length > 1200;
  const needsSearch = internet && /\b(cari|search|info terbaru|berita|apa itu)\b/i.test(text);
  if (hasImage) return ModelType.FLASH;
  if (looksCode) return ModelType.LLAMA_3_3_70B;
  if (longForm) return ModelType.GEMINI_3_PRO;
  if (needsSearch) return ModelType.FLASH;
  return type;
};

/**
 * Map UI ModelType to valid Gemini model string
 */
const resolveGeminiModel = (type: ModelType): string => {
  const modelString = String(type);

  if (modelString === 'gemini-2.5-flash' ||
    modelString === 'gemini-2.5-pro' ||
    modelString === 'gemini-2.0-flash' ||
    modelString === 'gemini-3-pro') {
    return modelString;
  }

  switch (type) {
    case ModelType.PRO:
      return 'gemini-2.0-pro-exp-02-05';
    case ModelType.FLASH:
    case ModelType.FLASH_2_0:
      return 'gemini-2.0-flash-exp';
    case ModelType.GEMINI_3_PRO:
      return 'gemini-2.0-pro-exp-02-05';
    case ModelType.GEMINI_2_0_FLASH:
      return 'gemini-2.0-flash-exp';
    default:
      return 'gemini-2.0-flash-exp';
  }
};

/**
 * Main streaming function - routes to appropriate service
 */
export const streamChatResponse = async (
  modelType: ModelType,
  history: Message[],
  newMessage: string,
  attachments: Attachment[],
  systemInstruction: string,
  isInternetEnabled: boolean,
  onChunk: (text: string) => void,
  onComplete: (stats: UsageStats, citations?: Citation[]) => void,
  shouldStop?: () => boolean
): Promise<void> => {
  const ARTIFACT_INSTRUCTIONS = `
  [SYSTEM_NOTE: ARTIFACTS PROTOCOL]
  When producing substantial code (React components, full HTML pages, SVG, diagrams), you MUST use the following XML format strictly. Do NOT use standard markdown code blocks for these.
  
  <antArtifact identifier="unique-id" type="application/vnd.ant.code" language="typescript" title="Filename">
  ... content ...
  </antArtifact>
  
  Use 'type="application/vnd.ant.mermaid"' for mermaid diagrams.
  Use 'language="tsx"' for React.
  This allows the UI to render a Preview panel side-by-side. 
  For simple snippets, use standard markdown.
  `;

  const effectiveSystemInstruction = systemInstruction + "\n\n" + ARTIFACT_INSTRUCTIONS;

  const chosen = selectModelByTask(modelType, newMessage || history.filter(h => h.role === Role.USER).slice(-1)[0]?.text || '', attachments, isInternetEnabled);
  const serviceType = resolveServiceType(chosen);


  // Direct Client-Side Pollinations Fallback (For Vercel / Cloud Deployment)
  const tryPollinationsDirect = async (message: string): Promise<boolean> => {
    console.log('[WILI] Attempting Direct Pollinations API (Client-Side)...');

    // 0. Check for Attachments (Image Analysis Limitation)
    if (attachments && attachments.length > 0) {
      onChunk("⚠️ **Batasan Sistem Cloud (Vercel)**\n\nMaaf, analisis gambar/file saat ini hanya tersedia jika Anda menjalankan bot di komputer sendiri (Localhost) atau menggunakan API Key Gemini pribadi. Mode Cloud Gratis (Pollinations) belum mendukung input gambar.\n\nSilakan lanjutkan percakapan teks biasa. 😊");
      onComplete({ inputTokens: 0, outputTokens: 50, latencyMs: 0, totalCost: "Free" }, undefined);
      return true;
    }

    // 1. Server-Side Search via API Route (Bypass CORS)
    let searchContext = '';

    // V5 Search Logic: Smart Router (Tavily → Serper → Wikipedia)
    if (isInternetEnabled && message.split(' ').length > 1) {
      try {
        console.log('[WILI] Starting Smart Web Search...');
        const searchQuery = message.replace(/\b(cari|search|info|berita)\b/gi, '').trim();

        // Import smart search router
        const { performWebSearch } = await import('./webSearchService');

        // Perform search (auto-detects which service to use)
        const searchResults = await performWebSearch(searchQuery, 5);

        if (searchResults.length > 0) {
          searchContext = `[SYSTEM: WEB SEARCH RESULTS (REAL-TIME)]\n`;
          searchResults.slice(0, 4).forEach((r: any) => {
            searchContext += `- ${r.title}: ${r.snippet}\n`;
            if (r.url) searchContext += `  URL: ${r.url}\n`;
          });
          searchContext += `\n[INSTRUCTION: Use the above search information to answer the user's question with accurate, up-to-date information.]\n\n`;
          console.log(`[WILI] ✓ Search returned ${searchResults.length} results`);
        }
      } catch (e) {
        console.log('[WILI] Search Failed', e);
      }
    }

    // 4. Memory Injection: Construct full message history
    const conversation = history.map(h => ({
      role: h.role === Role.USER ? 'user' : 'assistant',
      content: h.text
    }));

    // Add current search context + user message
    const finalPrompt = searchContext ? (searchContext + message) : message;
    conversation.push({ role: 'user', content: finalPrompt });

    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: effectiveSystemInstruction || 'You are Wili, a helpful AI assistant.' },
            ...conversation
          ],
          model: 'openai'
        })
      });

      if (!response.ok) throw new Error('Pollinations API Error');
      const text = await response.text();

      onChunk(text);
      onComplete({
        inputTokens: 0,
        outputTokens: text.length,
        latencyMs: 0,
        totalCost: "Free (Cloud)"
      }, undefined); // No citation object for now
      return true;

    } catch (e) {
      console.error('[WILI] Direct Pollinations Failed:', e);
      return false;
    }
  };

  // Route to Scraping Service (Fallback)
  const tryScraperFallback = async (): Promise<boolean> => {
    console.log(`[WILI] Using Scraping Service (Fallback)`);

    // Standard local scraper URL or env override
    const scraperUrl = (import.meta as any)?.env?.VITE_SCRAPER_URL || 'http://localhost:3000/api/chat';

    // 0. Vercel / Cloud Detection (Skip Localhost)
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      console.log('[WILI] Vercel Environment Detected. Skipping Localhost, switching to Cloud Direct.');
      return await tryPollinationsDirect(newMessage || history[history.length - 1]?.text || '');
    }

    try {
      // 1. Check if scraper is online
      const check = await fetch(scraperUrl.replace('/api/chat', '/health')).catch(() => null);
      if (!check || !check.ok) {
        throw new Error('Scraping service not available');
      }

      // 2. Prepare message (with attachment info)
      let lastMsg = newMessage || history[history.length - 1]?.text || 'Hello';

      if (attachments && attachments.length > 0) {
        const attInfo = attachments.map(a => `[Attachment: ${a.name} (${a.mimeType})]`).join(', ');
        lastMsg += `\n\n${attInfo}\n*(Note: Attachments are not fully processed in Lite Mode)*`;
      }
      const resp = await fetch(scraperUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: lastMsg })
      });

      if (!resp.ok) throw new Error(`Scraper Error: ${resp.status}`);

      const data = await resp.json();
      const outputText = data.text || data.message || 'No response from scraper';

      // Simulate streaming for UI experience
      const chunks = outputText.match(/.{1,10}/g) || [outputText];
      for (const chunk of chunks) {
        if (shouldStop && shouldStop()) break;
        onChunk(chunk);
        await new Promise(r => setTimeout(r, 10)); // tiny delay
      }

      onComplete({
        inputTokens: 0,
        outputTokens: outputText.length,
        latencyMs: 0,
        totalCost: "Free"
      }, undefined);

      return true;

    } catch (e) {
      console.error('[WILI] Scraper Fallback Failed:', e);
      // Fallback to Direct Pollinations if backend is dead (Crucial for Vercel)
      return await tryPollinationsDirect(newMessage || history[history.length - 1]?.text || '');
    }
  };


  // Route to OpenRouter
  const tryOpenRouter = async (): Promise<boolean> => {
    if (serviceType !== 'openrouter') return false;
    console.log(`[WILI] Using OpenRouter for model: ${modelType}`);

    const allMessages = [...history];
    if (newMessage) {
      allMessages.push({
        id: Date.now().toString(),
        role: Role.USER,
        text: newMessage,
        timestamp: Date.now()
      });
    }

    await streamOpenRouterChat(
      chosen,
      allMessages,
      effectiveSystemInstruction,
      onChunk,
      (stats) => onComplete(stats, undefined),
      shouldStop
    );
    return true;
  };

  // Route to HuggingFace
  const tryHF = async (): Promise<boolean> => {
    if (serviceType !== 'huggingface') return false;
    console.log(`[WILI] Using HuggingFace for model: ${modelType}`);

    const allMessages = [...history];
    if (newMessage) {
      allMessages.push({
        id: Date.now().toString(),
        role: Role.USER,
        text: newMessage,
        timestamp: Date.now()
      });
    }

    await streamHFChat(
      chosen,
      allMessages,
      effectiveSystemInstruction,
      onChunk,
      (stats) => onComplete(stats, undefined),
      shouldStop
    );
    return true;
  };

  // Route to OpenAI
  const tryOpenAI = async (): Promise<boolean> => {
    if (serviceType !== 'openai') return false;
    console.log(`[WILI] Using OpenAI for model: ${modelType}`);
    const allMessages = [...history];
    if (newMessage) {
      allMessages.push({ id: Date.now().toString(), role: Role.USER, text: newMessage, timestamp: Date.now() });
    }
    await streamOpenAIChat(chosen, allMessages, effectiveSystemInstruction, onChunk, (stats) => onComplete(stats, undefined), shouldStop);
    return true;
  };

  // Default: Use Gemini
  const tryGemini = async (): Promise<boolean> => {
    console.log(`[WILI] Using Gemini for model: ${modelType}`);

    const startTime = Date.now();
    const apiKey = getApiKey();

    // Fallback if no API key
    if (!apiKey) {
      console.log('[WILI] No Gemini Key found, switching to Scraping Service...');
      return await tryScraperFallback();
    }
    const ai = new GoogleGenAI({ apiKey });

    const historyContent = formatHistory(history);
    const tools: any[] = [];
    if (isInternetEnabled) {
      tools.push({ googleSearch: {} });
    }

    const apiModel = resolveGeminiModel(chosen);

    const tRaw = typeof window !== 'undefined' ? window.localStorage.getItem('wili.gen.temperature') : null;
    const pRaw = typeof window !== 'undefined' ? window.localStorage.getItem('wili.gen.top_p') : null;
    const mRaw = typeof window !== 'undefined' ? window.localStorage.getItem('wili.gen.max_tokens') : null;
    const genConfig: any = {
      systemInstruction: effectiveSystemInstruction,
      tools: tools.length > 0 ? tools : undefined,
    };
    if (tRaw) genConfig.temperature = parseFloat(tRaw);
    if (pRaw) genConfig.topP = parseFloat(pRaw);
    if (mRaw) genConfig.maxOutputTokens = parseInt(mRaw);

    const chat = ai.chats.create({
      model: apiModel,
      history: historyContent,
      config: genConfig,
    });

    const currentParts: Part[] = [];
    if (newMessage) currentParts.push({ text: newMessage });
    attachments.forEach(att => {
      currentParts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: att.data
        }
      });
    });
    if (currentParts.length === 0) {
      currentParts.push({ text: history[history.length - 1]?.text || 'Ping' });
    }

    try {
      const result = await chat.sendMessageStream({ message: currentParts });
      let fullText = '';

      for await (const chunk of result as any) {
        if (shouldStop && shouldStop()) break;
        let text: any = chunk?.text;
        if (typeof text === 'function') {
          try { text = text(); } catch { }
        }
        if (!text) {
          const parts = chunk?.candidates?.[0]?.content?.parts || chunk?.content?.parts || [];
          const joined = Array.isArray(parts) ? parts.map((p: any) => p?.text || (typeof p === 'string' ? p : '')).join('') : '';
          text = joined;
        }
        if (text) {
          fullText += String(text);
          onChunk(String(text));
        }
      }

      const latency = Date.now() - startTime;
      const stats: UsageStats = {
        inputTokens: Math.ceil((newMessage.length + JSON.stringify(history).length) / 4),
        outputTokens: Math.ceil(fullText.length / 4),
        latencyMs: latency,
        totalCost: "$0.0001"
      };

      const lastUser = history.filter(h => h.role === Role.USER).slice(-1)[0]?.text || '';
      const citations = isInternetEnabled ? await getCitationsFromQuery(lastUser || fullText) : undefined;
      if (!fullText.trim()) {
        throw new Error('Model tidak mengembalikan teks');
      }
      onComplete(stats, citations);

    } catch (error: any) {
      console.error("[WILI ERROR] Gemini API Error:", error);

      const errMsg = String(error?.message || JSON.stringify(error));
      if (errMsg.includes('429') || errMsg.includes('Quota') || errMsg.includes('Resource has been exhausted')) {
        console.log('[WILI] Gemini Quota Exceeded (429). Switching to Scraping Service Fallback...');
        return await tryScraperFallback();
      }

      // For other errors, also try fallback as a safety net
      console.log('[WILI] Gemini Error. Attempting Scraping Service Fallback...');
      return await tryScraperFallback();
    }
    return true;
  };

  try {
    if (await tryOpenRouter()) return;
    if (await tryHF()) return;
    if (await tryOpenAI()) return;
    if (await tryGemini()) return;
  } catch (e) {
    try {
      if (serviceType !== 'gemini') await tryGemini(); else await tryOpenRouter();
    } catch (e2) {
      throw e2;
    }
  }
};
