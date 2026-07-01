// client/src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Controlled form state — React owns these values.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');      // message shown to the user
  const [submitting, setSubmitting] = useState(false); // true while the request is in flight

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser's default page reload on form submit
    setError('');

    // Simple client-side check before we bother the server.
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate('/dashboard'); // success -> go to the dashboard
    } catch (err) {
      // Show the server's message (e.g. "Invalid credentials", "Account locked ...").
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      if (status === 423) {
        setError(serverMsg || 'Account locked. Please try again later.');
      } else if (status === 401) {
        setError('Invalid username or password.');
      } else {
        setError(serverMsg || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false); // re-enable the button whether we succeeded or failed
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>HMS Login</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            style={styles.input}
            disabled={submitting}
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            style={styles.input}
            disabled={submitting}
          />
        </label>

        <button type="submit" style={styles.button} disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

// Minimal inline styles so we have a clean page without a CSS file yet.
const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' },
  card: { width: 340, padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 14 },
  title: { margin: 0, fontSize: 24, color: '#0f172a', textAlign: 'center' },
  subtitle: { margin: 0, marginBottom: 8, fontSize: 14, color: '#64748b', textAlign: 'center' },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: '#334155' },
  input: { padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, outline: 'none' },
  button: { marginTop: 8, padding: '11px', border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  error: { padding: '10px 12px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13 },
};