/**
 * ===========================================
 * SCRAPER CLIENT - HTTP Client untuk Scraping Service
 * ===========================================
 * 
 * Client untuk berkomunikasi dengan scraping service
 * yang di-deploy di Railway/Render.
 * 
 * @author AI System
 * @version 1.0.0
 */

/**
 * ScraperClient Class
 * Menangani komunikasi dengan scraping service eksternal
 */
export class ScraperClient {
    /**
     * @param {Object} config - Konfigurasi client
     * @param {string} config.baseUrl - URL scraping service
     * @param {string} config.apiKey - API key untuk autentikasi
     * @param {number} config.timeout - Request timeout (ms)
     * @param {number} config.maxRetries - Max retry attempts
     * @param {Function} config.onLog - Callback untuk logging
     */
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || process.env.SCRAPING_SERVICE_URL;
        this.apiKey = config.apiKey || process.env.SCRAPING_API_KEY;
        this.timeout = config.timeout || 45000;
        this.maxRetries = config.maxRetries || 3;
        this.onLog = config.onLog || console.log;

        // Health tracking
        this.providerHealth = {
            brave: { healthy: true, failures: 0, lastCheck: null },
            copilot: { healthy: true, failures: 0, lastCheck: null }
        };

        // Circuit breaker state
        this.circuitBreaker = {
            brave: { open: false, openedAt: null, cooldownMs: 60000 },
            copilot: { open: false, openedAt: null, cooldownMs: 120000 }
        };

        this._log('info', 'ScraperClient initialized', { baseUrl: this.baseUrl });
    }

    /**
     * Mendapatkan response dari Brave Leo
     * 
     * @param {string} message - Pesan dari user
     * @param {Object} options - Opsi tambahan
     * @returns {Promise<Object>} Response object
     */
    async getBraveResponse(message, options = {}) {
        return this._makeRequest('brave', message, options);
    }

    /**
     * Mendapatkan response dari Copilot
     * 
     * @param {string} message - Pesan dari user
     * @param {Object} options - Opsi tambahan
     * @returns {Promise<Object>} Response object
     */
    async getCopilotResponse(message, options = {}) {
        return this._makeRequest('copilot', message, options);
    }

    /**
     * Mendapatkan response dengan auto-fallback (Brave -> Copilot)
     * 
     * @param {string} message - Pesan dari user
     * @param {Object} options - Opsi tambahan
     * @returns {Promise<Object>} Response object
     */
    async getResponse(message, options = {}) {
        // Coba Brave dulu
        if (this._isProviderAvailable('brave')) {
            const braveResult = await this.getBraveResponse(message, options);
            if (braveResult.success) {
                return braveResult;
            }
        }

        // Fallback ke Copilot
        if (this._isProviderAvailable('copilot')) {
            return this.getCopilotResponse(message, options);
        }

        return {
            success: false,
            error: 'ALL_SCRAPERS_UNAVAILABLE',
            message: 'Semua scraping providers tidak tersedia.',
            provider: 'scraper'
        };
    }

    /**
     * Make HTTP request ke scraping service
     * @private
     */
    async _makeRequest(provider, message, options) {
        const startTime = Date.now();

        // Check circuit breaker
        if (this._isCircuitOpen(provider)) {
            return {
                success: false,
                error: 'CIRCUIT_OPEN',
                message: `Provider ${provider} sedang dalam cooldown.`,
                provider
            };
        }

        const endpoint = `${this.baseUrl}/api/chat/${provider}`;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                this._log('debug', `Attempt ${attempt} to ${provider}`, { endpoint });

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                        'X-Request-ID': this._generateRequestId()
                    },
                    body: JSON.stringify({
                        message,
                        ...options
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                }

                const data = await response.json();
                const responseTime = Date.now() - startTime;

                // Update health
                this._updateHealth(provider, true);

                return {
                    success: true,
                    text: data.text || data.response,
                    provider,
                    responseTime,
                    metadata: data.metadata
                };

            } catch (error) {
                this._log('warn', `${provider} attempt ${attempt} failed`, { error: error.message });

                // Jika timeout atau network error, retry
                if (error.name === 'AbortError') {
                    if (attempt < this.maxRetries) {
                        await this._delay(1000 * attempt); // Exponential backoff
                        continue;
                    }
                }

                // Jika detection error, buka circuit breaker
                if (this._isDetectionError(error)) {
                    this._openCircuit(provider);
                    break;
                }

                // Retry untuk error lain
                if (attempt < this.maxRetries) {
                    await this._delay(1000 * attempt);
                    continue;
                }
            }
        }

        // Update health (failed)
        this._updateHealth(provider, false);

        return {
            success: false,
            error: 'REQUEST_FAILED',
            message: `Gagal mendapatkan response dari ${provider} setelah ${this.maxRetries} percobaan.`,
            provider
        };
    }

    /**
     * Check apakah provider tersedia
     * @private
     */
    _isProviderAvailable(provider) {
        const health = this.providerHealth[provider];
        const circuit = this.circuitBreaker[provider];

        // Check circuit breaker
        if (circuit.open) {
            // Check if cooldown passed
            if (Date.now() - circuit.openedAt > circuit.cooldownMs) {
                circuit.open = false;
                health.failures = 0;
                this._log('info', `Circuit breaker closed for ${provider}`);
            } else {
                return false;
            }
        }

        // Check health
        return health.healthy && health.failures < 5;
    }

    /**
     * Check apakah circuit breaker terbuka
     * @private
     */
    _isCircuitOpen(provider) {
        const circuit = this.circuitBreaker[provider];
        if (!circuit.open) return false;

        // Check if cooldown passed
        if (Date.now() - circuit.openedAt > circuit.cooldownMs) {
            circuit.open = false;
            return false;
        }

        return true;
    }

    /**
     * Buka circuit breaker
     * @private
     */
    _openCircuit(provider) {
        const circuit = this.circuitBreaker[provider];
        circuit.open = true;
        circuit.openedAt = Date.now();
        this._log('warn', `Circuit breaker opened for ${provider}`, { cooldownMs: circuit.cooldownMs });
    }

    /**
     * Check apakah error adalah detection error
     * @private
     */
    _isDetectionError(error) {
        const message = error.message?.toLowerCase() || '';
        return (
            message.includes('detection') ||
            message.includes('captcha') ||
            message.includes('blocked') ||
            message.includes('forbidden') ||
            message.includes('bot')
        );
    }

    /**
     * Update health status
     * @private
     */
    _updateHealth(provider, success) {
        const health = this.providerHealth[provider];
        health.lastCheck = Date.now();

        if (success) {
            health.healthy = true;
            health.failures = 0;
        } else {
            health.failures++;
            if (health.failures >= 5) {
                health.healthy = false;
            }
        }
    }

    /**
     * Check health dari scraping service
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });

            if (!response.ok) {
                return { healthy: false, error: `HTTP ${response.status}` };
            }

            return await response.json();
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    /**
     * Mendapatkan status health semua providers
     */
    getHealthStatus() {
        return {
            brave: {
                ...this.providerHealth.brave,
                circuitOpen: this.circuitBreaker.brave.open
            },
            copilot: {
                ...this.providerHealth.copilot,
                circuitOpen: this.circuitBreaker.copilot.open
            }
        };
    }

    /**
     * Generate unique request ID
     * @private
     */
    _generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Delay helper
     * @private
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Internal logging
     * @private
     */
    _log(level, message, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            provider: 'scraper-client',
            message,
            ...data
        };

        if (this.onLog) {
            this.onLog(logEntry);
        }
    }
}

export default ScraperClient;
