import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [needsVerification, setNeedsVerification] = useState(false);

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
                        if (!userDataRes.data.User.IsAccVerified) {
                            setNeedsVerification(true);
                        }
                    }
                } else if (response.data.message === "Please verify your account") {
                    setNeedsVerification(true);
                } else {
                    const storedUser = localStorage.getItem('cozy_user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                if (error.response?.data?.message === "Please verify your account") {
                    setNeedsVerification(true);
                }
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

                if (!userData.IsAccVerified) {
                    setNeedsVerification(true);
                }

                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error("Login failed:", error);
            if (error.response?.data?.message === "Please verify your account") {
                setNeedsVerification(true);
                // We might still want to return success:false to stop login flow, but the UI should redirect
                return { success: false, message: "Please verify your account" };
            }
            return { success: false, message: error.response?.data?.message || 'Login failed. Please check your connection or credentials.' };
        }
    };



    const refreshUser = async () => {
        try {
            const response = await api.post('/auth/get-user-data');
            if (response.data.success) {
                const userData = response.data.User;
                setUser(userData);
                localStorage.setItem('cozy_user', JSON.stringify(userData));
                return { success: true, user: userData };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch user data' };
        }
    };

    // Alias for backward compatibility
    const getUserData = refreshUser;

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
                // Fetch user data to populate state immediately
                const userResult = await refreshUser();
                if (userResult.success && userResult.user) {
                    if (!userResult.user.IsAccVerified) {
                        setNeedsVerification(true);
                    }
                }
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
        // Optimistic update: Clear local state immediately for snappy UI
        setUser(null);
        localStorage.removeItem('cozy_user');

        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error("Logout api failed", e);
        }
    };

    const sendVerificationOTP = async (email) => {
        try {
            // If email is provided, send it in body. Otherwise backend relies on cookie/userId
            const payload = email ? { email } : {};
            const response = await api.post('/auth/send-verification-otp', payload);
            return { success: response.data.success, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to send OTP' };
        }
    };

    const verifyOTP = async (userId, otp, email) => {
        try {
            const payload = { otp };
            if (email) payload.email = email;

            const response = await api.post('/auth/verify-otp', payload);

            // If verification successful and we have a user in context matching (or just general update)
            if (response.data.success) {
                // If we were verifying the current user context
                if (user?._id) {
                    setUser(prev => ({ ...prev, IsAccVerified: true }));
                    setNeedsVerification(false);
                }

                // Always try to refresh user data if possible, in case we just got a token or cookie updated
                if (!user) {
                    await refreshUser();
                }
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
            refreshUser,
            getUserData,
            refreshUser,
            updateProfile,
            needsVerification
        }}>
            {children}
        </AuthContext.Provider>
    );
};
