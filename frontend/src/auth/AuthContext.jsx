import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth.js';
import { followPrimersId, markPrimersLinked } from '../lib/primersFollow.js';
import { startPrimersSignIn } from '../lib/primersId.js';

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
    markPrimersLinked(false);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    persist(data.token, data.user);
    markPrimersLinked(false);
    return data.user;
  }, []);

  const signInWithToken = useCallback((nextToken, nextUser) => {
    persist(nextToken, nextUser);
  }, []);

  const updateUser = useCallback((nextUser) => {
    const { password, ...safeUser } = nextUser || {};
    localStorage.setItem('pc_user', JSON.stringify(safeUser));
    setUser(safeUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pc_token');
    localStorage.removeItem('pc_user');
    markPrimersLinked(false);
    setToken(null);
    setUser(null);
  }, []);

  // Follow the Primers bar: an account switch there signs you in here as that account; signing out of
  // Primers ID signs you out here if you came in with Primers ID.
  useEffect(() => followPrimersId({
    isSignedIn: () => !!localStorage.getItem('pc_token'),
    signIn: () => { startPrimersSignIn('primeconnect', window.location.pathname + window.location.search).catch(() => {}); },
    signOut: () => { logout(); window.location.assign('/login'); },
  }), [logout]);

  useEffect(() => {
    window.addEventListener('pc:unauthorized', logout);
    return () => window.removeEventListener('pc:unauthorized', logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, updateUser, signInWithToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
