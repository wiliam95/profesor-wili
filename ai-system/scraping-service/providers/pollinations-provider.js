/**
 * Pollinations.ai Provider - Enhanced with Web Search
 * Endpoint: https://text.pollinations.ai/
 */

import fetch from 'node-fetch';

export class PollinationsProvider {
    constructor(config = {}) {
        this.onLog = config.onLog || console.log;
        this.baseUrl = 'https://text.pollinations.ai/';
        this._log('info', 'PollinationsProvider initialized with Web Search (Free/No-Auth)');
    }

    /**
     * Deteksi apakah user ingin search internet
     */
    _detectSearchIntent(message) {
        const searchKeywords = /\b(cari|search|apa itu|info terbaru|berita|latest|news|what is|find|lookup)\b/i;
        return searchKeywords.test(message);
    }

    /**
     * Ekstrak query dari message
     */
    _extractQuery(message) {
        // Hapus command keywords
        return message
            .replace(/\b(cari|search|apa itu|info terbaru|berita|latest|news|what is|find|lookup)\b/gi, '')
            .trim();
    }

    /**
     * Search web menggunakan DuckDuckGo API
     */
    async _searchWeb(query, limit = 5) {
        try {
            // Import webSearch service
            const { searchWeb } = await import('./webSearch.js');
            const results = await searchWeb(query, limit);

            // Convert format jika perlu
            return results.map(r => ({
                title: r.title,
                source: r.source,
                snippet: r.snippet,
                url: r.link
            }));
        } catch (error) {
            this._log('error', `Web search failed: ${error.message}`);
            return [];
        }
    }

    async getResponse(message) {
        const startTime = Date.now();

        try {
            this._log('info', 'Processing message...');

            // Deteksi search intent
            const needsSearch = this._detectSearchIntent(message);
            let searchContext = '';

            if (needsSearch) {
                this._log('info', 'Search intent detected, fetching web results...');
                const query = this._extractQuery(message);
                const searchResults = await this._searchWeb(query, 5);

                if (searchResults.length > 0) {
                    searchContext = '\n\n[HASIL PENCARIAN WEB]\n';
                    searchResults.forEach((result, idx) => {
                        searchContext += `${idx + 1}. ${result.title}\n`;
                        searchContext += `   Sumber: ${result.source}\n`;
                        searchContext += `   Info: ${result.snippet}\n`;
                        if (result.url) searchContext += `   URL: ${result.url}\n`;
                        searchContext += '\n';
                    });
                    searchContext += '[AKHIR HASIL PENCARIAN]\n\n';
                    searchContext += 'Berdasarkan informasi di atas, jawab pertanyaan user dengan detail dan sertakan sumber.';
                }
            }

            // Kirim ke Pollinations dengan context
            const fullPrompt = searchContext
                ? `${searchContext}\n\nPertanyaan User: ${message}`
                : message;

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful AI assistant with access to real-time web search. When provided with search results, cite your sources and provide accurate, up-to-date information.'
                        },
                        { role: 'user', content: fullPrompt }
                    ],
                    model: 'openai'
                })
            });

            if (!response.ok) {
                // Fallback ke GET
                this._log('info', 'POST failed, trying GET fallback...');
                const fallbackUrl = `${this.baseUrl}${encodeURIComponent(fullPrompt)}`;
                const fallbackResp = await fetch(fallbackUrl);
                if (!fallbackResp.ok) throw new Error(`Pollinations Error: ${fallbackResp.status}`);
                const text = await fallbackResp.text();
                return this.success(text, startTime, needsSearch);
            }

            const text = await response.text();
            return this.success(text, startTime, needsSearch);

        } catch (error) {
            this._log('error', `Pollinations Failed: ${error.message}`);
            return {
                success: false,
                error: error.message,
                provider: 'pollinations'
            };
        }
    }

    success(text, startTime, usedSearch) {
        const duration = Date.now() - startTime;
        this._log('info', `Pollinations Success! (${duration}ms)${usedSearch ? ' [with web search]' : ''}`);
        return {
            success: true,
            text: text,
            provider: 'pollinations',
            responseTime: duration,
            usedWebSearch: usedSearch
        };
    }

    _log(level, msg) {
        if (this.onLog) this.onLog({ level, message: msg, provider: 'pollinations-provider' });
    }

    async cleanup() { }
}

export default PollinationsProvider;
