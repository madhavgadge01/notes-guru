import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('notesguru_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (
          res.data?.success &&
          res.data.user?.role === 'admin' &&
          res.data.user?.email?.toLowerCase() === 'rozar@notesguru.in'
        ) {
          setAdmin(res.data.user);
        } else {
          // Reject ordinary students or unauthorized accounts from accessing admin portal
          localStorage.removeItem('notesguru_admin_token');
          setToken(null);
          setAdmin(null);
        }
      } catch {
        localStorage.removeItem('notesguru_admin_token');
        setToken(null);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [token]);

  const login = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail !== 'rozar@notesguru.in') {
      throw new Error('Access denied. Only authorized administrator rozar@notesguru.in is permitted to log in.');
    }

    const res = await api.post('/auth/login', { email: trimmedEmail, password });
    if (res.data?.success) {
      const user = res.data.user;
      if (user.role !== 'admin' || user.email?.toLowerCase() !== 'rozar@notesguru.in') {
        throw new Error('Access denied. Administrator privileges required.');
      }
      localStorage.setItem('notesguru_admin_token', res.data.token);
      setToken(res.data.token);
      setAdmin(user);
      return { success: true };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('notesguru_admin_token');
      setToken(null);
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!admin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
