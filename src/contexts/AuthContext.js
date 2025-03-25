// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null); // Add token state
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');

            if (storedUser && storedToken) {
                try {
                    const userData = JSON.parse(storedUser);
                    await axios.get('http://localhost:5000/api/validate-token', {
                        headers: { Authorization: `Bearer ${storedToken}` },
                    });
                    setUser(userData);
                    setToken(storedToken); // Set token state
                } catch (error) {
                    console.error('AuthContext: Token validation failed:', error);
                    setUser(null);
                    setToken(null); // Clear token state
                    try {
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                    } catch (localStorageError) {
                        console.error("AuthContext: Error removing local storage items", localStorageError);
                    }
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        setToken(token); // Set token state
        try {
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);
        } catch (localStorageError) {
            console.error("AuthContext: Error setting local storage items", localStorageError);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null); // Clear token state
        try {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } catch (localStorageError) {
            console.error("AuthContext: Error removing local storage items", localStorageError);
        }
        navigate('/login');
    };

    const isAdmin = () => user && user.type === 1;

    const isLoggedIn = () => !!user;

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, isLoggedIn, loading, token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);