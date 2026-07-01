// client/src/pages/dashboard/DashboardPage.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Admin has no employee record yet, so fall back to username.
  const displayName = user.employee
    ? `${user.employee.first_name} ${user.employee.last_name}`
    : user.username;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.brand}>🏥 HMS</span>
        <button onClick={handleLogout} style={styles.logout}>Log out</button>
      </header>

      <main style={styles.main}>
        <h1 style={styles.title}>Welcome, {displayName}</h1>
        <p style={styles.role}>Role: <strong>{user.role}</strong></p>
        <p style={styles.note}>
          You are logged in. Role-specific dashboards and modules come next.
        </p>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0' },
  brand: { fontSize: 18, fontWeight: 700, color: '#0f172a' },
  logout: { padding: '8px 14px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', color: '#334155', cursor: 'pointer', fontSize: 14 },
  main: { maxWidth: 720, margin: '48px auto', padding: '0 24px' },
  title: { margin: 0, fontSize: 28, color: '#0f172a' },
  role: { marginTop: 8, color: '#475569' },
  note: { marginTop: 16, color: '#64748b', fontSize: 14 },
};