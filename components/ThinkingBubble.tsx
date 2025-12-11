// ThinkingBubble.tsx - Claude AI Extended Thinking UI
import React, { useState, useEffect, memo } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Brain, Clock } from 'lucide-react';

interface ThinkingBubbleProps {
    isThinking: boolean;
    thinkingContent?: string;
    elapsedTime?: number;
    onToggle?: () => void;
}

export const ThinkingBubble: React.FC<ThinkingBubbleProps> = memo(({
    isThinking, thinkingContent, elapsedTime = 0, onToggle
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [animatedTime, setAnimatedTime] = useState(0);

    useEffect(() => {
        if (isThinking) {
            const interval = setInterval(() => setAnimatedTime(prev => prev + 100), 100);
            return () => clearInterval(interval);
        } else {
            setAnimatedTime(elapsedTime);
        }
    }, [isThinking, elapsedTime]);

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const tenths = Math.floor((ms % 1000) / 100);
        return `${seconds}.${tenths}s`;
    };

    if (!isThinking && !thinkingContent) return null;

    return (
        <div className="mb-4 animate-fadeIn">
            <button
                onClick={() => { setIsExpanded(!isExpanded); onToggle?.(); }}
                className="flex items-center gap-2 text-sm transition-colors group"
            >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isThinking ? 'bg-orange-500/30 animate-pulse' : 'bg-orange-500/20'}`}>
                    {isThinking ? <Brain className="w-4 h-4 text-orange-400 animate-bounce" /> : <Sparkles className="w-4 h-4 text-orange-400" />}
                </div>
                <span className={`font-medium ${isThinking ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-300'}`}>
                    {isThinking ? 'Thinking...' : 'View thinking'}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {formatTime(animatedTime)}
                </span>
                {!isThinking && (isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />)}
            </button>

            {(isThinking || isExpanded) && thinkingContent && (
                <div className="mt-2 ml-8 pl-4 border-l-2 border-orange-500/30 text-sm text-slate-400 bg-slate-800/30 rounded-r-lg py-3 pr-4 animate-fadeIn max-h-60 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans">{thinkingContent}</pre>
                </div>
            )}

            {isThinking && !thinkingContent && (
                <div className="mt-2 ml-8 flex items-center gap-2 text-sm text-slate-500">
                    <div className="flex gap-1">
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Processing your request...</span>
                </div>
            )}
        </div>
    );
});

ThinkingBubble.displayName = 'ThinkingBubble';
export default ThinkingBubble;
