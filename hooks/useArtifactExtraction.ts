import { ArtifactExtractionResult, ArtifactType } from '../types/artifacts';

export interface ArtifactDetails {
    type: ArtifactType;
    language: string;
    title: string;
    content: string;
    id?: string;
    raw?: string; // Original substring in message
}

/**
 * Enhanced artifact extraction from AI messages
 * Priority:
 * 1. <antArtifact> XML tags (Claude Style)
 * 2. Markdown Code Blocks (Legacy/Fallback)
 */
export const extractArtifactsFromMessage = (message: string): ArtifactDetails[] => {
    if (!message || message.length < 10) return [];

    const artifacts: ArtifactDetails[] = [];
    const usedContent = new Set<string>();

    // 1. STRATEGY: XML Tags (Specific to Claude Protocol)
    // <antArtifact identifier="foo" type="application/vnd.ant.code" language="typescript" title="App.tsx">
    const xmlPattern = /<antArtifact\s+([^>]+)>([\s\S]*?)<\/antArtifact>/g;
    const xmlMatches = [...message.matchAll(xmlPattern)];

    for (const match of xmlMatches) {
        const [, attributesStr, innerContent] = match;
        const cleanContent = innerContent.trim();

        // Parse attributes
        const getAttr = (name: string) => {
            const m = attributesStr.match(new RegExp(`${name}="([^"]*)"`));
            return m ? m[1] : '';
        };

        const rawType = getAttr('type');
        const language = getAttr('language') || 'text';
        const title = getAttr('title') || 'Artifact';
        const identifier = getAttr('identifier');

        let type: ArtifactType = 'code';
        if (rawType === 'application/vnd.ant.mermaid') type = 'mermaid';
        else if (language === 'html') type = 'html';
        else if (['svg', 'xml'].includes(language)) type = 'svg';
        else if (['tsx', 'jsx', 'react'].includes(language)) type = 'react';
        else if (language === 'markdown' || language === 'md') type = 'markdown';

        if (cleanContent && !usedContent.has(cleanContent)) {
            artifacts.push({
                type,
                language,
                title,
                content: cleanContent,
                id: identifier,
                raw: match[0]
            });
            usedContent.add(cleanContent);
        }
    }

    // 2. STRATEGY: Fallback to Code Blocks if NO artifacts found ? 
    // Or should we support mixed? Mixed is better for safety.
    // However, if we found specific artifacts, the model probably intended those.
    // But sometimes it mixes simple snippets and artifacts.
    // We will extract code blocks ONLY if they are NOT inside the artifact tags (complex to track indices)
    // OR just extract them if they are unique content.

    const codeBlockPattern = /```(\w+)?\s*([\s\S]+?)```/g;
    const codeMatches = [...message.matchAll(codeBlockPattern)];

    for (const match of codeMatches) {
        let [, lang = 'text', content] = match;
        const cleanContent = content.trim();
        if (cleanContent.length < 15) continue; // Skip tiny snippets
        if (usedContent.has(cleanContent)) continue; // Already captured by XML

        // Heuristic: Is this "substantial" enough to be an artifact?
        // Or did the user ask for it?
        // Without XML, everything is guessing. We'll be permissive but try to categorize.

        // Skip if it looks like just a terminal command
        if (['bash', 'sh', 'shell', 'zsh', 'console'].includes(lang) && cleanContent.split('\n').length < 5) continue;

        let title = '';
        const lines = content.split('\n');
        const first = lines[0].trim();
        const commentMatch = first.match(/^(\/\/|#|<!--)\s*(.+?)(\s*-->)?$/);
        if (commentMatch) title = commentMatch[2].trim();

        if (!lang || lang === 'plaintext') lang = 'text';

        const type = determineArtifactType(lang, cleanContent);
        if (!title) title = generateTitle(type, lang, cleanContent);

        // Deduplication check (some models output XML then repeat in markdown)
        if (!isAlmostSame(cleanContent, usedContent)) {
            artifacts.push({ type, language: lang, title, content: cleanContent, raw: match[0] });
            usedContent.add(cleanContent);
        }
    }

    // 3. Fallback: Raw HTML if massive and looks like full page
    if (artifacts.length === 0) {
        if ((message.includes('<!DOCTYPE html>') || /^<html/i.test(message.trim())) && message.trim().length > 50) {
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
    return `${language.toUpperCase()}`;
}

// Fuzzy Match Helper to avoid duplicates
function isAlmostSame(content: string, set: Set<string>): boolean {
    for (const existing of Array.from(set)) {
        if (existing.includes(content) || content.includes(existing)) return true;
        // Simple Levenshtein or similarity could go here, but length check is fast enough for now
    }
    return false;
}