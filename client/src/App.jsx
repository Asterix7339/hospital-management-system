// src/App.jsx
// Root application component.
// Defines all top-level routes.
// Each route will map to a page component (built during feature modules).

import { Routes, Route, Navigate } from 'react-router-dom';
import ConnectionTest from './pages/ConnectionTest';

// Temporary placeholder pages (will be replaced during module development)
const LoginPage    = () => <h1>🏥 HMS — Login Page</h1>;
const DashboardPage = () => <h1>🏥 HMS — Dashboard</h1>;
const NotFoundPage = () => <h1>404 — Page Not Found</h1>;

function App() {
  return (
    <Routes>
      {/* Default redirect from root to login */}
      <Route path="/"         element={<Navigate to="/login" replace />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/test" element={<ConnectionTest />} />  
         
      {/* 404 catch-all */}
      <Route path="*"         element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;