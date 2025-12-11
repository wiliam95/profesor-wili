import { Embedding } from './embeddingsService';

type Item = { id: string; text: string; embedding?: Embedding };

const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * (b[i] || 0), 0);

export const rerank = (query: string, items: Item[], qEmbedding?: Embedding): Item[] => {
  const q = (query || '').toLowerCase();
  const qTokens = q.split(/\s+/).filter(Boolean);
  const idf = (t: string) => {
    const df = items.reduce((c, it) => c + (it.text.toLowerCase().includes(t) ? 1 : 0), 0) || 1;
    return Math.log(items.length / df);
  };
  return items
    .map(it => {
      const bm25 = qTokens.reduce((s, t) => s + (it.text.toLowerCase().includes(t) ? idf(t) : 0), 0);
      const vec = qEmbedding && it.embedding ? dot(qEmbedding, it.embedding) : 0;
      return { it, score: bm25 + vec };
    })
    .sort((a, b) => b.score - a.score)
    .map(x => x.it);
};

