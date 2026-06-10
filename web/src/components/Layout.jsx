import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLatency } from '../context/LatencyContext';

const NAV_ITEMS = [
  { to: '/app',             icon: '📊', label: 'Dashboard'   },
  { to: '/app/messages',   icon: '💬', label: 'Mensagens'   },
  { to: '/app/crew',       icon: '👨‍🚀', label: 'Tripulação' },
  { to: '/app/tasks',      icon: '✅', label: 'Tarefas'     },
  { to: '/app/alerts',     icon: '🚨', label: 'Alertas'     },
  { to: '/app/log',        icon: '📋', label: 'Log'         },
  { to: '/app/latency',    icon: '⏱️', label: 'Latência'   },
  { to: '/app/satellites', icon: '🛰️', label: 'Satélites'  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { delayMs, formatDelay } = useLatency();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: 3, color: 'var(--accent)' }}>◉ ORBIT</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: 1 }}>MISSION CONTROL</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.6rem 0.75rem', borderRadius: 8,
                fontSize: '0.88rem', transition: 'all 0.15s',
                background: isActive ? 'rgba(14,165,233,0.12)' : 'transparent',
                color: isActive ? 'var(--accent2)' : 'var(--muted)',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
              })}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + Latency */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '0.5rem 0.75rem', marginBottom: '0.75rem',
            fontSize: '0.78rem',
          }}>
            <div style={{ color: 'var(--muted)', letterSpacing: 1 }}>DELAY MARTE</div>
            <div style={{ color: 'var(--orange)', fontWeight: 700, fontSize: '0.9rem' }}>
              {formatDelay(delayMs)}
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
            {user?.name}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '0.4rem', background: 'transparent',
              border: '1px solid var(--border)', color: 'var(--muted)',
              borderRadius: 6, fontSize: '0.8rem', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--red)'; e.target.style.color = 'var(--red)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)'; }}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
