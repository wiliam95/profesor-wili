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
}

export interface ArtifactExtractionResult {
    found: boolean;
    artifact?: Omit<Artifact, 'id' | 'timestamp'>;
}
