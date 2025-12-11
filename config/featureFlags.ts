// config/featureFlags.ts - Feature Flag Configuration

export interface FeatureFlags {
    enableClaudeFiles: boolean;
    enableWorkspace: boolean;
    enableAIBuilder: boolean;
    enableExperimentalStreaming: boolean;
    enableWebSearch: boolean;
    enableCodeExecution: boolean;
    enableImageGeneration: boolean;
    enableVoiceInput: boolean;
    enableMemory: boolean;
    enableProjects: boolean;
    enableArtifacts: boolean;
    enableThinking: boolean;
    enableDarkMode: boolean;
    enableAnimations: boolean;
    maxFileSize: number;
    maxMessageLength: number;
    streamingChunkDelay: number;
}

export const defaultFeatureFlags: FeatureFlags = {
    enableClaudeFiles: true,
    enableWorkspace: true,
    enableAIBuilder: true,
    enableExperimentalStreaming: false,
    enableWebSearch: true,
    enableCodeExecution: true,
    enableImageGeneration: false,
    enableVoiceInput: true,
    enableMemory: true,
    enableProjects: true,
    enableArtifacts: true,
    enableThinking: true,
    enableDarkMode: true,
    enableAnimations: true,
    maxFileSize: 20 * 1024 * 1024, // 20MB
    maxMessageLength: 100000,
    streamingChunkDelay: 0
};

// Load flags from localStorage
export function loadFeatureFlags(): FeatureFlags {
    const stored = localStorage.getItem('wili_feature_flags');
    if (stored) {
        try {
            return { ...defaultFeatureFlags, ...JSON.parse(stored) };
        } catch {
            return defaultFeatureFlags;
        }
    }
    return defaultFeatureFlags;
}

// Save flags to localStorage
export function saveFeatureFlags(flags: Partial<FeatureFlags>): void {
    const current = loadFeatureFlags();
    const updated = { ...current, ...flags };
    localStorage.setItem('wili_feature_flags', JSON.stringify(updated));
}

// Check if feature is enabled
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    const flags = loadFeatureFlags();
    return Boolean(flags[feature]);
}

export default defaultFeatureFlags;
