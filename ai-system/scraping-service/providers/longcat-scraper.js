/**
 * ===========================================
 * LONGCAT PROVIDER - Official API
 * ===========================================
 * 
 * Provider untuk LongCat API Resmi.
 * URL: https://api.longcat.chat
 * Quota: 500,000 tokens/hari GRATIS via Dashboard.
 * 
 * Cara dapat API Key:
 * 1. Buka https://longcat.chat/
 * 2. Daftar/Login
 * 3. Masuk ke Dashboard -> API Keys
 * 
 * @author AI System
 * @version 2.0.0 (API Version)
 */

import fetch from 'node-fetch';

export class LongCatScraper { // Keep name as Scraper class for compatibility, but internally uses API
    constructor(config = {}) {
        this.onLog = config.onLog || console.log;
        this.apiKey = process.env.LONGCAT_API_KEY; // User needs to set this
        this.baseUrl = 'https://api.longcat.chat/v1';

        // Fallback scraping if no key
        this.useScraping = !this.apiKey;

        // Selectors for fallback (legacy scraping)
        this.selectors = {
            input: 'textarea, input[type="text"][placeholder*="chat"]',
            sendBtn: 'button[type="submit"]',
            response: '.prose, .markdown'
        };
    }

    async getResponse(message) {
        // 1. Try API First (Stability: High)
        if (this.apiKey) {
            return this._callApi(message);
        }

        // 2. Fallback to Scraping (Stability: Low)
        this._log('warn', 'LONGCAT_API_KEY not found. Using unstable fallback scraping...');
        return {
            success: false,
            error: 'PLEASE_SET_LONGCAT_API_KEY',
            message: 'Mohon set LONGCAT_API_KEY di .env agar stabil. Scraping dimatikan demi stabilitas.',
            provider: 'longcat-api'
        };
    }

    async _callApi(message) {
        const startTime = Date.now();
        try {
            this._log('info', 'Calling LongCat API...');

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'LongCat-Flash-Chat', // or LongCat-Flash-Thinking
                    messages: [{ role: 'user', content: message }],
                    stream: false,
                    max_tokens: 4096
                })
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`API Error ${response.status}: ${err}`);
            }

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content || '';

            const duration = Date.now() - startTime;
            this._log('info', `API Success! (${duration}ms)`);

            return {
                success: true,
                text: text.trim(),
                provider: 'longcat-api',
                responseTime: duration
            };

        } catch (error) {
            this._log('error', `LongCat API Failed: ${error.message}`);
            return {
                success: false,
                error: error.message,
                provider: 'longcat-api'
            };
        }
    }

    _log(level, msg) {
        if (this.onLog) this.onLog({ level, message: msg, provider: 'longcat-provider' });
    }

    async cleanup() { } // No browser to close
}

export default LongCatScraper;
