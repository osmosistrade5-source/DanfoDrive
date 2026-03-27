import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'advertiser' | 'driver' | 'admin';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('danfo_token');
      const userStr = localStorage.getItem('danfo_user');

      if (!token || !userStr) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const user = JSON.parse(userStr);
        
        // Basic role check from local storage first
        if (role && user.role !== role) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Verify with backend
        const endpoint = user.role === 'admin' ? '/api/admin/me' : '/api/advertisers/me';
        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('danfo_token');
          localStorage.removeItem('danfo_user');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-yellow animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on role
    const loginPath = role === 'admin' ? '/admin/login' : '/advertiser/auth';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
