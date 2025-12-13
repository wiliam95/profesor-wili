import React, { useState, useEffect, useMemo } from 'react';
import { Menu, X, Plus, ChevronDown, MessageSquare, Settings, Trash2, Grid, ChevronRight } from 'lucide-react';
import { View } from '../types';
import { FEATURE_CATEGORIES } from '../constants';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: number;
}

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  onNewChat: () => void;
  onLoadChat?: (chatId: string) => void;
  onSelectFeature?: (featureId: string, featureLabel: string) => void;
}

const STORAGE_KEY = 'wili.chatSessions';

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onNewChat,
  onLoadChat,
  onSelectFeature
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState({
    today: false,
    yesterday: false,
    previous7: false,
    previous30: false,
    features: true
  });

  // Feature category expansion state
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setChatHistory([]);
          return;
        }

        const sessions = JSON.parse(raw);
        if (!Array.isArray(sessions) || sessions.length === 0) {
          setChatHistory([]);
          return;
        }

        const validHistory = sessions
          .filter((s: any) => s && s.id && s.messages && s.messages.length > 0)
          .map((s: any) => ({
            id: s.id,
            title: s.title || s.messages?.[0]?.text?.slice(0, 40) || 'New Chat',
            timestamp: s.timestamp || Date.now(),
          }))
          .sort((a: ChatHistory, b: ChatHistory) => b.timestamp - a.timestamp);

        setChatHistory(validHistory);
      } catch {
        setChatHistory([]);
      }
    };

    loadHistory();
    window.addEventListener('storage', loadHistory);
    window.addEventListener('chatSessionsUpdated', loadHistory);

    return () => {
      window.removeEventListener('storage', loadHistory);
      window.removeEventListener('chatSessionsUpdated', loadHistory);
    };
  }, []);

  const groupedChats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return {
      today: chatHistory.filter(c => new Date(c.timestamp) >= today),
      yesterday: chatHistory.filter(c => {
        const d = new Date(c.timestamp);
        return d >= yesterday && d < today;
      }),
      previous7: chatHistory.filter(c => {
        const d = new Date(c.timestamp);
        return d >= sevenDaysAgo && d < yesterday;
      }),
      previous30: chatHistory.filter(c => {
        const d = new Date(c.timestamp);
        return d >= thirtyDaysAgo && d < sevenDaysAgo;
      }),
    };
  }, [chatHistory]);

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategory(prev => prev === catId ? null : catId);
  };

  const handleAction = (action: () => void) => {
    action();
    if (window.innerWidth < 768) setMobileMenuOpen(false);
  };

  const handleChatClick = (chatId: string) => {
    setActiveChatId(chatId);
    onViewChange('chat');
    if (onLoadChat) onLoadChat(chatId);
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const sessions = JSON.parse(raw);
        const filtered = sessions.filter((s: any) => s.id !== chatId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        setChatHistory(prev => prev.filter(c => c.id !== chatId));
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const ChatItem: React.FC<{ chat: ChatHistory }> = ({ chat }) => {
    const isActive = activeChatId === chat.id;
    const isHovered = hoveredChatId === chat.id;

    return (
      <div
        onClick={() => handleAction(() => handleChatClick(chat.id))}
        onMouseEnter={() => setHoveredChatId(chat.id)}
        onMouseLeave={() => setHoveredChatId(null)}
        className={`flex items-center gap-2 h-10 px-3 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-[--bg-tertiary]' : 'hover:bg-[--bg-hover]'
          }`}
      >
        <MessageSquare size={14} className="text-[--text-muted] flex-shrink-0" />
        <span className="flex-1 text-sm text-[--text-primary] truncate">
          {chat.title}
        </span>
        {isHovered && (
          <button
            onClick={(e) => handleDeleteChat(chat.id, e)}
            className="p-1 rounded hover:bg-[--bg-tertiary] text-[--text-muted] hover:text-[--text-primary]"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    );
  };

  const HistorySection: React.FC<{
    title: string;
    chats: ChatHistory[];
    sectionKey: keyof typeof collapsedSections;
  }> = ({ title, chats, sectionKey }) => {
    if (chats.length === 0) return null;
    const isCollapsed = collapsedSections[sectionKey];

    return (
      <div className="mb-2">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[--text-muted] uppercase tracking-wider hover:text-[--text-secondary] transition-colors"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
          />
          <span>{title}</span>
        </button>
        {!isCollapsed && (
          <div className="px-2">
            {chats.map(chat => <ChatItem key={chat.id} chat={chat} />)}
          </div>
        )}
      </div>
    );
  };

  const MobileFeaturesMenu = () => {
    if (!onSelectFeature) return null;
    const isCollapsed = collapsedSections.features;

    return (
      <div className="mb-2 border-t border-[--border-subtle] pt-2 mt-2">
        <button
          onClick={() => toggleSection('features')}
          className="w-full flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[--text-muted] uppercase tracking-wider hover:text-[--text-secondary] transition-colors"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
          />
          <span>EXPLORE FEATURES</span>
        </button>
        {!isCollapsed && (
          <div className="px-2 space-y-1">
            {FEATURE_CATEGORIES.map(cat => (
              <div key={cat.id}>
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-[--bg-hover] text-[--text-primary] text-sm text-left transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </span>
                  <ChevronRight size={14} className={`transition-transform ${expandedCategory === cat.id ? 'rotate-90' : ''}`} />
                </button>

                {expandedCategory === cat.id && (
                  <div className="pl-4 pr-1 mt-1 space-y-0.5 border-l border-[--border-subtle] ml-4">
                    {cat.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleAction(() => onSelectFeature(item.id, item.label))}
                        className="w-full flex items-center gap-2 p-1.5 rounded text-xs text-[--text-secondary] hover:bg-[--bg-hover] hover:text-[--text-primary] text-left transition-colors"
                      >
                        <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[--bg-primary] text-[--text-primary] border-r border-[--border-primary]">
      <div className="h-14 px-4 flex items-center justify-between border-b border-[--border-subtle] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[--accent-primary] rounded-md flex items-center justify-center text-white text-base font-bold">
            W
          </div>
          <span className="text-lg font-semibold">WILI</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden p-1.5 rounded-md hover:bg-[--bg-hover] text-[--text-muted]"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-4 pt-4 flex-shrink-0">
        <button
          onClick={() => handleAction(onNewChat)}
          className="w-full h-12 flex items-center justify-center gap-2 bg-[--accent-primary] hover:bg-[--accent-hover] text-white rounded-xl font-bold shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
        <HistorySection title="TODAY" chats={groupedChats.today} sectionKey="today" />
        <HistorySection title="YESTERDAY" chats={groupedChats.yesterday} sectionKey="yesterday" />
        <HistorySection title="PREVIOUS 7 DAYS" chats={groupedChats.previous7} sectionKey="previous7" />
        <HistorySection title="PREVIOUS 30 DAYS" chats={groupedChats.previous30} sectionKey="previous30" />

        {/* Feature Explorer */}
        <MobileFeaturesMenu />
      </div>

      <div className="px-4 py-3 border-t border-[--border-subtle] flex items-center justify-between gap-2 flex-shrink-0">
        <button
          onClick={() => handleAction(() => onViewChange('settings'))}
          className="flex-1 flex items-center gap-3 p-2 rounded-md hover:bg-[--bg-hover] transition-colors min-h-[44px]"
        >
          <div className="w-8 h-8 bg-[--accent-primary] rounded-full flex items-center justify-center text-white text-sm font-semibold">
            W
          </div>
          <div className="flex flex-col items-start gap-0.5 max-w-[120px]">
            <span className="text-sm font-medium truncate w-full">User Profile</span>
            <span className="text-xs text-[--text-muted]">Free Plan</span>
          </div>
        </button>
        <button
          onClick={() => handleAction(() => onViewChange('settings'))}
          className="w-10 h-10 flex items-center justify-center rounded-md text-[--text-muted] hover:bg-[--bg-hover] hover:text-[--text-primary] transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:block w-[260px] h-full flex-shrink-0">
        <SidebarContent />
      </div>

      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2.5 bg-[--bg-tertiary] rounded-lg text-[--text-muted] border border-[--border-primary] shadow-lg hover:bg-[--bg-hover] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          <div
            className={`w-[280px] max-w-[85vw] h-full bg-[--bg-primary] shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
          >
            <SidebarContent />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}
    </>
  );
};