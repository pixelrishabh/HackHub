import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

export function RoleGuard({ allowedRoles = [], children }) {
  const { user, role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner label="Verifying role authorizations..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const normalizedRole = (role || '').toLowerCase();
  const isAuthorized = allowedRoles.some((r) => r.toLowerCase() === normalizedRole);

  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 ring-8 ring-rose-50/50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">You don't have access to this section</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          This area is restricted to staff users with role{' '}
          <span className="font-semibold text-slate-700">
            {allowedRoles.join(' or ')}
          </span>
          . Your current account role is <span className="font-semibold capitalize text-primary-600">{role || 'participant'}</span>.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return children;
}
