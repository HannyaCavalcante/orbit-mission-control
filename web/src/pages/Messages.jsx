import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  sent:       { label: 'Enviada',     color: 'var(--muted)',   icon: '🕐' },
  in_transit: { label: 'Em trânsito', color: 'var(--orange)',  icon: '📡' },
  delivered:  { label: 'Entregue',    color: 'var(--accent)',  icon: '✓✓'  },
  read:       { label: 'Lida',        color: 'var(--green)',   icon: '✓✓'  },
};

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [crew,     setCrew]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [form, setForm] = useState({ receiver_id: '', content: '', priority: 'normal' });
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([api.get('/messages'), api.get('/crew')]).then(([m, c]) => {
      setMessages(m.data);
      setCrew(c.data);
      setLoading(false);
    });
  }, []);

  // Polling a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      api.get('/messages').then(({ data }) => setMessages(data)).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function sendMessage(e) {
    e.preventDefault();
    if (!form.receiver_id || !form.content.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post('/messages', form);
      setMessages(prev => [data, ...prev]);
      setForm(f => ({ ...f, content: '' }));
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div style={{ color: 'var(--muted)', padding: '2rem' }}>Carregando mensagens...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>
          Comunicações
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Central de Mensagens</h1>
      </div>

      {/* Send form */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
        padding: '1.5rem', marginBottom: '2rem',
      }}>
        <h3 style={{ fontSize: '0.95rem', color: 'var(--accent2)', marginBottom: '1rem' }}>Enviar Instrução</h3>
        <form onSubmit={sendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={form.receiver_id}
              onChange={e => setForm(f => ({ ...f, receiver_id: e.target.value }))}
              style={{ flex: 1, minWidth: 180 }}
              required
            >
              <option value="">Destinatário...</option>
              {crew.map(c => <option key={c.id} value={c.id}>{c.name} ({c.position})</option>)}
            </select>
            <select
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              style={{ width: 140 }}
            >
              <option value="low">Baixa</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
          <textarea
            rows={3}
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Escreva a instrução para a tripulação..."
            style={{ resize: 'vertical' }}
            required
          />
          <button
            type="submit"
            disabled={sending}
            style={{
              alignSelf: 'flex-end', padding: '0.6rem 1.5rem',
              background: sending ? 'var(--border)' : 'var(--accent)',
              color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: '0.88rem',
            }}
          >
            {sending ? 'Transmitindo...' : '📡 Transmitir'}
          </button>
        </form>
      </div>

      {/* Message list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {messages.map(msg => {
          const sc = STATUS_CONFIG[msg.status] || STATUS_CONFIG.sent;
          return (
            <div key={msg.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '1rem 1.25rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 4 }}>
                    <strong style={{ color: 'var(--text)' }}>{msg.sender_name}</strong>
                    {' → '}
                    <strong style={{ color: 'var(--text)' }}>{msg.receiver_name}</strong>
                    {' · '}
                    {new Date(msg.sent_at).toLocaleString('pt-BR')}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{msg.content}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{
                    fontSize: '0.75rem', color: sc.color, fontWeight: 600,
                    background: `${sc.color}18`, padding: '2px 10px', borderRadius: 20,
                  }}>
                    {sc.icon} {sc.label}
                  </span>
                  {msg.priority !== 'normal' && (
                    <span style={{
                      fontSize: '0.72rem', color: msg.priority === 'critical' ? 'var(--red)' : 'var(--orange)',
                      textTransform: 'uppercase', letterSpacing: 1,
                    }}>
                      {msg.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div style={{ color: 'var(--muted)', padding: '2rem', textAlign: 'center' }}>
            Nenhuma mensagem transmitida ainda.
          </div>
        )}
      </div>
    </div>
  );
}
