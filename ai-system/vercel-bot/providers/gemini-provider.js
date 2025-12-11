/**
 * ===========================================
 * GEMINI PROVIDER - Multi-Model Handler
 * ===========================================
 * 
 * Provider utama untuk Google AI Studio (Gemini).
 * Mendukung multi-model fallback dengan quota tracking.
 * 
 * Models yang didukung:
 * - gemini-2.0-flash-exp (1500 req/day) - PRIMARY
 * - gemini-1.5-flash (1000 req/day) - BACKUP 1  
 * - gemini-1.5-pro (50 req/day) - BACKUP 2
 * 
 * @author AI System
 * @version 1.0.0
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Konfigurasi model Gemini dengan quota dan prioritas
 */
const GEMINI_MODELS = [
    {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash (Exp)',
        dailyLimit: 1500,
        priority: 1,
        description: 'Model tercepat, eksperimental'
    },
    {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        dailyLimit: 1000,
        priority: 2,
        description: 'Model cepat dan stabil'
    },
    {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        dailyLimit: 50,
        priority: 3,
        description: 'Model berkualitas tinggi'
    }
];

/**
 * GeminiProvider Class
 * Menangani semua interaksi dengan Google AI Studio
 */
export class GeminiProvider {
    /**
     * @param {Object} config - Konfigurasi provider
     * @param {string} config.apiKey - Google AI Studio API key
     * @param {Function} config.onLog - Callback untuk logging
     */
    constructor(config = {}) {
        this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY;
        this.onLog = config.onLog || console.log;

        if (!this.apiKey) {
            throw new Error('GOOGLE_API_KEY tidak ditemukan! Set di environment variables.');
        }

        // Inisialisasi Google AI client
        this.genAI = new GoogleGenerativeAI(this.apiKey);

        // Tracking quota per model (reset setiap hari)
        this.quotaUsage = {};
        this.quotaResetTime = this._getNextMidnightPT();

        // Health tracking per model
        this.modelHealth = {};

        // Chat history untuk context
        this.chatHistory = new Map();

        // Inisialisasi quota dan health untuk semua model
        GEMINI_MODELS.forEach(model => {
            this.quotaUsage[model.id] = 0;
            this.modelHealth[model.id] = {
                healthy: true,
                failures: 0,
                lastSuccess: null,
                lastError: null,
                avgResponseTime: 0,
                responseTimes: []
            };
        });

        this._log('info', 'GeminiProvider initialized', { models: GEMINI_MODELS.map(m => m.id) });
    }

    /**
     * Mendapatkan response dari Gemini dengan auto-fallback
     * 
     * @param {string} message - Pesan dari user
     * @param {Object} options - Opsi tambahan
     * @param {string} options.sessionId - ID sesi untuk chat history
     * @param {string} options.preferredModel - Model yang diinginkan
     * @param {boolean} options.stream - Enable streaming (default: false)
     * @param {number} options.maxTokens - Max output tokens
     * @returns {Promise<Object>} Response object
     */
    async getResponse(message, options = {}) {
        const startTime = Date.now();
        const { sessionId, preferredModel, stream = false, maxTokens = 2048 } = options;

        // Check dan reset quota jika perlu
        this._checkQuotaReset();

        // Dapatkan model yang tersedia (sehat dan ada quota)
        const availableModels = this._getAvailableModels(preferredModel);

        if (availableModels.length === 0) {
            return {
                success: false,
                error: 'QUOTA_EXCEEDED',
                message: 'Semua model Gemini sudah mencapai batas quota harian.',
                provider: 'gemini'
            };
        }

        // Coba setiap model yang tersedia
        for (const modelConfig of availableModels) {
            try {
                this._log('debug', `Trying model: ${modelConfig.id}`);

                const result = await this._tryModel(modelConfig, message, {
                    sessionId,
                    stream,
                    maxTokens
                });

                // Update health dan quota
                const responseTime = Date.now() - startTime;
                this._updateModelHealth(modelConfig.id, true, responseTime);
                this.quotaUsage[modelConfig.id]++;

                return {
                    success: true,
                    text: result.text,
                    model: modelConfig.id,
                    modelName: modelConfig.name,
                    provider: 'gemini',
                    responseTime,
                    usage: {
                        quotaUsed: this.quotaUsage[modelConfig.id],
                        quotaLimit: modelConfig.dailyLimit,
                        quotaRemaining: modelConfig.dailyLimit - this.quotaUsage[modelConfig.id]
                    }
                };

            } catch (error) {
                this._log('warn', `Model ${modelConfig.id} failed`, { error: error.message });
                this._updateModelHealth(modelConfig.id, false, 0, error);

                // Jika quota exceeded, lanjut ke model berikutnya
                if (this._isQuotaError(error)) {
                    this.quotaUsage[modelConfig.id] = modelConfig.dailyLimit; // Mark as exhausted
                    continue;
                }

                // Jika error lain, coba model berikutnya
                continue;
            }
        }

        // Semua model gagal
        return {
            success: false,
            error: 'ALL_MODELS_FAILED',
            message: 'Semua model Gemini gagal merespons.',
            provider: 'gemini'
        };
    }

    /**
     * Mencoba satu model spesifik
     * @private
     */
    async _tryModel(modelConfig, message, options) {
        const { sessionId, stream, maxTokens } = options;

        const model = this.genAI.getGenerativeModel({
            model: modelConfig.id,
            generationConfig: {
                maxOutputTokens: maxTokens,
                temperature: 0.7,
                topP: 0.9,
            }
        });

        // Gunakan chat history jika ada sessionId
        let chat;
        if (sessionId && this.chatHistory.has(sessionId)) {
            chat = this.chatHistory.get(sessionId);
        } else {
            chat = model.startChat({
                history: [],
                generationConfig: {
                    maxOutputTokens: maxTokens,
                }
            });

            if (sessionId) {
                this.chatHistory.set(sessionId, chat);
            }
        }

        // Kirim pesan
        if (stream) {
            // Streaming response
            const result = await chat.sendMessageStream(message);
            let fullText = '';

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullText += chunkText;
            }

            return { text: fullText };
        } else {
            // Non-streaming response
            const result = await chat.sendMessage(message);
            const response = await result.response;
            return { text: response.text() };
        }
    }

    /**
     * Mendapatkan model yang tersedia berdasarkan quota dan health
     * @private
     */
    _getAvailableModels(preferredModel = null) {
        const available = GEMINI_MODELS.filter(model => {
            const health = this.modelHealth[model.id];
            const quotaUsed = this.quotaUsage[model.id];

            // Skip jika tidak sehat (lebih dari 3 kegagalan berturut-turut)
            if (!health.healthy || health.failures >= 3) {
                return false;
            }

            // Skip jika quota habis
            if (quotaUsed >= model.dailyLimit) {
                return false;
            }

            return true;
        });

        // Jika ada preferred model, prioritaskan
        if (preferredModel) {
            const preferredIdx = available.findIndex(m => m.id === preferredModel);
            if (preferredIdx > 0) {
                const preferred = available.splice(preferredIdx, 1)[0];
                available.unshift(preferred);
            }
        }

        return available;
    }

    /**
     * Update health metrics untuk model
     * @private
     */
    _updateModelHealth(modelId, success, responseTime, error = null) {
        const health = this.modelHealth[modelId];

        if (success) {
            health.healthy = true;
            health.failures = 0;
            health.lastSuccess = Date.now();

            // Track response time (keep last 10)
            health.responseTimes.push(responseTime);
            if (health.responseTimes.length > 10) {
                health.responseTimes.shift();
            }
            health.avgResponseTime = health.responseTimes.reduce((a, b) => a + b, 0) / health.responseTimes.length;
        } else {
            health.failures++;
            health.lastError = {
                message: error?.message,
                time: Date.now()
            };

            // Mark unhealthy jika terlalu banyak failure
            if (health.failures >= 3) {
                health.healthy = false;
                this._log('warn', `Model ${modelId} marked as unhealthy`, { failures: health.failures });
            }
        }
    }

    /**
     * Check apakah error adalah quota error
     * @private
     */
    _isQuotaError(error) {
        const errorMessage = error.message?.toLowerCase() || '';
        return (
            errorMessage.includes('quota') ||
            errorMessage.includes('429') ||
            errorMessage.includes('rate limit') ||
            errorMessage.includes('resource_exhausted')
        );
    }

    /**
     * Check dan reset quota jika sudah lewat midnight PT
     * @private
     */
    _checkQuotaReset() {
        const now = Date.now();
        if (now >= this.quotaResetTime) {
            this._log('info', 'Resetting daily quota for all models');

            GEMINI_MODELS.forEach(model => {
                this.quotaUsage[model.id] = 0;
                this.modelHealth[model.id].healthy = true;
                this.modelHealth[model.id].failures = 0;
            });

            this.quotaResetTime = this._getNextMidnightPT();
        }
    }

    /**
     * Mendapatkan timestamp midnight berikutnya (Pacific Time)
     * @private
     */
    _getNextMidnightPT() {
        const now = new Date();
        // Pacific Time adalah UTC-8 (atau UTC-7 saat DST)
        const ptOffset = -8 * 60; // dalam menit
        const ptNow = new Date(now.getTime() + (now.getTimezoneOffset() + ptOffset) * 60000);

        const nextMidnight = new Date(ptNow);
        nextMidnight.setDate(nextMidnight.getDate() + 1);
        nextMidnight.setHours(0, 0, 0, 0);

        // Konversi kembali ke UTC
        return nextMidnight.getTime() - (now.getTimezoneOffset() + ptOffset) * 60000;
    }

    /**
     * Mendapatkan status health semua model
     */
    getHealthStatus() {
        const status = {};

        GEMINI_MODELS.forEach(model => {
            const health = this.modelHealth[model.id];
            const quotaUsed = this.quotaUsage[model.id];

            status[model.id] = {
                name: model.name,
                healthy: health.healthy,
                quotaUsed,
                quotaLimit: model.dailyLimit,
                quotaRemaining: model.dailyLimit - quotaUsed,
                quotaPercentage: Math.round((quotaUsed / model.dailyLimit) * 100),
                avgResponseTime: Math.round(health.avgResponseTime),
                failures: health.failures,
                lastSuccess: health.lastSuccess,
                lastError: health.lastError
            };
        });

        return status;
    }

    /**
     * Menghapus chat history untuk sesi tertentu
     */
    clearHistory(sessionId) {
        if (this.chatHistory.has(sessionId)) {
            this.chatHistory.delete(sessionId);
            this._log('debug', `Chat history cleared for session: ${sessionId}`);
        }
    }

    /**
     * Menghapus semua chat history
     */
    clearAllHistory() {
        this.chatHistory.clear();
        this._log('info', 'All chat history cleared');
    }

    /**
     * Internal logging
     * @private
     */
    _log(level, message, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            provider: 'gemini',
            message,
            ...data
        };

        if (this.onLog) {
            this.onLog(logEntry);
        }
    }
}

export default GeminiProvider;
