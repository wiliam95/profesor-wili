export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-serper-key');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { query, limit = 5 } = req.body || {};
        const serperKey = req.headers['x-serper-key'] || process.env.SERPER_API_KEY;

        if (!query) {
            return res.status(400).json({ success: false, error: 'Query is required' });
        }

        console.log('[API/Search] Query:', query);
        const results = [];

        // ============================================
        // PRIORITY 1: Serper.dev (Google Search)
        // ============================================
        if (serperKey) {
            try {
                console.log('[API/Search] Trying Serper.dev...');
                const serperRes = await fetch('https://google.serper.dev/search', {
                    method: 'POST',
                    headers: {
                        'X-API-KEY': serperKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ q: query, num: limit })
                });

                if (serperRes.ok) {
                    const data = await serperRes.json();

                    if (data.organic && data.organic.length > 0) {
                        data.organic.forEach(item => {
                            results.push({
                                title: item.title,
                                link: item.link,
                                source: 'Google (Serper)',
                                snippet: item.snippet
                            });
                        });
                        console.log(`[API/Search] ✓ Serper returned ${results.length} results`);
                    }
                } else {
                    const error = await serperRes.text();
                    console.error('[API/Search] Serper error:', error);
                }
            } catch (serperError) {
                console.error('[API/Search] Serper failed:', serperError.message);
            }
        }

        // ============================================
        // PRIORITY 2: Tavily (AI Search)
        // ============================================
        const tavilyKey = req.headers['x-tavily-key'] || process.env.TAVILY_API_KEY;
        if (results.length === 0 && tavilyKey) {
            try {
                console.log('[API/Search] Trying Tavily...');
                const tavilyRes = await fetch('https://api.tavily.com/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        api_key: tavilyKey,
                        query: query,
                        search_depth: "basic",
                        max_results: limit
                    })
                });

                if (tavilyRes.ok) {
                    const data = await tavilyRes.json();
                    if (data.results && data.results.length > 0) {
                        data.results.forEach(item => {
                            results.push({
                                title: item.title,
                                link: item.url,
                                source: 'Tavily (AI)',
                                snippet: item.content
                            });
                        });
                        console.log(`[API/Search] ✓ Tavily returned ${results.length} results`);
                    }
                } else {
                    console.error('[API/Search] Tavily error:', await tavilyRes.text());
                }
            } catch (tavilyError) {
                console.error('[API/Search] Tavily failed:', tavilyError.message);
            }
        }

        // ============================================
        // PRIORITY 3: Wikipedia (Fallback)
        // ============================================
        if (results.length === 0) {
            try {
                console.log('[API/Search] Trying Wikipedia...');
                const wikiRes = await fetch(
                    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=${limit}`
                );

                if (wikiRes.ok) {
                    const wikiData = await wikiRes.json();

                    if (wikiData.query?.search?.length > 0) {
                        wikiData.query.search.forEach(item => {
                            results.push({
                                title: item.title,
                                link: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
                                source: 'Wikipedia',
                                snippet: item.snippet ? item.snippet.replace(/<[^>]+>/g, '') : ''
                            });
                        });
                        console.log(`[API/Search] ✓ Wikipedia returned ${results.length} results`);
                    }
                }
            } catch (wikiError) {
                console.error('[API/Search] Wikipedia error:', wikiError.message);
            }
        }

        // ============================================
        // PRIORITY 3: DuckDuckGo (Last Resort)
        // ============================================
        if (results.length < limit) {
            try {
                console.log('[API/Search] Trying DuckDuckGo...');
                const ddgRes = await fetch(
                    `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
                    { headers: { 'Accept': 'application/json' } }
                );

                if (ddgRes.ok) {
                    const data = await ddgRes.json();

                    if (data.Abstract && data.AbstractURL) {
                        results.push({
                            title: data.Heading || 'Summary',
                            link: data.AbstractURL,
                            source: data.AbstractSource || 'DuckDuckGo',
                            snippet: data.Abstract
                        });
                        console.log('[API/Search] ✓ DuckDuckGo Abstract found');
                    }
                }
            } catch (ddgError) {
                console.error('[API/Search] DuckDuckGo error:', ddgError.message);
            }
        }

        // Return results
        console.log(`[API/Search] Total results: ${results.length}`);
        return res.status(200).json({
            success: results.length > 0,
            results: results.slice(0, limit),
            query: query,
            count: results.length
        });

    } catch (error) {
        console.error('[API/Search] Server error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}
