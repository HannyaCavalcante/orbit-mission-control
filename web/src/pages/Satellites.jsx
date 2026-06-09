import { useState, useEffect } from 'react';
import api from '../services/api';

const SATELLITE_FEEDS = [
  {
    id: 'sar-01', name: 'ORBIT-SAR-01', type: 'Radar de Abertura Sintética',
    orbit: 'Polar Heliossíncrona', alt_km: 520, period_min: 95,
    status: 'operational', coverage: 'Hemisfério Norte',
    last_pass: new Date(Date.now() - 23 * 60000).toISOString(),
    next_pass: new Date(Date.now() + 72 * 60000).toISOString(),
  },
  {
    id: 'opt-02', name: 'ORBIT-OPT-02', type: 'Óptico Multiespectral',
    orbit: 'Equatorial', alt_km: 705, period_min: 99,
    status: 'operational', coverage: 'Faixa Tropical',
    last_pass: new Date(Date.now() - 45 * 60000).toISOString(),
    next_pass: new Date(Date.now() + 54 * 60000).toISOString(),
  },
  {
    id: 'com-03', name: 'ORBIT-COM-03', type: 'Comunicações / Relay',
    orbit: 'GEO', alt_km: 35786, period_min: 1440,
    status: 'standby', coverage: 'Global',
    last_pass: null,
    next_pass: null,
  },
  {
    id: 'wx-04', name: 'ORBIT-WX-04', type: 'Meteorologia',
    orbit: 'GEO', alt_km: 35786, period_min: 1440,
    status: 'operational', coverage: 'Atlântico Sul',
    last_pass: null,
    next_pass: null,
  },
];

const EARTH_ALERTS = [
  { id: 1, type: 'flood',    region: 'Vale do Paraíba — SP/RJ', severity: 'critical', detected: new Date(Date.now()-3600000).toISOString(), source: 'ORBIT-SAR-01', description: 'Inundação detectada por radar SAR. Área afetada: ~340 km². Deslocamento estimado: 12.000 pessoas.' },
  { id: 2, type: 'fire',     region: 'Cerrado — MT',            severity: 'warning',  detected: new Date(Date.now()-7200000).toISOString(), source: 'ORBIT-OPT-02', description: 'Foco de incêndio ativo identificado por sensor infravermelho. Temperatura superficial: +420°C acima do normal.' },
  { id: 3, type: 'drought',  region: 'Semiárido — NE Brasil',   severity: 'warning',  detected: new Date(Date.now()-86400000).toISOString(), source: 'ORBIT-OPT-02', description: 'Índice NDVI abaixo de 0.2 em 68% da área monitorada. Estresse hídrico severo na vegetação.' },
  { id: 4, type: 'landslide',region: 'Serra Gaúcha — RS',       severity: 'critical', detected: new Date(Date.now()-1800000).toISOString(), source: 'ORBIT-SAR-01', description: 'Movimentação de solo detectada por interferometria SAR. Deslocamento de 2,3 cm/dia. Risco de deslizamento iminente.' },
];

const WEATHER_STATIONS = [
  { city: 'São Paulo', lat: -23.5, lon: -46.6, temp: 22, humidity: 78, wind: 14, condition: 'Parcialmente Nublado' },
  { city: 'Manaus',    lat: -3.1,  lon: -60.0, temp: 34, humidity: 92, wind: 6,  condition: 'Chuva Forte' },
  { city: 'Brasília',  lat: -15.8, lon: -47.9, temp: 28, humidity: 45, wind: 20, condition: 'Ensolarado' },
  { city: 'Fortaleza', lat: -3.7,  lon: -38.5, temp: 31, humidity: 80, wind: 25, condition: 'Ventos Fortes' },
];

const TYPE_ICONS = { flood: '🌊', fire: '🔥', drought: '🏜️', landslide: '⛰️' };
const SEV_COLOR  = { critical: 'var(--red)', warning: 'var(--orange)', info: 'var(--muted)' };

function timeSince(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 60) return `${m}min atrás`;
  return `${Math.floor(m/60)}h ${m%60}min atrás`;
}

function timeUntil(iso) {
  const m = Math.floor((new Date(iso) - Date.now()) / 60000);
  if (m < 60) return `em ${m}min`;
  return `em ${Math.floor(m/60)}h ${m%60}min`;
}

export default function Satellites() {
  const [orbital, setOrbital] = useState(null);
  const [tab, setTab]         = useState('satellites'); // 'satellites' | 'earth' | 'weather'

  useEffect(() => {
    api.get('/config/orbital').then(({ data }) => setOrbital(data)).catch(() => {});
    const i = setInterval(() => {
      api.get('/config/orbital').then(({ data }) => setOrbital(data)).catch(() => {});
    }, 30000);
    return () => clearInterval(i);
  }, []);

  const sigColor = orbital ? (
    orbital.signal_quality === 'excellent' ? 'var(--green)' :
    orbital.signal_quality === 'good'      ? 'var(--accent2)' :
    orbital.signal_quality === 'degraded'  ? 'var(--orange)' : 'var(--red)'
  ) : 'var(--muted)';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Dados Satelitais</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Satélites & Sensoriamento</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>Monitoramento orbital, dados climáticos e alertas terrestres</p>
      </div>

      {/* Orbital status bar */}
      {orbital && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
          {[
            { label: 'Distância Terra–Marte', value: `${(orbital.distance_km/1e6).toFixed(0)}M km`, sub: `${orbital.distance_AU} AU`, color: 'var(--orange)' },
            { label: 'Delay One-Way',         value: `${orbital.one_way_min} min`, sub: `${orbital.one_way_sec}s`, color: sigColor },
            { label: 'Round Trip',            value: `${orbital.round_trip_min} min`, sub: 'ida + volta', color: sigColor },
            { label: 'Qualidade do Sinal',    value: orbital.signal_quality, sub: 'atual', color: sigColor },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', border: `1px solid ${s.color}30`, borderTop: `3px solid ${s.color}`, borderRadius: 10, padding: '1rem' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color, lineHeight: 1, textTransform: 'capitalize' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 3 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        {[['satellites', '🛰️ Frota de Satélites'], ['earth', '🌍 Alertas Terrestres'], ['weather', '🌤️ Dados Climáticos']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '0.75rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: tab === key ? 700 : 400, fontSize: '0.875rem',
            color: tab === key ? 'var(--accent)' : 'var(--muted)',
            borderBottom: `2px solid ${tab === key ? 'var(--accent)' : 'transparent'}`,
            marginBottom: -1, transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* ── Satélites ── */}
      {tab === 'satellites' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {SATELLITE_FEEDS.map(sat => (
            <div key={sat.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{sat.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>{sat.type}</div>
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: sat.status === 'operational' ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)',
                  color: sat.status === 'operational' ? 'var(--green)' : 'var(--muted)',
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  {sat.status === 'operational' ? '● Online' : '○ Standby'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  ['Órbita',    sat.orbit],
                  ['Altitude',  `${sat.alt_km.toLocaleString()} km`],
                  ['Período',   sat.period_min < 1440 ? `${sat.period_min} min` : '24h (GEO)'],
                  ['Cobertura', sat.coverage],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--muted)' }}>{l}</span>
                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{v}</span>
                  </div>
                ))}
                {sat.last_pass && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Última passagem</span>
                    <span style={{ color: 'var(--green)' }}>{timeSince(sat.last_pass)}</span>
                  </div>
                )}
                {sat.next_pass && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Próxima passagem</span>
                    <span style={{ color: 'var(--accent2)' }}>{timeUntil(sat.next_pass)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Alertas Terrestres ── */}
      {tab === 'earth' && (
        <div>
          <div style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            💡 <strong style={{ color: 'var(--accent2)' }}>Impacto Terrestre:</strong> A mesma plataforma que coordena a tripulação em Marte pode ser implantada em zonas de desastre, regiões sem cobertura e operações humanitárias. Os alertas abaixo simulam dados reais de sensoriamento remoto por satélite.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {EARTH_ALERTS.map(alert => (
              <div key={alert.id} style={{ background: 'var(--surface)', border: `1px solid ${SEV_COLOR[alert.severity]}40`, borderLeft: `4px solid ${SEV_COLOR[alert.severity]}`, borderRadius: 10, padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{TYPE_ICONS[alert.type]}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{alert.region}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
                        Fonte: {alert.source} · {timeSince(alert.detected)}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    background: `${SEV_COLOR[alert.severity]}18`,
                    color: SEV_COLOR[alert.severity],
                    textTransform: 'uppercase', letterSpacing: 1,
                  }}>
                    {alert.severity === 'critical' ? '⚠️ Crítico' : '⚡ Aviso'}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Dados Climáticos ── */}
      {tab === 'weather' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {WEATHER_STATIONS.map(w => (
              <div key={w.city} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{w.city}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>{w.lat}°, {w.lon}°</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent2)', lineHeight: 1, marginBottom: 4 }}>{w.temp}°C</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text)', marginBottom: '1rem' }}>{w.condition}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--muted)' }}>💧 Umidade</span>
                    <span style={{ fontWeight: 600 }}>{w.humidity}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--muted)' }}>💨 Vento</span>
                    <span style={{ fontWeight: 600 }}>{w.wind} km/h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'center' }}>
            Dados via satélite meteorológico ORBIT-WX-04 · GEO 35.786 km · Cobertura: Atlântico Sul
          </div>
        </div>
      )}
    </div>
  );
}
