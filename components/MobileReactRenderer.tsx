import React, { useEffect, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom/client';

interface MobileReactRendererProps {
    code: string;
}

export const MobileReactRenderer: React.FC<MobileReactRendererProps> = ({ code }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string>('');
    const [rendered, setRendered] = useState(false);

    useEffect(() => {
        if (!containerRef.current || rendered) return;

        try {
            // Clean code: remove import statements (not needed in browser)
            let cleanCode = code
                .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?\n?/g, '')
                .replace(/import\s+['"][^'"]+['"];?\n?/g, '')
                .replace(/export\s+default\s+/g, '')
                .replace(/export\s+/g, '');

            console.log('[MobileReactRenderer] Cleaned code:', cleanCode.substring(0, 200));

            // Create a simple wrapper component that renders the code as static HTML
            // This is safer than eval for mobile
            const htmlContent = `
        <div style="font-family: system-ui, sans-serif; padding: 1rem;">
          <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <strong>📱 Mobile Preview Mode</strong>
            <p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">
              Interactive preview is limited on mobile. View full code below.
            </p>
          </div>
          <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.75rem; white-space: pre-wrap; word-break: break-word;">${cleanCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
      `;

            containerRef.current.innerHTML = htmlContent;
            setRendered(true);

        } catch (err: any) {
            console.error('[MobileReactRenderer] Error:', err);
            setError(err.message);
        }
    }, [code, rendered]);

    if (error) {
        return (
            <div className="w-full p-4 bg-red-50 text-red-600">
                <p className="font-bold">Render Error:</p>
                <p className="text-sm">{error}</p>
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                    {code}
                </pre>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full min-h-screen bg-white"
            style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
            }}
        />
    );
};

export default MobileReactRenderer;
