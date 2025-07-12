import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        
        if (authService.isAuthenticated()) {
          // Check if token is still valid
          const userData = await authService.refreshUserData();
          if (userData) {
            setUser(userData);
          } else {
            // Token expired or invalid
            authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
        authService.logout();
        setUser(null);
        setError('Authentication failed. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      setUser(response.data.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google login function
  const googleLogin = async (googleData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.googleLogin(googleData);
      setUser(response.data.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.registerDriver(userData);
      setUser(response.data.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    try {
      authService.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed. Please try again.');
    }
  };

  // Update user profile
  const updateProfile = async (updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await authService.updateProfile(updateData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && authService.isAuthenticated();
  };

  // Check if user is a driver
  const isDriver = () => {
    return user && user.role === 'driver';
  };

  // Check if user is a student
  const isStudent = () => {
    return user && user.role === 'student';
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    googleLogin,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    isDriver,
    isStudent,
    isAdmin,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 