/**
 * Web Search Service - Production-Ready Multi-Provider
 * Priority: Google CSE → Jina Scraper → SerpAPI → DuckDuckGo → Wikipedia
 */

/**
 * Main search function with intelligent fallback
 */
export async function searchWeb(query, limit = 5) {
    const results = [];
    let source = '';

    // ============================================
    // TIER 0: Vercel API Route (Bypass CORS)
    // ============================================
    try {
        console.log('[WebSearch] Trying Vercel API route...');
        const apiResponse = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, limit })
        });

        if (apiResponse.ok) {
            const data = await apiResponse.json();
            if (data.success && data.results?.length > 0) {
                console.log(`[WebSearch] ✓ API route returned ${data.results.length} results`);
                return data.results.slice(0, limit);
            }
        }
    } catch (apiError) {
        console.log('[WebSearch] API route unavailable, trying client-side...', apiError.message);
    }

    // ============================================
    // TIER 1: Google Custom Search (Most Reliable)
    // ============================================
    try {
        const googleKey = localStorage.getItem('wili.googleCseKey');
        const googleCx = localStorage.getItem('wili.googleCseCx');

        if (googleKey && googleCx) {
            console.log('[WebSearch] Trying Google CSE...');
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
                            source: 'Google',
                            snippet: item.snippet || ''
                        });
                    });
                    source = 'Google CSE';
                    console.log(`[WebSearch] ✓ Google CSE returned ${results.length} results`);
                }
            }
        }
    } catch (error) {
        console.error('[WebSearch] Google CSE error:', error.message);
    }

    // ============================================
    // TIER 2: Jina Reader + Google Scraping (Fallback)
    // ============================================
    if (results.length === 0) {
        try {
            console.log('[WebSearch] Trying Jina Reader scraping...');
            const jinaUrl = `https://r.jina.ai/https://www.google.com/search?q=${encodeURIComponent(query)}&num=${limit}`;
            const response = await fetch(jinaUrl, {
                headers: {
                    'Accept': 'application/json',
                    'X-Return-Format': 'markdown'
                }
            });

            if (response.ok) {
                const text = await response.text();

                // Parse markdown hasil dari Jina
                const lines = text.split('\n');
                let currentTitle = '';
                let currentSnippet = '';
                let currentUrl = '';

                lines.forEach(line => {
                    // Deteksi title (## heading)
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
                    // Deteksi URL [text](url)
                    else if (line.includes('](http')) {
                        const match = line.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
                        if (match) {
                            currentUrl = match[2];
                            if (!currentTitle) currentTitle = match[1];
                        }
                    }
                    // Deteksi snippet (plain text)
                    else if (line.trim() && !line.startsWith('#') && !line.startsWith('[')) {
                        currentSnippet += line.trim() + ' ';
                    }
                });

                // Push last item
                if (currentTitle && currentSnippet) {
                    results.push({
                        title: currentTitle,
                        link: currentUrl || '#',
                        source: 'Google (Jina)',
                        snippet: currentSnippet.trim()
                    });
                }

                source = 'Jina Reader Scraper';
                console.log(`[WebSearch] ✓ Jina scraping returned ${results.length} results`);
            }
        } catch (error) {
            console.error('[WebSearch] Jina scraping error:', error.message);
        }
    }

    // ============================================
    // TIER 3: SerpAPI (If Key Available)
    // ============================================
    if (results.length === 0) {
        try {
            const serpKey = localStorage.getItem('wili.serpapiKey');
            if (serpKey) {
                console.log('[WebSearch] Trying SerpAPI...');
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
                        console.log(`[WebSearch] ✓ SerpAPI returned ${results.length} results`);
                    }
                }
            }
        } catch (error) {
            console.error('[WebSearch] SerpAPI error:', error.message);
        }
    }

    // ============================================
    // TIER 4: DuckDuckGo (Last Resort)
    // ============================================
    if (results.length === 0) {
        try {
            console.log('[WebSearch] Trying DuckDuckGo...');
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
                    console.log(`[WebSearch] ✓ DuckDuckGo returned ${results.length} results`);
                }
            }
        } catch (error) {
            console.error('[WebSearch] DuckDuckGo error:', error.message);
        }
    }

    // ============================================
    // TIER 5: Wikipedia (Knowledge Fallback)
    // ============================================
    if (results.length === 0) {
        try {
            console.log('[WebSearch] Trying Wikipedia...');
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
                    console.log(`[WebSearch] ✓ Wikipedia returned ${results.length} results`);
                }
            }
        } catch (error) {
            console.error('[WebSearch] Wikipedia error:', error.message);
        }
    }

    // ============================================
    // Final Fallback - Error Message
    // ============================================
    if (results.length === 0) {
        console.error('[WebSearch] ✗ All providers failed');
        return [{
            title: 'Pencarian Gagal',
            link: '#',
            source: 'System',
            snippet: `Maaf, tidak dapat menemukan hasil untuk "${query}". Semua provider sedang tidak tersedia. Coba: 1) Cek koneksi internet 2) Gunakan kata kunci berbeda 3) Setup Google CSE API key di Settings`
        }];
    }

    console.log(`[WebSearch] SUCCESS: ${results.length} results from ${source}`);
    return results.slice(0, limit);
}

/**
 * Fetch full webpage content
 */
export async function fetchWebpage(url) {
    try {
        console.log(`[WebFetch] Fetching: ${url}`);

        // Gunakan Jina Reader untuk convert to markdown
        const response = await fetch(`https://r.jina.ai/${url}`, {
            headers: {
                'Accept': 'text/markdown',
                'X-Return-Format': 'markdown'
            }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const text = await response.text();
        console.log(`[WebFetch] ✓ Success: ${text.length} chars`);

        return {
            success: true,
            content: text.slice(0, 4000), // Limit 4000 karakter
            url: url,
            length: text.length
        };
    } catch (error) {
        console.error(`[WebFetch] ✗ Error: ${error.message}`);
        return {
            success: false,
            error: error.message,
            url: url
        };
    }
}

/**
 * Get simple citations for AI Context
 */
export async function getCitationsFromQuery(query) {
    try {
        const results = await searchWeb(query, 3);
        return results.map(r => ({
            title: r.title,
            uri: r.link,
            source: r.source
        }));
    } catch (e) {
        return [];
    }
}

export default { searchWeb, fetchWebpage, getCitationsFromQuery };
