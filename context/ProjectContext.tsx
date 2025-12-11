// ProjectContext.tsx - Project Context Provider
import React, { createContext, useContext, ReactNode } from 'react';
import { useProjects } from '../hooks/useProjects';

type ProjectContextType = ReturnType<typeof useProjects>;

const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const projects = useProjects();
    return <ProjectContext.Provider value={projects}>{children}</ProjectContext.Provider>;
};

export const useProjectContext = () => {
    const context = useContext(ProjectContext);
    if (!context) throw new Error('useProjectContext must be used within ProjectProvider');
    return context;
};

export default ProjectContext;
