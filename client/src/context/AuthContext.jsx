// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking for an existing session

  // On app load: try a silent refresh using the httpOnly cookie.
  // If it succeeds, the user was already logged in (survived a browser refresh).
  useEffect(() => {
    (async () => {
      try {
        const restoredUser = await authService.refresh();
        setUser(restoredUser);
      } catch {
        setUser(null); // no valid session — show the login page, this is normal
      } finally {
        setLoading(false); // done checking, let the app render
      }
    })();
  }, []);

  const login = async (username, password) => {
    const loggedInUser = await authService.login(username, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = { user, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Small helper so components can just call useAuth() to read the auth state.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}