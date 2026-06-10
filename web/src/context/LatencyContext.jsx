import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const Ctx = createContext(null);

export function LatencyProvider({ children }) {
  const [delayMs,  setDelayMs]  = useState(3000);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('orbit_token')) return;
    api.get('/config/latency').then(({ data }) => setDelayMs(data.delayMs)).catch(() => {});
  }, []);

  const updateDelay = useCallback(async (ms) => {
    setLoading(true);
    try {
      const { data } = await api.put('/config/latency', { delayMs: ms });
      setDelayMs(data.delayMs);
    } finally {
      setLoading(false);
    }
  }, []);

  function formatDelay(ms) {
    if (ms < 1000)    return `${ms}ms`;
    if (ms < 60000)   return `${(ms/1000).toFixed(1)}s`;
    if (ms < 3600000) return `${Math.round(ms/60000)}min`;
    return `${(ms/3600000).toFixed(1)}h`;
  }

  return (
    <Ctx.Provider value={{ delayMs, loading, updateDelay, formatDelay }}>
      {children}
    </Ctx.Provider>
  );
}

export const useLatency = () => useContext(Ctx);
