import { Message, ModelType, UsageStats } from "../types";

const getKey = (): string => {
  const local = typeof window !== 'undefined' ? window.localStorage.getItem('wili.hfToken') : null;
  const k = local || (import.meta as any)?.env?.VITE_HF_TOKEN;
  if (!k) throw new Error("HuggingFace token tidak ditemukan. Isi di Settings atau VITE_HF_TOKEN di .env.local.");
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('wili.hfToken', k);
    }
  } catch {}
  return k;
};

/**
 * Map internal ModelType to HuggingFace model ID
 */
const resolveHFModel = (modelType: ModelType): string => {
  const modelString = String(modelType);
  
  // Remove 'huggingface:' prefix if exists
  if (modelString.startsWith('huggingface:')) {
    return modelString.replace('huggingface:', '');
  }
  
  // Default fallback
  return 'Qwen/Qwen2.5-72B-Instruct';
};

/**
 * Test HuggingFace model connection
 */
export const testHFModel = async (modelType: ModelType): Promise<UsageStats> => {
  const token = getKey();
  const modelId = resolveHFModel(modelType);
  const start = Date.now();
  
  try {
    const url = (import.meta as any)?.env?.DEV ? `/proxy/hf/${modelId}` : `https://api-inference.huggingface.co/models/${modelId}`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: "Ping",
        parameters: {
          max_new_tokens: 16,
          temperature: 0.7
        }
      })
    });
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`HuggingFace error ${r.status}: ${txt}`);
    }
  } catch (e) {
    // Fallback: metadata check (often CORS-friendly)
    const meta = await fetch(`https://huggingface.co/api/models/${modelId.replace(/^[^:]+:/, '')}`);
    if (!meta.ok) {
      const txt = await meta.text();
      throw new Error(`HuggingFace connectivity error: ${txt}`);
    }
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
 * Stream chat with HuggingFace models
 */
export const streamHFChat = async (
  modelType: ModelType,
  messages: Message[],
  systemInstruction: string,
  onChunk: (text: string) => void,
  onComplete: (stats: UsageStats) => void,
  shouldStop?: () => boolean
): Promise<void> => {
  const token = getKey();
  const modelId = resolveHFModel(modelType);
  const startTime = Date.now();
  let temperature = 0.7, top_p = 0.9, max_tokens = 2048;
  try {
    const t = parseFloat(String(window.localStorage.getItem('wili.gen.temperature') || '0.7'));
    const p = parseFloat(String(window.localStorage.getItem('wili.gen.top_p') || '0.9'));
    const m = parseInt(String(window.localStorage.getItem('wili.gen.max_tokens') || '2048'));
    if (!isNaN(t)) temperature = t; if (!isNaN(p)) top_p = p; if (!isNaN(m)) max_tokens = m;
  } catch {}
  
  // Format prompt for HF models
  let prompt = `${systemInstruction}\n\n`;
  messages.forEach(msg => {
    const role = msg.role === 'user' ? 'User' : 'Assistant';
    prompt += `${role}: ${msg.text}\n`;
  });
  prompt += 'Assistant: ';
  
  const url = (import.meta as any)?.env?.DEV ? `/proxy/hf/${modelId}` : `https://api-inference.huggingface.co/models/${modelId}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: max_tokens,
        temperature,
        top_p,
        return_full_text: false
      },
      options: {
        use_cache: false,
        wait_for_model: true
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HuggingFace error ${response.status}: ${error}`);
  }
  
  const data = await response.json();
  const generatedText = data[0]?.generated_text || data.generated_text || '';
  
  // Simulate streaming by chunking
  const chunkSize = 10;
  for (let i = 0; i < generatedText.length; i += chunkSize) {
    if (shouldStop && shouldStop()) break;
    const chunk = generatedText.slice(i, i + chunkSize);
    onChunk(chunk);
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay
  }
  
  const latency = Date.now() - startTime;
  const stats: UsageStats = {
    inputTokens: Math.ceil(prompt.length / 4),
    outputTokens: Math.ceil(generatedText.length / 4),
    latencyMs: latency,
    totalCost: "$0.00"
  };
  
  onComplete(stats);
};
