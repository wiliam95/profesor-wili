export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { query, limit = 5 } = req.body || {};

        if (!query) {
            return res.status(400).json({ success: false, error: 'Query is required' });
        }

        console.log('[API/Search] Query:', query);
        const results = [];

        // ============================================
        // PRIORITY 1: Wikipedia (Most Reliable for all queries)
        // ============================================
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

        // ============================================
        // PRIORITY 2: DuckDuckGo (Instant Answers if available)
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
                        results.unshift({
                            title: data.Heading || 'Summary',
                            link: data.AbstractURL,
                            source: data.AbstractSource || 'DuckDuckGo',
                            snippet: data.Abstract
                        });
                        console.log('[API/Search] ✓ DuckDuckGo Abstract found');
                    }

                    if (data.RelatedTopics && results.length < limit) {
                        data.RelatedTopics.slice(0, limit - results.length).forEach(topic => {
                            if (topic.Text && topic.FirstURL) {
                                results.push({
                                    title: topic.Text.split(' - ')[0].substring(0, 80),
                                    link: topic.FirstURL,
                                    source: 'DuckDuckGo',
                                    snippet: topic.Text
                                });
                            }
                        });
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
