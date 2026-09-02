import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProtectedRoute = ({ children, pageName = 'this section' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast.warning(`Please log in to access your ${pageName}.`);
    }
  }, [loading, user, pageName]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
