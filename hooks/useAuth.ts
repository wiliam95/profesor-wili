// useAuth.ts - Authentication Hook
import { useState, useEffect, useCallback } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    plan: 'free' | 'pro' | 'team' | 'enterprise';
    createdAt: number;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('wili_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setState({ user, isAuthenticated: true, isLoading: false, error: null });
            } catch {
                setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
            }
        } else {
            setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setState(s => ({ ...s, isLoading: true, error: null }));
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            const user: User = {
                id: `user_${Date.now()}`,
                email,
                name: email.split('@')[0],
                plan: 'pro',
                createdAt: Date.now()
            };
            localStorage.setItem('wili_user', JSON.stringify(user));
            setState({ user, isAuthenticated: true, isLoading: false, error: null });
            return true;
        } catch (error) {
            setState(s => ({ ...s, isLoading: false, error: 'Login failed' }));
            return false;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('wili_user');
        setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }, []);

    const updateProfile = useCallback((updates: Partial<User>) => {
        if (state.user) {
            const updatedUser = { ...state.user, ...updates };
            localStorage.setItem('wili_user', JSON.stringify(updatedUser));
            setState(s => ({ ...s, user: updatedUser }));
        }
    }, [state.user]);

    return { ...state, login, logout, updateProfile };
}

export default useAuth;
