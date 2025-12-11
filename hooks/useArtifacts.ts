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
            const updated = prev.map(a => a.id === id ? { ...a, ...updates } : a);
            saveToStorage(updated);
            return updated;
        });
        if (selectedArtifact?.id === id) {
            setSelectedArtifact(prev => prev ? { ...prev, ...updates } : null);
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

    // Extract artifact from message content
    const extractArtifactFromMessage = useCallback((content: string): Partial<Artifact> | null => {
        // Match code blocks
        const codeBlockMatch = content.match(/```(\w+)?\n([\s\S]*?)```/);
        if (codeBlockMatch) {
            const language = codeBlockMatch[1] || 'text';
            const code = codeBlockMatch[2];

            // Auto-trigger only if content > 15 lines (Ultimate Workspace Spec)
            const lineCount = code.split('\n').length;
            if (lineCount > 15 || language === 'html' || language === 'svg' || language === 'react') { // Always trigger for visual component types
                let type: Artifact['type'] = 'code';
                if (language === 'html') type = 'html';
                else if (language === 'svg') type = 'svg';
                else if (language === 'react' || language === 'tsx' || language === 'jsx') type = 'react';

                return { type, content: code, language, title: `${language} snippet` };
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
