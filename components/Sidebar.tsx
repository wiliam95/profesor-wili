import React, { useState, useEffect, useMemo } from 'react';
import {
  Menu, X, Plus, ChevronDown, MessageSquare,
  FolderOpen, Settings, Star, User, Trash2, Edit3, MoreHorizontal
} from 'lucide-react';
import { View } from '../types';
import { FEATURE_CATEGORIES } from '../constants';


interface ChatHistory {
  id: string;
  title: string;
  timestamp: number;
  isPinned?: boolean;
}

interface Project {
  id: string;
  name: string;
  chatCount: number;
}

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  onNewChat: () => void;
  onSelectFeature?: (featureId: string, featureLabel: string) => void;
  onLoadChat?: (chatId: string) => void;
}

const STORAGE_KEY = 'wili.chatSessions';

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onNewChat,
  onSelectFeature,
  onLoadChat
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  // Feature menu state - Expand all by default
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    FEATURE_CATEGORIES.forEach(cat => defaults[cat.id] = true);
    return defaults;
  });

  const toggleFeatureCategory = (catId: string) => {
    setExpandedFeatures(prev => ({ ...prev, [catId]: !prev[catId] }));
  };


  const [collapsedSections, setCollapsedSections] = useState({
    today: false,
    yesterday: false,
    previous7: false,
    previous30: false,
  });

  // Load chat history from localStorage
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
            isPinned: s.isPinned,
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

  // Group chats by date
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

  const hasHistory = chatHistory.length > 0;

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const handleAction = (action: () => void) => {
    action();
    if (window.innerWidth < 768) setMobileMenuOpen(false);
  };

  const handleChatClick = (chatId: string) => {
    setActiveChatId(chatId);
    onViewChange('chat');
    onLoadChat?.(chatId);
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
    } catch { }
  };

  const handleCreateProject = () => {
    const newProject: Project = {
      id: `project_${Date.now()}`,
      name: `Project ${projects.length + 1}`,
      chatCount: 0,
    };
    setProjects(prev => [...prev, newProject]);
  };

  const ChatItem = ({ chat }: { chat: ChatHistory }) => {
    const isActive = activeChatId === chat.id;
    const isHovered = hoveredChatId === chat.id;

    return (
      <div
        onClick={() => handleAction(() => handleChatClick(chat.id))}
        onMouseEnter={() => setHoveredChatId(chat.id)}
        onMouseLeave={() => setHoveredChatId(null)}
        className={`chat-item flex items-center gap-2 h-10 px-3 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-[--bg-tertiary]' : 'hover:bg-[--bg-hover]'
          }`}
      >
        <MessageSquare size={14} className="text-[--text-muted] flex-shrink-0" />
        <span className="chat-item-title flex-1 text-sm text-[--text-primary] truncate">
          {chat.title}
        </span>

        {/* Show actions on hover */}
        {isHovered && (
          <div className="chat-item-actions flex gap-1">
            <button
              onClick={(e) => handleDeleteChat(chat.id, e)}
              className="p-1 rounded hover:bg-[--bg-tertiary] text-[--text-muted] hover:text-[--text-primary]"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {/* Show pin if pinned */}
        {chat.isPinned && !isHovered && (
          <Star size={12} className="text-[--accent-primary] flex-shrink-0" fill="currentColor" />
        )}
      </div>
    );
  };

  const HistorySection = ({
    title,
    chats,
    sectionKey
  }: {
    title: string;
    chats: ChatHistory[];
    sectionKey: keyof typeof collapsedSections;
  }) => {
    if (chats.length === 0) return null;

    const isCollapsed = collapsedSections[sectionKey];

    return (
      <div className="history-section mb-2">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="section-header w-full flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[--text-muted] uppercase tracking-wider hover:text-[--text-secondary] transition-colors"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
          />
          <span>{title}</span>
        </button>

        {!isCollapsed && (
          <div className="chat-list px-2">
            {chats.map(chat => <ChatItem key={chat.id} chat={chat} />)}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="sidebar flex flex-col h-full bg-[--bg-primary] text-[--text-primary] border-r border-[--border-primary]">

      {/* ===== HEADER - Logo ===== */}
      <div className="sidebar-header h-14 px-4 flex items-center justify-between border-b border-[--border-subtle]">
        <div className="logo flex items-center gap-2">
          <div className="logo-icon w-7 h-7 bg-[--accent-primary] rounded-md flex items-center justify-center text-white text-base font-bold">
            W
          </div>
          <span className="logo-text text-lg font-semibold text-[--text-primary]">WILI</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden p-1.5 rounded-md hover:bg-[--bg-hover] text-[--text-muted]"
        >
          <X size={18} />
        </button>
      </div>

      {/* ===== NEW CHAT BUTTON ===== */}
      <div className="px-4 pt-4">
        <button
          onClick={() => handleAction(onNewChat)}
          className="new-chat-btn w-full h-12 flex items-center justify-center gap-2 bg-[--accent-primary] hover:bg-[--accent-hover] text-white rounded-xl font-bold shadow-sm transition-all active:scale-[0.98] mb-2"
        >
          <Plus size={20} className="stroke-[3]" />
          <span>CHAT BARU</span>
        </button>
      </div>

      {/* ===== HISTORY SECTIONS (Conditional) ===== */}
      <div className="history-sections flex-1 overflow-y-auto py-4">
        {hasHistory && (
          <>
            <HistorySection title="HARI INI" chats={groupedChats.today} sectionKey="today" />
            <HistorySection title="KEMARIN" chats={groupedChats.yesterday} sectionKey="yesterday" />
            <HistorySection title="7 HARI TERAKHIR" chats={groupedChats.previous7} sectionKey="previous7" />
            <HistorySection title="30 HARI TERAKHIR" chats={groupedChats.previous30} sectionKey="previous30" />
          </>
        )}
        {/* Empty = just empty space, no placeholder */}
      </div>

      {/* ===== PROJECTS SECTION (Always Visible) ===== */}
      <div className="projects-section px-4 py-3 border-t border-[--border-subtle]">
        <div className="section-header-fixed flex items-center gap-1.5 py-2 text-xs font-semibold text-[--text-muted] uppercase tracking-wider">
          <FolderOpen size={14} />
          <span>PROYEK</span>
        </div>

        {/* Project Items */}
        {projects.length > 0 && (
          <div className="projects-list mb-2">
            {projects.map(project => (
              <div
                key={project.id}
                className="project-item flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[--bg-hover] cursor-pointer transition-colors"
              >
                <FolderOpen size={16} className="text-[--accent-primary] flex-shrink-0" />
                <div className="project-info flex-1 min-w-0">
                  <div className="project-name text-sm text-[--text-primary] truncate">{project.name}</div>
                  <div className="project-meta text-xs text-[--text-muted]">{project.chatCount} chats</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Project Button */}
        <button
          onClick={handleCreateProject}
          className="create-project-btn w-full px-3 py-2 flex items-center gap-2 border border-[--border-primary] rounded-md text-sm text-[--text-muted] hover:bg-[--bg-hover] hover:text-[--text-primary] hover:border-[--bg-hover] transition-colors"
        >
          <Plus size={16} />
          <span>Buat Proyek</span>
        </button>

        <button
          onClick={() => handleAction(() => onViewChange('artifacts'))}
          className="create-project-btn w-full mt-2 px-3 py-2 flex items-center gap-2 border border-[--border-primary] rounded-md text-sm text-[--text-muted] hover:bg-[--bg-hover] hover:text-[--text-primary] hover:border-[--bg-hover] transition-colors"
        >
          <FolderOpen size={16} />
          <span>Artifacts Space</span>
        </button>
      </div>

      {/* ===== FEATURES SECTION (Dashboard) ===== */}
      <div className="features-section px-4 py-3 border-t border-[--border-subtle] flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="section-header-fixed flex items-center gap-1.5 py-2 text-xs font-semibold text-[--text-muted] uppercase tracking-wider mb-2">
          <span>🎯 DASHBOARD FITUR</span>
        </div>

        <div className="space-y-1">
          {FEATURE_CATEGORIES.map(cat => {
            const isExpanded = expandedFeatures[cat.id];
            return (
              <div key={cat.id} className="feature-category">
                <button
                  onClick={() => toggleFeatureCategory(cat.id)}
                  className="w-full flex items-center justify-between px-2 py-2.5 text-sm text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover] active:bg-[--bg-hover] rounded-md transition-colors touch-manipulation"
                >
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="font-medium">{cat.label}</span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="pl-7 mt-1 space-y-0.5 border-l border-[--border-subtle] ml-4">
                    {cat.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleAction(() => onSelectFeature?.(item.id, item.label))}
                        className="w-full text-left px-2 py-2 text-xs text-[--text-muted] hover:text-[--accent-primary] hover:bg-[--bg-hover] active:bg-[--bg-hover] rounded-md transition-colors truncate touch-manipulation min-h-[44px] flex items-center"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>


      {/* ===== FOOTER (Always Visible) ===== */}
      <div className="sidebar-footer px-4 py-3 border-t border-[--border-subtle] flex items-center justify-between gap-2">
        <button
          onClick={() => handleAction(() => onViewChange('settings'))}
          className="user-profile flex-1 flex items-center gap-3 p-2 rounded-md hover:bg-[--bg-hover] transition-colors"
        >
          <div className="user-avatar w-8 h-8 bg-[--accent-primary] rounded-full flex items-center justify-center text-white text-sm font-semibold">
            W
          </div>
          {/* Plan text removed */}
        </button>

        <button
          onClick={() => handleAction(() => onViewChange('settings'))}
          className="settings-btn w-9 h-9 flex items-center justify-center rounded-md text-[--text-muted] hover:bg-[--bg-hover] hover:text-[--text-primary] transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - 260px */}
      <div className="hidden md:block w-[260px] h-full flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2.5 bg-[--bg-tertiary] rounded-lg text-[--text-muted] border border-[--border-primary] shadow-lg hover:bg-[--bg-hover] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Drawer */}
      {/* Mobile Sidebar with CSS Transition */}
      <div className={`md:hidden fixed inset-0 z-[100] flex pointer-events-none ${mobileMenuOpen ? 'pointer-events-auto' : ''}`}>
        <div
          className={`w-[280px] max-w-[85vw] h-full bg-[--bg-primary] shadow-2xl transition-transform duration-300 ease-in-out overflow-hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <SidebarContent />
        </div>
        <div
          className={`flex-1 bg-black/50 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        />
      </div>
    </>
  );
};
