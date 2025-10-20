import { type ReactNode } from 'react';
import { canAccessRoute, getFounderById } from '../types/founders';

interface ProtectedRouteProps {
  userId: string;
  route: string;
  children: ReactNode;
}

export function ProtectedRoute({ userId, route, children }: ProtectedRouteProps) {
  const hasAccess = canAccessRoute(userId, route);
  const founder = getFounderById(userId);

  if (!founder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-400 mb-4">Authentication Required</h2>
          <p className="text-red-700 dark:text-red-300">
            You must be logged in to access this page. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-yellow-900 dark:text-yellow-400 mb-4">Access Denied</h2>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            You do not have permission to access this page.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded p-4 mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Your Role:</span> {founder.titles.join(', ')}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              <span className="font-semibold">Required Permissions:</span> View access to this resource
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
