import React, { useEffect, useRef, useState } from 'react';
import { Artifact } from '../../types/artifacts';

interface ArtifactRendererProps {
    artifact: Artifact;
    isMobile: boolean;
}

export const ArtifactRenderer: React.FC<ArtifactRendererProps> = ({
    artifact,
    isMobile
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Reset state when artifact changes
        setLoading(true);
        setError(null);

        // Timer to allow overlay to show and ref to mount
        const timer = setTimeout(() => {
            try {
                // Safe check: If ref is missing, retry once
                if (!iframeRef.current) {
                    if (['code', 'markdown', 'mermaid'].includes(artifact.type)) {
                        setLoading(false);
                        return;
                    }
                    // Retry logic
                    setTimeout(() => {
                        if (iframeRef.current) {
                            renderContent();
                        } else {
                            console.error('[ArtifactRenderer] Iframe ref missing after retry');
                            // Do not crash, just show code fallback? No, error.
                            setError('System error: Renderer initialization failed');
                            setLoading(false);
                        }
                    }, 100);
                    return;
                }
                renderContent();
            } catch (err: any) {
                console.error('[ArtifactRenderer] Error:', err);
                setError(err.message || 'Rendering failed');
                setLoading(false);
            }
        }, 50);

        return () => clearTimeout(timer);
    }, [artifact.id, artifact.content, artifact.type]);

    const renderContent = () => {
        if (artifact.type === 'html') renderHTML();
        else if (artifact.type === 'react') renderReact();
        else if (artifact.type === 'svg') renderSVG();
        else setLoading(false);
    };

    const renderHTML = () => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const htmlDoc = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            margin: 0; padding: 16px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh; background: white;
        }
    </style>
</head>
<body>
    ${artifact.content}
</body>
</html>`;

        writeToIframe(iframe, htmlDoc, 'HTML');
    };

    const renderReact = () => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        let code = artifact.content
            .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?\n?/g, '')
            .replace(/import\s+['"][^'"]+['"];?\n?/g, '')
            .replace(/export\s+default\s+/g, '')
            .trim();

        const reactDoc = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script src="https://cdn.tailwindcss.com"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; }
        .error-display { color: #dc2626; padding: 20px; background: #fef2f2; border-radius: 8px; font-family: monospace; font-size: 14px; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect, useRef, useMemo, useCallback } = React;
        try {
            ${code}
            const root = ReactDOM.createRoot(document.getElementById('root'));
            
            // Smart Component Detection
            let ComponentToRender = null;
            if (typeof App !== 'undefined') ComponentToRender = App;
            else if (typeof Calculator !== 'undefined') ComponentToRender = Calculator;
            else if (typeof Component !== 'undefined') ComponentToRender = Component;
            else {
                // Find any Capitalized function
                const globals = Object.keys(window).filter(k => 
                    /^[A-Z][a-zA-Z0-9]*$/.test(k) && typeof window[k] === 'function'
                );
                if (globals.length > 0) ComponentToRender = window[globals[0]];
            }
            
            if (ComponentToRender) {
                root.render(<ComponentToRender />);
            } else {
                document.getElementById('root').innerHTML = 
                    '<div class="error-display">⚠️ No React component found. Name your component App, Calculator, or similar.</div>';
            }
        } catch (err) {
            document.getElementById('root').innerHTML = 
                '<div class="error-display">❌ Error: ' + err.message + '</div>';
        }
    </script>
</body>
</html>`;

        writeToIframe(iframe, reactDoc, 'React');
    };

    const renderSVG = () => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        const svgDoc = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }</style>
</head>
<body>${artifact.content}</body>
</html>`;
        writeToIframe(iframe, svgDoc, 'SVG');
    };

    const writeToIframe = (iframe: HTMLIFrameElement, doc: string, type: string) => {
        try {
            iframe.srcdoc = doc;
            iframe.onload = () => {
                console.log(`[ArtifactRenderer] ${type} Loaded`);
                setLoading(false);
            };
        } catch (e: any) {
            setError(e.message);
            setLoading(false);
        }
    };

    // CODE VIEW (Direct Render)
    if (['code', 'markdown', 'mermaid'].includes(artifact.type)) {
        return (
            <div className="w-full h-full overflow-auto bg-gray-900 p-4">
                <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-words leading-relaxed">
                    <code>{artifact.content}</code>
                </pre>
            </div>
        );
    }

    // PREVIEW VIEW (Fixed Overlay Pattern)
    return (
        <div className="w-full h-full relative bg-white">
            {/* LOADING OVERLAY - Does NOT unmount iframe */}
            <div
                className={`absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-opacity duration-300 ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    <p className="text-xs text-gray-500 font-medium">RENDERING PREVIEW...</p>
                </div>
            </div>

            {/* ERROR OVERLAY */}
            {error ? (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-red-50 p-6">
                    <div className="text-center">
                        <div className="text-4xl mb-3">⚠️</div>
                        <h3 className="text-red-700 font-bold mb-2">Rendering Error</h3>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                </div>
            ) : (
                /* IFRAME - ALWAYS RENDERED */
                <iframe
                    ref={iframeRef}
                    className="w-full h-full border-0 block"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                    title={artifact.title || 'Artifact Preview'}
                    style={{ backgroundColor: 'white' }}
                />
            )}
        </div>
    );
};

export default ArtifactRenderer;