import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet(['orbit_token', 'orbit_user']).then(([[, tk], [, us]]) => {
      if (tk) setToken(tk);
      if (us) try { setUser(JSON.parse(us)); } catch {}
      setReady(true);
    });
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    await AsyncStorage.multiSet([['orbit_token', data.token], ['orbit_user', JSON.stringify(data.user)]]);
    setToken(data.token);
    setUser(data.user);
  }

  async function logout() {
    await AsyncStorage.multiRemove(['orbit_token', 'orbit_user']);
    setToken(null);
    setUser(null);
  }

  return <Ctx.Provider value={{ user, token, ready, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
