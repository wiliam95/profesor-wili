/**
 * LLM7.io Provider - Free LLM API without authentication
 * NO API KEY REQUIRED
 */

import fetch from 'node-fetch';

export class LLM7Provider {
    constructor(config = {}) {
        this.onLog = config.onLog || console.log;
        this.baseUrl = 'https://llm7.io/v1';
        this._log('info', 'LLM7Provider initialized (NO API KEY NEEDED)');
    }

    async getResponse(message) {
        const startTime = Date.now();
        try {
            this._log('info', 'Calling LLM7.io API...');

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: message }],
                    stream: false
                })
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`LLM7 Error ${response.status}: ${err}`);
            }

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content || '';

            const duration = Date.now() - startTime;

            this._log('info', `LLM7 Success! (${duration}ms)`);

            return {
                success: true,
                text: text.trim(),
                provider: 'llm7-free',
                responseTime: duration
            };

        } catch (error) {
            this._log('error', `LLM7 Failed: ${error.message}`);
            return {
                success: false,
                error: error.message,
                provider: 'llm7-free'
            };
        }
    }

    _log(level, msg) {
        if (this.onLog) this.onLog({ level, message: msg, provider: 'llm7-provider' });
    }

    async cleanup() { }
}

export default LLM7Provider;
