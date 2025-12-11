/**
 * ===========================================
 * HUGGING FACE PROVIDER - Inference API
 * ===========================================
 * 
 * Provider untuk HuggingFace Inference API.
 * FREE with rate limits.
 * 
 * Models:
 * - meta-llama/Llama-3.3-70B-Instruct (PRIMARY)
 * - mistralai/Mixtral-8x7B-Instruct-v0.1 (BACKUP)
 * - microsoft/Phi-3-mini-4k-instruct (FAST)
 * 
 * @author AI System
 * @version 1.0.0
 */

const HF_MODELS = [
    {
        id: 'meta-llama/Llama-3.3-70B-Instruct',
        name: 'Llama 3.3 70B',
        priority: 1,
        description: 'Most capable open model'
    },
    {
        id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        name: 'Mixtral 8x7B',
        priority: 2,
        description: 'Good balance of speed and quality'
    },
    {
        id: 'microsoft/Phi-3-mini-4k-instruct',
        name: 'Phi-3 Mini',
        priority: 3,
        description: 'Fast, compact model'
    }
];

/**
 * HuggingFaceProvider Class
 */
export class HuggingFaceProvider {
    constructor(config = {}) {
        this.apiKey = config.apiKey || process.env.HF_API_KEY;
        this.onLog = config.onLog || console.log;
        this.baseUrl = 'https://api-inference.huggingface.co/models';

        // Health tracking
        this.modelHealth = {};
        HF_MODELS.forEach(model => {
            this.modelHealth[model.id] = {
                healthy: true,
                failures: 0,
                lastSuccess: null,
                avgResponseTime: 0,
                responseTimes: []
            };
        });

        this.chatHistory = new Map();

        this._log('info', 'HuggingFaceProvider initialized', { available: !!this.apiKey });
    }

    isAvailable() {
        return !!this.apiKey;
    }

    async getResponse(message, options = {}) {
        if (!this.apiKey) {
            return {
                success: false,
                error: 'API_KEY_MISSING',
                message: 'HuggingFace API key not configured',
                provider: 'huggingface'
            };
        }

        const startTime = Date.now();
        const { sessionId, preferredModel, maxTokens = 1024 } = options;

        const availableModels = this._getAvailableModels(preferredModel);

        if (availableModels.length === 0) {
            return {
                success: false,
                error: 'NO_MODELS_AVAILABLE',
                message: 'All HuggingFace models unavailable',
                provider: 'huggingface'
            };
        }

        // Build prompt with history
        const prompt = this._buildPrompt(message, sessionId);

        for (const modelConfig of availableModels) {
            try {
                this._log('debug', `Trying HF model: ${modelConfig.id}`);

                const response = await fetch(`${this.baseUrl}/${modelConfig.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: {
                            max_new_tokens: maxTokens,
                            temperature: 0.7,
                            top_p: 0.9,
                            return_full_text: false
                        },
                        options: {
                            wait_for_model: true
                        }
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                }

                const data = await response.json();
                let responseText = '';

                if (Array.isArray(data)) {
                    responseText = data[0]?.generated_text || '';
                } else {
                    responseText = data.generated_text || '';
                }

                // Clean up response
                responseText = this._cleanResponse(responseText);

                const responseTime = Date.now() - startTime;
                this._updateHealth(modelConfig.id, true, responseTime);

                if (sessionId) {
                    this._updateChatHistory(sessionId, message, responseText);
                }

                return {
                    success: true,
                    text: responseText,
                    model: modelConfig.id,
                    modelName: modelConfig.name,
                    provider: 'huggingface',
                    responseTime
                };

            } catch (error) {
                this._log('warn', `HF model ${modelConfig.id} failed`, { error: error.message });
                this._updateHealth(modelConfig.id, false, 0, error);

                // Check if model is loading
                if (error.message.includes('loading')) {
                    await new Promise(r => setTimeout(r, 5000));
                    continue;
                }

                continue;
            }
        }

        return {
            success: false,
            error: 'ALL_MODELS_FAILED',
            message: 'All HuggingFace models failed',
            provider: 'huggingface'
        };
    }

    _buildPrompt(message, sessionId) {
        let prompt = '';

        // Add chat history
        if (sessionId && this.chatHistory.has(sessionId)) {
            const history = this.chatHistory.get(sessionId);
            for (const msg of history.slice(-6)) {
                if (msg.role === 'user') {
                    prompt += `User: ${msg.content}\n`;
                } else {
                    prompt += `Assistant: ${msg.content}\n`;
                }
            }
        }

        // Add current message
        prompt += `User: ${message}\nAssistant:`;

        return prompt;
    }

    _cleanResponse(text) {
        // Remove potential duplicate prompts
        const lines = text.split('\n');
        const cleaned = lines.filter(line => !line.startsWith('User:') && !line.startsWith('Assistant:'));
        return cleaned.join('\n').trim();
    }

    _updateChatHistory(sessionId, userMessage, assistantMessage) {
        if (!this.chatHistory.has(sessionId)) {
            this.chatHistory.set(sessionId, []);
        }

        const history = this.chatHistory.get(sessionId);
        history.push({ role: 'user', content: userMessage });
        history.push({ role: 'assistant', content: assistantMessage });

        if (history.length > 12) history.splice(0, 2);
    }

    _getAvailableModels(preferredModel = null) {
        const available = HF_MODELS.filter(model => {
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

    getHealthStatus() {
        const status = {};
        HF_MODELS.forEach(model => {
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

    clearHistory(sessionId) {
        if (this.chatHistory.has(sessionId)) this.chatHistory.delete(sessionId);
    }

    _log(level, message, data = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            provider: 'huggingface',
            message,
            ...data
        };
        if (this.onLog) this.onLog(entry);
    }
}

export default HuggingFaceProvider;
