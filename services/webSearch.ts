import { Citation } from "../types";

type WebItem = { title: string; link: string; source: string };

const getLocal = (k: string): string | null => {
  try { return typeof window !== "undefined" ? window.localStorage.getItem(k) : null; } catch { return null; }
};

const getEnv = (k: string): string | undefined => {
  try { return (import.meta as any)?.env?.[k]; } catch { return undefined; }
};

export const searchWeb = async (q: string, n: number = 5): Promise<WebItem[]> => {
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
  } catch {}

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
  } catch {}

  try {
    const r = await fetch(`https://r.jina.ai/http://duckduckgo.com/html/?q=${encodeURIComponent(q)}`);
    if (r.ok) {
      const html = await r.text();
      const results: WebItem[] = [];
      const regex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(html)) && results.length < n) {
        const link = m[1];
        const title = m[2].replace(/<[^>]+>/g, "").trim();
        const source = link.replace(/^https?:\/\//, "").split("/")[0];
        if (link && title) results.push({ title, link, source });
      }
      if (results.length) return results;
    }
  } catch {}

  return [];
};

export const getCitationsFromQuery = async (query: string): Promise<Citation[] | undefined> => {
  try {
    const items = await searchWeb(query, 3);
    if (!items.length) return undefined;
    return items.map(i => ({ title: i.title, uri: i.link, source: i.source }));
  } catch { return undefined; }
};

