import { Citation } from "../types";

type WebItem = { title: string; link: string; source: string };

const getLocal = (k: string): string | null => {
  try { return typeof window !== "undefined" ? window.localStorage.getItem(k) : null; } catch { return null; }
};

const getEnv = (k: string): string | undefined => {
  try { return (import.meta as any)?.env?.[k]; } catch { return undefined; }
};

export const searchWeb = async (q: string, n: number = 5): Promise<WebItem[]> => {
  // ============================================
  // TIER 0: Vercel API Route (Bypass CORS)
  // ============================================
  try {
    console.log('[WebSearch.ts] Trying Vercel API route...');
    const serperKey = getLocal("wili.serperKey") || getEnv("VITE_SERPER_API_KEY");

    const apiResponse = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-serper-key': serperKey || ''
      },
      body: JSON.stringify({ query: q, limit: n })
    });

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      if (data.success && data.results?.length > 0) {
        console.log(`[WebSearch.ts] ✓ API route returned ${data.results.length} results`);
        return data.results.slice(0, n).map((r: any) => ({
          title: String(r.title || 'Untitled'),
          link: String(r.link || r.url || ''),
          source: String(r.source || 'web')
        }));
      }
    }
  } catch (apiErr) {
    console.log('[WebSearch.ts] API route unavailable, trying client-side...', apiErr);
  }

  // ============================================
  // TIER 1: SerpAPI (if key available)
  // ============================================
  const serpKey = getLocal("wili.serpapiKey") || getEnv("VITE_SERPAPI_KEY");
  const gCseKey = getLocal("wili.googleCseKey") || getEnv("VITE_GOOGLE_CSE_KEY");
  const gCseCx = getLocal("wili.googleCseCx") || getEnv("VITE_GOOGLE_CSE_CX");

  try {
    if (serpKey) {
      const r = await fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&api_key=${serpKey}`);
      if (r.ok) {
        const data = await r.json();
        const items = (data?.organic_results || []).slice(0, n);
        return items.map((it: any) => ({
          title: String(it?.title || "Untitled"),
          link: String(it?.link || it?.url || ""),
          source: String((it?.source || (it?.link || it?.url || "").replace(/^https?:\/\//, "").split("/")[0]) || "google.com")
        })).filter(i => i.link);
      }
    }
  } catch { }

  // ============================================
  // TIER 2: Google CSE (if key available)
  // ============================================
  try {
    if (gCseKey && gCseCx) {
      const r = await fetch(`https://www.googleapis.com/customsearch/v1?key=${gCseKey}&cx=${gCseCx}&q=${encodeURIComponent(q)}`);
      if (r.ok) {
        const data = await r.json();
        const items = (data?.items || []).slice(0, n);
        return items.map((it: any) => ({
          title: String(it?.title || "Untitled"),
          link: String(it?.link || ""),
          source: String((it?.displayLink || (it?.link || "").replace(/^https?:\/\//, "").split("/")[0]) || "googleapis.com")
        })).filter(i => i.link);
      }
    }
  } catch { }

  // ============================================
  // TIER 3: Wikipedia API (CORS supported)
  // ============================================
  try {
    console.log('[WebSearch.ts] Trying Wikipedia API...');
    const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*`);
    if (wikiRes.ok) {
      const data = await wikiRes.json();
      if (data.query?.search?.length > 0) {
        return data.query.search.slice(0, n).map((r: any) => ({
          title: String(r.title || 'Untitled'),
          link: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
          source: 'wikipedia.org'
        }));
      }
    }
  } catch { }

  return [];
};

export const getCitationsFromQuery = async (query: string): Promise<Citation[] | undefined> => {
  try {
    const items = await searchWeb(query, 3);
    if (!items.length) return undefined;
    return items.map(i => ({ title: i.title, uri: i.link, source: i.source }));
  } catch { return undefined; }
};

