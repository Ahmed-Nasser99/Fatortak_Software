
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated (login/register pages)
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user has subscription restrictions
  const hasSubscriptionRestriction = localStorage.getItem('subscription_required') === 'true';
  const allowedPathsForUnsubscribed = ['/subscription-plans', '/payment'];
  const isOnAllowedPath = allowedPathsForUnsubscribed.includes(location.pathname);

  // If user has subscription restriction and is not on allowed paths, redirect to subscription plans
  if (hasSubscriptionRestriction && !isOnAllowedPath && requireAuth && isAuthenticated) {
    return <Navigate to="/subscription-plans" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
