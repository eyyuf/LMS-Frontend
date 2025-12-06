import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Check for persisted login
    useEffect(() => {
        const storedUser = localStorage.getItem('cozy_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData) => {
        const mockUser = {
            name: "Faith Walker",
            email: userData.email,
            avatar: "https://i.pravatar.cc/150?u=faith"
        };
        setUser(mockUser);
        localStorage.setItem('cozy_user', JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('cozy_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
