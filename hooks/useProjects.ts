// useProjects.ts - Projects Management Hook
import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Project {
    id: string;
    name: string;
    description?: string;
    chatCount: number;
    lastActive: number;
    isPinned?: boolean;
    color?: string;
    systemInstruction?: string;
    createdAt: number;
}

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>(() => {
        const stored = localStorage.getItem('wili_projects');
        return stored ? JSON.parse(stored) : [];
    });
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem('wili_projects', JSON.stringify(projects));
    }, [projects]);

    const activeProject = projects.find(p => p.id === activeProjectId) || null;

    const createProject = useCallback((name: string, description?: string) => {
        const project: Project = {
            id: uuidv4(),
            name,
            description,
            chatCount: 0,
            lastActive: Date.now(),
            createdAt: Date.now()
        };
        setProjects(prev => [project, ...prev]);
        return project;
    }, []);

    const updateProject = useCallback((id: string, updates: Partial<Project>) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, lastActive: Date.now() } : p));
    }, []);

    const deleteProject = useCallback((id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (activeProjectId === id) setActiveProjectId(null);
    }, [activeProjectId]);

    const pinProject = useCallback((id: string) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
    }, []);

    const selectProject = useCallback((id: string) => {
        setActiveProjectId(id);
        updateProject(id, { lastActive: Date.now() });
    }, [updateProject]);

    const incrementChatCount = useCallback((id: string) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, chatCount: p.chatCount + 1, lastActive: Date.now() } : p));
    }, []);

    return {
        projects,
        activeProject,
        activeProjectId,
        createProject,
        updateProject,
        deleteProject,
        pinProject,
        selectProject,
        incrementChatCount
    };
}

export default useProjects;
