import React, { ReactNode, useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  onQuickAction?: (actionId: string) => void;
  onToolToggle?: (toolId: string) => void;
  onRecentFileOpen?: (fileId: string) => void;
  onPopularCommandSelect?: (commandId: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  sidebar,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

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
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[--bg-primary]">
      {sidebar}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="h-12 flex items-center justify-end px-4 border-b border-[--border-subtle] bg-[--bg-primary]">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted] transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};