// Types untuk Artifacts System
export type ArtifactType = 
  | 'code' 
  | 'react' 
  | 'html' 
  | 'svg' 
  | 'mermaid' 
  | 'markdown'
  | 'text';

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  content: string;
  language?: string;
  createdAt: number;
  updatedAt: number;
  isFullscreen?: boolean;
}

export interface ArtifactMessage {
  role: 'user' | 'assistant';
  content: string;
  artifacts?: Artifact[];
}

export interface ArtifactUpdate {
  id: string;
  oldStr: string;
  newStr: string;
}

export interface ParsedArtifact {
  command: 'create' | 'update' | 'rewrite';
  id: string;
  type?: ArtifactType;
  title?: string;
  content?: string;
  language?: string;
  updates?: ArtifactUpdate[];
}
