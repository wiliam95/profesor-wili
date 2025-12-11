// MessageBubble.tsx - Claude AI Style Message Component
import React, { useState, memo } from 'react';
import {
    Copy, ThumbsUp, ThumbsDown, RefreshCw, Edit,
    Share, MoreHorizontal, Check, Sparkles, User,
    ChevronDown, ChevronUp, Clock
} from 'lucide-react';
import { Message, Role } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageBubbleProps {
    message: Message;
    onCopy?: (text: string) => void;
    onRegenerate?: (id: string) => void;
    onEdit?: (id: string, newText: string) => void;
    onFeedback?: (id: string, type: 'up' | 'down') => void;
    isLast?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({
    message,
    onCopy,
    onRegenerate,
    onEdit,
    onFeedback,
    isLast = false
}) => {
    const [showActions, setShowActions] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.text);
    const [showThinking, setShowThinking] = useState(true);
    const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

    const isUser = message.role === Role.USER;
    const isStreaming = message.isStreaming;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.text);
        setCopied(true);
        onCopy?.(message.text);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEdit = () => {
        if (isEditing && editText !== message.text) {
            onEdit?.(message.id, editText);
        }
        setIsEditing(!isEditing);
    };

    const handleFeedback = (type: 'up' | 'down') => {
        setFeedback(type);
        onFeedback?.(message.id, type);
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Extract thinking content if present
    const thinkingMatch = message.text.match(/<thinking>([\s\S]*?)<\/thinking>/);
    const thinkingContent = thinkingMatch ? thinkingMatch[1].trim() : null;
    const mainContent = thinkingContent
        ? message.text.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim()
        : message.text;

    return (
        <div
            className={`group relative py-6 px-4 md:px-8 transition-all duration-200 ${isUser
                    ? 'bg-transparent'
                    : 'bg-slate-900/30'
                }`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="max-w-4xl mx-auto">
                <div className="flex gap-4">
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : 'bg-gradient-to-br from-orange-400 to-orange-500'
                        }`}>
                        {isUser ? (
                            <User className="w-4 h-4 text-white" />
                        ) : (
                            <Sparkles className="w-4 h-4 text-white" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-slate-200">
                                {isUser ? 'You' : 'Claude'}
                            </span>
                            <span className="text-xs text-slate-500">
                                {formatTime(message.timestamp)}
                            </span>
                            {message.usage && (
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {message.usage.latencyMs}ms
                                </span>
                            )}
                        </div>

                        {/* Thinking Bubble - Claude Style */}
                        {thinkingContent && !isUser && (
                            <div className="mb-4">
                                <button
                                    onClick={() => setShowThinking(!showThinking)}
                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors mb-2"
                                >
                                    <div className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-orange-400" />
                                    </div>
                                    <span>Thinking</span>
                                    {showThinking ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>

                                {showThinking && (
                                    <div className="ml-7 pl-4 border-l-2 border-orange-500/30 text-sm text-slate-400 bg-slate-800/30 rounded-r-lg py-3 pr-4 animate-fadeIn">
                                        <MarkdownRenderer content={thinkingContent} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Main Message Content */}
                        {isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                    rows={4}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleEdit}
                                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditText(message.text);
                                        }}
                                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={`prose prose-invert max-w-none ${isStreaming ? 'typing-cursor' : ''}`}>
                                {isUser ? (
                                    <p className="text-slate-200 whitespace-pre-wrap">{mainContent}</p>
                                ) : (
                                    <MarkdownRenderer content={mainContent} />
                                )}
                            </div>
                        )}

                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {message.attachments.map((attachment, idx) => (
                                    <div key={idx} className="relative group/attachment">
                                        {attachment.type === 'image' ? (
                                            <img
                                                src={`data:${attachment.mimeType};base64,${attachment.data}`}
                                                alt={attachment.name || 'Attachment'}
                                                className="max-w-xs max-h-48 rounded-lg border border-slate-700 object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700">
                                                <span className="text-sm text-slate-300">{attachment.name}</span>
                                                {attachment.size && (
                                                    <span className="text-xs text-slate-500">
                                                        ({(attachment.size / 1024).toFixed(1)} KB)
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Citations */}
                        {message.citations && message.citations.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                <p className="text-xs text-slate-500 mb-2">Sources:</p>
                                <div className="flex flex-wrap gap-2">
                                    {message.citations.map((citation, idx) => (
                                        <a
                                            key={idx}
                                            href={citation.uri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-400 hover:text-slate-300 transition-colors"
                                        >
                                            <span className="w-4 h-4 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px] font-bold">
                                                {idx + 1}
                                            </span>
                                            <span className="truncate max-w-[150px]">{citation.title || citation.source}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Usage Stats */}
                        {message.usage && !isUser && (
                            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                                <span>{message.usage.inputTokens} input tokens</span>
                                <span>{message.usage.outputTokens} output tokens</span>
                                {message.usage.totalCost && (
                                    <span className="text-emerald-500">{message.usage.totalCost}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons - Claude Style */}
                {!isEditing && (showActions || isLast) && (
                    <div className={`absolute right-4 md:right-8 top-6 flex items-center gap-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                        <button
                            onClick={handleCopy}
                            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Copy"
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <Copy className="w-4 h-4 text-slate-400" />
                            )}
                        </button>

                        {!isUser && (
                            <>
                                <button
                                    onClick={() => handleFeedback('up')}
                                    className={`p-1.5 hover:bg-slate-700 rounded-lg transition-colors ${feedback === 'up' ? 'text-emerald-400' : 'text-slate-400'
                                        }`}
                                    title="Good response"
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleFeedback('down')}
                                    className={`p-1.5 hover:bg-slate-700 rounded-lg transition-colors ${feedback === 'down' ? 'text-red-400' : 'text-slate-400'
                                        }`}
                                    title="Bad response"
                                >
                                    <ThumbsDown className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onRegenerate?.(message.id)}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400"
                                    title="Regenerate"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </>
                        )}

                        {isUser && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400"
                            title="Share"
                        >
                            <Share className="w-4 h-4" />
                        </button>

                        <button
                            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400"
                            title="More options"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
