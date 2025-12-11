import React, { ReactNode, useState, useEffect } from 'react';
import { Search, Sun, Moon, User, ChevronDown, Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  artifactsPanel?: ReactNode;
  onQuickAction?: (actionId: string) => void;
  onToolToggle?: (toolId: string) => void;
  onRecentFileOpen?: (fileId: string) => void;
  onPopularCommandSelect?: (commandId: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  sidebar,
  artifactsPanel,
  onQuickAction,
  onToolToggle,
  onRecentFileOpen,
  onPopularCommandSelect,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('claude.theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('claude.theme', newTheme);
  };

  return (
    <div className="app-layout flex h-screen w-screen overflow-hidden bg-[--bg-primary]">

      {/* Sidebar - 260px */}
      {sidebar}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="h-12 flex items-center justify-between px-4 border-b border-[--border-subtle] bg-[--bg-primary]">
          <div className="flex items-center gap-2">
            {/* Quick Actions Removed */}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted]">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
        {children}
      </div>

      {/* Artifacts Panel - 400px (optional) */}
      {artifactsPanel}
    </div>
  );
};
