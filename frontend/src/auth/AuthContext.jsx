import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('pc_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('pc_token'));
  const [user, setUser] = useState(readStoredUser);

  const persist = (nextToken, nextUser) => {
    localStorage.setItem('pc_token', nextToken);
    const { password, ...safeUser } = nextUser || {};
    localStorage.setItem('pc_user', JSON.stringify(safeUser));
    setToken(nextToken);
    setUser(safeUser);
  };

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    persist(data.token, data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    persist(data.token, data.user);
    return data.user;
  }, []);

  const updateUser = useCallback((nextUser) => {
    const { password, ...safeUser } = nextUser || {};
    localStorage.setItem('pc_user', JSON.stringify(safeUser));
    setUser(safeUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pc_token');
    localStorage.removeItem('pc_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener('pc:unauthorized', logout);
    return () => window.removeEventListener('pc:unauthorized', logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
