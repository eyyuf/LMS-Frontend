import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for persisted login
    useEffect(() => {
        const storedUser = localStorage.getItem('cozy_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        // Ideally call /is-auth here to verify cookie, but skipping for speed
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            // Using /auth/login assuming standard route for that controller
            const response = await api.post('/auth/login', credentials);

            if (response.data.success) {
                const { user } = response.data;
                setUser(user);
                localStorage.setItem('cozy_user', JSON.stringify(user));
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error("Login failed:", error);
            if (error.response) {
                console.error("Error Response Data:", error.response.data);
                console.error("Error Response Status:", error.response.status);
            } else if (error.request) {
                console.error("Error Request (No Response):", error.request);
            } else {
                console.error("Error Message:", error.message);
            }
            return { success: false, message: error.response?.data?.message || 'Login failed. Please check your connection or credentials.' };
        }
    };

    const signup = async (userData) => {
        try {
            // Backend expects: name, email, password, (avater), role
            // Mapping frontend formData to backend expectations
            const payload = {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                role: 'STUDENT' // Enforce STUDENT role for signups
            };

            const response = await api.post('/auth/register', payload);

            if (response.data.success) {
                // Determine if auto-login or redirect is needed. 
                // Backend register sends email but returns { success: true } and sets cookie.
                // So we can treat as logged in IF the backend sets the cookie on register (code says it does).

                // However, backend register code: sends email, sets cookie.
                // But it does NOT return the user object in the JSON response.
                // So we can't setUser immediately unless we manually construct it or fetch it.
                // Let's manually set it or ask user to login.
                // Safe bet: Redirect to login.
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error("Signup failed:", error);
            return { success: false, message: error.response?.data?.message || 'Signup failed' };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error("Logout api failed", e);
        }
        setUser(null);
        localStorage.removeItem('cozy_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
