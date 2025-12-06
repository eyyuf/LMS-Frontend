import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.post('/auth/is-auth');
                if (response.data.success && user?._id) {
                    // Fetch full user data - backend auth middleware sets req.body.userId from token cookie
                    const userDataRes = await api.post('/auth/get-user-data');
                    if (userDataRes.data.success) {
                        setUser(userDataRes.data.User);
                    }
                } else {
                    const storedUser = localStorage.getItem('cozy_user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                const storedUser = localStorage.getItem('cozy_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);

            if (response.data.success) {
                const { user: userData } = response.data;
                setUser(userData);
                localStorage.setItem('cozy_user', JSON.stringify(userData));
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error("Login failed:", error);
            return { success: false, message: error.response?.data?.message || 'Login failed. Please check your connection or credentials.' };
        }
    };

    const signup = async (userData) => {
        try {
            const payload = {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                role: 'STUDENT'
            };

            const response = await api.post('/auth/register', payload);

            if (response.data.success) {
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

    const sendVerificationOTP = async (userId) => {
        try {
            // Backend auth middleware sets req.body.userId from token cookie
            const response = await api.post('/auth/send-verification-otp');
            return { success: response.data.success, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to send OTP' };
        }
    };

    const verifyOTP = async (userId, otp) => {
        try {
            // Backend auth middleware sets req.body.userId from token cookie
            const response = await api.post('/auth/verify-otp', { otp });
            if (response.data.success && user?._id === userId) {
                setUser(prev => ({ ...prev, IsAccVerified: true }));
            }
            return { success: response.data.success, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Verification failed' };
        }
    };

    const sendResetPasswordOTP = async (email) => {
        try {
            const response = await api.post('/auth/send-reset-password', { email });
            return { success: response.data.success, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to send reset OTP' };
        }
    };

    const resetPassword = async (email, otp, newPassword) => {
        try {
            const response = await api.post('/auth/reset-password', { email, otp, newPassword });
            return { success: response.data.success, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Password reset failed' };
        }
    };

    const getUserData = async (userId) => {
        try {
            // Backend auth middleware sets req.body.userId from token cookie
            const response = await api.post('/auth/get-user-data');
            if (response.data.success) {
                setUser(response.data.User);
                return { success: true, user: response.data.User };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch user data' };
        }
    };

    const updateProfile = async (userId, name, avater) => {
        try {
            // Backend auth middleware sets req.body.userId from token cookie
            const response = await api.post('/auth/updateProfile', { name, avater });
            if (response.data.success && user?._id === userId) {
                setUser(prev => ({ ...prev, name, avater }));
            }
            return { success: response.data.success };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Profile update failed' };
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            signup, 
            logout, 
            loading,
            sendVerificationOTP,
            verifyOTP,
            sendResetPasswordOTP,
            resetPassword,
            getUserData,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};
