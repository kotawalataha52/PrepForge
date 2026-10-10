import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Clear legacy localStorage token if left from previous sessions
  if (typeof window !== 'undefined' && localStorage.getItem('token')) {
    localStorage.removeItem('token');
  }

  // Token is stored in sessionStorage so closing the tab/browser requires re-login
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('token') || null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If there's a token in this tab session, load the user profile
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        } catch (err) {
          console.error('Failed to load user', err);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register User
  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      sessionStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  // Login User
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      sessionStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Logout User
  function logout() {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        register,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
