// validators.ts - Input Validation Utilities

// Validate email
export function isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validate URL
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Validate file type
export function isAllowedFileType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
        if (type.endsWith('/*')) {
            return mimeType.startsWith(type.slice(0, -1));
        }
        return mimeType === type;
    });
}

// Validate file size
export function isValidFileSize(size: number, maxSizeMB: number): boolean {
    return size <= maxSizeMB * 1024 * 1024;
}

// Validate prompt length
export function isValidPromptLength(text: string, maxLength: number = 100000): boolean {
    return text.length <= maxLength;
}

// Sanitize HTML to prevent XSS
export function sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

// Validate API key format
export function isValidApiKey(key: string, provider: 'gemini' | 'openai' | 'openrouter' | 'hf'): boolean {
    if (!key || key.trim().length === 0) return false;
    switch (provider) {
        case 'gemini': return key.startsWith('AI') && key.length >= 30;
        case 'openai': return key.startsWith('sk-') && key.length >= 40;
        case 'openrouter': return key.startsWith('sk-or-') && key.length >= 40;
        case 'hf': return key.startsWith('hf_') && key.length >= 30;
        default: return key.length >= 10;
    }
}

// Validate JSON string
export function isValidJson(str: string): boolean {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

// Check for harmful content patterns (basic)
export function containsHarmfulPatterns(text: string): boolean {
    const patterns = [/<script/i, /javascript:/i, /on\w+=/i, /data:text\/html/i];
    return patterns.some(pattern => pattern.test(text));
}

// Rate limit check
export function isRateLimited(lastRequest: number, minInterval: number): boolean {
    return Date.now() - lastRequest < minInterval;
}

export default { isValidEmail, isValidUrl, isAllowedFileType, isValidFileSize, isValidPromptLength, sanitizeHtml, isValidApiKey, isValidJson, containsHarmfulPatterns, isRateLimited };
