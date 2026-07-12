import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useApp();

  if (!user) {
    // Redirect to login if user not logged in
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // Redirect to home if admin credentials are required but absent
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
