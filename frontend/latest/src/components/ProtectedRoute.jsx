import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protected route component that checks authentication
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/driver" replace />;
  }

  // Check if specific role is required
  if (requiredRole) {
    if (requiredRole === 'driver' && user.role !== 'driver') {
      return <Navigate to="/driver" replace />;
    }
    if (requiredRole === 'student' && user.role !== 'student') {
      return <Navigate to="/student" replace />;
    }
    if (requiredRole === 'admin' && user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has required role
  return children;
};

export default ProtectedRoute; 