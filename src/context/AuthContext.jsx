import { createContext, useState, useContext } from 'react';
import { setAuthToken } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        setAuthToken(authToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setAuthToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
