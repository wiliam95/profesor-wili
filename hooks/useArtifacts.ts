// useArtifacts.ts - Artifacts Management Hook
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Artifact } from '../components/ArtifactsPanel';

export function useArtifacts() {
    const [artifacts, setArtifacts] = useState<Artifact[]>(() => {
        const stored = localStorage.getItem('wili_artifacts');
        return stored ? JSON.parse(stored) : [];
    });
    const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const saveToStorage = useCallback((arts: Artifact[]) => {
        localStorage.setItem('wili_artifacts', JSON.stringify(arts));
    }, []);

    const addArtifact = useCallback((artifact: Omit<Artifact, 'id' | 'createdAt'>) => {
        const newArtifact: Artifact = {
            ...artifact,
            id: uuidv4(),
            createdAt: Date.now()
        };
        setArtifacts(prev => {
            const updated = [newArtifact, ...prev];
            saveToStorage(updated);
            return updated;
        });
        setSelectedArtifact(newArtifact);
        setIsPanelOpen(true);
        return newArtifact;
    }, [saveToStorage]);

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
        console.log('[Artifact Extract] Processing message length:', content.length);

        // Force detect code blocks for mobile with robust regex
        const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/;
        const match = content.match(codeBlockRegex);

        if (match) {
            const language = match[1] || 'text';
            const code = match[2];

            console.log('[Artifact Extract] Found code block:', { language, codeLength: code.length });

            // Accept almost anything that looks like code? 
            // Or stick to known types but be generous
            if (code.length > 20 || ['html', 'react', 'tsx', 'jsx', 'js', 'javascript', 'svg'].includes(language)) {
                let type: Artifact['type'] = 'code';
                if (language === 'html') type = 'html';
                else if (language === 'svg') type = 'svg';
                else if (['react', 'tsx', 'jsx'].includes(language)) type = 'react';

                return {
                    type,
                    content: code.trim(),
                    language: language,
                    title: `${language} snippet`
                };
            }
        }
        return null;
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
        extractArtifactFromMessage
    };
}

export default useArtifacts;
