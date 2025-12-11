// assets/index.ts - Asset Exports

// Logo SVG as data URL
export const WILI_LOGO = `data:image/svg+xml,${encodeURIComponent(`
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="45" fill="#10b981"/>
  <text x="50" y="65" text-anchor="middle" fill="white" font-size="40" font-weight="bold">W</text>
</svg>
`)}`;

// Avatar colors
export const AVATAR_COLORS = [
    '#10b981', // green
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
];

// Model icons
export const MODEL_ICONS: Record<string, string> = {
    gemini: '✨',
    openrouter: '🔷',
    huggingface: '🤗',
    openai: '🤖',
    claude: '🟠',
};

export default { WILI_LOGO, AVATAR_COLORS, MODEL_ICONS };
