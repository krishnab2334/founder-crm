import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// Export the context so it can be imported by other components
export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getCurrentUser();
        // Backend returns: { success: true, data: { user, workspace } }
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Backend returns: { success: true, data: { token, user, workspace } }
      const { token, user } = response.data.data;
      
      console.log('Token received:', token);
      console.log('User received:', user);
      
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      console.error('Login error:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user, // Add this
    login,
    logout,
    checkAuth
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};