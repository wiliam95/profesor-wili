import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Artifact } from '../types/artifacts';
import { extractArtifactFromMessage as extractStrategy, extractArtifactsFromMessage as extractAllStrategy } from './useArtifactExtraction';

export function useArtifacts() {
    const [artifacts, setArtifacts] = useState<Artifact[]>(() => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem('wili_artifacts');
        return stored ? JSON.parse(stored) : [];
    });
    const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const saveToStorage = useCallback((arts: Artifact[]) => {
        localStorage.setItem('wili_artifacts', JSON.stringify(arts));
    }, []);

    const addArtifact = useCallback((artifact: Omit<Artifact, 'id' | 'timestamp'>) => {
        const newArtifact: Artifact = {
            ...artifact,
            id: uuidv4(),
            timestamp: Date.now() // Changed from createdAt to timestamp to match type
        };

        // Mobile detection and logging
        const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad/i.test(navigator.userAgent);
        console.log('[Artifact] Adding new artifact:', {
            type: newArtifact.type,
            language: newArtifact.language,
            contentLength: newArtifact.content?.length,
            isMobile
        });

        setArtifacts(prev => {
            const updated = [newArtifact, ...prev];
            saveToStorage(updated);
            return updated;
        });
        setSelectedArtifact(newArtifact);

        // MOBILE: Always open panel immediately
        if (isMobile || !isPanelOpen) {
            console.log('[Artifact] Opening panel for mobile/closed state');
            setIsPanelOpen(true);
        }

        return newArtifact;
    }, [saveToStorage, isPanelOpen]);

    const updateArtifact = useCallback((id: string, updates: Partial<Artifact>) => {
        setArtifacts(prev => {
            const updated = prev.map(a => {
                if (a.id === id) {
                    // Handle Versioning if content changes
                    let newVersions = a.versions || [];
                    if (updates.content && updates.content !== a.content) {
                        newVersions = [
                            { id: uuidv4(), content: a.content, timestamp: Date.now(), title: a.title },
                            ...newVersions
                        ];
                    }

                    return { ...a, ...updates, versions: newVersions };
                }
                return a;
            });
            saveToStorage(updated);
            return updated;
        });

        if (selectedArtifact?.id === id) {
            setSelectedArtifact(prev => {
                if (!prev) return null;
                // Update selected artifact state
                let newVersions = prev.versions || [];
                if (updates.content && updates.content !== prev.content) {
                    newVersions = [
                        { id: uuidv4(), content: prev.content, timestamp: Date.now(), title: prev.title },
                        ...newVersions
                    ];
                }
                return { ...prev, ...updates, versions: newVersions };
            });
        }
    }, [selectedArtifact, saveToStorage]);

    const deleteArtifact = useCallback((id: string) => {
        setArtifacts(prev => {
            const updated = prev.filter(a => a.id !== id);
            saveToStorage(updated);
            return updated;
        });
        if (selectedArtifact?.id === id) {
            setSelectedArtifact(null);
        }
    }, [selectedArtifact, saveToStorage]);

    const selectArtifact = useCallback((artifact: Artifact) => {
        setSelectedArtifact(artifact);
        setIsPanelOpen(true);
    }, []);

    const clearArtifacts = useCallback(() => {
        setArtifacts([]);
        setSelectedArtifact(null);
        localStorage.removeItem('wili_artifacts');
    }, []);

    const togglePanel = useCallback(() => {
        setIsPanelOpen(prev => !prev);
    }, []);

    const closePanel = useCallback(() => {
        setIsPanelOpen(false);
    }, []);

    const extractArtifactFromMessage = useCallback((content: string): Partial<Artifact> | null => {
        const result = extractStrategy(content);
        if (result.found && result.artifact) {
            console.log('[Artifact Extract] Found artifact:', result.artifact);
            return result.artifact;
        }
        return null;
    }, []);

    const extractArtifactsFromMessage = useCallback((content: string): Partial<Artifact>[] => {
        const results = extractAllStrategy(content);
        return results.filter(r => r.found && r.artifact).map(r => r.artifact!);
    }, []);

    return {
        artifacts,
        selectedArtifact,
        isPanelOpen,
        addArtifact,
        updateArtifact,
        deleteArtifact,
        selectArtifact,
        clearArtifacts,
        togglePanel,
        closePanel,
        extractArtifactFromMessage,
        extractArtifactsFromMessage
    };
}

export default useArtifacts;
