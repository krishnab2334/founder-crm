import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.data.user);
      setWorkspace(response.data.data.workspace);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { user, workspace, token } = response.data.data;
    
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    setWorkspace(workspace);
    
    return response.data;
  };

  const register = async (name, email, password, workspaceName) => {
    const response = await axios.post('/api/auth/register', {
      name,
      email,
      password,
      workspaceName
    });
    
    const { user, workspace, token } = response.data.data;
    
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    setWorkspace(workspace);
    
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setWorkspace(null);
  };

  const value = {
    user,
    workspace,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isFounder: user?.role === 'founder'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
