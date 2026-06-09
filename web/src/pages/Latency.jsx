import { useState } from 'react';
import { useLatency } from '../context/LatencyContext';

const PRESETS = [
  { label: 'Demo (3s)',         ms: 3000,    color: 'var(--green)',  icon: '🟢', desc: 'Para apresentação' },
  { label: 'Marte próximo (3min)',  ms: 180000,  color: 'var(--green)',  icon: '🟢', desc: '~54 milhões km' },
  { label: 'Posição média (11min)', ms: 660000,  color: 'var(--orange)', icon: '🟠', desc: '~200 milhões km' },
  { label: 'Marte distante (22min)',ms: 1320000, color: 'var(--red)',    icon: '🔴', desc: '~401 milhões km' },
];

export default function Latency() {
  const { delayMs, loading, updateDelay, formatDelay } = useLatency();
  const [custom, setCustom] = useState('');
  const [msg, setMsg] = useState('');

  async function applyPreset(ms) {
    await updateDelay(ms);
    setMsg(`Delay atualizado para ${formatDelay(ms)}`);
    setTimeout(() => setMsg(''), 3000);
  }

  async function applyCustom() {
    const ms = parseInt(custom) * 1000;
    if (isNaN(ms) || ms < 0) return;
    await updateDelay(ms);
    setMsg(`Delay atualizado para ${formatDelay(ms)}`);
    setTimeout(() => setMsg(''), 3000);
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>
          Configuração
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Simulação de Latência</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Ajuste o delay que simula a distância Terra–Marte
        </p>
      </div>

      {/* Current */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
        padding: '2rem', marginBottom: '2rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: 2, marginBottom: 8 }}>DELAY ATUAL</div>
        <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--orange)', fontFamily: 'monospace' }}>
          {formatDelay(delayMs)}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 8 }}>
          {delayMs.toLocaleString('pt-BR')} milissegundos
        </div>
      </div>

      {/* Presets */}
      <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--accent2)' }}>Posições predefinidas</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {PRESETS.map(p => (
          <button
            key={p.ms}
            onClick={() => applyPreset(p.ms)}
            disabled={loading}
            style={{
              background: delayMs === p.ms ? 'rgba(14,165,233,0.1)' : 'var(--surface)',
              border: `1px solid ${delayMs === p.ms ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 12, padding: '1.25rem', textAlign: 'left',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '1.3rem', marginBottom: 8 }}>{p.icon}</div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{p.label}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>{p.desc}</div>
          </button>
        ))}
      </div>

      {/* Custom */}
      <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--accent2)' }}>Valor personalizado</h3>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', maxWidth: 400 }}>
        <input
          type="number"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          placeholder="Segundos (ex: 240)"
          style={{ flex: 1 }}
        />
        <button
          onClick={applyCustom}
          disabled={loading}
          style={{
            padding: '0.5rem 1.25rem', background: 'var(--accent)', color: '#fff',
            borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
          }}
        >
          Aplicar
        </button>
      </div>

      {msg && (
        <div style={{
          marginTop: '1.5rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 8, padding: '0.75rem 1rem', color: 'var(--green)', fontSize: '0.9rem',
        }}>
          ✓ {msg}
        </div>
      )}

      {/* Explanation */}
      <div style={{
        marginTop: '2rem', background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '1.5rem',
      }}>
        <h4 style={{ color: '#fff', marginBottom: '0.75rem' }}>Como funciona o delay</h4>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7 }}>
          O delay é implementado como um middleware no servidor Express que intercepta todas as
          requisições autenticadas e aplica um <code style={{ color: 'var(--accent2)' }}>setTimeout</code> antes
          de prosseguir. Isso significa que toda mensagem enviada, toda tarefa criada e todo alerta
          disparado leva exatamente esse tempo para ser processado pelo servidor — simulando
          com fidelidade a física da comunicação Terra–Marte.
        </p>
      </div>
    </div>
  );
}
