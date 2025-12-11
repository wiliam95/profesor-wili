// services/index.ts - Service Exports
export { streamChatResponse } from './geminiService';
export { streamOpenRouterChat } from './openrouterService';
export { streamHFChat } from './hfService';
export { streamOpenAIChat } from './openaiService';
export { getCitationsFromQuery } from './webSearch';

// Feature flags
export const FEATURE_FLAGS = {
    enableClaudeFiles: true,
    enableWorkspace: true,
    enableAIBuilder: true,
    enableExperimentalStreaming: false,
    enableWebSearch: true,
    enableCodeExecution: true,
    enableImageGeneration: false,
    enableVoiceInput: true,
    enableMemory: true,
    enableProjects: true,
    enableArtifacts: true,
    enableThinking: true
};

// Service configuration
export const SERVICE_CONFIG = {
    gemini: { maxTokens: 8192, temperature: 0.7, topP: 0.95 },
    openrouter: { maxTokens: 4096, temperature: 0.7 },
    huggingface: { maxTokens: 2048, temperature: 0.7 },
    openai: { maxTokens: 4096, temperature: 0.7 }
};

// Model routing configuration
export const MODEL_ROUTING = {
    code: ['gemini-2.5-pro', 'gemini-2.5-flash'],
    creative: ['gemini-2.5-pro', 'gemini-2.5-flash'],
    analysis: ['gemini-2.5-pro-thinking'],
    fast: ['gemini-2.5-flash-lite', 'gemini-2.0-flash']
};

export default {
    FEATURE_FLAGS,
    SERVICE_CONFIG,
    MODEL_ROUTING
};
