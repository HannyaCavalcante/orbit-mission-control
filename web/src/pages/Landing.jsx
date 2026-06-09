import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────── STYLE INJECTION ─────────── */
const CSS = `
@keyframes twinkle {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:0.2; transform:scale(0.5); }
}
@keyframes orbit-earth {
  from { transform: rotate(0deg) translateX(var(--r)) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(var(--r)) rotate(-360deg); }
}
@keyframes orbit-moon {
  from { transform: rotate(0deg) translateX(38px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(38px) rotate(-360deg); }
}
@keyframes float-mars {
  0%,100% { transform: translateY(0px) rotate(0deg); }
  33%     { transform: translateY(-18px) rotate(3deg); }
  66%     { transform: translateY(10px) rotate(-2deg); }
}
@keyframes float-saturn {
  0%,100% { transform: translateY(0px) rotate(-15deg); }
  50%     { transform: translateY(-22px) rotate(-12deg); }
}
@keyframes galaxy-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes nebula-pulse {
  0%,100% { opacity:0.18; transform:scale(1); }
  50%     { opacity:0.28; transform:scale(1.08); }
}
@keyframes shooting-star {
  0%   { transform:translateX(0) translateY(0) rotate(215deg); opacity:1; }
  100% { transform:translateX(-600px) translateY(300px) rotate(215deg); opacity:0; }
}
@keyframes fadeInUp {
  from { opacity:0; transform:translateY(30px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes pulse-ring {
  0%   { transform:scale(1); opacity:0.6; }
  100% { transform:scale(2.2); opacity:0; }
}
@keyframes satellite-orbit {
  from { transform: rotate(0deg) translateX(160px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(160px) rotate(-360deg); }
}
`;

/* ─────────── CANVAS STARFIELD ─────────── */
function StarCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx    = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Stars
    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.6 + 0.2,
      speed: Math.random() * 0.0003 + 0.00005,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.9 ? '#7dd3fc'
           : Math.random() > 0.85 ? '#fcd34d'
           : '#fff',
    }));

    // Shooting stars
    const shoots = Array.from({ length: 4 }, () => ({
      x: 0, y: 0, len: 0, opacity: 0, timer: Math.random() * 400,
    }));

    function spawnShoot(s) {
      s.x = Math.random() * 0.8 + 0.1;
      s.y = Math.random() * 0.4;
      s.len = Math.random() * 120 + 60;
      s.vx = -(Math.random() * 4 + 3);
      s.vy = Math.random() * 3 + 1.5;
      s.opacity = 1;
      s.timer = Math.random() * 500 + 200;
    }

    let t = 0;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      t++;

      // Stars
      stars.forEach(s => {
        const bri = 0.4 + 0.6 * Math.sin(s.phase + t * s.speed * 60);
        ctx.globalAlpha = bri;
        ctx.fillStyle   = s.color;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.2) {
          ctx.globalAlpha = bri * 0.25;
          ctx.beginPath();
          ctx.arc(s.x * w, s.y * h, s.r * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Shooting stars
      shoots.forEach(s => {
        s.timer--;
        if (s.timer <= 0 && s.opacity <= 0) spawnShoot(s);
        if (s.opacity > 0) {
          const sx = s.x * w, sy = s.y * h;
          const grad = ctx.createLinearGradient(sx, sy, sx + s.len * (s.vx/5), sy + s.len * (s.vy/5));
          grad.addColorStop(0, `rgba(255,255,255,${s.opacity})`);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.globalAlpha = 1;
          ctx.strokeStyle = grad;
          ctx.lineWidth   = 1.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + s.len * (s.vx/5), sy + s.len * (s.vy/5));
          ctx.stroke();
          s.x += s.vx / w * 0.4;
          s.y += s.vy / h * 0.4;
          s.opacity -= 0.012;
        }
      });

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />;
}

/* ─────────── PLANET COMPONENTS ─────────── */
function Earth({ style }) {
  return (
    <div style={{ position:'relative', ...style }}>
      {/* Pulse ring */}
      <div style={{ position:'absolute', inset:-8, borderRadius:'50%', border:'1px solid rgba(59,130,246,0.4)', animation:'pulse-ring 2s ease-out infinite' }} />
      <div style={{ position:'absolute', inset:-4, borderRadius:'50%', border:'1px solid rgba(59,130,246,0.25)', animation:'pulse-ring 2s ease-out infinite 0.6s' }} />
      {/* Planet */}
      <div style={{
        width:64, height:64, borderRadius:'50%',
        background:'radial-gradient(circle at 35% 35%, #60a5fa, #1d4ed8 50%, #1e3a8a)',
        boxShadow:'0 0 30px rgba(59,130,246,0.5), inset -12px -8px 20px rgba(0,0,0,0.5)',
        position:'relative', overflow:'hidden',
      }}>
        {/* Continents */}
        <div style={{ position:'absolute', top:'20%', left:'15%', width:'35%', height:'28%', borderRadius:'50% 60% 40% 70%', background:'rgba(34,197,94,0.7)' }} />
        <div style={{ position:'absolute', top:'45%', left:'40%', width:'25%', height:'20%', borderRadius:'40% 60% 50% 50%', background:'rgba(34,197,94,0.6)' }} />
        <div style={{ position:'absolute', top:'30%', right:'10%', width:'18%', height:'30%', borderRadius:'50%', background:'rgba(34,197,94,0.5)' }} />
        {/* Atmosphere glow */}
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, rgba(147,197,253,0.3), transparent 60%)' }} />
        {/* Cloud band */}
        <div style={{ position:'absolute', top:'55%', left:0, right:0, height:'12%', background:'rgba(255,255,255,0.15)', borderRadius:4 }} />
      </div>
      <div style={{ textAlign:'center', marginTop:6, fontSize:'0.65rem', color:'#60a5fa', letterSpacing:2, fontWeight:700 }}>TERRA</div>
    </div>
  );
}

function Mars({ style }) {
  return (
    <div style={{ position:'relative', ...style }}>
      <div style={{
        width:48, height:48, borderRadius:'50%',
        background:'radial-gradient(circle at 35% 30%, #f87171, #dc2626 45%, #7f1d1d)',
        boxShadow:'0 0 25px rgba(239,68,68,0.5), inset -10px -8px 18px rgba(0,0,0,0.6)',
        position:'relative', overflow:'hidden',
      }}>
        {/* Polar ice cap */}
        <div style={{ position:'absolute', top:'5%', left:'25%', width:'50%', height:'22%', borderRadius:'50%', background:'rgba(255,255,255,0.5)' }} />
        {/* Valles Marineris hint */}
        <div style={{ position:'absolute', top:'48%', left:'10%', right:'10%', height:'8%', background:'rgba(0,0,0,0.35)', borderRadius:4 }} />
        {/* Highlight */}
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'radial-gradient(circle at 35% 30%, rgba(251,191,36,0.2), transparent 60%)' }} />
      </div>
      <div style={{ textAlign:'center', marginTop:6, fontSize:'0.65rem', color:'#f87171', letterSpacing:2, fontWeight:700 }}>MARTE</div>
    </div>
  );
}

function Saturn({ style }) {
  return (
    <div style={{ position:'relative', ...style }}>
      <div style={{ position:'relative', width:72, height:72 }}>
        {/* Rings */}
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          width:110, height:28,
          transform:'translate(-50%,-50%) rotateX(70deg)',
          border:'6px solid rgba(251,191,36,0.4)',
          borderRadius:'50%',
        }} />
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          width:130, height:34,
          transform:'translate(-50%,-50%) rotateX(70deg)',
          border:'3px solid rgba(251,191,36,0.2)',
          borderRadius:'50%',
        }} />
        {/* Planet */}
        <div style={{
          width:72, height:72, borderRadius:'50%',
          background:'radial-gradient(circle at 38% 35%, #fde68a, #f59e0b 40%, #92400e)',
          boxShadow:'0 0 28px rgba(245,158,11,0.4), inset -14px -10px 22px rgba(0,0,0,0.5)',
          position:'relative', overflow:'hidden',
        }}>
          {/* Bands */}
          {[20,35,50,65,78].map(t => (
            <div key={t} style={{ position:'absolute', top:`${t}%`, left:0, right:0, height:'6%', background:'rgba(0,0,0,0.12)' }} />
          ))}
          <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.2), transparent 55%)' }} />
        </div>
      </div>
      <div style={{ textAlign:'center', marginTop:2, fontSize:'0.65rem', color:'#fbbf24', letterSpacing:2, fontWeight:700 }}>SATURNO</div>
    </div>
  );
}

function Galaxy({ style }) {
  return (
    <div style={{ ...style, pointerEvents:'none' }}>
      {/* Outer arms */}
      <div style={{
        width:320, height:320, borderRadius:'50%',
        background:'conic-gradient(from 0deg, transparent 0%, rgba(99,102,241,0.08) 15%, transparent 30%, rgba(167,139,250,0.06) 45%, transparent 60%, rgba(99,102,241,0.08) 75%, transparent 90%)',
        animation:'galaxy-spin 120s linear infinite',
        filter:'blur(8px)',
      }} />
      {/* Inner arms */}
      <div style={{
        position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:180, height:180, borderRadius:'50%',
        background:'conic-gradient(from 90deg, transparent 0%, rgba(139,92,246,0.15) 20%, transparent 40%, rgba(196,181,253,0.1) 60%, transparent 80%)',
        animation:'galaxy-spin 60s linear infinite reverse',
        filter:'blur(4px)',
      }} />
      {/* Core */}
      <div style={{
        position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:60, height:60, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(196,181,253,0.5) 0%, rgba(139,92,246,0.2) 50%, transparent 80%)',
        filter:'blur(6px)',
      }} />
    </div>
  );
}

/* ─────────── SIGNAL LINE ─────────── */
function SignalLine() {
  return (
    <svg viewBox="0 0 500 60" style={{ width:'100%', maxWidth:500, overflow:'visible' }}>
      <defs>
        <linearGradient id="sigGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
          <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8"/>
        </linearGradient>
      </defs>
      {/* Dashed signal line */}
      <line x1="30" y1="30" x2="470" y2="30" stroke="url(#sigGrad)" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.7"/>
      {/* Pulses */}
      {[80,170,260,350,430].map((x,i) => (
        <circle key={x} cx={x} cy="30" r="2.5" fill="#0ea5e9" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" begin={`${i*0.4}s`} repeatCount="indefinite"/>
        </circle>
      ))}
      <text x="15" y="52" fontSize="9" fill="#60a5fa" fontFamily="monospace">TERRA</text>
      <text x="450" y="52" fontSize="9" fill="#f87171" fontFamily="monospace">MARTE</text>
      <text x="225" y="20" fontSize="8" fill="#94a3b8" fontFamily="monospace" textAnchor="middle">3–22 MIN</text>
    </svg>
  );
}

/* ─────────── DATA ─────────── */
const TEAM = [
  { name:'Hannya Cavalcante', role:'Planetary Geologist & Dev' },
  { name:'Mariana Nikaido',   role:'Aerospace Engineer & Dev'  },
  { name:'Gabriel Oliveira',  role:'Emergency Physician & Dev' },
];

const TECH = [
  { icon:'⚛️', label:'React + Vite',       desc:'Interface web'    },
  { icon:'📱', label:'React Native / Expo', desc:'App mobile'       },
  { icon:'🟢', label:'Node.js + Express',   desc:'API REST'         },
  { icon:'🔐', label:'JWT Auth',            desc:'Autenticação'     },
  { icon:'🛰️', label:'Latência orbital',   desc:'3–22 min'         },
  { icon:'🗃️', label:'Demo em memória',    desc:'Sem banco requerido' },
];

const FEATURES = [
  { icon:'📡', title:'Comunicação Assíncrona',     desc:'Mensagens com fila de entrega tolerante à latência extrema. Status: enviada → em trânsito → entregue → lida.' },
  { icon:'👨‍🚀', title:'Monitoramento da Tripulação', desc:'Sinais vitais em tempo real (FC, hidratação, sono, O₂). Atualização a cada 15 segundos via simulação.' },
  { icon:'✅', title:'Gestão de Tarefas',           desc:'Kanban P1–P3, responsáveis, comentários colaborativos estilo Jira e movimentação entre colunas.' },
  { icon:'🚨', title:'Sistema de Alertas',          desc:'Alertas críticos e de aviso com resolução rastreável e registro automático no log da missão.' },
  { icon:'⚡', title:'Recursos da Missão',          desc:'O₂, água, energia solar, suprimentos e combustível com taxas de consumo e limiares de alerta dinâmicos.' },
  { icon:'🌡️', title:'Clima Marciano',             desc:'Temperatura, vento, pressão atmosférica e tempestades de poeira simulados em tempo real.' },
  { icon:'🛰️', title:'Latência Orbital Real',      desc:'Cálculo dinâmico: distância oscila de 56M a 401M km, delay de 3 a 22 minutos por física orbital.' },
  { icon:'📋', title:'Log da Missão',               desc:'Timeline cronológica de todos os eventos da missão — mensagens, tarefas, alertas, atualizações de tripulação.' },
];

const DUAL_USE = [
  { icon:'🌊', scenario:'Zonas de Desastre',      text:'A mesma fila assíncrona que suporta 22 min de latência funciona em regiões sem cobertura após enchentes, terremotos ou furacões.' },
  { icon:'🌿', scenario:'Regiões Remotas',         text:'Comunidades indígenas, estações na Antártida ou campos de extração beneficiam-se do mesmo protocolo resiliente.' },
  { icon:'🚁', scenario:'Operações Humanitárias',  text:'Coordenação de equipes distribuídas com status em tempo real, tarefas priorizadas e histórico de decisões sem infraestrutura central.' },
  { icon:'🛡️', scenario:'Defesa Civil',            text:'Alertas de emergência, gestão de recursos críticos e monitoramento de pessoal em campo aplicam os mesmos módulos do sistema.' },
];

/* ─────────── MAIN ─────────── */
export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight:'100vh', background:'#050a14', color:'#e2e8f0', fontFamily:'inherit', overflowX:'hidden' }}>
      <style>{CSS}</style>

      {/* ── HERO ── */}
      <section style={{
        minHeight:'100vh', position:'relative',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        textAlign:'center', padding:'2rem', overflow:'hidden',
      }}>
        {/* Canvas starfield */}
        <StarCanvas />

        {/* Nebulae */}
        <div style={{ position:'absolute', top:'-10%', left:'-15%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', animation:'nebula-pulse 8s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'5%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)', animation:'nebula-pulse 12s ease-in-out infinite 3s', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'30%', right:'5%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)', animation:'nebula-pulse 10s ease-in-out infinite 1s', pointerEvents:'none' }} />

        {/* Galaxy background */}
        <Galaxy style={{ position:'absolute', top:'5%', right:'8%', width:320, height:320 }} />

        {/* Saturn — top left */}
        <div style={{ position:'absolute', top:'8%', left:'6%', animation:'float-saturn 14s ease-in-out infinite', zIndex:1 }}>
          <Saturn />
        </div>

        {/* Mars — right side */}
        <div style={{ position:'absolute', top:'20%', right:'10%', animation:'float-mars 10s ease-in-out infinite 2s', zIndex:1 }}>
          <Mars />
        </div>

        {/* Earth with orbiting moon — bottom left */}
        <div style={{ position:'absolute', bottom:'18%', left:'8%', zIndex:1 }}>
          <div style={{ position:'relative', width:90, height:90, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {/* Orbit path */}
            <div style={{ position:'absolute', width:90, height:90, borderRadius:'50%', border:'1px dashed rgba(59,130,246,0.25)' }} />
            <Earth style={{}} />
            {/* Moon */}
            <div style={{
              position:'absolute', top:'50%', left:'50%',
              marginTop:-5, marginLeft:-5,
              animation:'orbit-moon 6s linear infinite',
              zIndex:2,
            }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'radial-gradient(circle at 35% 35%, #e2e8f0, #94a3b8)', boxShadow:'0 0 6px rgba(226,232,240,0.4)' }} />
            </div>
          </div>
        </div>

        {/* Signal line between Earth and Mars */}
        <div style={{ position:'absolute', bottom:'28%', left:0, right:0, display:'flex', justifyContent:'center', padding:'0 2rem', pointerEvents:'none' }}>
          <SignalLine />
        </div>

        {/* Satellite orbiting */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:320, height:320, zIndex:0, pointerEvents:'none', opacity:0.35 }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', marginTop:-4, marginLeft:-4, animation:'satellite-orbit 20s linear infinite' }}>
            <div style={{ fontSize:'0.8rem' }}>🛰️</div>
          </div>
        </div>

        {/* Hero content */}
        <div style={{ position:'relative', zIndex:2, animation:'fadeInUp 1s ease both' }}>
          <div style={{ fontSize:'0.72rem', color:'var(--accent)', letterSpacing:5, textTransform:'uppercase', marginBottom:'1.5rem', animation:'fadeInUp 0.8s ease both 0.2s', opacity:0 }}>
            FIAP — Global Solution 2026 · Turma 2TWDOR
          </div>
          <div style={{ fontSize:'clamp(3.5rem,12vw,7rem)', fontWeight:900, letterSpacing:'0.12em', lineHeight:1, marginBottom:'0.75rem', animation:'fadeInUp 0.8s ease both 0.4s', opacity:0,
            background:'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 40%, #0ea5e9 70%, #0284c7 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            filter:'drop-shadow(0 0 40px rgba(14,165,233,0.5))',
          }}>
            ◉ ORBIT
          </div>
          <div style={{ fontSize:'clamp(0.9rem,2.5vw,1.3rem)', fontWeight:700, color:'rgba(255,255,255,0.85)', marginBottom:'1rem', letterSpacing:3, animation:'fadeInUp 0.8s ease both 0.6s', opacity:0 }}>
            MISSION CONTROL
          </div>
          <p style={{ fontSize:'clamp(0.85rem,1.8vw,1.05rem)', color:'var(--muted)', maxWidth:580, margin:'0 auto 2.5rem', lineHeight:1.8, animation:'fadeInUp 0.8s ease both 0.8s', opacity:0 }}>
            Plataforma integrada de comunicação e coordenação para a primeira missão humana a Marte —
            e para qualquer equipe operando em condições extremas aqui na Terra.
          </p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap', animation:'fadeInUp 0.8s ease both 1s', opacity:0 }}>
            <button onClick={() => navigate('/login')} style={{
              padding:'0.9rem 2.5rem', background:'linear-gradient(135deg, #0ea5e9, #0284c7)',
              color:'#fff', borderRadius:10, fontWeight:800, fontSize:'1rem', border:'none', cursor:'pointer',
              boxShadow:'0 0 40px rgba(14,165,233,0.45)', letterSpacing:1,
              transition:'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.boxShadow='0 0 60px rgba(14,165,233,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 0 40px rgba(14,165,233,0.45)'; }}
            >
              Acessar o Sistema →
            </button>
            <button onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior:'smooth' })} style={{
              padding:'0.9rem 2rem', background:'rgba(255,255,255,0.05)', color:'var(--muted)',
              borderRadius:10, fontWeight:600, fontSize:'1rem', border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer',
              backdropFilter:'blur(4px)', transition:'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='var(--muted)'; }}
            >
              Saiba mais ↓
            </button>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:'3rem', justifyContent:'center', marginTop:'4rem', flexWrap:'wrap', animation:'fadeInUp 0.8s ease both 1.2s', opacity:0 }}>
            {[['3–22','min de latência'],['7','tripulantes'],['5','recursos'],['Sol 47','missão ativa']].map(([v,l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.8rem', fontWeight:900, background:'linear-gradient(135deg,#7dd3fc,#38bdf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{v}</div>
                <div style={{ fontSize:'0.68rem', color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── O DESAFIO ── */}
      <section id="sobre" style={{ maxWidth:960, margin:'0 auto', padding:'6rem 2rem', position:'relative' }}>
        {/* Mini galaxy decoration */}
        <Galaxy style={{ position:'absolute', top:-60, right:-80, width:220, height:220, opacity:0.5 }} />
        <Tag>O Desafio</Tag>
        <h2 style={{ fontSize:'clamp(1.5rem,4vw,2.5rem)', fontWeight:800, marginBottom:'1.5rem', lineHeight:1.2 }}>
          Projetado para Marte.<br />
          <span style={{ background:'linear-gradient(90deg,#38bdf8,#0ea5e9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Construído para a Terra.
          </span>
        </h2>
        <p style={{ fontSize:'1.05rem', color:'var(--muted)', lineHeight:1.8, maxWidth:720, marginBottom:'1rem' }}>
          Quando uma tripulação está em Marte, cada decisão precisa ser tomada com os dados disponíveis dentro da nave.
          O sinal leva entre <strong style={{ color:'#fff' }}>3 e 22 minutos</strong> para chegar — dependendo da posição dos planetas.
          Não existe suporte instantâneo. Não existe chamada de vídeo.
        </p>
        <p style={{ fontSize:'1.05rem', color:'var(--muted)', lineHeight:1.8, maxWidth:720 }}>
          Uma plataforma projetada para funcionar com comunicação intermitente é exatamente o que
          <strong style={{ color:'#fff' }}> comunidades sem infraestrutura precisam na Terra</strong> —
          zonas de desastre, regiões remotas, operações humanitárias em campo.
        </p>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section style={{ background:'rgba(14,165,233,0.04)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:960, margin:'0 auto', padding:'5rem 2rem' }}>
          <Tag>Plataforma</Tag>
          <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:800, marginBottom:'3rem' }}>Funcionalidades do sistema</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.5rem' }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem', transition:'border-color 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(14,165,233,0.4)'; e.currentTarget.style.transform='translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}
              >
                <div style={{ fontSize:'1.8rem', marginBottom:'0.75rem' }}>{f.icon}</div>
                <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'0.5rem', color:'#fff' }}>{f.title}</div>
                <div style={{ fontSize:'0.83rem', color:'var(--muted)', lineHeight:1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACTO TERRA ── */}
      <section style={{ maxWidth:960, margin:'0 auto', padding:'5rem 2rem', position:'relative' }}>
        <div style={{ position:'absolute', bottom:-40, left:-60, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
        <Tag>Impacto Terrestre</Tag>
        <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:800, marginBottom:'0.75rem' }}>O mesmo sistema. Outros contextos.</h2>
        <p style={{ color:'var(--muted)', marginBottom:'3rem', fontSize:'1rem', lineHeight:1.7 }}>
          A arquitetura tolerante a falhas que garante comunicação em Marte resolve problemas reais e urgentes aqui.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1.25rem' }}>
          {DUAL_USE.map(d => (
            <div key={d.scenario} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(14,165,233,0.4)'; e.currentTarget.style.transform='translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}
            >
              <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>{d.icon}</div>
              <div style={{ fontWeight:700, color:'var(--accent2)', marginBottom:'0.5rem', fontSize:'0.9rem' }}>{d.scenario}</div>
              <div style={{ fontSize:'0.82rem', color:'var(--muted)', lineHeight:1.6 }}>{d.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STACK ── */}
      <section style={{ background:'rgba(14,165,233,0.04)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:960, margin:'0 auto', padding:'5rem 2rem' }}>
          <Tag>Arquitetura</Tag>
          <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:800, marginBottom:'3rem' }}>Stack tecnológica</h2>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem' }}>
            {TECH.map(t => (
              <div key={t.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'1rem 1.5rem', display:'flex', alignItems:'center', gap:'0.75rem', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(14,165,233,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; }}
              >
                <span style={{ fontSize:'1.5rem' }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.9rem' }}>{t.label}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EQUIPE ── */}
      <section style={{ maxWidth:960, margin:'0 auto', padding:'5rem 2rem' }}>
        <Tag>Equipe</Tag>
        <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:800, marginBottom:'3rem' }}>Tripulação 2TWDOR</h2>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'1.5rem' }}>
          {TEAM.map((m,i) => (
            <div key={m.name} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem 2rem', display:'flex', alignItems:'center', gap:'1rem', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(14,165,233,0.5)'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}
            >
              <div style={{ width:50, height:50, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'1.3rem', color:'var(--accent)',
                background:`linear-gradient(135deg, ${['rgba(14,165,233,0.2)','rgba(139,92,246,0.2)','rgba(34,197,94,0.2)'][i]}, rgba(255,255,255,0.05))`,
                border:'2px solid var(--accent)',
              }}>
                {m.name[0]}
              </div>
              <div>
                <div style={{ fontWeight:700, color:'#fff' }}>{m.name}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--muted)' }}>{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ position:'relative', textAlign:'center', padding:'6rem 2rem', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 50%, rgba(14,165,233,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
        {/* Mini planets */}
        <div style={{ position:'absolute', top:'10%', left:'5%', animation:'float-mars 12s ease-in-out infinite', opacity:0.5 }}><Mars /></div>
        <div style={{ position:'absolute', bottom:'15%', right:'6%', animation:'float-saturn 16s ease-in-out infinite 3s', opacity:0.4 }}><Saturn /></div>
        <Galaxy style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:400, height:400, opacity:0.3 }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:'0.72rem', color:'var(--accent)', letterSpacing:4, marginBottom:'1rem', textTransform:'uppercase' }}>PRONTO PARA DECOLAR</div>
          <h2 style={{ fontSize:'clamp(1.5rem,4vw,2.5rem)', fontWeight:800, marginBottom:'2rem' }}>Acesse o Mission Control</h2>
          <button onClick={() => navigate('/login')} style={{
            padding:'1rem 3rem', background:'linear-gradient(135deg, #0ea5e9, #0284c7)',
            color:'#fff', borderRadius:10, fontWeight:800, fontSize:'1.05rem', border:'none', cursor:'pointer',
            boxShadow:'0 0 50px rgba(14,165,233,0.4)', letterSpacing:1, transition:'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform='scale(1.06)'; e.currentTarget.style.boxShadow='0 0 70px rgba(14,165,233,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 0 50px rgba(14,165,233,0.4)'; }}
          >
            Entrar no Sistema →
          </button>
          <div style={{ marginTop:'3rem', fontSize:'0.72rem', color:'var(--muted)' }}>
            ORBIT · FIAP Global Solution 2026 · Turma 2TWDOR
          </div>
        </div>
      </section>
    </div>
  );
}

function Tag({ children }) {
  return <div style={{ fontSize:'0.68rem', color:'var(--accent)', letterSpacing:3, textTransform:'uppercase', marginBottom:'1rem', fontWeight:700 }}>{children}</div>;
}
