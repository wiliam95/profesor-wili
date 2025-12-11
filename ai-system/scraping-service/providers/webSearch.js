/**
 * BACKEND Web Search Service - Node.js Compatible (ESM)
 * Priority: Google CSE → Jina Scraper → SerpAPI → DuckDuckGo → Wikipedia
 * NOTE: Uses process.env instead of localStorage
 */

import fetch from 'node-fetch';

/**
 * Main search function with intelligent fallback
 */
export async function searchWeb(query, limit = 5) {
    const results = [];
    let source = '';

    // ============================================
    // TIER 1: Google Custom Search (Requires Env Vars)
    // ============================================
    try {
        const googleKey = process.env.GOOGLE_CSE_KEY;
        const googleCx = process.env.GOOGLE_CSE_CX;

        if (googleKey && googleCx) {
            console.log('[WebSearch-Backend] Trying Google CSE...');
            const response = await fetch(
                `https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${googleCx}&q=${encodeURIComponent(query)}&num=${limit}`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    data.items.forEach(item => {
                        results.push({
                            title: item.title,
                            link: item.link,
                            source: 'Google CSE',
                            snippet: item.snippet || ''
                        });
                    });
                    source = 'Google CSE';
                }
            }
        }
    } catch (error) {
        console.error('[WebSearch-Backend] Google CSE error:', error.message);
    }

    // ============================================
    // TIER 2: Jina Reader + Google Scraping (Fallback)
    // ============================================
    if (results.length === 0) {
        try {
            console.log('[WebSearch-Backend] Trying Jina Reader scraping...');
            const jinaUrl = `https://r.jina.ai/https://www.google.com/search?q=${encodeURIComponent(query)}&num=${limit}`;
            const response = await fetch(jinaUrl, {
                headers: {
                    'Accept': 'application/json',
                    'X-Return-Format': 'markdown'
                }
            });

            if (response.ok) {
                const text = await response.text();

                const lines = text.split('\n');
                let currentTitle = '';
                let currentSnippet = '';
                let currentUrl = '';

                lines.forEach(line => {
                    if (line.startsWith('## ')) {
                        if (currentTitle && currentSnippet) {
                            results.push({
                                title: currentTitle,
                                link: currentUrl || '#',
                                source: 'Google (Jina)',
                                snippet: currentSnippet
                            });
                        }
                        currentTitle = line.replace('## ', '').trim();
                        currentSnippet = '';
                        currentUrl = '';
                    }
                    else if (line.includes('](http')) {
                        const match = line.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
                        if (match) {
                            currentUrl = match[2];
                            if (!currentTitle) currentTitle = match[1];
                        }
                    }
                    else if (line.trim() && !line.startsWith('#') && !line.startsWith('[')) {
                        currentSnippet += line.trim() + ' ';
                    }
                });

                if (currentTitle && currentSnippet) {
                    results.push({
                        title: currentTitle,
                        link: currentUrl || '#',
                        source: 'Google (Jina)',
                        snippet: currentSnippet.trim()
                    });
                }

                if (results.length > 0) {
                    source = 'Jina Reader Scraper';
                }
            }
        } catch (error) {
            console.error('[WebSearch-Backend] Jina scraping error:', error.message);
        }
    }

    // ============================================
    // TIER 3: SerpAPI (Requires Env Var)
    // ============================================
    if (results.length === 0) {
        try {
            const serpKey = process.env.SERPAPI_KEY;
            if (serpKey) {
                console.log('[WebSearch-Backend] Trying SerpAPI...');
                const response = await fetch(
                    `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpKey}&num=${limit}`
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.organic_results) {
                        data.organic_results.forEach(item => {
                            results.push({
                                title: item.title,
                                link: item.link,
                                source: 'SerpAPI',
                                snippet: item.snippet || ''
                            });
                        });
                        source = 'SerpAPI';
                    }
                }
            }
        } catch (error) {
            console.error('[WebSearch-Backend] SerpAPI error:', error.message);
        }
    }

    // ============================================
    // TIER 4: DuckDuckGo (Last Resort)
    // ============================================
    if (results.length === 0) {
        try {
            console.log('[WebSearch-Backend] Trying DuckDuckGo...');
            const response = await fetch(
                `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
            );

            if (response.ok) {
                const data = await response.json();

                if (data.Abstract) {
                    results.push({
                        title: data.Heading || 'Info Utama',
                        link: data.AbstractURL || '#',
                        source: data.AbstractSource || 'DuckDuckGo',
                        snippet: data.Abstract
                    });
                }

                if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                    data.RelatedTopics.slice(0, limit - results.length).forEach(topic => {
                        if (topic.Text && topic.FirstURL) {
                            results.push({
                                title: topic.Text.split(' - ')[0],
                                link: topic.FirstURL,
                                source: 'DuckDuckGo',
                                snippet: topic.Text
                            });
                        }
                    });
                }

                if (results.length > 0) {
                    source = 'DuckDuckGo';
                }
            }
        } catch (error) {
            console.error('[WebSearch-Backend] DuckDuckGo error:', error.message);
        }
    }

    // ============================================
    // TIER 5: Wikipedia (Knowledge Fallback)
    // ============================================
    if (results.length === 0) {
        try {
            console.log('[WebSearch-Backend] Trying Wikipedia...');
            const response = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=${limit}`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.query && data.query.search) {
                    data.query.search.forEach(item => {
                        results.push({
                            title: item.title,
                            link: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
                            source: 'Wikipedia',
                            snippet: item.snippet.replace(/<[^>]+>/g, '')
                        });
                    });
                    source = 'Wikipedia';
                }
            }
        } catch (error) {
            console.error('[WebSearch-Backend] Wikipedia error:', error.message);
        }
    }

    console.log(`[WebSearch-Backend] Result: ${results.length} items via ${source}`);
    return results.slice(0, limit);
}

export default { searchWeb };
