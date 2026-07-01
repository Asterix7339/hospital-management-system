// client/src/routes/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps any page that requires a logged-in user.
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking for an existing session -> wait, don't decide yet.
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#64748b' }}>
        Loading…
      </div>
    );
  }

  // Not logged in -> send to login.
  if (!user) return <Navigate to="/login" replace />;

  // Logged in -> show the protected page.
  return children;
}