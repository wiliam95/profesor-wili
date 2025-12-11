// apiHelpers.ts - API Utility Functions

// Retry wrapper with exponential backoff
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: Error | null = null;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries - 1) {
                await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
            }
        }
    }
    throw lastError;
}

// Fetch with timeout
export async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = 30000
): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// Parse SSE stream
export async function* parseSSEStream(reader: ReadableStreamDefaultReader<Uint8Array>): AsyncGenerator<string> {
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data && data !== '[DONE]') {
                    yield data;
                }
            }
        }
    }
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json);
    } catch {
        return fallback;
    }
}

// Create query string
export function createQueryString(params: Record<string, string | number | boolean | undefined>): string {
    return Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
}

// Rate limiter
export function createRateLimiter(requestsPerSecond: number) {
    const queue: Array<() => void> = [];
    let lastCall = 0;
    const interval = 1000 / requestsPerSecond;

    return function limit<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            const execute = async () => {
                const now = Date.now();
                const wait = Math.max(0, lastCall + interval - now);
                lastCall = now + wait;
                await new Promise(r => setTimeout(r, wait));
                try { resolve(await fn()); } catch (e) { reject(e); }
                queue.shift();
                if (queue.length > 0) queue[0]();
            };
            queue.push(execute);
            if (queue.length === 1) execute();
        });
    };
}

export default { withRetry, fetchWithTimeout, parseSSEStream, safeJsonParse, createQueryString, createRateLimiter };
