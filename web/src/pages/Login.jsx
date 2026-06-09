import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const POSITIONS = [
  'Commander', 'Medical Officer', 'Systems Engineer', 'Science Officer',
  'Planetary Geologist', 'Aerospace Engineer', 'Emergency Physician',
  'Flight Engineer', 'Mission Specialist', 'Robotics Engineer',
];

const INPUT = {
  width: '100%', padding: '0.7rem 0.85rem', borderRadius: 8,
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)',
  color: 'var(--text)', fontSize: '0.9rem', boxSizing: 'border-box',
  outline: 'none', transition: 'border-color 0.2s',
};

export default function Login() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const navigate = useNavigate();
  const { login } = useAuth();

  // login state
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  // register state
  const [reg, setReg] = useState({ name: '', email: '', password: '', confirm: '', position: '', role: 'crew' });

  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciais inválidas');
    } finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    if (reg.password !== reg.confirm) { setError('As senhas não coincidem.'); return; }
    if (!reg.position) { setError('Selecione um cargo.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: reg.name, email: reg.email, password: reg.password,
        position: reg.position, role: reg.role,
      });
      localStorage.setItem('orbit_token', data.token);
      localStorage.setItem('orbit_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao cadastrar');
    } finally { setLoading(false); }
  }

  function switchTab(t) { setTab(t); setError(''); }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.12) 0%, #050a14 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 1.5rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: 6, color: 'var(--accent)' }}>◉ ORBIT</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: 3 }}>MISSION CONTROL</div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {[['login', 'Entrar'], ['register', 'Cadastrar']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                style={{
                  flex: 1, padding: '0.85rem', fontWeight: 700, fontSize: '0.88rem',
                  background: tab === key ? 'rgba(14,165,233,0.1)' : 'transparent',
                  color: tab === key ? 'var(--accent)' : 'var(--muted)',
                  borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >{label}</button>
            ))}
          </div>

          <div style={{ padding: '2rem' }}>
            {/* ─── LOGIN ─── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>E-MAIL</label>
                  <input style={INPUT} type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="houston@orbit.earth" required autoFocus />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>SENHA</label>
                  <input style={INPUT} type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required />
                </div>

                {error && <ErrorBox msg={error} />}

                <button type="submit" disabled={loading} style={submitBtn(loading)}>
                  {loading ? 'Autenticando...' : 'Entrar no Sistema'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
                  Ainda não tem conta?{' '}
                  <span onClick={() => switchTab('register')} style={{ color: 'var(--accent)', cursor: 'pointer' }}>
                    Cadastre-se
                  </span>
                </p>
              </form>
            )}

            {/* ─── REGISTER ─── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>NOME COMPLETO *</label>
                  <input style={INPUT} value={reg.name} onChange={e => setReg(r => ({ ...r, name: e.target.value }))}
                    placeholder="Ex: Ana Lima" required autoFocus />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>E-MAIL *</label>
                  <input style={INPUT} type="email" value={reg.email} onChange={e => setReg(r => ({ ...r, email: e.target.value }))}
                    placeholder="nome@orbit.space" required />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>CARGO / ESPECIALIDADE *</label>
                  <select style={{ ...INPUT }} value={reg.position} onChange={e => setReg(r => ({ ...r, position: e.target.value }))}>
                    <option value="">Selecione o cargo...</option>
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>SENHA *</label>
                    <input style={INPUT} type="password" value={reg.password} onChange={e => setReg(r => ({ ...r, password: e.target.value }))}
                      placeholder="mín. 6 caracteres" required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>CONFIRMAR *</label>
                    <input style={INPUT} type="password" value={reg.confirm} onChange={e => setReg(r => ({ ...r, confirm: e.target.value }))}
                      placeholder="repita a senha" required />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>PERFIL DE ACESSO</label>
                  <select style={{ ...INPUT }} value={reg.role} onChange={e => setReg(r => ({ ...r, role: e.target.value }))}>
                    <option value="crew">Tripulante (bordo)</option>
                    <option value="control">Controle de Missão (Terra)</option>
                  </select>
                </div>

                {error && <ErrorBox msg={error} />}

                <button type="submit" disabled={loading} style={submitBtn(loading)}>
                  {loading ? 'Cadastrando...' : '🚀 Incorporar à Missão'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
                  Já tem conta?{' '}
                  <span onClick={() => switchTab('login')} style={{ color: 'var(--accent)', cursor: 'pointer' }}>
                    Entrar
                  </span>
                </p>
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted)', marginTop: '1.5rem' }}>
          ORBIT — FIAP Global Solution 2026
        </p>
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div style={{
      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: 8, padding: '0.6rem 1rem', fontSize: '0.85rem', color: 'var(--red)',
    }}>{msg}</div>
  );
}

function submitBtn(loading) {
  return {
    width: '100%', padding: '0.75rem',
    background: loading ? 'var(--border)' : 'var(--accent)',
    color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem',
    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s',
  };
}
