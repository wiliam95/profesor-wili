type MCPStatus = { connected: boolean; url?: string; message?: string };

let ws: WebSocket | null = null;

export const connectMCP = async (url: string): Promise<MCPStatus> => {
  try {
    if (ws) { try { ws.close(); } catch {} ws = null; }
    ws = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      ws!.onopen = () => resolve();
      ws!.onerror = () => reject(new Error('WebSocket error'));
    });
    return { connected: true, url };
  } catch (e: any) {
    return { connected: false, url, message: e?.message || 'connect failed' };
  }
};

export const disconnectMCP = (): void => { try { ws?.close(); } catch {} ws = null; };

