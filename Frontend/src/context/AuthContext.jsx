import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { setAccessToken, getAccessToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Helper to decode JWT client side
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      if (response.data?.success) {
        const { accessToken: token } = response.data.data;
        setAccessToken(token);
        
        const decoded = decodeToken(token);
        if (decoded) {
          const userData = {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email,
            name: decoded.name || decoded.email.split('@')[0]
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          return userData;
        }
      }
    } catch (error) {
      console.log('No active session / refresh token expired');
      localStorage.removeItem('user');
      setUser(null);
    }
    return null;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await fetchProfile();
      setLoading(false);
    };

    initializeAuth();

    const handleAuthExpired = () => {
      setUser(null);
      setAccessToken('');
      localStorage.removeItem('user');
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { tokens, user: userData } = response.data.data;
      const token = tokens.accessToken;
      setAccessToken(token);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      setUser(null);
      setAccessToken('');
      localStorage.removeItem('user');
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role, phone) => {
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password, role, phone });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken('');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-logout'));
  };

  const verifyEmail = async (token) => {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Email verification failed.'
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset request failed.'
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed.'
      };
    }
  };

  // Helper roles getters
  const isAdmin = user?.role === 'admin';
  const isProjectManager = user?.role === 'project_manager';
  const isSiteEngineer = user?.role === 'site_engineer';
  const isContractor = user?.role === 'contractor';
  const isSupplier = user?.role === 'supplier';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        verifyEmail,
        forgotPassword,
        resetPassword,
        isAdmin,
        isProjectManager,
        isSiteEngineer,
        isContractor,
        isSupplier
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
