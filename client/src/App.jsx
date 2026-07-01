// src/App.jsx
// Root application component. Defines all top-level routes.

import { Routes, Route, Navigate } from 'react-router-dom';
import ConnectionTest from './pages/ConnectionTest';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PrivateRoute from './routes/PrivateRoute';

const NotFoundPage = () => <h1>404 — Page Not Found</h1>;

function App() {
  return (
    <Routes>
      {/* Default redirect from root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />

      {/* Protected: only logged-in users reach the dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      <Route path="/test" element={<ConnectionTest />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;