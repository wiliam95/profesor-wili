const KEY = 'wili.workspace.current';

export const setWorkspace = (name: string): void => { try { localStorage.setItem(KEY, name); } catch {} };
export const getWorkspace = (): string => { try { return localStorage.getItem(KEY) || 'default'; } catch { return 'default'; } };

