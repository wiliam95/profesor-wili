export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { query, limit = 5 } = req.body;
        const results = [];

        // Try DuckDuckGo
        try {
            const ddgRes = await fetch(
                `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`
            );
            const data = await ddgRes.json();

            if (data.Abstract) {
                results.push({
                    title: data.Heading || 'Info',
                    link: data.AbstractURL || '#',
                    source: data.AbstractSource || 'DuckDuckGo',
                    snippet: data.Abstract
                });
            }

            if (data.RelatedTopics) {
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
        } catch (error) {
            console.error('[Search] DuckDuckGo failed:', error.message);
        }

        // Fallback: Wikipedia
        if (results.length === 0) {
            try {
                const wikiRes = await fetch(
                    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=${limit}`
                );
                const wikiData = await wikiRes.json();

                if (wikiData.query?.search) {
                    wikiData.query.search.forEach(item => {
                        results.push({
                            title: item.title,
                            link: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
                            source: 'Wikipedia',
                            snippet: item.snippet.replace(/<[^>]+>/g, '')
                        });
                    });
                }
            } catch (error) {
                console.error('[Search] Wikipedia failed:', error.message);
            }
        }

        return res.status(200).json({
            success: true,
            results: results.slice(0, limit),
            query: query
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
