import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onFeatureClick?: (featureId: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onFeatureClick }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  let blockCounter = -1;

  const copyCode = async (code: string, idx: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="markdown-content text-[15px] leading-relaxed text-[--text-primary]">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeStr = String(children).replace(/\n$/, '');

            if (!inline && match) {
              blockCounter += 1;
              const idx = blockCounter;

              return (
                <div className="code-block bg-[--bg-tertiary] border border-[--border-primary] rounded-lg overflow-hidden my-4">
                  <div className="code-header flex justify-between items-center px-4 py-2 bg-black/20 border-b border-[--border-subtle]">
                    <span className="code-lang text-xs text-[--text-muted] font-mono">{match[1]}</span>
                    <button
                      onClick={() => copyCode(codeStr, idx)}
                      className={`code-copy-btn h-8 px-3 flex items-center gap-1.5 rounded text-xs transition-colors ${copiedIndex === idx
                          ? 'text-[--success]'
                          : 'text-[--text-muted] hover:bg-[--bg-hover] hover:text-[--text-primary]'
                        }`}
                    >
                      {copiedIndex === idx ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    {...props}
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      background: 'transparent',
                      fontSize: '14px',
                      lineHeight: '1.5',
                    }}
                  >
                    {codeStr}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code {...props} className="bg-[--bg-tertiary] px-1.5 py-0.5 rounded text-[0.9em] font-mono">
                {children}
              </code>
            );
          },

          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          h1: ({ children }) => <h1 className="text-2xl font-semibold mb-4 mt-5 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-4 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-3 first:mt-0">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc ml-5 mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-5 mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-[--accent-primary] pl-4 my-4 text-[--text-secondary] italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[--bg-tertiary]">{children}</thead>,
          th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-semibold border border-[--border-primary]">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-sm border border-[--border-primary]">{children}</td>,
          a: ({ href, children }) => {
            // Citations: [web:1] format
            if (typeof children === 'string' && children.match(/^\[web:\d+\]$/)) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-[--accent-primary] text-xs hover:underline">
                  {children}
                </a>
              );
            }
            if (typeof href === 'string' && href.startsWith('/feature/')) {
              return (
                <button onClick={() => onFeatureClick?.(href.replace('/feature/', ''))} className="text-[--accent-primary] hover:underline">
                  {children}
                </button>
              );
            }
            return <a href={href} target="_blank" rel="noopener noreferrer" className="text-[--accent-primary] hover:underline">{children}</a>;
          },
          hr: () => <hr className="my-6 border-[--border-subtle]" />,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
