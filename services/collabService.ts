type Presence = { user: string; ts: number };
const channels: Record<string, BroadcastChannel> = {};
const KEY = 'wili.collab.presence';

export const joinChannel = (name: string, user: string): void => {
  const bc = new BroadcastChannel(`wili.${name}`);
  channels[name] = bc;
  const msg: Presence = { user, ts: Date.now() };
  try {
    const raw = localStorage.getItem(KEY);
    const obj = raw ? JSON.parse(raw) : {};
    const arr: Presence[] = obj[name] || [];
    arr.push(msg);
    obj[name] = arr.slice(-50);
    localStorage.setItem(KEY, JSON.stringify(obj));
  } catch {}
  bc.postMessage(msg);
};

export const listPresence = (name: string): Presence[] => {
  try { const raw = localStorage.getItem(KEY); const obj = raw ? JSON.parse(raw) : {}; return obj[name] || []; } catch { return []; }
};

