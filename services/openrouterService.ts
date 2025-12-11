import { Message, ModelType, UsageStats } from "../types";

const getKey = (): string => {
  const local = typeof window !== 'undefined' ? window.localStorage.getItem('wili.openrouterKey') : null;
  const k = local || (import.meta as any)?.env?.VITE_OPENROUTER_API_KEY;
  if (!k) throw new Error("OpenRouter API key tidak ditemukan. Isi di Settings atau VITE_OPENROUTER_API_KEY di .env.local.");
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('wili.openrouterKey', k);
    }
  } catch { }
  return k;
};

/**
 * Map internal ModelType to OpenRouter model ID
 */
const resolveOpenRouterModel = (modelType: ModelType): string => {
  const modelString = String(modelType);

  // Remove 'openrouter:' prefix if exists
  if (modelString.startsWith('openrouter:')) {
    const cleanModel = modelString.replace('openrouter:', '');

    // Map to actual OpenRouter model IDs
    const modelMap: Record<string, string> = {
      // Ultra Large Models (400B, 176B)
      'meta-llama/llama-4-maverick': 'meta-llama/llama-4-maverick',
      'mistralai/mixtral-8x22b-instruct': 'mistralai/mixtral-8x22b-instruct',

      // Large Models (70B+)
      'meta-llama/llama-3.3-70b-instruct': 'meta-llama/llama-3.3-70b-instruct',
      'meta-llama/llama-3.1-70b-instruct': 'meta-llama/llama-3.1-70b-instruct',
      'qwen/qwen-2.5-72b-instruct': 'qwen/qwen-2.5-72b-instruct',
      'deepseek/deepseek-r1-distill-llama-70b': 'deepseek/deepseek-r1-distill-llama-70b',

      // Anthropic Models (via OpenRouter)
      'anthropic/claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-opus': 'anthropic/claude-3-opus',
      'anthropic/claude-3-haiku': 'anthropic/claude-3-haiku',

      // Legacy mappings (backward compatibility)
      'llama-3-70b': 'meta-llama/llama-3.1-70b-instruct',
      'mixtral-8x22b': 'mistralai/mixtral-8x22b-instruct',
      'qwen-2.5-72b': 'qwen/qwen-2.5-72b-instruct',
      'gpt-5-smart': 'meta-llama/llama-4-maverick', // Fallback to biggest
      'deepseek-671b': 'deepseek/deepseek-r1-distill-llama-70b',
    };

    return modelMap[cleanModel] || cleanModel;
  }

  // Fallback
  return 'meta-llama/llama-3.3-70b-instruct';
};

/**
 * Test OpenRouter model connection
 */
export const testOpenRouterModel = async (modelType: ModelType): Promise<UsageStats> => {
  const apiKey = getKey();
  const modelId = resolveOpenRouterModel(modelType);
  const start = Date.now();

  const base = (import.meta as any)?.env?.DEV ? "/proxy/openrouter/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
  const r = await fetch(base, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "WILI AI Workspace"
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: "Ping" }],
      max_tokens: 16
    })
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`OpenRouter error ${r.status}: ${txt}`);
  }

  const latencyMs = Date.now() - start;
  return {
    inputTokens: 4,
    outputTokens: 4,
    latencyMs,
    totalCost: "$0.00"
  };
};

/**
 * Stream chat with OpenRouter models
 */
export const streamOpenRouterChat = async (
  modelType: ModelType,
  messages: Message[],
  systemInstruction: string,
  onChunk: (text: string) => void,
  onComplete: (stats: UsageStats) => void,
  shouldStop?: () => boolean
): Promise<void> => {
  const apiKey = getKey();
  const modelId = resolveOpenRouterModel(modelType);
  const startTime = Date.now();
  const getGen = () => {
    let temperature = 0.7, top_p = 0.9, max_tokens = 4096;
    try {
      const t = parseFloat(String(window.localStorage.getItem('wili.gen.temperature') || '0.7'));
      const p = parseFloat(String(window.localStorage.getItem('wili.gen.top_p') || '0.9'));
      const m = parseInt(String(window.localStorage.getItem('wili.gen.max_tokens') || '4096'));
      if (!isNaN(t)) temperature = t; if (!isNaN(p)) top_p = p; if (!isNaN(m)) max_tokens = m;
    } catch { }
    return { temperature, top_p, max_tokens };
  };

  // Format messages for OpenRouter API
  const formattedMessages = [
    { role: "system", content: systemInstruction },
    ...messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text
    }))
  ];

  const base = (import.meta as any)?.env?.DEV ? "/proxy/openrouter/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
  const response = await fetch(base, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "WILI AI Workspace"
    },
    body: JSON.stringify({
      model: modelId,
      messages: formattedMessages,
      stream: true,
      ...getGen()
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${error}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  if (!reader) throw new Error("Stream reader unavailable");

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
          if (content) {
            if (shouldStop && shouldStop()) break;
            fullText += content;
            onChunk(content);
          }
        } catch (e) {
          // Skip invalid JSON chunks
        }
      }
    }

    const latency = Date.now() - startTime;
    const stats: UsageStats = {
      inputTokens: Math.ceil(JSON.stringify(formattedMessages).length / 4),
      outputTokens: Math.ceil(fullText.length / 4),
      latencyMs: latency,
      totalCost: "$0.00"
    };

    onComplete(stats);

  } catch (error) {
    console.error("[OpenRouter] Stream error:", error);
    throw error;
  }
};
