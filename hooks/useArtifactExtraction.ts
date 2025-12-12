import { ArtifactExtractionResult, ArtifactType } from '../types/artifacts';

export interface ArtifactDetails {
    type: ArtifactType;
    language: string;
    title: string;
    content: string;
}

/**
 * Enhanced artifact extraction from AI messages
 * Detects MULTIPLE code blocks, HTML, React components automatically
 */
export const extractArtifactsFromMessage = (message: string): ArtifactDetails[] => {
    if (!message || message.length < 20) return [];

    const artifacts: ArtifactDetails[] = [];

    // Pattern: Code blocks
    // Capture language, optional title in comments, and content (relaxed newline check)
    const codeBlockPattern = /```(\w+)?\s*([\s\S]+?)```/g;
    const matches = [...message.matchAll(codeBlockPattern)];

    for (const match of matches) {
        let [, lang = 'text', content] = match;
        const cleanContent = content.trim();
        if (cleanContent.length < 10) continue;

        let title = '';
        const lines = content.split('\n');
        const first = lines[0].trim();
        const commentMatch = first.match(/^(\/\/|#|<!--)\s*(.+?)(\s*-->)?$/);
        if (commentMatch) title = commentMatch[2].trim();

        if (!lang || lang === 'plaintext') lang = 'text';

        const type = determineArtifactType(lang, cleanContent);
        if (!title) title = generateTitle(type, lang, cleanContent);

        artifacts.push({ type, language: lang, title, content: cleanContent });
    }

    // Fallback: Raw HTML
    if (artifacts.length === 0) {
        if (message.includes('<!DOCTYPE html>') || /^<html/i.test(message.trim())) {
            artifacts.push({
                type: 'html',
                language: 'html',
                title: 'HTML Document',
                content: message.trim()
            });
        }
    }

    return artifacts;
};

/**
 * Legacy Singular Extraction (Wrapper)
 */
export const extractArtifactFromMessage = (message: string): ArtifactExtractionResult => {
    const arts = extractArtifactsFromMessage(message);
    if (arts.length > 0) {
        return {
            found: true,
            artifact: {
                // Matches Omit<Artifact, 'id' | 'timestamp'>
                type: arts[0].type,
                language: arts[0].language,
                title: arts[0].title,
                content: arts[0].content
            }
        };
    }
    return { found: false };
};

function determineArtifactType(language: string, content: string): ArtifactType {
    const lang = language.toLowerCase();
    if (['html', 'htm'].includes(lang)) return 'html';
    if (['jsx', 'tsx', 'react'].includes(lang)) return 'react';
    if (lang === 'svg' || content.includes('<svg')) return 'svg';
    if (lang === 'mermaid') return 'mermaid';
    if (['markdown', 'md'].includes(lang)) return 'markdown';
    if (['js', 'ts', 'javascript', 'typescript'].includes(lang)) {
        if (content.includes('import React') || /return\s*\(?<[A-Z]/.test(content)) return 'react';
    }
    return 'code';
}

function generateTitle(type: string, language: string, content: string): string {
    if (type === 'react') {
        const m = content.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/);
        return m ? `${m[1]} Component` : 'React Component';
    }
    if (type === 'html') {
        const m = content.match(/<title>(.*?)<\/title>/);
        return m ? m[1] : 'HTML Document';
    }
    return `${language.toUpperCase()} Snippet`;
}