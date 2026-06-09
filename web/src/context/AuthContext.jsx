import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem('orbit_user')); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('orbit_token'));

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('orbit_token', data.token);
    localStorage.setItem('orbit_user',  JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('orbit_token');
    localStorage.removeItem('orbit_user');
    setToken(null);
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, token, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
