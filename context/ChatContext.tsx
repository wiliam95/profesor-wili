// ChatContext.tsx - Chat Context Provider
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Message, ModelType, Persona } from '../types';
import { DEFAULT_PERSONAS } from '../constants';

interface ChatState {
    messages: Message[];
    activeModel: ModelType;
    activePersona: Persona;
    isLoading: boolean;
    isInternetEnabled: boolean;
    isMemoryEnabled: boolean;
}

interface ChatContextType extends ChatState {
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    clearMessages: () => void;
    setActiveModel: (model: ModelType) => void;
    setActivePersona: (persona: Persona) => void;
    setIsLoading: (loading: boolean) => void;
    toggleInternet: () => void;
    toggleMemory: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeModel, setActiveModel] = useState<ModelType>(ModelType.FLASH);
    const [activePersona, setActivePersona] = useState<Persona>(DEFAULT_PERSONAS[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInternetEnabled, setIsInternetEnabled] = useState(false);
    const [isMemoryEnabled, setIsMemoryEnabled] = useState(true);

    const addMessage = (message: Message) => setMessages(prev => [...prev, message]);
    const updateMessage = (id: string, updates: Partial<Message>) => setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    const clearMessages = () => setMessages([]);
    const toggleInternet = () => setIsInternetEnabled(prev => !prev);
    const toggleMemory = () => setIsMemoryEnabled(prev => !prev);

    return (
        <ChatContext.Provider value={{
            messages, activeModel, activePersona, isLoading, isInternetEnabled, isMemoryEnabled,
            setMessages, addMessage, updateMessage, clearMessages, setActiveModel, setActivePersona, setIsLoading, toggleInternet, toggleMemory
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChatContext must be used within ChatProvider');
    return context;
};

export default ChatContext;
