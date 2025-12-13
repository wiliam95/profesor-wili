import React, { useState } from 'react';
import { useArtifacts } from '../hooks/useArtifacts';
import { ArtifactsPanel } from '../components/artifacts/ArtifactsPanel';
import { ArtifactsSpace } from '../components/artifacts/ArtifactsSpace';
import { removeArtifactTags } from '../utils/artifactParser';

/**
 * EXAMPLE: Cara integrate Artifacts ke App.tsx
 */
export function ExampleArtifactsApp() {
  const {
    artifacts,
    currentArtifact,
    currentArtifactId,
    setCurrentArtifactId,
    processArtifacts,
    deleteArtifact
  } = useArtifacts();
  
  const [showArtifactsPanel, setShowArtifactsPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Contoh handle AI response
  const handleAIResponse = (aiMessage: string) => {
    const hasArtifacts = processArtifacts(aiMessage);
    if (hasArtifacts) setShowArtifactsPanel(true);
    return removeArtifactTags(aiMessage);
  };

  return (
    <div className="flex h-screen">
      {/* Artifacts Sidebar */}
      {showArtifactsPanel && (
        <div className="w-64">
          <ArtifactsSpace
            artifacts={artifacts}
            currentArtifactId={currentArtifactId}
            onSelectArtifact={setCurrentArtifactId}
            onDeleteArtifact={deleteArtifact}
          />
        </div>
      )}

      {/* Main Chat */}
      <div className="flex-1">
        <div className="p-4">
          <h1>Your Chat Interface Here</h1>
        </div>
      </div>

      {/* Artifacts Panel */}
      {showArtifactsPanel && currentArtifact && (
        <div className="w-1/2">
          <ArtifactsPanel
            artifact={currentArtifact}
            onClose={() => setShowArtifactsPanel(false)}
            onDelete={deleteArtifact}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          />
        </div>
      )}
    </div>
  );
}
