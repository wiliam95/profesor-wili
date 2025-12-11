type VDoc = { id: string; title: string; text: string; embedding?: number[]; tags?: string[] };

const DB_NAME = 'wili_vector_db';
const STORE = 'docs';

const open = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  try {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  } catch (e) { reject(e as any); }
});

export const storeDoc = async (doc: VDoc): Promise<void> => {
  try {
    const db = await open();
    const tx = db.transaction(STORE, 'readwrite');
    const st = tx.objectStore(STORE);
    st.put(doc);
  } catch {}
};

const cosine = (a: number[], b: number[]): number => {
  let s = 0, na = 0, nb = 0;
  for (let i = 0; i < Math.max(a.length, b.length); i++) { const x = a[i] || 0, y = b[i] || 0; s += x*y; na += x*x; nb += y*y; }
  return s / (Math.sqrt(na) * Math.sqrt(nb) || 1);
};

export const queryTopK = async (qEmb: number[], k: number = 3): Promise<VDoc[]> => {
  const docs: VDoc[] = [];
  try {
    const db = await open();
    const tx = db.transaction(STORE, 'readonly');
    const st = tx.objectStore(STORE);
    const req = st.openCursor();
    await new Promise<void>((resolve) => {
      req.onsuccess = () => { const cur = req.result; if (cur) { docs.push(cur.value as VDoc); cur.continue(); } else resolve(); };
    });
  } catch {}
  const withEmb = docs.filter(d => Array.isArray(d.embedding) && d.embedding?.length);
  const scored = withEmb.map(d => ({ d, s: cosine(qEmb, d.embedding as number[]) })).sort((a,b)=>b.s-a.s).slice(0,k).map(x=>x.d);
  return scored.length ? scored : docs.slice(0,k);
};

