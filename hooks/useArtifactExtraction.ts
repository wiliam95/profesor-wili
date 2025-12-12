import { ArtifactExtractionResult } from '../types/artifacts';

/**
 * Enhanced artifact extraction from AI messages
 * Detects code blocks, HTML, React components automatically
 * Claude AI Style - Auto-create artifacts
 */
export const extractArtifactFromMessage = (message: string): ArtifactExtractionResult => {
    if (!message || message.length < 20) {
        return { found: false };
    }

    // Pattern 1: Code blocks with title comment
    // Example: ```html\n// My Calculator\n<div>...</div>```
    // Also supports <!-- title --> or # title
    const patternWithTitle = /```(\w+)\s*\n(?:\/\/|#|<!--)\s*(.+?)\s*(?:-->)?\n([\s\S]+?)```/;
    const matchWithTitle = message.match(patternWithTitle);

    if (matchWithTitle) {
        const [, language, title, content] = matchWithTitle;
        const cleanContent = content.trim();

        // Skip if too short
        if (cleanContent.length < 30) {
            return { found: false };
        }

        return {
            found: true,
            artifact: {
                type: determineArtifactType(language, cleanContent),
                language: language,
                title: title.trim(),
                content: cleanContent
            }
        };
    }

    // Pattern 2: Standard code blocks
    // Example: ```javascript\n...code...```
    const patternStandard = /```(\w+)?\s*\n([\s\S]+?)```/;
    const matchStandard = message.match(patternStandard);

    if (matchStandard) {
        const [, language = 'text', content] = matchStandard;
        const cleanContent = content.trim();

        // Skip short snippets (likely explanations)
        if (cleanContent.length < 30) {
            return { found: false };
        }

        // Skip simple text blocks
        if (!language || language === 'text' || language === 'plaintext') {
            return { found: false };
        }

        const type = determineArtifactType(language, cleanContent);
        const title = generateTitle(type, language, cleanContent);

        return {
            found: true,
            artifact: {
                type: type,
                language: language,
                title: title,
                content: cleanContent
            }
        };
    }

    // Pattern 3: Detect HTML without code blocks (sometimes AI forgets)
    // Example: <html>...</html> or <!DOCTYPE html>...
    if (message.includes('<!DOCTYPE html>') ||
        (/^<html[^>]*>/i.test(message) && message.includes('</html>'))) {

        const htmlMatch = message.match(/<!DOCTYPE html>[\s\S]+?<\/html>/i) ||
            message.match(/<html[^>]*>[\s\S]+?<\/html>/i);

        if (htmlMatch) {
            const content = htmlMatch[0].trim();
            return {
                found: true,
                artifact: {
                    type: 'html',
                    language: 'html',
                    title: 'HTML Document',
                    content: content
                }
            };
        }
    }

    // Pattern 4: Detect React components without code blocks
    // Example: function App() { ... } or const App = () => { ... }
    const reactPattern = /(?:function|const)\s+([A-Z][a-zA-Z0-9]*)\s*(?:=\s*\(.*?\)\s*=>|\(.*?\))\s*\{[\s\S]{50,}\}/;
    const reactMatch = message.match(reactPattern);

    if (reactMatch && reactMatch[0].length > 100) {
        const content = reactMatch[0].trim();
        const componentName = reactMatch[1];

        return {
            found: true,
            artifact: {
                type: 'react',
                language: 'jsx',
                title: `${componentName} Component`,
                content: content
            }
        };
    }

    return { found: false };
};

/**
 * Extract ALL artifacts from a message (supports multiple code blocks)
 */
export const extractArtifactsFromMessage = (message: string): ArtifactExtractionResult[] => {
    if (!message || message.length < 20) return [];

    const results: ArtifactExtractionResult[] = [];
    const processedRanges: [number, number][] = [];

    // Helper to check overlap
    const isOverlapping = (start: number, end: number) => {
        return processedRanges.some(([s, e]) => start < e && end > s);
    };

    // 1. Find all code blocks (Standard & Titled)
    // We use a general regex and then refine
    const codeBlockRegex = /```(\w+)?\s*\n(?:(?:\/\/|#|<!--)\s*(.+?)\s*(?:-->)?\n)?([\s\S]+?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(message)) !== null) {
        const [fullMatch, lang, titleMatch, content] = match;
        const startIndex = match.index;
        const endIndex = startIndex + fullMatch.length;

        if (isOverlapping(startIndex, endIndex)) continue;

        const cleanContent = content.trim();
        if (cleanContent.length < 30) continue;

        const language = lang || 'text';

        // Skip simple text
        if (language === 'text' && !titleMatch) continue;

        const type = determineArtifactType(language, cleanContent);
        const title = titleMatch ? titleMatch.trim() : generateTitle(type, language, cleanContent);

        results.push({
            found: true,
            artifact: {
                type,
                language,
                title,
                content: cleanContent
            }
        });

        processedRanges.push([startIndex, endIndex]);
    }

    // 2. Fallbacks (HTML/React without blocks) - Only if NO code blocks found to avoid false positives inside code
    // (Simplification: If we found code blocks, we assume the AI is being "good" and using blocks)
    if (results.length === 0) {
        const single = extractArtifactFromMessage(message);
        if (single.found) {
            results.push(single);
        }
    }

    return results;
};

/**
 * Determine artifact type from language and content
 */
function determineArtifactType(language: string, content: string): any {
    const lang = language.toLowerCase();

    // HTML
    if (lang === 'html' || lang === 'htm') {
        return 'html';
    }

    // React/JSX
    if (lang === 'jsx' || lang === 'tsx' || lang === 'react') {
        return 'react';
    }

    // Check content for React patterns
    if (/(?:function|const)\s+[A-Z][a-zA-Z0-9]*.*?(?:return|=>).*?<[A-Z]/.test(content)) {
        return 'react';
    }

    // SVG
    if (lang === 'svg' || content.includes('<svg')) {
        return 'svg';
    }

    // Mermaid
    if (lang === 'mermaid') {
        return 'mermaid';
    }

    // Markdown
    if (lang === 'markdown' || lang === 'md') {
        return 'markdown';
    }

    // Default to code
    return 'code';
}

/**
 * Generate a meaningful title from code content
 */
function generateTitle(type: string, language: string, content: string): string {
    // Try to extract meaningful title from content

    // React Component
    if (type === 'react') {
        const componentMatch = content.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/);
        if (componentMatch) {
            return `${componentMatch[1]} Component`;
        }
        return 'React Component';
    }

    // HTML - look for title tag
    if (type === 'html') {
        const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch) {
            return titleMatch[1].trim();
        }
        return 'HTML Document';
    }

    // Function/Class names for code
    if (type === 'code') {
        const functionMatch = content.match(/(?:function|def|class)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (functionMatch) {
            return `${functionMatch[1]} - ${language}`;
        }
    }

    // Default
    return `${language.toUpperCase()} Snippet`;
}
