import { useState, useEffect } from 'react';
import api from '../services/api';

const EVENT_ICONS = {
  message_sent:    '📡',
  task_completed:  '✅',
  alert_created:   '🚨',
  mission_start:   '🚀',
  crew_update:     '👨‍🚀',
  default:         '📋',
};

const EVENT_COLORS = {
  message_sent:    'var(--accent)',
  task_completed:  'var(--green)',
  alert_created:   'var(--red)',
  mission_start:   'var(--orange)',
  default:         'var(--border)',
};

export default function MissionLog() {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mission-log').then(({ data }) => {
      setLog(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--muted)', padding: '2rem' }}>Carregando log...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>
          Registro
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Log da Missão</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Timeline de todos os eventos registrados
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute', left: 19, top: 0, bottom: 0, width: 2,
          background: 'var(--border)',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {log.map(entry => (
            <div key={entry.id} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              {/* Dot */}
              <div style={{
                width: 40, height: 40, flexShrink: 0, borderRadius: '50%',
                background: 'var(--surface)',
                border: `2px solid ${EVENT_COLORS[entry.event_type] || EVENT_COLORS.default}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', zIndex: 1,
              }}>
                {EVENT_ICONS[entry.event_type] || EVENT_ICONS.default}
              </div>

              {/* Content */}
              <div style={{
                flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '0.75rem 1rem',
              }}>
                <div style={{ fontSize: '0.88rem', color: '#e2e8f0', marginBottom: 4 }}>
                  {entry.description}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {new Date(entry.created_at).toLocaleString('pt-BR')}
                  {entry.user_name && ` · ${entry.user_name}`}
                </div>
              </div>
            </div>
          ))}

          {log.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
              Log vazio. Aguardando eventos da missão.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
