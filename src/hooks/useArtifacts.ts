import { useState, useCallback } from 'react';
import { Artifact, ParsedArtifact } from '../types/artifacts';
import { parseArtifactsFromMessage } from '../utils/artifactParser';

export function useArtifacts() {
  const [artifacts, setArtifacts] = useState<Map<string, Artifact>>(new Map());
  const [currentArtifactId, setCurrentArtifactId] = useState<string | null>(null);

  // Process artifacts dari AI response
  const processArtifacts = useCallback((message: string) => {
    const parsed = parseArtifactsFromMessage(message);
    const now = Date.now();
    
    setArtifacts(prev => {
      const newMap = new Map(prev);
      
      parsed.forEach(parsedArtifact => {
        const { command, id } = parsedArtifact;
        
        if (command === 'create') {
          // Buat artifact baru
          const artifact: Artifact = {
            id,
            type: parsedArtifact.type!,
            title: parsedArtifact.title || 'Untitled',
            content: parsedArtifact.content || '',
            language: parsedArtifact.language,
            createdAt: now,
            updatedAt: now
          };
          newMap.set(id, artifact);
          setCurrentArtifactId(id);
          
        } else if (command === 'update') {
          // Update artifact yang sudah ada
          const existing = newMap.get(id);
          if (existing && parsedArtifact.updates) {
            let updatedContent = existing.content;
            
            parsedArtifact.updates.forEach(update => {
              updatedContent = updatedContent.replace(update.oldStr, update.newStr);
            });
            
            newMap.set(id, {
              ...existing,
              content: updatedContent,
              updatedAt: now
            });
          }
          
        } else if (command === 'rewrite') {
          // Rewrite complete artifact
          const existing = newMap.get(id);
          if (existing) {
            newMap.set(id, {
              ...existing,
              content: parsedArtifact.content || existing.content,
              updatedAt: now
            });
          }
        }
      });
      
      return newMap;
    });
    
    return parsed.length > 0;
  }, []);

  // Get artifact by ID
  const getArtifact = useCallback((id: string) => {
    return artifacts.get(id);
  }, [artifacts]);

  // Get current artifact
  const getCurrentArtifact = useCallback(() => {
    if (!currentArtifactId) return null;
    return artifacts.get(currentArtifactId) || null;
  }, [artifacts, currentArtifactId]);

  // Get all artifacts sebagai array
  const getAllArtifacts = useCallback(() => {
    return Array.from(artifacts.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [artifacts]);

  // Delete artifact
  const deleteArtifact = useCallback((id: string) => {
    setArtifacts(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    
    if (currentArtifactId === id) {
      setCurrentArtifactId(null);
    }
  }, [currentArtifactId]);

  // Clear all artifacts
  const clearArtifacts = useCallback(() => {
    setArtifacts(new Map());
    setCurrentArtifactId(null);
  }, []);

  return {
    artifacts: getAllArtifacts(),
    currentArtifact: getCurrentArtifact(),
    currentArtifactId,
    setCurrentArtifactId,
    processArtifacts,
    getArtifact,
    deleteArtifact,
    clearArtifacts
  };
}
