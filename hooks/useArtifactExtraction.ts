import { ArtifactExtractionResult } from '../types/artifacts';

export const extractArtifactFromMessage = (message: string): ArtifactExtractionResult => {
    // Pattern 1: Code blocks dengan title
    // Example: ```html\n// My Title\n...```
    const patternWithTitle = /```(\w+)\s*\n\/\/\s*(.+)\n([\s\S]+?)```/;
    const matchWithTitle = message.match(patternWithTitle);

    if (matchWithTitle) {
        const [, language, title, content] = matchWithTitle;
        return {
            found: true,
            artifact: {
                type: language === 'html' ? 'html' : ['jsx', 'tsx', 'react'].includes(language) ? 'react' : 'code',
                language: language,
                title: title.trim(),
                content: content.trim()
            }
        };
    }

    // Pattern 2: Code blocks biasa
    const patternSimple = /```(\w+)?\n([\s\S]+?)```/;
    const matchSimple = message.match(patternSimple);

    if (matchSimple) {
        const [, language = 'text', content] = matchSimple;

        // Ignore simple short blocks likely to be explanations
        if (content.length < 20 && !['html', 'jsx', 'tsx'].includes(language)) {
            return { found: false };
        }

        let type: any = 'code';
        if (language === 'html') type = 'html';
        else if (['jsx', 'tsx', 'react'].includes(language)) type = 'react';
        else if (language === 'svg') type = 'svg';
        else if (language === 'mermaid') type = 'mermaid';

        return {
            found: true,
            artifact: {
                type: type,
                language: language,
                title: `Code Snippet (${language})`,
                content: content.trim()
            }
        };
    }

    return { found: false };
};
