/**
 * ===========================================
 * UNIFIED AI SERVICE - Multi-Provider with Smart Fallback
 * ===========================================
 * 
 * Production-ready AI service dengan 4 provider fallback:
 * 1. Gemini (1500+ req/day) - PRIMARY
 * 2. Groq (180k tokens/day) - SECONDARY
 * 3. OpenRouter (Free models) - TERTIARY
 * 4. HuggingFace (Rate limited) - QUATERNARY
 * 
 * Features:
 * - Smart provider selection
 * - Auto-fallback cascade
 * - Health monitoring
 * - Response caching
 * - Rate limiting
 * 
 * @author AI System
 * @version 2.0.0
 */

import { GeminiProvider } from './providers/gemini-provider.js';
import { GroqProvider } from './providers/groq-provider.js';
import { OpenRouterProvider } from './providers/openrouter-provider.js';
import { HuggingFaceProvider } from './providers/huggingface-provider.js';
import NodeCache from 'node-cache';
import { v4 as uuidv4 } from 'uuid';

/**
 * AIService Class - Unified Multi-Provider Interface
 */
export class AIService {
    /**
     * @param {Object} config - Configuration
     */
    constructor(config = {}) {
        // Configuration
        this.enableCache = config.enableCache ?? (process.env.ENABLE_CACHE === 'true');
        this.cacheTTL = config.cacheTTL || parseInt(process.env.CACHE_TTL) || 3600;
        this.userRateLimitMs = config.userRateLimitMs || parseInt(process.env.USER_RATE_LIMIT_MS) || 2000;
        this.onLog = config.onLog || this._defaultLogger.bind(this);

        // Initialize all providers
        this.providers = {
            gemini: new GeminiProvider({
                apiKey: config.googleApiKey || process.env.GOOGLE_API_KEY,
                onLog: this.onLog
            }),
            groq: new GroqProvider({
                apiKey: config.groqApiKey || process.env.GROQ_API_KEY,
                onLog: this.onLog
            }),
            openrouter: new OpenRouterProvider({
                apiKey: config.openrouterApiKey || process.env.OPENROUTER_API_KEY,
                onLog: this.onLog
            }),
            huggingface: new HuggingFaceProvider({
                apiKey: config.hfApiKey || process.env.HF_API_KEY,
                onLog: this.onLog
            })
        };

        // Provider priority order
        this.providerOrder = ['gemini', 'groq', 'openrouter', 'huggingface'];

        // Cache
        this.cache = new NodeCache({
            stdTTL: this.cacheTTL,
            checkperiod: 120,
            useClones: false
        });

        // Rate limiting
        this.userLastRequest = new Map();

        // Statistics
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            cacheHits: 0,
            providerUsage: {
                gemini: 0,
                groq: 0,
                openrouter: 0,
                huggingface: 0
            },
            averageResponseTime: 0,
            responseTimes: []
        };

        this._log('info', 'AIService initialized', {
            providers: this.providerOrder.filter(p => this.providers[p].isAvailable?.() !== false),
            cacheEnabled: this.enableCache
        });
    }

    /**
     * Get AI response with auto-fallback
     * 
     * @param {string} message - User message
     * @param {Object} options - Options
     * @returns {Promise<Object>} Response
     */
    async getResponse(message, options = {}) {
        const startTime = Date.now();
        const requestId = uuidv4();
        const { userId, sessionId, skipCache = false, preferredProvider } = options;

        this.stats.totalRequests++;

        this._log('info', 'Processing request', { requestId, userId, messageLength: message.length });

        // Rate limiting
        if (userId) {
            const rateCheck = this._checkRateLimit(userId);
            if (!rateCheck.allowed) {
                return {
                    success: false,
                    error: 'RATE_LIMITED',
                    message: `Mohon tunggu ${rateCheck.waitMs}ms sebelum request berikutnya.`,
                    requestId
                };
            }
        }

        // Cache check
        if (this.enableCache && !skipCache) {
            const cacheKey = this._generateCacheKey(message);
            const cached = this.cache.get(cacheKey);
            if (cached) {
                this.stats.cacheHits++;
                this._log('debug', 'Cache hit', { requestId });
                return {
                    ...cached,
                    cached: true,
                    requestId,
                    responseTime: Date.now() - startTime
                };
            }
        }

        // Determine provider order
        let providerOrder = [...this.providerOrder];
        if (preferredProvider && this.providers[preferredProvider]) {
            providerOrder = [preferredProvider, ...providerOrder.filter(p => p !== preferredProvider)];
        }

        // Try each provider
        for (const providerName of providerOrder) {
            const provider = this.providers[providerName];

            // Skip if not available
            if (provider.isAvailable && !provider.isAvailable()) {
                this._log('debug', `Skipping ${providerName} - not available`);
                continue;
            }

            try {
                this._log('debug', `Trying provider: ${providerName}`);

                const result = await provider.getResponse(message, { sessionId });

                if (result.success) {
                    this.stats.successfulRequests++;
                    this.stats.providerUsage[providerName]++;

                    return this._finalizeResponse(result, message, startTime, requestId);
                }

                this._log('warn', `${providerName} failed`, { error: result.error });

            } catch (error) {
                this._log('error', `${providerName} threw error`, { error: error.message });
            }
        }

        // All providers failed
        this.stats.failedRequests++;

        return {
            success: false,
            error: 'ALL_PROVIDERS_FAILED',
            message: 'Maaf, semua AI providers sedang tidak tersedia. Silakan coba lagi.',
            requestId,
            responseTime: Date.now() - startTime
        };
    }

    /**
     * Finalize and cache response
     * @private
     */
    _finalizeResponse(result, message, startTime, requestId) {
        const responseTime = Date.now() - startTime;

        // Update stats
        this.stats.responseTimes.push(responseTime);
        if (this.stats.responseTimes.length > 100) this.stats.responseTimes.shift();
        this.stats.averageResponseTime = this.stats.responseTimes.reduce((a, b) => a + b, 0) / this.stats.responseTimes.length;

        // Cache
        if (this.enableCache) {
            const cacheKey = this._generateCacheKey(message);
            this.cache.set(cacheKey, {
                success: true,
                text: result.text,
                provider: result.provider,
                model: result.model
            });
        }

        this._log('info', 'Request completed', {
            requestId,
            provider: result.provider,
            model: result.model,
            responseTime
        });

        return {
            ...result,
            requestId,
            responseTime,
            cached: false
        };
    }

    /**
     * Check rate limit
     * @private
     */
    _checkRateLimit(userId) {
        const now = Date.now();
        const last = this.userLastRequest.get(userId);

        if (last) {
            const elapsed = now - last;
            if (elapsed < this.userRateLimitMs) {
                return { allowed: false, waitMs: this.userRateLimitMs - elapsed };
            }
        }

        this.userLastRequest.set(userId, now);
        return { allowed: true };
    }

    /**
     * Generate cache key
     * @private
     */
    _generateCacheKey(message) {
        const normalized = message.toLowerCase().trim().replace(/\s+/g, ' ');
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
            const char = normalized.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `msg_${hash}`;
    }

    /**
     * Get health status of all providers
     */
    getHealthStatus() {
        return {
            gemini: this.providers.gemini.getHealthStatus(),
            groq: this.providers.groq.getHealthStatus(),
            openrouter: this.providers.openrouter.getHealthStatus(),
            huggingface: this.providers.huggingface.getHealthStatus(),
            cache: {
                enabled: this.enableCache,
                keys: this.cache.keys().length,
                hits: this.stats.cacheHits
            },
            stats: {
                totalRequests: this.stats.totalRequests,
                successfulRequests: this.stats.successfulRequests,
                failedRequests: this.stats.failedRequests,
                successRate: this.stats.totalRequests > 0
                    ? Math.round((this.stats.successfulRequests / this.stats.totalRequests) * 100)
                    : 0,
                averageResponseTime: Math.round(this.stats.averageResponseTime),
                providerUsage: this.stats.providerUsage
            }
        };
    }

    /**
     * Get stats
     */
    getStats() {
        return {
            ...this.stats,
            cacheKeys: this.cache.keys().length,
            activeUsers: this.userLastRequest.size
        };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.flushAll();
        this._log('info', 'Cache cleared');
    }

    /**
     * Clear history for session
     */
    clearHistory(sessionId) {
        Object.values(this.providers).forEach(provider => {
            if (provider.clearHistory) provider.clearHistory(sessionId);
        });
    }

    /**
     * Default logger
     * @private
     */
    _defaultLogger(entry) {
        const { level, message, ...data } = entry;
        const line = `[${entry.timestamp}] [${level.toUpperCase()}] [${entry.provider || 'service'}] ${message}`;
        console[level === 'error' ? 'error' : 'log'](line, Object.keys(data).length > 1 ? data : '');
    }

    /**
     * Internal log
     * @private
     */
    _log(level, message, data = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            service: 'ai-service',
            message,
            ...data
        };
        if (this.onLog) this.onLog(entry);
    }
}

/**
 * Create AIService instance
 */
export function createAIService(config = {}) {
    return new AIService(config);
}

export default AIService;
