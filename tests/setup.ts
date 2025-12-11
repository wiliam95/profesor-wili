// tests/setup.ts - Test Setup File (placeholder)
// Note: Install @types/jest and jest for full testing support

export const mockLocalStorage = {
    store: {} as Record<string, string>,
    getItem(key: string) { return this.store[key] || null; },
    setItem(key: string, value: string) { this.store[key] = value; },
    removeItem(key: string) { delete this.store[key]; },
    clear() { this.store = {}; }
};

export const mockFetch = (response: any) => {
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response))
    });
};

export const mockClipboard = {
    writeText: (text: string) => Promise.resolve()
};

// Test utilities
export function createMockMessage(overrides = {}) {
    return {
        id: 'test-id',
        role: 'user',
        text: 'Test message',
        timestamp: Date.now(),
        ...overrides
    };
}

export default { mockLocalStorage, mockFetch, mockClipboard, createMockMessage };
