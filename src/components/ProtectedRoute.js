import React from 'react';
import { Navigate } from 'react-router-dom';
import ApiService from '../services/api';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = ApiService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute; 