/**
 * ProtectedRoute — Guards routes based on authentication and role.
 * Extracted from App.jsx for reusability.
 */
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

function PageLoader() {
  return (
    <div className="page-container flex items-center justify-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
          style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)' }}
        />
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return (
      <div className="page-container flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="glass-card p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Access Denied</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Please login to access this page.</p>
          <a href="/login" className="btn btn-primary">Go to Login</a>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="page-container flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="glass-card p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Unauthorized</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>You don't have permission to access this page.</p>
          <a href="/" className="btn btn-primary">Go Home</a>
        </div>
      </div>
    );
  }

  return children;
}

export { PageLoader };
