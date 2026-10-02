import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const verifySession = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            setUser(response.data);
            localStorage.setItem('currentUserId', response.data.id);
            localStorage.setItem('currentUserRole', response.data.role);
            localStorage.setItem('currentUserName', response.data.name);
        } catch (err) {
            setUser(null);
            localStorage.removeItem('currentUserId');
            localStorage.removeItem('currentUserRole');
            localStorage.removeItem('currentUserName');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifySession();

        const handlePageShow = (event) => {
            if (event.persisted) {
                verifySession();
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('currentUserId', userData.id);
        localStorage.setItem('currentUserRole', userData.role);
        localStorage.setItem('currentUserName', userData.name);
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (err) {
            console.error('Backend logout failed:', err);
        } finally {
            setUser(null);
            localStorage.clear();
            window.location.replace('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
