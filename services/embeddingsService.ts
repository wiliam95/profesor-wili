export type Embedding = number[];

const fromTextLocal = (text: string): Embedding => {
  const bytes = new TextEncoder().encode(text || "");
  const arr: number[] = Array.from(bytes.slice(0, 256)).map(b => (b - 127) / 128);
  return arr;
};

export const embedText = async (text: string): Promise<Embedding> => {
  try {
    const dev = (import.meta as any)?.env?.DEV;
    if (dev) {
      const url = '/proxy/openai/embeddings';
      const body = { model: 'text-embedding-3-large', input: text };
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.ok) {
        const data = await r.json();
        const v = data?.data?.[0]?.embedding;
        if (Array.isArray(v)) return v as number[];
      }
    }
  } catch {}
  return fromTextLocal(text);
};

