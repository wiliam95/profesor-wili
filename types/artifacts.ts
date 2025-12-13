export type ArtifactType = 'html' | 'react' | 'svg' | 'mermaid' | 'markdown' | 'code';

export interface Artifact {
    id: string;
    type: ArtifactType;
    title: string;
    content: string;
    language?: string;
    timestamp: number;
    preview?: string; // For thumbnails
    versions?: any[]; // Keep compatibility if needed
    raw?: string; // The raw string used to generate this artifact
}

export interface ArtifactExtractionResult {
    found: boolean;
    artifact?: Omit<Artifact, 'id' | 'timestamp'>;
}
