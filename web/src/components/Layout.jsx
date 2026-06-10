import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLatency } from '../context/LatencyContext';

const NAV_ITEMS = [
  { to: '/app',             icon: '📊', label: 'Dashboard'  },
  { to: '/app/messages',   icon: '💬', label: 'Mensagens'  },
  { to: '/app/crew',       icon: '👨‍🚀', label: 'Tripulação'},
  { to: '/app/tasks',      icon: '✅', label: 'Tarefas'    },
  { to: '/app/alerts',     icon: '🚨', label: 'Alertas'    },
  { to: '/app/log',        icon: '📋', label: 'Log'        },
  { to: '/app/latency',    icon: '⏱️', label: 'Latência'  },
  { to: '/app/satellites', icon: '🛰️', label: 'Satélites' },
];

// Bottom nav shows first 5 most-used items on mobile
const BOTTOM_NAV = NAV_ITEMS.slice(0, 5);

const CSS = `
.orbit-layout { display: flex; height: 100vh; overflow: hidden; }

/* ── Sidebar (desktop) ── */
.orbit-sidebar {
  width: 220px; background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column; flex-shrink: 0;
  transition: transform 0.25s ease;
}

/* ── Top header (mobile) ── */
.orbit-topbar {
  display: none;
  align-items: center; justify-content: space-between;
  padding: 0 1rem; height: 56px;
  background: var(--surface); border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 100; flex-shrink: 0;
}
.orbit-topbar-logo { font-size: 1rem; font-weight: 900; letter-spacing: 3px; color: var(--accent); }
.orbit-topbar-right { display: flex; align-items: center; gap: 0.75rem; }
.orbit-delay-chip {
  font-size: 0.65rem; font-weight: 700; padding: 3px 8px;
  border-radius: 20px; background: rgba(249,115,22,0.15);
  color: var(--orange); border: 1px solid rgba(249,115,22,0.3);
  letter-spacing: 0.5px;
}
.orbit-hamburger {
  width: 36px; height: 36px; border-radius: 8px;
  background: var(--surface2); border: 1px solid var(--border);
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 5px; cursor: pointer;
}
.orbit-hamburger span {
  display: block; width: 16px; height: 1.5px;
  background: var(--muted); border-radius: 2px;
  transition: all 0.2s;
}

/* ── Drawer overlay (mobile) ── */
.orbit-drawer-overlay {
  display: none; position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);
}
.orbit-drawer-overlay.open { display: block; }
.orbit-drawer {
  position: fixed; top: 0; left: 0; bottom: 0; width: 260px;
  background: var(--surface); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; z-index: 201;
  transform: translateX(-100%); transition: transform 0.25s ease;
}
.orbit-drawer.open { transform: translateX(0); }

/* ── Bottom navigation (mobile) ── */
.orbit-bottom-nav {
  display: none;
  position: fixed; bottom: 0; left: 0; right: 0; height: 64px;
  background: var(--surface); border-top: 1px solid var(--border);
  z-index: 100; padding: 0 0.25rem;
  align-items: center; justify-content: space-around;
}
.orbit-bottom-nav a {
  display: flex; flex-direction: column; align-items: center;
  gap: 3px; flex: 1; padding: 0.4rem 0;
  font-size: 0.6rem; color: var(--muted);
  border-radius: 8px; transition: all 0.15s; text-decoration: none;
}
.orbit-bottom-nav a.active { color: var(--accent2); }
.orbit-bottom-nav a span:first-child { font-size: 1.2rem; line-height: 1; }

/* ── Main ── */
.orbit-main { flex: 1; overflow: auto; padding: 2rem; }

/* ── Mobile breakpoint ── */
@media (max-width: 768px) {
  .orbit-sidebar  { display: none; }
  .orbit-topbar   { display: flex; }
  .orbit-bottom-nav { display: flex; }
  .orbit-main {
    padding: 1rem 0.875rem;
    padding-bottom: 80px; /* room for bottom nav */
  }
}
`;

export default function Layout() {
  const { user, logout } = useAuth();
  const { delayMs, formatDelay } = useLatency();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const SidebarContent = ({ onNavClick }) => (
    <>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: 3, color: 'var(--accent)' }}>◉ ORBIT</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: 1 }}>MISSION CONTROL</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            onClick={onNavClick}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0.65rem 0.75rem', borderRadius: 8,
              fontSize: '0.88rem', transition: 'all 0.15s', textDecoration: 'none',
              background: isActive ? 'rgba(14,165,233,0.12)' : 'transparent',
              color: isActive ? 'var(--accent2)' : 'var(--muted)',
              borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
            })}
          >
            <span style={{ fontSize: '1rem' }}>{icon}</span>
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
          <div style={{ color: 'var(--muted)', letterSpacing: 1, fontSize: '0.65rem' }}>DELAY MARTE</div>
          <div style={{ color: 'var(--orange)', fontWeight: 700 }}>{formatDelay(delayMs)}</div>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name}
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '0.45rem', background: 'transparent',
            border: '1px solid var(--border)', color: 'var(--muted)',
            borderRadius: 6, fontSize: '0.8rem', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
        >
          Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="orbit-layout">
      <style>{CSS}</style>

      {/* ── Desktop sidebar ── */}
      <aside className="orbit-sidebar">
        <SidebarContent onNavClick={undefined} />
      </aside>

      {/* ── Mobile top bar ── */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <header className="orbit-topbar">
          <span className="orbit-topbar-logo">◉ ORBIT</span>
          <div className="orbit-topbar-right">
            <span className="orbit-delay-chip">⏱ {formatDelay(delayMs)}</span>
            <div className="orbit-hamburger" onClick={() => setDrawerOpen(true)}>
              <span /><span /><span />
            </div>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="orbit-main">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile drawer overlay ── */}
      <div className={`orbit-drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`orbit-drawer${drawerOpen ? ' open' : ''}`}>
        <SidebarContent onNavClick={() => setDrawerOpen(false)} />
      </div>

      {/* ── Bottom navigation ── */}
      <nav className="orbit-bottom-nav">
        {BOTTOM_NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/app'}>
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
