// client/src/routes/RoleRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps pages that require a specific role. Usage: <RoleRoute allowed={['Admin']}>...</RoleRoute>
export default function RoleRoute({ allowed, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#64748b' }}>
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role -> bounce back to the dashboard.
  if (!allowed.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
}