import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { getToken, setToken, clearTokens } from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = getToken('velora_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken('velora_access_token');
      if (token) {
        try {
          const res = await authApi.getProfile();
          if (res.data && res.data.data) {
            setUser(res.data.data);
            const isPersistent = !!localStorage.getItem('velora_access_token');
            setToken('velora_user', JSON.stringify(res.data.data), isPersistent);
          }
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchProfile();

    const handleLogoutEvent = () => {
      setUser(null);
      toast.info('Session expired. Please log in again.');
    };

    window.addEventListener('velora_auth_logout', handleLogoutEvent);
    return () => window.removeEventListener('velora_auth_logout', handleLogoutEvent);
  }, []);

  const login = async (email, password, rememberMe = true) => {
    try {
      const res = await authApi.login({ email, password });
      const { user: userData, tokens } = res.data.data;
      setToken('velora_access_token', tokens.access, rememberMe);
      setToken('velora_refresh_token', tokens.refresh, rememberMe);
      setToken('velora_user', JSON.stringify(userData), rememberMe);
      setUser(userData);
      toast.success('Login successful!');
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      toast.error(msg);
      throw err;
    }
  };

  const register = async (data) => {
    try {
      const res = await authApi.register(data);
      const { user: userData, tokens } = res.data.data;
      setToken('velora_access_token', tokens.access, true);
      setToken('velora_refresh_token', tokens.refresh, true);
      setToken('velora_user', JSON.stringify(userData), true);
      setUser(userData);
      toast.success('Account created successfully!');
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw err;
    }
  };

  const logout = async () => {
    const refresh = getToken('velora_refresh_token');
    if (refresh) {
      try { await authApi.logout(refresh); } catch {}
    }
    clearTokens();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data) => {
    try {
      const res = await authApi.updateProfile(data);
      setUser(res.data.data);
      const isPersistent = !!localStorage.getItem('velora_access_token');
      setToken('velora_user', JSON.stringify(res.data.data), isPersistent);
      toast.success('Profile updated successfully!');
      return res.data.data;
    } catch (err) {
      toast.error('Failed to update profile');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN',
    isStaff: user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'STAFF',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
