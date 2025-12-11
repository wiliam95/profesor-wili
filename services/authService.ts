export type User = { id: string; name: string };
const KEY = 'wili.auth.user';
const KEY_USERS = 'wili.auth.users';

const hash = async (text: string): Promise<string> => {
  try {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    const arr = Array.from(new Uint8Array(buf));
    return arr.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch { return text; }
};

export const getCurrentUser = (): User | null => {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
};

export const login = (name: string): User => {
  const user = { id: String(Date.now()), name };
  try { localStorage.setItem(KEY, JSON.stringify(user)); } catch {}
  return user;
};

export const logout = (): void => { try { localStorage.removeItem(KEY); } catch {} };

export const registerUser = async (username: string, password: string): Promise<User> => {
  const usersRaw = localStorage.getItem(KEY_USERS);
  const users = usersRaw ? JSON.parse(usersRaw) : {};
  const passHash = await hash(password);
  users[username] = { passHash };
  localStorage.setItem(KEY_USERS, JSON.stringify(users));
  const user = { id: String(Date.now()), name: username };
  localStorage.setItem(KEY, JSON.stringify(user));
  return user;
};

export const loginWithPassword = async (username: string, password: string): Promise<User | null> => {
  const usersRaw = localStorage.getItem(KEY_USERS);
  const users = usersRaw ? JSON.parse(usersRaw) : {};
  const rec = users[username];
  if (!rec) return null;
  const passHash = await hash(password);
  if (rec.passHash !== passHash) return null;
  const user = { id: String(Date.now()), name: username };
  localStorage.setItem(KEY, JSON.stringify(user));
  return user;
};
