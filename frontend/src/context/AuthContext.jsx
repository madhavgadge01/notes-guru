import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setSessionInvalidatedCallback } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('notesguru_student_token'));
  const [loading, setLoading] = useState(true);
  const [sessionAlertMessage, setSessionAlertMessage] = useState(null);

  // Initialize session invalidation callback
  useEffect(() => {
    setSessionInvalidatedCallback((msg) => {
      setUser(null);
      setToken(null);
      setSessionAlertMessage(msg || 'Your account was logged in on another device. Please log in again.');
    });
  }, []);

  // Fetch current user if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data?.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('notesguru_student_token');
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Login
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const newToken = res.data.token;
      const newUser = res.data.user;
      localStorage.setItem('notesguru_student_token', newToken);
      setToken(newToken);
      setUser(newUser);
      setSessionAlertMessage(null);
      return { success: true, user: newUser };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  // Register
  const register = async (name, email, password, phone) => {
    const res = await api.post('/auth/register', { name, email, password, phone, role: 'student' });
    if (res.data?.success) {
      const newToken = res.data.token;
      const newUser = res.data.user;
      localStorage.setItem('notesguru_student_token', newToken);
      setToken(newToken);
      setUser(newUser);
      setSessionAlertMessage(null);
      return { success: true, user: newUser };
    }
    return { success: false, message: res.data?.message || 'Registration failed' };
  };

  // Google Login / Registration
  const loginWithGoogle = async (credential) => {
    const res = await api.post('/auth/google', { credential });
    if (res.data?.success) {
      const newToken = res.data.token;
      const newUser = res.data.user;
      localStorage.setItem('notesguru_student_token', newToken);
      setToken(newToken);
      setUser(newUser);
      setSessionAlertMessage(null);
      return { success: true, user: newUser };
    }
    return { success: false, message: res.data?.message || 'Google sign-in failed' };
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('notesguru_student_token');
      setToken(null);
      setUser(null);
    }
  };

  // Save Academic Preferences (College, Course, Semester)
  const savePreferences = async (collegeId, courseId, semesterId) => {
    try {
      const res = await api.put('/auth/preferences', { collegeId, courseId, semesterId });
      if (res.data?.success) {
        setUser((prev) => ({
          ...prev,
          college: res.data.preferences.college,
          course: res.data.preferences.course,
          semester: res.data.preferences.semester,
        }));
        return true;
      }
    } catch (err) {
      console.error('Failed to save academic preferences:', err);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        savePreferences,
        sessionAlertMessage,
        clearSessionAlert: () => setSessionAlertMessage(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
