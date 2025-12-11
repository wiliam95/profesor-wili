/**
 * ===========================================
 * OPENROUTER PROVIDER - Free AI Models Gateway
 * ===========================================
 * 
 * Provider untuk OpenRouter API dengan multiple free models.
 * 
 * FREE Models:
 * - meta-llama/llama-3.3-70b-instruct:free
 * - qwen/qwen-2.5-72b-instruct:free
 * - google/gemma-2-9b-it:free
 * - mistralai/mistral-7b-instruct:free
 * 
 * @author AI System
 * @version 1.0.0
 */

/**
 * Free models available on OpenRouter
 */
const OPENROUTER_MODELS = [
    {
        id: 'meta-llama/llama-3.3-70b-instruct:free',
        name: 'Llama 3.3 70B (Free)',
        priority: 1,
        description: 'Latest and most capable free model'
    },
    {
        id: 'qwen/qwen-2.5-72b-instruct:free',
        name: 'Qwen 2.5 72B (Free)',
        priority: 2,
        description: 'Excellent multilingual support'
    },
    {
        id: 'google/gemma-2-9b-it:free',
        name: 'Gemma 2 9B (Free)',
        priority: 3,
        description: 'Google model, fast and reliable'
    },
    {
        id: 'mistralai/mistral-7b-instruct:free',
        name: 'Mistral 7B (Free)',
        priority: 4,
        description: 'Fast, good for simple tasks'
    }
];

/**
 * OpenRouterProvider Class
 */
export class OpenRouterProvider {
    /**
     * @param {Object} config - Configuration
     * @param {string} config.apiKey - OpenRouter API Key
     * @param {Function} config.onLog - Logging callback
     */
    constructor(config = {}) {
        this.apiKey = config.apiKey || process.env.OPENROUTER_API_KEY;
        this.onLog = config.onLog || console.log;
        this.baseUrl = 'https://openrouter.ai/api/v1';

        // Health tracking
        this.modelHealth = {};
        OPENROUTER_MODELS.forEach(model => {
            this.modelHealth[model.id] = {
                healthy: true,
                failures: 0,
                lastSuccess: null,
                avgResponseTime: 0,
                responseTimes: []
            };
        });

        // Chat history
        this.chatHistory = new Map();

        this._log('info', 'OpenRouterProvider initialized', {
            available: !!this.apiKey,
            models: OPENROUTER_MODELS.map(m => m.name)
        });
    }

    /**
     * Check if provider is available
     */
    isAvailable() {
        return !!this.apiKey;
    }

    /**
     * Get response from OpenRouter
     */
    async getResponse(message, options = {}) {
        if (!this.apiKey) {
            return {
                success: false,
                error: 'API_KEY_MISSING',
                message: 'OpenRouter API key not configured',
                provider: 'openrouter'
            };
        }

        const startTime = Date.now();
        const { sessionId, preferredModel, maxTokens = 2048 } = options;

        // Get available models
        const availableModels = this._getAvailableModels(preferredModel);

        if (availableModels.length === 0) {
            return {
                success: false,
                error: 'NO_MODELS_AVAILABLE',
                message: 'All OpenRouter models unavailable',
                provider: 'openrouter'
            };
        }

        // Build messages
        const messages = this._buildMessages(message, sessionId);

        // Try each model
        for (const modelConfig of availableModels) {
            try {
                this._log('debug', `Trying OpenRouter model: ${modelConfig.id}`);

                const response = await fetch(`${this.baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                        'HTTP-Referer': 'https://your-app.vercel.app',
                        'X-Title': 'WILI AI Bot'
                    },
                    body: JSON.stringify({
                        model: modelConfig.id,
                        messages: messages,
                        max_tokens: maxTokens,
                        temperature: 0.7
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
                }

                const data = await response.json();
                const responseText = data.choices?.[0]?.message?.content || '';

                // Update tracking
                const responseTime = Date.now() - startTime;
                this._updateHealth(modelConfig.id, true, responseTime);

                // Update chat history
                if (sessionId) {
                    this._updateChatHistory(sessionId, message, responseText);
                }

                return {
                    success: true,
                    text: responseText,
                    model: modelConfig.id,
                    modelName: modelConfig.name,
                    provider: 'openrouter',
                    responseTime
                };

            } catch (error) {
                this._log('warn', `OpenRouter model ${modelConfig.id} failed`, { error: error.message });
                this._updateHealth(modelConfig.id, false, 0, error);
                continue;
            }
        }

        return {
            success: false,
            error: 'ALL_MODELS_FAILED',
            message: 'All OpenRouter models failed',
            provider: 'openrouter'
        };
    }

    /**
     * Build messages with history
     * @private
     */
    _buildMessages(message, sessionId) {
        const messages = [];

        messages.push({
            role: 'system',
            content: 'You are a helpful AI assistant. Respond in the same language as the user.'
        });

        if (sessionId && this.chatHistory.has(sessionId)) {
            const history = this.chatHistory.get(sessionId);
            messages.push(...history.slice(-10));
        }

        messages.push({ role: 'user', content: message });

        return messages;
    }

    /**
     * Update chat history
     * @private
     */
    _updateChatHistory(sessionId, userMessage, assistantMessage) {
        if (!this.chatHistory.has(sessionId)) {
            this.chatHistory.set(sessionId, []);
        }

        const history = this.chatHistory.get(sessionId);
        history.push({ role: 'user', content: userMessage });
        history.push({ role: 'assistant', content: assistantMessage });

        if (history.length > 20) history.splice(0, 2);
    }

    /**
     * Get available models
     * @private
     */
    _getAvailableModels(preferredModel = null) {
        const available = OPENROUTER_MODELS.filter(model => {
            const health = this.modelHealth[model.id];
            return health.healthy && health.failures < 3;
        });

        if (preferredModel) {
            const idx = available.findIndex(m => m.id === preferredModel);
            if (idx > 0) {
                const preferred = available.splice(idx, 1)[0];
                available.unshift(preferred);
            }
        }

        return available;
    }

    /**
     * Update health
     * @private
     */
    _updateHealth(modelId, success, responseTime, error = null) {
        const health = this.modelHealth[modelId];

        if (success) {
            health.healthy = true;
            health.failures = 0;
            health.lastSuccess = Date.now();
            health.responseTimes.push(responseTime);
            if (health.responseTimes.length > 10) health.responseTimes.shift();
            health.avgResponseTime = health.responseTimes.reduce((a, b) => a + b, 0) / health.responseTimes.length;
        } else {
            health.failures++;
            if (health.failures >= 3) health.healthy = false;
        }
    }

    /**
     * Get health status
     */
    getHealthStatus() {
        const status = {};
        OPENROUTER_MODELS.forEach(model => {
            const health = this.modelHealth[model.id];
            status[model.id] = {
                name: model.name,
                healthy: health.healthy,
                avgResponseTime: Math.round(health.avgResponseTime),
                failures: health.failures
            };
        });

        return { available: this.isAvailable(), models: status };
    }

    /**
     * Clear history
     */
    clearHistory(sessionId) {
        if (this.chatHistory.has(sessionId)) {
            this.chatHistory.delete(sessionId);
        }
    }

    _log(level, message, data = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            provider: 'openrouter',
            message,
            ...data
        };
        if (this.onLog) this.onLog(entry);
    }
}

export default OpenRouterProvider;
