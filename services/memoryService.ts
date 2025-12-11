type Doc = { id: string; title: string; text: string; uri?: string; tags?: string[]; embedding?: number[] };

const KEY = 'wili.memory.docs';

const tokenize = (t: string): string[] => t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

const vectorize = (t: string): Record<string, number> => {
  const tokens = tokenize(t);
  const freq: Record<string, number> = {};
  for (const w of tokens) freq[w] = (freq[w] || 0) + 1;
  const max = Math.max(1, ...Object.values(freq));
  Object.keys(freq).forEach(k => { freq[k] = freq[k] / max; });
  return freq;
};

const cosine = (a: Record<string, number>, b: Record<string, number>): number => {
  let dot = 0, na = 0, nb = 0;
  for (const k in a) { const va = a[k]; dot += va * (b[k] || 0); na += va * va; }
  for (const k in b) { const vb = b[k]; nb += vb * vb; }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
};

export const saveDocument = (doc: Doc): void => {
  try {
    const raw = localStorage.getItem(KEY);
    const arr: Doc[] = raw ? JSON.parse(raw) : [];
    const idx = arr.findIndex(d => d.id === doc.id);
    if (idx >= 0) arr[idx] = doc; else arr.push(doc);
    localStorage.setItem(KEY, JSON.stringify(arr));
    try { import('./vectorStore').then(({ storeDoc }) => storeDoc({ id: doc.id, title: doc.title, text: doc.text, tags: doc.tags, embedding: doc.embedding })).catch(()=>{}); } catch {}
  } catch {}
};

export const listDocuments = (): Doc[] => {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
};

export const queryDocuments = (q: string, k: number = 3): Array<{ doc: Doc; score: number; snippet: string }> => {
  const docs = listDocuments();
  const hasEmbed = docs.some(d => Array.isArray(d.embedding) && d.embedding.length);
  if (hasEmbed) {
    try {
      const items = docs.map(d => ({ id: d.id, text: d.text, embedding: d.embedding }));
      const { embedText } = (window as any).WILI_EMBED || {};
      const qEmb = typeof embedText === 'function' ? undefined : undefined;
      const { rerank } = (window as any).WILI_RERANK || {};
      const ranked = rerank ? rerank(q, items, qEmb) : items;
      const top = ranked.slice(0, k);
      return top.map(it => {
        const d = docs.find(x => x.id === it.id)!;
        const idx = d.text.toLowerCase().indexOf(q.toLowerCase().split(/\s+/)[0] || '');
        const start = Math.max(0, idx - 80);
        const snippet = d.text.slice(start, start + 240);
        return { doc: d, score: 1, snippet };
      });
    } catch {}
  }
  const vq = vectorize(q);
  const scored = docs.map(d => {
    const vd = vectorize(d.text);
    const score = cosine(vq, vd);
    const idx = d.text.toLowerCase().indexOf(q.toLowerCase().split(/\s+/)[0] || '');
    const start = Math.max(0, idx - 80);
    const snippet = d.text.slice(start, start + 240);
    return { doc: d, score, snippet };
  }).sort((a,b)=>b.score-a.score).slice(0, k);
  return scored.filter(s => s.score > 0.05);
};

export const queryDocumentsAdvanced = async (q: string, k: number = 3): Promise<Array<{ doc: Doc; score: number; snippet: string }>> => {
  try {
    const docs = listDocuments();
    const items = docs.map(d => ({ id: d.id, text: d.text, embedding: d.embedding }));
    const { embedText } = await import('./embeddingsService');
    const { rerank } = await import('./rerankService');
    const qEmb = await embedText(q);
    const ranked = rerank(q, items, qEmb);
    const top = ranked.slice(0, k);
    return top.map(it => {
      const d = docs.find(x => x.id === it.id)!;
      const idx = d.text.toLowerCase().indexOf(q.toLowerCase().split(/\s+/)[0] || '');
      const start = Math.max(0, idx - 80);
      const snippet = d.text.slice(start, start + 240);
      return { doc: d, score: 1, snippet };
    });
  } catch {
    return queryDocuments(q, k);
  }
};
