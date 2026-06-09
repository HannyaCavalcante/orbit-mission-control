import { useState, useEffect } from 'react';
import api from '../services/api';

const POSITIONS = [
  'Commander', 'Medical Officer', 'Systems Engineer', 'Science Officer',
  'Planetary Geologist', 'Aerospace Engineer', 'Emergency Physician',
  'Flight Engineer', 'Mission Specialist', 'Robotics Engineer',
];

const LOCATIONS = [
  'Módulo Hab A', 'Módulo Hab B', 'Centro de Controle', 'Enfermaria',
  'Sala de Máquinas', 'Laboratório Geo', 'Área de Escavação',
  'Laboratório Bio', 'Depósito', 'Exterior — EVA',
];

function VitalRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' }}>{value}</span>
    </div>
  );
}

function CrewCard({ member }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--surface2)', border: '2px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
        }}>👤</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{member.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent2)' }}>{member.position}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <VitalRow label="❤️ Freq. cardíaca" value={member.heart_rate ? `${member.heart_rate} bpm` : '—'} />
        <VitalRow label="💧 Hidratação"      value={member.hydration  ? `${member.hydration}%`   : '—'} />
        <VitalRow label="😴 Sono (24h)"       value={member.sleep_hours ? `${member.sleep_hours}h` : '—'} />
        <VitalRow label="📍 Localização"      value={member.location || '—'} />
      </div>
      {member.status_updated_at && (
        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '1rem' }}>
          Atualizado: {new Date(member.status_updated_at).toLocaleString('pt-BR')}
        </div>
      )}
    </div>
  );
}

const MODAL_OVERLAY = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: '1rem',
};

const INPUT_STYLE = {
  width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--surface2)',
  color: 'var(--text)', fontSize: '0.9rem', boxSizing: 'border-box',
};

export default function Crew() {
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', position: '', email: '', location: '' });

  useEffect(() => {
    api.get('/crew').then(({ data }) => { setCrew(data); setLoading(false); });
    const interval = setInterval(() => {
      api.get('/crew').then(({ data }) => setCrew(data)).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  function openModal() {
    setForm({ name: '', position: '', email: '', location: '' });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.position) { setError('Nome e cargo são obrigatórios.'); return; }
    setSaving(true); setError('');
    try {
      const { data } = await api.post('/crew', form);
      setCrew(prev => [...prev, data]);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao cadastrar tripulante.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ color: 'var(--muted)', padding: '2rem' }}>Carregando tripulação...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>
            Monitoramento
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Tripulação</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>
            {crew.length} membro{crew.length !== 1 ? 's' : ''} · Status vital em tempo real
          </p>
        </div>
        <button
          onClick={openModal}
          style={{
            padding: '0.6rem 1.25rem', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem',
            background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
          }}
        >
          + Novo Tripulante
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {crew.map(member => <CrewCard key={member.id} member={member} />)}
      </div>

      {/* Modal de cadastro */}
      {showModal && (
        <div style={MODAL_OVERLAY} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 480,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Cadastrar Tripulante</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}
              >×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>NOME COMPLETO *</label>
                <input
                  style={INPUT_STYLE}
                  placeholder="Ex: Ana Lima"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>CARGO / ESPECIALIDADE *</label>
                <select
                  style={INPUT_STYLE}
                  value={form.position}
                  onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                >
                  <option value="">Selecione o cargo...</option>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>E-MAIL</label>
                <input
                  style={INPUT_STYLE}
                  type="email"
                  placeholder="nome@orbit.space"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>LOCALIZAÇÃO INICIAL</label>
                <select
                  style={INPUT_STYLE}
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                >
                  <option value="">Módulo Hab A (padrão)</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--red)', borderRadius: 8, padding: '0.6rem 0.75rem', fontSize: '0.85rem', color: 'var(--red)' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ flex: 2, padding: '0.65rem', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Cadastrando...' : '🚀 Incorporar à Missão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
