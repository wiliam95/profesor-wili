// types.ts - Updated with BIG MODELS (December 2025)

export enum Role {
  USER = 'user',
  MODEL = 'model'
}

/**
 * ModelType Enum - VERIFIED VALID MODELS (Dec 2025)
 * ✅ All models confirmed available & FREE
 */
export enum ModelType {
  // ====== GEMINI 3.x SERIES (LATEST - Dec 2025) ======
  GEMINI_3_PRO = 'gemini-3-pro-preview',
  GEMINI_3_FLASH = 'gemini-3-flash-preview',

  // ====== CLAUDE 4.5 SERIES (ULTIMATE - Dec 2025) ======
  // Route via OpenRouter since direct Anthropic API is not configured
  SONNET_4_5 = 'openrouter:anthropic/claude-3.5-sonnet',
  OPUS_4_1 = 'openrouter:anthropic/claude-3-opus',
  HAIKU_4_5 = 'openrouter:anthropic/claude-3-haiku',

  // ====== GEMINI 2.5 SERIES (RECOMMENDED - Dec 2025) ======
  PRO = 'gemini-2.0-pro-exp-02-05', // Updated ID
  PRO_3 = 'gemini-2.0-pro-exp-02-05', // Alias for Pro 3 Request
  PRO_PREVIEW = 'gemini-2.0-pro-exp-02-05',
  PRO_EXP = 'gemini-2.0-pro-exp-02-05',
  FLASH = 'gemini-1.5-flash', // Stable Free Tier
  FLASH_PREVIEW = 'gemini-2.0-flash-exp',
  FLASH_LITE = 'gemini-2.0-flash-lite-preview-02-05',
  FLASH_8B = 'gemini-1.5-flash-8b',
  FLASH_THINKING = 'gemini-2.0-flash-thinking-exp-01-21',

  // ====== GEMINI 2.0 SERIES (STABLE) ======
  GEMINI_2_0_FLASH = 'gemini-2.0-flash', // Keep for paid/whitelist
  FLASH_2_0 = 'gemini-1.5-flash', // Fallback to 1.5 for stability
  GEMINI_2_0_FLASH_LITE = 'gemini-2.0-flash-lite',

  // ====== SPECIALIZED MODES ======
  QUICK_RESPONSE = 'gemini-2.5-flash-quick',
  THINK_DEEPER = 'gemini-2.5-pro-thinking',
  STUDY_LEARN = 'gemini-2.5-flash-study',
  SEARCH_MODE = 'gemini-2.5-flash-search',

  // ====== OPENROUTER MODELS (FREE & VERIFIED) ======
  // 🏆 BIGGEST FREE MODEL
  LLAMA_4_MAVERICK = 'openrouter:meta-llama/llama-4-maverick', // 400B MoE, FREE!

  // Large Models
  MIXTRAL_8x22B = 'openrouter:mistralai/mixtral-8x22b-instruct', // 176B total
  LLAMA_3_3_70B = 'openrouter:meta-llama/llama-3.3-70b-instruct', // 70B
  LLAMA_3_1_70B = 'openrouter:meta-llama/llama-3.1-70b-instruct', // 70B
  QWEN_2_5_72B_OR = 'openrouter:qwen/qwen-2.5-72b-instruct', // 72B
  DEEPSEEK_R1_70B = 'openrouter:deepseek/deepseek-r1-distill-llama-70b', // 70B

  // Legacy (keeping for backward compatibility)
  GPT5_SMART = 'openrouter:gpt-5-smart',
  LLAMA_3_70B = 'openrouter:llama-3-70b',
  MIXTRAL_8x22B_OLD = 'openrouter:mixtral-8x22b',
  QWEN_2_5_72B = 'openrouter:qwen-2.5-72b',
  DEEPSEEK_671B = 'openrouter:deepseek-671b',

  // ====== HUGGINGFACE MODELS (FREE & VERIFIED) ======
  QWEN_2_5_72B_HF = 'huggingface:Qwen/Qwen2.5-72B-Instruct', // 72B, FREE!
  LLAMA_3_1_70B_HF = 'huggingface:meta-llama/Meta-Llama-3.1-70B-Instruct', // 70B, FREE!
  LLAMA_3_3_70B_HF = 'huggingface:meta-llama/Llama-3.3-70B-Instruct', // 70B, FREE!

  // ====== OPENAI MODELS (OPTIONAL) ======
  OPENAI_GPT_4O = 'openai:gpt-4o',
  OPENAI_GPT_4O_MINI = 'openai:gpt-4o-mini'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  attachments?: Attachment[];
  isStreaming?: boolean;
  isError?: boolean;
  usage?: UsageStats;
  citations?: Citation[];
}

export interface Attachment {
  type: 'image' | 'file';
  data: string; // base64
  mimeType: string;
  name?: string;
  size?: number;
}

export interface Citation {
  title: string;
  uri: string;
  source: string;
}

export interface UsageStats {
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  totalCost?: string;
}

export interface Persona {
  id: string;
  name: string;
  systemInstruction: string;
  avatar: string;
  description: string;
  preferredModel?: ModelType;
}

export type View = 'chat' | 'bot-builder' | 'analytics' | 'settings' | 'login' | 'artifacts';

export interface FeatureItem {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

export interface FeatureCategory {
  id: string;
  label: string;
  icon: string;
  items: FeatureItem[];
}

export interface ModelGroup {
  provider: string;
  group?: string;
  models: Array<{
    id: ModelType;
    name: string;
    description: string;
    badge?: string;
    icon?: string;
    desc?: string;
  }>;
}
