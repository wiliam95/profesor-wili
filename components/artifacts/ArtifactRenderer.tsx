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
        console.log('[ArtifactRenderer] Rendering:', {
            type: artifact.type,
            title: artifact.title,
            contentLength: artifact.content?.length,
            isMobile
        });

        setLoading(true);
        setError(null);

        const timer = setTimeout(() => {
            try {
                if (artifact.type === 'html') {
                    renderHTML();
                } else if (artifact.type === 'react') {
                    renderReact();
                } else if (artifact.type === 'svg') {
                    renderSVG();
                } else {
                    // For code/markdown/mermaid, just show the code
                    setLoading(false);
                }
            } catch (err: any) {
                console.error('[ArtifactRenderer] Error:', err);
                setError(err.message || 'Rendering failed');
                setLoading(false);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [artifact.id, artifact.content]);

    const renderHTML = () => {
        if (!iframeRef.current) {
            setError('iframe not available');
            setLoading(false);
            return;
        }

        const iframe = iframeRef.current;
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
            margin: 0; 
            padding: 16px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            min-height: 100vh;
            background: white;
        }
    </style>
</head>
<body>
    ${artifact.content}
</body>
</html>`;

        try {
            iframe.srcdoc = htmlDoc;
            iframe.onload = () => {
                console.log('[ArtifactRenderer] HTML iframe loaded');
                setLoading(false);
            };
            iframe.onerror = (e) => {
                console.error('[ArtifactRenderer] iframe error:', e);
                setError('Failed to load HTML content');
                setLoading(false);
            };
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const renderReact = () => {
        if (!iframeRef.current) {
            setError('iframe not available');
            setLoading(false);
            return;
        }

        const iframe = iframeRef.current;

        // Clean React code - remove imports
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
        * { box-sizing: border-box; }
        body { 
            margin: 0; 
            padding: 16px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
        }
        .error-display { 
            color: #dc2626; 
            padding: 20px; 
            background: #fef2f2; 
            border-radius: 8px; 
            border-left: 4px solid #dc2626;
            font-family: monospace;
            font-size: 14px;
        }
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
            let ComponentToRender = null;
            
            // Priority order: App > Calculator > Component > any Capitalized function
            if (typeof App !== 'undefined') {
                ComponentToRender = App;
            } else if (typeof Calculator !== 'undefined') {
                ComponentToRender = Calculator;
            } else if (typeof Component !== 'undefined') {
                ComponentToRender = Component;
            } else {
                // Look for any capitalized function
                const globals = Object.keys(window).filter(k => 
                    /^[A-Z][a-zA-Z0-9]*$/.test(k) && 
                    typeof window[k] === 'function'
                );
                if (globals.length > 0) {
                    ComponentToRender = window[globals[0]];
                }
            }
            
            if (ComponentToRender) {
                root.render(<ComponentToRender />);
            } else {
                document.getElementById('root').innerHTML = 
                    '<div class="error-display">⚠️ No React component found. Make sure your component is named "App", "Calculator", or starts with a capital letter.</div>';
            }
        } catch (err) {
            console.error('[React Artifact Error]', err);
            document.getElementById('root').innerHTML = 
                '<div class="error-display">❌ Error: ' + err.message + '</div>';
        }
    </script>
</body>
</html>`;

        try {
            iframe.srcdoc = reactDoc;
            iframe.onload = () => {
                console.log('[ArtifactRenderer] React iframe loaded');
                setLoading(false);
            };
            iframe.onerror = (e) => {
                console.error('[ArtifactRenderer] React iframe error:', e);
                setError('Failed to load React component');
                setLoading(false);
            };
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const renderSVG = () => {
        if (!iframeRef.current) {
            setError('iframe not available');
            setLoading(false);
            return;
        }

        const iframe = iframeRef.current;
        const svgDoc = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            margin: 0; 
            padding: 16px; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh;
            background: white;
        }
        svg {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    ${artifact.content}
</body>
</html>`;

        try {
            iframe.srcdoc = svgDoc;
            iframe.onload = () => {
                console.log('[ArtifactRenderer] SVG iframe loaded');
                setLoading(false);
            };
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    // LOADING STATE
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Rendering {artifact.type}...</p>
                </div>
            </div>
        );
    }

    // ERROR STATE
    if (error) {
        return (
            <div className="flex items-center justify-center h-full min-h-[300px] bg-red-50 p-6">
                <div className="text-center max-w-md">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Rendering Error</h3>
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                    <details className="text-left">
                        <summary className="text-sm text-red-700 cursor-pointer mb-2">View code snippet</summary>
                        <pre className="text-xs bg-red-100 p-3 rounded text-left overflow-auto max-h-32 border border-red-200">
                            {artifact.content.substring(0, 500)}...
                        </pre>
                    </details>
                </div>
            </div>
        );
    }

    // CODE/TEXT TYPES - Direct Display
    if (artifact.type === 'code' || artifact.type === 'markdown' || artifact.type === 'mermaid') {
        return (
            <div className="w-full h-full overflow-auto bg-gray-900 p-4">
                <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-words leading-relaxed">
                    <code>{artifact.content}</code>
                </pre>
            </div>
        );
    }

    // IFRAME RENDERING for HTML/React/SVG
    return (
        <div className="w-full h-full relative bg-white" data-artifact-preview>
            <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                title={artifact.title || 'Artifact Preview'}
                style={{
                    minHeight: '100%',
                    background: 'white'
                }}
            />
        </div>
    );
};

export default ArtifactRenderer;
