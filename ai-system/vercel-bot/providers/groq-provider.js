/**
 * ===========================================
 * GROQ PROVIDER - Super Fast Inference
 * ===========================================
 * 
 * Provider untuk Groq API dengan Llama/Mixtral models.
 * FREE: 180k tokens/day dengan inference super cepat.
 * 
 * Models:
 * - llama-3.3-70b-versatile (PRIMARY)
 * - llama-3.1-8b-instant (FAST)
 * - mixtral-8x7b-32768 (BACKUP)
 * 
 * @author AI System
 * @version 1.0.0
 */

import Groq from 'groq-sdk';

/**
 * Model configurations untuk Groq
 */
const GROQ_MODELS = [
    {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B',
        tokensPerDay: 180000,
        priority: 1,
        description: 'Most capable, versatile responses'
    },
    {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B Instant',
        tokensPerDay: 180000,
        priority: 2,
        description: 'Fast responses, good for simple tasks'
    },
    {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        tokensPerDay: 180000,
        priority: 3,
        description: 'Good balance of speed and quality'
    }
];

/**
 * GroqProvider Class
 */
export class GroqProvider {
    /**
     * @param {Object} config - Configuration
     * @param {string} config.apiKey - Groq API Key
     * @param {Function} config.onLog - Logging callback
     */
    constructor(config = {}) {
        this.apiKey = config.apiKey || process.env.GROQ_API_KEY;
        this.onLog = config.onLog || console.log;

        if (!this.apiKey) {
            this._log('warn', 'GROQ_API_KEY not set - provider will be unavailable');
            this.client = null;
        } else {
            this.client = new Groq({ apiKey: this.apiKey });
        }

        // Health tracking
        this.modelHealth = {};
        this.tokenUsage = {};
        this.lastReset = this._getTodayStart();

        // Initialize tracking for all models
        GROQ_MODELS.forEach(model => {
            this.modelHealth[model.id] = {
                healthy: true,
                failures: 0,
                lastSuccess: null,
                avgResponseTime: 0,
                responseTimes: []
            };
            this.tokenUsage[model.id] = 0;
        });

        // Chat history per session
        this.chatHistory = new Map();

        this._log('info', 'GroqProvider initialized', {
            available: !!this.client,
            models: GROQ_MODELS.map(m => m.id)
        });
    }

    /**
     * Check if provider is available
     */
    isAvailable() {
        return !!this.client;
    }

    /**
     * Get response from Groq with auto-fallback
     */
    async getResponse(message, options = {}) {
        if (!this.client) {
            return {
                success: false,
                error: 'API_KEY_MISSING',
                message: 'Groq API key not configured',
                provider: 'groq'
            };
        }

        const startTime = Date.now();
        const { sessionId, preferredModel, maxTokens = 2048 } = options;

        // Check daily reset
        this._checkDailyReset();

        // Get available models
        const availableModels = this._getAvailableModels(preferredModel);

        if (availableModels.length === 0) {
            return {
                success: false,
                error: 'NO_MODELS_AVAILABLE',
                message: 'All Groq models unavailable or quota exceeded',
                provider: 'groq'
            };
        }

        // Build messages with history
        const messages = this._buildMessages(message, sessionId);

        // Try each model
        for (const modelConfig of availableModels) {
            try {
                this._log('debug', `Trying Groq model: ${modelConfig.id}`);

                const completion = await this.client.chat.completions.create({
                    model: modelConfig.id,
                    messages: messages,
                    max_tokens: maxTokens,
                    temperature: 0.7,
                    top_p: 0.9
                });

                const responseText = completion.choices[0]?.message?.content || '';
                const tokensUsed = completion.usage?.total_tokens || 0;

                // Update tracking
                const responseTime = Date.now() - startTime;
                this._updateHealth(modelConfig.id, true, responseTime);
                this.tokenUsage[modelConfig.id] += tokensUsed;

                // Update chat history
                if (sessionId) {
                    this._updateChatHistory(sessionId, message, responseText);
                }

                return {
                    success: true,
                    text: responseText,
                    model: modelConfig.id,
                    modelName: modelConfig.name,
                    provider: 'groq',
                    responseTime,
                    usage: {
                        tokensUsed,
                        totalTokensToday: this.tokenUsage[modelConfig.id],
                        tokenLimit: modelConfig.tokensPerDay
                    }
                };

            } catch (error) {
                this._log('warn', `Groq model ${modelConfig.id} failed`, { error: error.message });
                this._updateHealth(modelConfig.id, false, 0, error);

                if (this._isRateLimitError(error)) {
                    this.tokenUsage[modelConfig.id] = modelConfig.tokensPerDay;
                    continue;
                }

                continue;
            }
        }

        return {
            success: false,
            error: 'ALL_MODELS_FAILED',
            message: 'All Groq models failed to respond',
            provider: 'groq'
        };
    }

    /**
     * Build messages array with chat history
     * @private
     */
    _buildMessages(message, sessionId) {
        const messages = [];

        // Add system message
        messages.push({
            role: 'system',
            content: 'You are a helpful, friendly AI assistant. Respond in the same language as the user. Be concise but thorough.'
        });

        // Add chat history if exists
        if (sessionId && this.chatHistory.has(sessionId)) {
            const history = this.chatHistory.get(sessionId);
            messages.push(...history.slice(-10)); // Last 5 exchanges (10 messages)
        }

        // Add current message
        messages.push({
            role: 'user',
            content: message
        });

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

        // Limit history size
        if (history.length > 20) {
            history.splice(0, 2);
        }
    }

    /**
     * Get available models based on health and quota
     * @private
     */
    _getAvailableModels(preferredModel = null) {
        const available = GROQ_MODELS.filter(model => {
            const health = this.modelHealth[model.id];
            const tokensUsed = this.tokenUsage[model.id];

            if (!health.healthy || health.failures >= 3) return false;
            if (tokensUsed >= model.tokensPerDay * 0.95) return false;

            return true;
        });

        // Prioritize preferred model
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
     * Update health metrics
     * @private
     */
    _updateHealth(modelId, success, responseTime, error = null) {
        const health = this.modelHealth[modelId];

        if (success) {
            health.healthy = true;
            health.failures = 0;
            health.lastSuccess = Date.now();

            health.responseTimes.push(responseTime);
            if (health.responseTimes.length > 10) {
                health.responseTimes.shift();
            }
            health.avgResponseTime = health.responseTimes.reduce((a, b) => a + b, 0) / health.responseTimes.length;
        } else {
            health.failures++;
            if (health.failures >= 3) {
                health.healthy = false;
            }
        }
    }

    /**
     * Check if error is rate limit
     * @private
     */
    _isRateLimitError(error) {
        const msg = error.message?.toLowerCase() || '';
        return msg.includes('rate') || msg.includes('limit') || msg.includes('429') || msg.includes('quota');
    }

    /**
     * Check and reset daily quotas
     * @private
     */
    _checkDailyReset() {
        const todayStart = this._getTodayStart();
        if (todayStart > this.lastReset) {
            this._log('info', 'Resetting daily token usage');
            GROQ_MODELS.forEach(model => {
                this.tokenUsage[model.id] = 0;
                this.modelHealth[model.id].healthy = true;
                this.modelHealth[model.id].failures = 0;
            });
            this.lastReset = todayStart;
        }
    }

    /**
     * Get today's start timestamp (midnight UTC)
     * @private
     */
    _getTodayStart() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    }

    /**
     * Get health status
     */
    getHealthStatus() {
        const status = {};
        GROQ_MODELS.forEach(model => {
            const health = this.modelHealth[model.id];
            const tokensUsed = this.tokenUsage[model.id];

            status[model.id] = {
                name: model.name,
                healthy: health.healthy,
                tokensUsed,
                tokenLimit: model.tokensPerDay,
                tokensRemaining: model.tokensPerDay - tokensUsed,
                avgResponseTime: Math.round(health.avgResponseTime),
                failures: health.failures
            };
        });

        return {
            available: this.isAvailable(),
            models: status
        };
    }

    /**
     * Clear chat history
     */
    clearHistory(sessionId) {
        if (this.chatHistory.has(sessionId)) {
            this.chatHistory.delete(sessionId);
        }
    }

    /**
     * Logger
     * @private
     */
    _log(level, message, data = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            provider: 'groq',
            message,
            ...data
        };
        if (this.onLog) this.onLog(entry);
    }
}

export default GroqProvider;
