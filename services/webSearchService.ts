// Advanced Web Search Services
// Tavily & Serper API Integration

export interface SearchResult {
    title: string;
    snippet: string;
    url?: string;
    score?: number;
}

/**
 * Tavily Search API
 * Real-time Google Search optimized for AI/LLM
 * Docs: https://docs.tavily.com/
 */
export const searchWithTavily = async (query: string, maxResults: number = 5): Promise<SearchResult[]> => {
    const apiKey = localStorage.getItem('TAVILY_API_KEY');
    if (!apiKey) {
        console.warn('[Tavily] API key not found');
        return [];
    }

    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                query,
                max_results: maxResults,
                search_depth: 'basic', // 'basic' or 'advanced'
                include_answer: true,
                include_raw_content: false
            })
        });

        if (!response.ok) {
            throw new Error(`Tavily API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform Tavily response to SearchResult format
        const results: SearchResult[] = (data.results || []).map((r: any) => ({
            title: r.title || '',
            snippet: r.content || r.snippet || '',
            url: r.url || '',
            score: r.score || 0
        }));

        console.log(`[Tavily] ✓ Found ${results.length} results`);
        return results;

    } catch (error) {
        console.error('[Tavily] Search failed:', error);
        return [];
    }
};

/**
 * Serper Search API
 * Google Search API with SERP data
 * Docs: https://serper.dev/
 */
export const searchWithSerper = async (query: string, maxResults: number = 5): Promise<SearchResult[]> => {
    const apiKey = localStorage.getItem('SERPER_API_KEY');
    if (!apiKey) {
        console.warn('[Serper] API key not found');
        return [];
    }

    try {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey
            },
            body: JSON.stringify({
                q: query,
                num: maxResults
            })
        });

        if (!response.ok) {
            throw new Error(`Serper API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform Serper response to SearchResult format
        const results: SearchResult[] = [];

        // Add answer box if available
        if (data.answerBox?.answer) {
            results.push({
                title: 'Answer',
                snippet: data.answerBox.answer,
                url: data.answerBox.link || ''
            });
        }

        // Add knowledge graph if available
        if (data.knowledgeGraph?.description) {
            results.push({
                title: data.knowledgeGraph.title || 'Knowledge Graph',
                snippet: data.knowledgeGraph.description,
                url: data.knowledgeGraph.website || ''
            });
        }

        // Add organic results
        if (data.organic) {
            data.organic.slice(0, maxResults).forEach((r: any) => {
                results.push({
                    title: r.title || '',
                    snippet: r.snippet || '',
                    url: r.link || ''
                });
            });
        }

        console.log(`[Serper] ✓ Found ${results.length} results`);
        return results;

    } catch (error) {
        console.error('[Serper] Search failed:', error);
        return [];
    }
};

/**
 * Smart Search Router
 * Tries premium services first, then falls back to free options
 */
export const performWebSearch = async (query: string, maxResults: number = 5): Promise<SearchResult[]> => {
    console.log(`[WebSearch] Query: "${query}"`);

    // Priority 1: Tavily (if API key available)
    const tavilyKey = localStorage.getItem('TAVILY_API_KEY');
    if (tavilyKey) {
        const tavilyResults = await searchWithTavily(query, maxResults);
        if (tavilyResults.length > 0) {
            console.log('[WebSearch] ✓ Using Tavily results');
            return tavilyResults;
        }
    }

    // Priority 2: Serper (if API key available)
    const serperKey = localStorage.getItem('SERPER_API_KEY');
    if (serperKey) {
        const serperResults = await searchWithSerper(query, maxResults);
        if (serperResults.length > 0) {
            console.log('[WebSearch] ✓ Using Serper results');
            return serperResults;
        }
    }

    // Priority 3: Wikipedia (free fallback)
    console.log('[WebSearch] ⚠️ No premium API keys found, using Wikipedia fallback');
    return await searchWithWikipedia(query, maxResults);
};

/**
 * Wikipedia Search (Free Fallback)
 */
const searchWithWikipedia = async (query: string, maxResults: number = 5): Promise<SearchResult[]> => {
    try {
        const q = encodeURIComponent(query);
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&format=json&origin=*&srlimit=${maxResults}`;

        const response = await fetch(wikiUrl);
        const data = await response.json();

        if (!data.query?.search) {
            return [];
        }

        const results: SearchResult[] = data.query.search.map((r: any) => ({
            title: r.title,
            snippet: r.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
            score: 0
        }));

        console.log(`[Wikipedia] ✓ Found ${results.length} results`);
        return results;

    } catch (error) {
        console.error('[Wikipedia] Search failed:', error);
        return [];
    }
};
