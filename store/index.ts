// store/index.ts - Simple State Store
// Using localStorage for persistence without external dependencies

export interface AppState {
    theme: 'dark' | 'light';
    sidebarCollapsed: boolean;
    artifactsPanelOpen: boolean;
    lastActiveModel: string;
    recentSearches: string[];
    preferences: Record<string, any>;
}

const STORE_KEY = 'wili_app_state';

const defaultState: AppState = {
    theme: 'dark',
    sidebarCollapsed: false,
    artifactsPanelOpen: false,
    lastActiveModel: 'gemini-2.5-flash',
    recentSearches: [],
    preferences: {}
};

export function getState(): AppState {
    const stored = localStorage.getItem(STORE_KEY);
    if (stored) {
        try {
            return { ...defaultState, ...JSON.parse(stored) };
        } catch {
            return defaultState;
        }
    }
    return defaultState;
}

export function setState(updates: Partial<AppState>): AppState {
    const current = getState();
    const newState = { ...current, ...updates };
    localStorage.setItem(STORE_KEY, JSON.stringify(newState));
    return newState;
}

export function resetState(): void {
    localStorage.setItem(STORE_KEY, JSON.stringify(defaultState));
}

// Convenience methods
export const store = {
    get: getState,
    set: setState,
    reset: resetState,

    setTheme: (theme: 'dark' | 'light') => setState({ theme }),
    setSidebarCollapsed: (collapsed: boolean) => setState({ sidebarCollapsed: collapsed }),
    setArtifactsPanelOpen: (open: boolean) => setState({ artifactsPanelOpen: open }),
    setLastActiveModel: (model: string) => setState({ lastActiveModel: model }),

    addRecentSearch: (query: string) => {
        const state = getState();
        const searches = [query, ...state.recentSearches.filter(s => s !== query)].slice(0, 10);
        return setState({ recentSearches: searches });
    }
};

export default store;
