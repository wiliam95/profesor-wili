const KEY = 'wili.rate.window';

export const canProceed = (bucket: string, limit: number = 20, windowMs: number = 60_000): boolean => {
  try {
    const raw = localStorage.getItem(KEY);
    const now = Date.now();
    const obj = raw ? JSON.parse(raw) : {};
    const arr: number[] = (obj[bucket] || []).filter((ts: number) => now - ts < windowMs);
    if (arr.length >= limit) return false;
    arr.push(now);
    obj[bucket] = arr;
    localStorage.setItem(KEY, JSON.stringify(obj));
  } catch {}
  return true;
};

