import { Message, ModelType, UsageStats } from "../types";

const getKey = (): string => {
  const local = typeof window !== 'undefined' ? window.localStorage.getItem('wili.openaiKey') : null;
  const k = local || (import.meta as any)?.env?.VITE_OPENAI_API_KEY;
  if (!k) throw new Error("OpenAI API key tidak ditemukan. Isi di Settings atau VITE_OPENAI_API_KEY di .env.local.");
  try { if (typeof window !== 'undefined') { window.localStorage.setItem('wili.openaiKey', k); } } catch {}
  return k;
};

const resolveOpenAIModel = (modelType: ModelType): string => {
  const s = String(modelType);
  if (s.startsWith('openai:')) return s.replace('openai:', '');
  switch (modelType) {
    case ModelType.OPENAI_GPT_4O: return 'gpt-4o';
    case ModelType.OPENAI_GPT_4O_MINI: return 'gpt-4o-mini';
    default: return 'gpt-4o-mini';
  }
};

export const testOpenAIModel = async (modelType: ModelType): Promise<UsageStats> => {
  const apiKey = getKey();
  const model = resolveOpenAIModel(modelType);
  const start = Date.now();
  const url = (import.meta as any)?.env?.DEV ? '/proxy/openai/chat/completions' : 'https://api.openai.com/v1/chat/completions';
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Ping' }], max_tokens: 16 })
  });
  if (!r.ok) { const t = await r.text(); throw new Error(`OpenAI error ${r.status}: ${t}`); }
  const latencyMs = Date.now() - start;
  return { inputTokens: 4, outputTokens: 4, latencyMs, totalCost: "$0.00" };
};

export const streamOpenAIChat = async (
  modelType: ModelType,
  messages: Message[],
  systemInstruction: string,
  onChunk: (text: string) => void,
  onComplete: (stats: UsageStats) => void,
  shouldStop?: () => boolean
): Promise<void> => {
  const apiKey = getKey();
  const model = resolveOpenAIModel(modelType);
  const startTime = Date.now();

  const formatted = [
    { role: 'system', content: systemInstruction },
    ...messages.map(m => {
      if (m.role === 'user') {
        const parts: any[] = [];
        if (m.text) parts.push({ type: 'text', text: m.text });
        (m.attachments || []).forEach(att => {
          if (att.type === 'image') {
            parts.push({ type: 'image_url', image_url: { url: `data:${att.mimeType};base64,${att.data}` } });
          }
        });
        return { role: 'user', content: parts.length ? parts : m.text } as any;
      }
      return { role: 'assistant', content: m.text } as any;
    })
  ];

  const url = (import.meta as any)?.env?.DEV ? '/proxy/openai/chat/completions' : 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: formatted, stream: true })
  });
  if (!response.ok) { const e = await response.text(); throw new Error(`OpenAI error ${response.status}: ${e}`); }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  if (!reader) throw new Error('Stream reader unavailable');

  try {
    while (true) {
      if (shouldStop && shouldStop()) break;
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));
      for (const line of lines) {
        const data = line.replace('data: ', '').trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) { fullText += content; onChunk(content); }
        } catch {}
      }
    }
    const latency = Date.now() - startTime;
    const stats: UsageStats = {
      inputTokens: Math.ceil(JSON.stringify(formatted).length / 4),
      outputTokens: Math.ceil(fullText.length / 4),
      latencyMs: latency,
      totalCost: "$0.00"
    };
    onComplete(stats);
  } catch (error) {
    console.error('[OpenAI] Stream error:', error);
    throw error as any;
  }
};
