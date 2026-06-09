import { useState, useEffect } from 'react';
import api from '../services/api';

const SEVERITY_CONFIG = {
  critical: { label: 'Crítico', color: 'var(--red)',    bg: 'rgba(239,68,68,0.1)',    icon: '🔴' },
  warning:  { label: 'Aviso',   color: 'var(--orange)', bg: 'rgba(249,115,22,0.1)',   icon: '🟡' },
  info:     { label: 'Info',    color: 'var(--accent)',  bg: 'rgba(14,165,233,0.1)',  icon: '🔵' },
};

export default function Alerts() {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', category: 'mission', severity: 'warning' });
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    api.get('/alerts').then(({ data }) => { setAlerts(data); setLoading(false); });
  }, []);

  async function createAlert(e) {
    e.preventDefault();
    const { data } = await api.post('/alerts', form);
    setAlerts(prev => [data, ...prev]);
    setForm({ title: '', description: '', category: 'mission', severity: 'warning' });
    setShowing(false);
  }

  async function resolveAlert(id) {
    await api.put(`/alerts/${id}/resolve`);
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  if (loading) return <div style={{ color: 'var(--muted)', padding: '2rem' }}>Carregando alertas...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--red)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>
            Emergências
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Alertas</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>
            {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} ativo{alerts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowing(!showing)}
          style={{
            padding: '0.6rem 1.25rem', background: 'rgba(239,68,68,0.15)',
            color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, fontWeight: 700, fontSize: '0.88rem',
          }}
        >
          + Novo Alerta
        </button>
      </div>

      {showing && (
        <form onSubmit={createAlert} style={{
          background: 'var(--surface)', border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
        }}>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Título do alerta..."
            required
          />
          <textarea
            rows={2}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Descrição (opcional)..."
            style={{ resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ flex: 1 }}>
              <option value="medical">Médico</option>
              <option value="system">Sistema</option>
              <option value="mission">Missão</option>
            </select>
            <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} style={{ flex: 1 }}>
              <option value="info">Info</option>
              <option value="warning">Aviso</option>
              <option value="critical">Crítico</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" style={{ padding: '0.5rem 1.25rem', background: 'var(--red)', color: '#fff', borderRadius: 8, fontWeight: 700 }}>
              Disparar Alerta
            </button>
            <button type="button" onClick={() => setShowing(false)} style={{ padding: '0.5rem 1.25rem', background: 'var(--surface2)', color: 'var(--muted)', borderRadius: 8 }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {alerts.map(alert => {
          const sc = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
          return (
            <div key={alert.id} style={{
              background: sc.bg, border: `1px solid ${sc.color}40`,
              borderRadius: 12, padding: '1.25rem',
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '1.4rem' }}>{sc.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{alert.title}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: sc.color, background: `${sc.color}20`, padding: '2px 8px', borderRadius: 20 }}>
                      {sc.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 20 }}>
                      {alert.category}
                    </span>
                  </div>
                </div>
                {alert.description && (
                  <div style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: 6 }}>{alert.description}</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {new Date(alert.created_at).toLocaleString('pt-BR')}
                    {alert.created_by_name && ` · ${alert.created_by_name}`}
                  </span>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    style={{
                      padding: '0.3rem 0.9rem', fontSize: '0.78rem',
                      background: 'rgba(34,197,94,0.15)', color: 'var(--green)',
                      border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6, cursor: 'pointer',
                    }}
                  >
                    ✓ Resolver
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '3rem', color: 'var(--muted)',
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
            Nenhum alerta ativo. Missão operando normalmente.
          </div>
        )}
      </div>
    </div>
  );
}
