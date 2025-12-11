type Entry = { ts: number; provider: string; model: string; input?: number; output?: number; cost?: number; latency?: number; error?: string };
const KEY = 'wili.audit';

export const logUsage = (e: Entry): void => {
  try {
    const raw = localStorage.getItem(KEY);
    const arr: Entry[] = raw ? JSON.parse(raw) : [];
    arr.push(e);
    localStorage.setItem(KEY, JSON.stringify(arr.slice(-500)));
  } catch {}
};

export const listUsage = (): Entry[] => { try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; } };

