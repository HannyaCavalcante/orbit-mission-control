import { useState, useEffect } from 'react';
import api from '../services/api';
import { useLatency } from '../context/LatencyContext';

function StatCard({ icon, label, value, color = 'var(--accent)' }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
      padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ fontSize: '1.5rem' }}>{icon}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 900, color }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [crew,     setCrew]     = useState([]);
  const [alerts,   setAlerts]   = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [messages, setMessages] = useState([]);
  const { formatDelay, delayMs } = useLatency();

  useEffect(() => {
    Promise.allSettled([
      api.get('/crew'),
      api.get('/alerts'),
      api.get('/tasks'),
      api.get('/messages'),
    ]).then(([c, a, t, m]) => {
      if (c.status === 'fulfilled') setCrew(c.value.data);
      if (a.status === 'fulfilled') setAlerts(a.value.data);
      if (t.status === 'fulfilled') setTasks(t.value.data);
      if (m.status === 'fulfilled') setMessages(m.value.data);
    });
  }, []);

  const pendingMessages = messages.filter(m => m.status === 'in_transit' || m.status === 'sent');
  const criticalAlerts  = alerts.filter(a => a.severity === 'critical');
  const openTasks       = tasks.filter(t => t.status !== 'done');

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>
          Visão Geral
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Status em tempo real da missão ORBIT
        </p>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon="👨‍🚀" label="Tripulantes"         value={crew.length}            color="var(--accent2)" />
        <StatCard icon="🚨" label="Alertas críticos"    value={criticalAlerts.length}  color="var(--red)"     />
        <StatCard icon="📡" label="Msgs em trânsito"    value={pendingMessages.length} color="var(--orange)"  />
        <StatCard icon="✅" label="Tarefas abertas"     value={openTasks.length}       color="var(--green)"   />
        <StatCard icon="⏱️" label="Delay atual"        value={formatDelay(delayMs)}   color="var(--orange)"  />
      </div>

      {/* Crew quick status */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--accent2)' }}>Status da Tripulação</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {crew.map(member => (
            <div key={member.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'var(--surface2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                }}>👤</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{member.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{member.position}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {member.heart_rate && (
                  <span style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 20 }}>
                    ❤️ {member.heart_rate} bpm
                  </span>
                )}
                {member.location && (
                  <span style={{ background: 'var(--surface2)', color: 'var(--muted)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 20 }}>
                    📍 {member.location}
                  </span>
                )}
              </div>
            </div>
          ))}
          {crew.length === 0 && (
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', padding: '1rem' }}>
              Aguardando dados da tripulação...
            </div>
          )}
        </div>
      </div>

      {/* Recent alerts */}
      {alerts.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--red)' }}>Alertas Ativos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} style={{
                background: 'var(--surface)', border: `1px solid ${alert.severity === 'critical' ? 'var(--red)' : 'var(--border)'}`,
                borderRadius: 10, padding: '0.75rem 1rem',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontSize: '1.2rem' }}>
                  {alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟡' : '🔵'}
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{alert.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    {alert.category} · {new Date(alert.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
