// ModelSelector.tsx - Claude AI Style Model Selector
import React, { useState, useRef, useEffect, memo } from 'react';
import { ChevronDown, ChevronUp, Check, Sparkles, Zap, Brain, Cpu, Crown, X, Search } from 'lucide-react';
import { ModelType, ModelGroup } from '../types';
import { AI_MODELS } from '../constants';

interface ModelSelectorProps {
    activeModel: ModelType;
    onModelChange: (model: ModelType) => void;
    compact?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = memo(({
    activeModel,
    onModelChange,
    compact = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Get current model info
    const getCurrentModelInfo = () => {
        for (const group of AI_MODELS) {
            const model = group.models.find(m => m.id === activeModel);
            if (model) {
                return { ...model, provider: group.provider };
            }
        }
        return {
            id: activeModel,
            name: 'Select Model',
            description: '',
            provider: 'Unknown',
            icon: '🤖'
        };
    };

    const currentModel = getCurrentModelInfo();

    // Filter models based on search
    const filteredGroups = AI_MODELS.map(group => ({
        ...group,
        models: group.models.filter(model =>
            model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.provider.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(group => group.models.length > 0);

    // Get badge styling - Claude Light Theme
    const getBadgeStyle = (badge?: string) => {
        if (!badge) return '';
        const lowerBadge = badge.toLowerCase();
        if (lowerBadge.includes('free')) return 'bg-emerald-100 text-emerald-700';
        if (lowerBadge.includes('fast')) return 'bg-blue-100 text-blue-700';
        if (lowerBadge.includes('recommended')) return 'bg-orange-100 text-claude-accent';
        if (lowerBadge.includes('premium') || lowerBadge.includes('latest')) return 'bg-purple-100 text-purple-700';
        if (lowerBadge.includes('preview') || lowerBadge.includes('beta')) return 'bg-amber-100 text-amber-700';
        if (lowerBadge.includes('thinking')) return 'bg-indigo-100 text-indigo-700';
        if (lowerBadge.includes('stable')) return 'bg-gray-100 text-gray-700';
        return 'bg-gray-100 text-gray-600';
    };

    // Get icon for model
    const getModelIcon = (model: any) => {
        if (model.icon) return model.icon;
        const id = String(model.id).toLowerCase();
        if (id.includes('opus') || id.includes('pro')) return <Crown className="w-4 h-4" />;
        if (id.includes('sonnet') || id.includes('flash')) return <Zap className="w-4 h-4" />;
        if (id.includes('haiku') || id.includes('lite')) return <Sparkles className="w-4 h-4" />;
        if (id.includes('thinking') || id.includes('deep')) return <Brain className="w-4 h-4" />;
        return <Cpu className="w-4 h-4" />;
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger Button - Claude Style */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${isOpen
                        ? 'bg-white border-claude-accent shadow-sm'
                        : 'bg-white border-claude-border hover:border-claude-text-light'
                    } ${compact ? 'text-sm' : ''}`}
            >
                <span className="text-base">{currentModel.icon || '🤖'}</span>
                {!compact && (
                    <span className="text-claude-text font-medium text-sm">{currentModel.name}</span>
                )}
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-claude-text-muted" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-claude-text-muted" />
                )}
            </button>

            {/* Dropdown Panel - Claude Style */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 max-h-[70vh] overflow-hidden bg-white border border-claude-border rounded-2xl shadow-lg z-50 animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b border-claude-border">
                        <span className="font-semibold text-claude-text">Select Model</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-lg hover:bg-claude-bg text-claude-text-muted transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="p-3 border-b border-claude-border">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-claude-text-light" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search models..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-claude-bg border border-claude-border rounded-lg text-sm text-claude-text placeholder-claude-text-light focus:outline-none focus:border-claude-accent focus:ring-1 focus:ring-claude-accent/20"
                            />
                        </div>
                    </div>

                    {/* Models List */}
                    <div className="overflow-y-auto max-h-[50vh] p-2">
                        {filteredGroups.map((group, groupIndex) => (
                            <div key={groupIndex} className="mb-3 last:mb-0">
                                {/* Group Header */}
                                <div className="px-3 py-2 text-xs font-semibold text-claude-text-light uppercase tracking-wider">
                                    {group.provider}
                                </div>

                                {/* Models */}
                                <div className="space-y-0.5">
                                    {group.models.map((model) => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                onModelChange(model.id);
                                                setIsOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all ${model.id === activeModel
                                                    ? 'bg-claude-bg border border-claude-accent/30'
                                                    : 'hover:bg-claude-bg border border-transparent'
                                                }`}
                                        >
                                            {/* Model Icon */}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${model.id === activeModel
                                                    ? 'bg-claude-accent/10 text-claude-accent'
                                                    : 'bg-claude-border-light text-claude-text-muted'
                                                }`}>
                                                {typeof model.icon === 'string' ? model.icon : getModelIcon(model)}
                                            </div>

                                            {/* Model Info */}
                                            <div className="flex-1 text-left min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`font-medium text-sm ${model.id === activeModel ? 'text-claude-accent' : 'text-claude-text'
                                                        }`}>
                                                        {model.name}
                                                    </span>
                                                    {model.badge && (
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getBadgeStyle(model.badge)}`}>
                                                            {model.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-claude-text-muted mt-0.5 line-clamp-1">
                                                    {model.description || model.desc}
                                                </p>
                                            </div>

                                            {/* Selected Indicator */}
                                            {model.id === activeModel && (
                                                <div className="flex-shrink-0">
                                                    <Check className="w-5 h-5 text-claude-accent" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {filteredGroups.length === 0 && (
                            <div className="px-4 py-8 text-center text-claude-text-muted">
                                <p>No models found for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-claude-border bg-claude-bg/50">
                        <div className="flex items-center justify-between text-xs text-claude-text-light">
                            <span>{AI_MODELS.reduce((acc, g) => acc + g.models.length, 0)} models available</span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-claude-text-muted hover:text-claude-text transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

ModelSelector.displayName = 'ModelSelector';

export default ModelSelector;
