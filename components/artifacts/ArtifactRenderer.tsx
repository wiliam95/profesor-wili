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
        setLoading(true);
        setError(null);

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
            console.error('[Renderer] Error:', err);
            setError(err.message);
            setLoading(false);
        }
    }, [artifact, isMobile]);

    const renderHTML = () => {
        if (isMobile) {
            // MOBILE: Direct DOM injection (no iframe)
            if (containerRef.current) {
                // Clear previous content
                if (containerRef.current.shadowRoot) {
                    // Shadow root already exists, just update innerHTML
                    containerRef.current.shadowRoot.innerHTML = '';
                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = artifact.content;
                    containerRef.current.shadowRoot.appendChild(wrapper);
                } else {
                    // Create shadow DOM for isolation
                    const shadow = containerRef.current.attachShadow({ mode: 'open' });
                    // Inject HTML
                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = artifact.content;
                    shadow.appendChild(wrapper);
                }
                setLoading(false);
            }
        } else {
            // DESKTOP: iframe sandbox
            if (iframeRef.current) {
                const iframe = iframeRef.current;
                iframe.srcdoc = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
                * { box-sizing: border-box; }
              </style>
            </head>
            <body>
              ${artifact.content}
            </body>
          </html>
        `;

                iframe.onload = () => setLoading(false);
            }
        }
    };

    const renderReact = () => {
        // Use @babel/standalone to compile JSX
        import('@babel/standalone').then((Babel) => {
            try {
                // Remove imports (not needed in browser)
                let code = artifact.content
                    .replace(/import .+ from .+;?\n?/g, '')
                    .replace(/export default /g, '');

                // Compile JSX to JS
                const compiled = Babel.transform(code, {
                    presets: ['react'],
                }).code;

                // Create React component
                // Note: We need React and ReactDOM available in scope for eval
                // In a real app we might expose them via window or use a Function constructor with args
                // For this implementation, we assume they are globally available or we'll rely on the app's React instance if compiled code uses React.createElement

                // However, eval-ing code that uses JSX compiled to React.createElement requiring React in scope
                // The compiled code usually assumes 'React' is in scope.
                // We can attach React to window temporarily or rely on it being imported in file? No, eval runs in local scope.

                // Let's try to expose basics to window or use a safer runner
                (window as any).React = React;
                // ReactDOM is dynamic import
                import('react-dom/client').then((ReactDOM) => {
                    (window as any).ReactDOM = ReactDOM;

                    try {
                        const Component = eval(`(${compiled})`);

                        // Render to container
                        if (containerRef.current) {
                            const root = ReactDOM.createRoot(containerRef.current!);
                            root.render(<Component />);
                            setLoading(false);
                        }
                    } catch (evalErr: any) {
                        throw new Error("Eval failed: " + evalErr.message);
                    }
                });

            } catch (err: any) {
                setError('React compilation failed: ' + err.message);
                setLoading(false);
            }
        });
    };

    const renderSVG = () => {
        if (containerRef.current) {
            containerRef.current.innerHTML = artifact.content;
            setLoading(false);
        }
    };

    const renderCode = () => {
        // Fallback: Show syntax highlighted code
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Rendering artifact...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full bg-red-50 p-6">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Rendering Error</h3>
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                    <pre className="text-xs bg-red-100 p-3 rounded text-left overflow-auto max-h-40">
                        {artifact.content}
                    </pre>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* MOBILE: Direct container */}
            {isMobile && (
                <div
                    ref={containerRef}
                    className="w-full h-full overflow-auto bg-white"
                    style={{ minHeight: '100vh' }}
                    data-artifact-preview
                />
            )}

            {/* DESKTOP: iframe */}
            {!isMobile && (
                <iframe
                    ref={iframeRef}
                    className="w-full h-full border-0 bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                    title="Artifact Preview"
                />
            )}
        </>
    );
};

export default ArtifactRenderer;
