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
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('[ArtifactRenderer] Rendering artifact:', {
            type: artifact.type,
            title: artifact.title,
            isMobile,
            contentLength: artifact.content?.length
        });

        setLoading(true);
        setError(null);

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            try {
                if (artifact.type === 'html') {
                    renderHTML();
                } else if (artifact.type === 'react') {
                    renderReact();
                } else if (artifact.type === 'svg') {
                    renderSVG();
                } else {
                    renderCode();
                }
            } catch (err: any) {
                console.error('[ArtifactRenderer] Error:', err);
                setError(err.message);
                setLoading(false);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [artifact.id, artifact.content, isMobile]);

    const renderHTML = () => {
        console.log('[ArtifactRenderer] renderHTML called, isMobile:', isMobile);

        // UNIVERSAL: Use iframe for both mobile and desktop (most reliable)
        if (iframeRef.current) {
            const iframe = iframeRef.current;
            const htmlDoc = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * { box-sizing: border-box; }
        body { 
            margin: 0; 
            padding: 16px; 
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            min-height: 100vh;
        }
    </style>
</head>
<body>
    ${artifact.content}
</body>
</html>`;

            iframe.srcdoc = htmlDoc;
            iframe.onload = () => {
                console.log('[ArtifactRenderer] iframe loaded');
                setLoading(false);
            };
            iframe.onerror = () => {
                setError('Failed to load iframe');
                setLoading(false);
            };
        } else {
            // Fallback: Direct injection to container
            if (containerRef.current) {
                containerRef.current.innerHTML = artifact.content;
                setLoading(false);
            }
        }
    };

    const renderReact = () => {
        console.log('[ArtifactRenderer] renderReact called');

        // For React, we use iframe with full React setup
        if (iframeRef.current) {
            const iframe = iframeRef.current;

            // Clean the code
            let code = artifact.content
                .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?\n?/g, '')
                .replace(/import\s+['"][^'"]+['"];?\n?/g, '')
                .replace(/export\s+default\s+/g, '');

            const reactDoc = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; }
        .error { color: #dc2626; padding: 20px; background: #fef2f2; border-radius: 8px; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect, useRef, useMemo, useCallback, useContext, useReducer } = React;
        
        try {
            ${code}
            
            const root = ReactDOM.createRoot(document.getElementById('root'));
            
            // Try to find and render the component
            if (typeof App !== 'undefined') {
                root.render(<App />);
            } else if (typeof Calculator !== 'undefined') {
                root.render(<Calculator />);
            } else if (typeof Component !== 'undefined') {
                root.render(<Component />);
            } else {
                // Look for any capitalized function
                const globals = Object.keys(window).filter(k => /^[A-Z][a-zA-Z]*$/.test(k) && typeof window[k] === 'function');
                if (globals.length > 0) {
                    const Comp = window[globals[0]];
                    root.render(<Comp />);
                } else {
                    document.getElementById('root').innerHTML = '<div class="error">No component found</div>';
                }
            }
        } catch (err) {
            document.getElementById('root').innerHTML = '<div class="error">Error: ' + err.message + '</div>';
            console.error('[React Artifact]', err);
        }
    </script>
</body>
</html>`;

            iframe.srcdoc = reactDoc;
            iframe.onload = () => {
                console.log('[ArtifactRenderer] React iframe loaded');
                setLoading(false);
            };
        } else {
            setError('iframe not available');
            setLoading(false);
        }
    };

    const renderSVG = () => {
        console.log('[ArtifactRenderer] renderSVG called');
        if (containerRef.current) {
            containerRef.current.innerHTML = artifact.content;
            setLoading(false);
        } else if (iframeRef.current) {
            const iframe = iframeRef.current;
            iframe.srcdoc = `
<!DOCTYPE html>
<html>
<head>
    <style>body { margin: 0; padding: 16px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }</style>
</head>
<body>${artifact.content}</body>
</html>`;
            iframe.onload = () => setLoading(false);
        }
    };

    const renderCode = () => {
        console.log('[ArtifactRenderer] renderCode called (fallback)');
        // For code type, we show syntax-highlighted code
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <p className="text-gray-500 text-sm">Rendering {artifact.type}...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full min-h-[300px] bg-red-50 p-4">
                <div className="text-center max-w-md">
                    <div className="text-4xl mb-3">⚠️</div>
                    <h3 className="text-base font-semibold text-red-700 mb-2">Rendering Error</h3>
                    <p className="text-sm text-red-600 mb-3">{error}</p>
                    <pre className="text-xs bg-red-100 p-2 rounded text-left overflow-auto max-h-32">
                        {artifact.content.substring(0, 500)}...
                    </pre>
                </div>
            </div>
        );
    }

    // For 'code' type, show syntax highlighted code directly
    if (artifact.type === 'code' || artifact.type === 'markdown' || artifact.type === 'mermaid') {
        return (
            <div className="w-full h-full overflow-auto bg-gray-900 p-4">
                <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-words">
                    <code>{artifact.content}</code>
                </pre>
            </div>
        );
    }

    // For HTML/React/SVG - use iframe (works on both mobile and desktop)
    return (
        <div className="w-full h-full relative" data-artifact-preview>
            {/* Hidden container for fallback */}
            <div ref={containerRef} className="hidden" />

            {/* Main iframe for rendering */}
            <iframe
                ref={iframeRef}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                title={artifact.title || 'Artifact Preview'}
                style={{ minHeight: '100%' }}
            />
        </div>
    );
};

export default ArtifactRenderer;
