import React, { useEffect, useRef, useState } from 'react';
import { Artifact } from '../../types/artifacts';
import mermaid from 'mermaid';
import ReactMarkdown from 'react-markdown';

interface ArtifactRendererProps {
  artifact: Artifact;
}

export const ArtifactRenderer: React.FC<ArtifactRendererProps> = ({ artifact }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true, 
      theme: 'default',
      securityLevel: 'loose'
    });
  }, []);

  // Render berdasarkan type
  useEffect(() => {
    setError(null);
    
    try {
      if (artifact.type === 'html') {
        renderHTML();
      } else if (artifact.type === 'react') {
        renderReact();
      } else if (artifact.type === 'svg') {
        renderSVG();
      } else if (artifact.type === 'mermaid') {
        renderMermaid();
      }
    } catch (err) {
      setError(`Error rendering artifact: ${err}`);
      console.error(err);
    }
  }, [artifact]);

  const renderHTML = () => {
    if (!iframeRef.current) return;
    
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    
    doc.open();
    doc.write(artifact.content);
    doc.close();
  };

  const renderReact = () => {
    if (!iframeRef.current) return;
    
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    
    // Wrapper HTML untuk React component
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${artifact.content}
            
            const container = document.getElementById('root');
            const root = ReactDOM.createRoot(container);
            
            // Try to render the component
            try {
              // Check if there's a default export
              const Component = typeof __default !== 'undefined' ? __default : App;
              root.render(React.createElement(Component));
            } catch (err) {
              console.error('Error rendering component:', err);
              container.innerHTML = '<div style="color: red;">Error: ' + err.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;
    
    doc.open();
    doc.write(html);
    doc.close();
  };

  const renderSVG = () => {
    if (!iframeRef.current) return;
    
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 16px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            svg { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${artifact.content}
        </body>
      </html>
    `;
    
    doc.open();
    doc.write(html);
    doc.close();
  };

  const renderMermaid = async () => {
    if (!mermaidRef.current) return;
    
    try {
      mermaidRef.current.innerHTML = artifact.content;
      await mermaid.run({ nodes: [mermaidRef.current] });
    } catch (err) {
      setError(`Mermaid rendering error: ${err}`);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600 font-semibold">Error</p>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  // Render berdasarkan type
  if (artifact.type === 'code' || artifact.type === 'text') {
    return (
      <pre className="p-4 bg-gray-50 rounded overflow-auto text-sm">
        <code className={`language-${artifact.language || 'text'}`}>
          {artifact.content}
        </code>
      </pre>
    );
  }

  if (artifact.type === 'markdown') {
    return (
      <div className="prose max-w-none p-4">
        <ReactMarkdown>{artifact.content}</ReactMarkdown>
      </div>
    );
  }

  if (artifact.type === 'mermaid') {
    return (
      <div className="p-4 flex justify-center items-center">
        <div ref={mermaidRef} className="mermaid" />
      </div>
    );
  }

  // HTML, React, SVG menggunakan iframe
  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin"
      title={artifact.title}
    />
  );
};
