/**
 * Brave Leo + Ollama Integration
 * Run AI models locally, connect via Brave Leo BYOM feature
 * 
 * Prerequisites:
 * 1. Install Ollama: https://ollama.ai/download
 * 2. Run: ollama serve
 * 3. Pull model: ollama pull llama3.2
 */

import fetch from 'node-fetch';

export class BraveLeoOllamaProvider {
    constructor(config = {}) {
        this.onLog = config.onLog || console.log;
        this.ollamaUrl = config.ollamaUrl || 'http://localhost:11434';
        this.model = config.model || 'llama3.2';
        this._log('info', 'BraveLeoOllama initialized - Local AI via BYOM');
    }

    async getResponse(message) {
        const startTime = Date.now();

        try {
            this._log('info', 'Calling Ollama local model...');

            const response = await fetch(`${this.ollamaUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    prompt: message,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama Error: ${response.status}`);
            }

            const data = await response.json();
            const text = data.response || 'No response';

            return this.success(text, startTime);

        } catch (error) {
            this._log('error', `Ollama Failed: ${error.message}`);
            return {
                success: false,
                error: error.message,
                provider: 'brave-leo-ollama'
            };
        }
    }

    success(text, startTime) {
        const duration = Date.now() - startTime;
        this._log('info', `Ollama Success! (${duration}ms) [100% Private, Local]`);
        return {
            success: true,
            text: text,
            provider: 'brave-leo-ollama',
            model: this.model,
            responseTime: duration,
            privacy: '100% local, no data sent to cloud'
        };
    }

    _log(level, msg) {
        if (this.onLog) this.onLog({ level, message: msg, provider: 'brave-leo-ollama' });
    }

    async cleanup() { }
}

export default BraveLeoOllamaProvider;
