import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';

type AuthContextType = {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    user: any | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const authenticated = await authService.isAuthenticated();
            if (authenticated) {
                const userData = await authService.getUser();
                setUser(userData);
            }
            setIsAuthenticated(authenticated);
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const success = await authService.login(email, password);
        if (success) {
            setIsAuthenticated(true);
            setUser(await authService.getUser());
        }
        return success;
    };

    const logout = async () => {
        await authService.logout();
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, isLoading, login, logout, user }}
>
    {children}
    </AuthContext.Provider>
);
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};