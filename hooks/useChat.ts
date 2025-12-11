// useChat.ts - Chat Operations Hook
import { useState, useCallback, useRef } from 'react';
import { Message, Role, Attachment, ModelType, UsageStats, Citation } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
    isPinned?: boolean;
    isArchived?: boolean;
    projectId?: string;
}

interface UseChatOptions {
    onStreamStart?: () => void;
    onStreamEnd?: (stats?: UsageStats) => void;
    onError?: (error: string) => void;
}

export function useChat(options: UseChatOptions = {}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const shouldStopRef = useRef(false);

    const addMessage = useCallback((role: Role, text: string, attachments?: Attachment[]) => {
        const message: Message = {
            id: uuidv4(),
            role,
            text,
            timestamp: Date.now(),
            attachments
        };
        setMessages(prev => [...prev, message]);
        return message;
    }, []);

    const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    }, []);

    const appendToMessage = useCallback((id: string, chunk: string) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, text: m.text + chunk } : m));
    }, []);

    const deleteMessage = useCallback((id: string) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    const stopGeneration = useCallback(() => {
        shouldStopRef.current = true;
        abortControllerRef.current?.abort();
    }, []);

    const sendMessage = useCallback(async (
        text: string,
        attachments: Attachment[] = [],
        streamFn: (
            modelType: ModelType,
            history: Message[],
            newMessage: string,
            attachments: Attachment[],
            systemInstruction: string,
            isInternetEnabled: boolean,
            onChunk: (chunk: string) => void,
            onComplete: (stats: UsageStats, citations?: Citation[]) => void,
            shouldStop?: () => boolean
        ) => Promise<void>,
        model: ModelType,
        systemInstruction: string,
        isInternetEnabled: boolean
    ) => {
        shouldStopRef.current = false;
        abortControllerRef.current = new AbortController();

        // Add user message
        const userMessage = addMessage(Role.USER, text, attachments);

        // Add placeholder assistant message
        const assistantMessage: Message = {
            id: uuidv4(),
            role: Role.MODEL,
            text: '',
            timestamp: Date.now(),
            isStreaming: true
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(true);
        options.onStreamStart?.();

        try {
            await streamFn(
                model,
                messages,
                text,
                attachments,
                systemInstruction,
                isInternetEnabled,
                (chunk) => appendToMessage(assistantMessage.id, chunk),
                (stats, citations) => {
                    updateMessage(assistantMessage.id, { isStreaming: false, usage: stats, citations });
                    setIsLoading(false);
                    options.onStreamEnd?.(stats);
                },
                () => shouldStopRef.current
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            updateMessage(assistantMessage.id, { isStreaming: false, isError: true, text: `Error: ${errorMessage}` });
            setIsLoading(false);
            options.onError?.(errorMessage);
        }
    }, [messages, addMessage, updateMessage, appendToMessage, options]);

    const loadSession = useCallback((session: ChatSession) => {
        setMessages(session.messages);
        setCurrentSessionId(session.id);
    }, []);

    const saveSession = useCallback((title?: string): ChatSession => {
        const session: ChatSession = {
            id: currentSessionId || uuidv4(),
            title: title || messages[0]?.text.slice(0, 50) || 'New Chat',
            messages,
            timestamp: Date.now()
        };
        const sessions = JSON.parse(localStorage.getItem('wili_sessions') || '[]');
        const existingIndex = sessions.findIndex((s: ChatSession) => s.id === session.id);
        if (existingIndex >= 0) {
            sessions[existingIndex] = session;
        } else {
            sessions.unshift(session);
        }
        localStorage.setItem('wili_sessions', JSON.stringify(sessions.slice(0, 100)));
        setCurrentSessionId(session.id);
        return session;
    }, [messages, currentSessionId]);

    return {
        messages,
        isLoading,
        currentSessionId,
        addMessage,
        updateMessage,
        appendToMessage,
        deleteMessage,
        clearMessages,
        sendMessage,
        stopGeneration,
        loadSession,
        saveSession
    };
}

export default useChat;
