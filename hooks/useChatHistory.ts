import { useState, useEffect } from 'react';
import { ChatSession, Message } from '../types';

export const useChatHistory = (messages: Message[], currentChatId: string) => {
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

    // 1. Load chat sessions on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('wili.chatSessions');
            if (saved) {
                setChatSessions(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Failed to load chat sessions:', error);
        }
    }, []);

    // 2. Auto-save current chat
    useEffect(() => {
        if (messages.length > 0 && currentChatId) {
            const updateSession = () => {
                setChatSessions(prev => {
                    const updated = prev.map(session =>
                        session.id === currentChatId
                            ? { ...session, messages, timestamp: Date.now() }
                            : session
                    );

                    // If session doesn't exist, create it
                    if (!updated.find(s => s.id === currentChatId)) {
                        const title = messages[0]?.text.substring(0, 50) || 'New Chat';
                        updated.push({
                            id: currentChatId,
                            title,
                            messages,
                            timestamp: Date.now()
                        });
                    }

                    // Save to localStorage
                    try {
                        localStorage.setItem('wili.chatSessions', JSON.stringify(updated));
                    } catch (error) {
                        console.error('Failed to save chat sessions:', error);
                    }

                    return updated;
                });
            };

            // Debounce save
            const timeout = setTimeout(updateSession, 1000);
            return () => clearTimeout(timeout);
        }
    }, [messages, currentChatId]);

    // 3. Sync chatSessions -> wili.chatHistory (for simple list access)
    useEffect(() => {
        try {
            const mapped = (chatSessions || []).map((s: any) => ({
                id: s.id,
                title: s.title || (s.messages?.find((m: any) => m.role === 'user')?.text?.slice(0, 50) || 'Chat'),
                preview: String((s.messages || []).find((m: any) => m.role === 'user')?.text || (s.messages || [])[0]?.text || '')
                    .slice(0, 80),
                timestamp: s.timestamp || Date.now(),
                isPinned: !!s.isPinned,
                isArchived: !!s.isArchived,
                folderId: s.folderId,
                tag: s.tag
            }));
            localStorage.setItem('wili.chatHistory', JSON.stringify(mapped));
        } catch { }
    }, [chatSessions]);

    // Helper to manually add a session (e.g. shared chat)
    const addSession = (session: ChatSession) => {
        setChatSessions(prev => {
            const updated = [...prev, session];
            localStorage.setItem('wili.chatSessions', JSON.stringify(updated));
            return updated;
        });
    };

    return { chatSessions, setChatSessions, addSession };
};
