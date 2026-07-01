// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // <-- ADD
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>          {/* <-- ADD: wraps the app so all pages see auth state */}
        <App />
      </AuthProvider>         {/* <-- ADD */}
    </BrowserRouter>
  </React.StrictMode>
);