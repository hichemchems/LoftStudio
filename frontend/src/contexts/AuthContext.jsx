import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

  const fetchUser = useCallback(async () => {
    try {
      console.log('Fetching user data from:', `${API_URL}/auth/me`);
      const response = await axios.get(`${API_URL}/auth/me`);
      console.log('User data fetched successfully:', response.data);
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      console.error('Error details:', error.response?.data);
      logout();
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (token) {
      console.log('Token found, setting axios header and fetching user...');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      console.log('No token found, setting loading to false');
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: newToken } = response.data.data;
      console.log('Login successful, setting token');
      setToken(newToken);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error.response?.data);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Attempting registration for:', userData.email);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { token: newToken } = response.data.data;
      console.log('Registration successful, setting token');
      setToken(newToken);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error.response?.data);
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'superAdmin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
