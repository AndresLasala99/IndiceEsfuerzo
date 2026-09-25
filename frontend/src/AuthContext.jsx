import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, clearToken, getToken, setToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('ise:logout', onLogout);
    return () => window.removeEventListener('ise:logout', onLogout);
  }, []);

  const handleSession = useCallback((data) => {
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }).then(handleSession);
  const register = (form) => api('/auth/register', { method: 'POST', body: form }).then(handleSession);
  const registerAdmin = (form) => api('/auth/register-admin', { method: 'POST', body: form }).then(handleSession);
  const logout = () => { clearToken(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, registerAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
