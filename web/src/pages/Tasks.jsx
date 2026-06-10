import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLUMNS = [
  { key: 'todo',        label: 'A Fazer',      color: 'var(--muted)'  },
  { key: 'in_progress', label: 'Em Andamento', color: 'var(--orange)' },
  { key: 'done',        label: 'Concluído',    color: 'var(--green)'  },
];

const PRIO_COLOR = { p1: 'var(--red)', p2: 'var(--orange)', p3: 'var(--muted)' };
const PRIO_LABEL = { p1: 'P1 — Crítica', p2: 'P2 — Normal', p3: 'P3 — Baixa' };

const MODAL_BG = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: '1rem',
};

const INPUT_STYLE = {
  width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--surface2)',
  color: 'var(--text)', fontSize: '0.9rem', boxSizing: 'border-box',
};

/* ─── Nova Tarefa Modal ─── */
function NewTaskModal({ crew, onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'p2', assignee_id: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setErr('Título é obrigatório.'); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/tasks', form);
      onCreate(data);
      onClose();
    } catch (e) { setErr(e.response?.data?.error || 'Erro ao criar tarefa'); }
    finally { setSaving(false); }
  }

  return (
    <div style={MODAL_BG} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Nova Tarefa</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>TÍTULO *</label>
            <input style={INPUT_STYLE} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Descreva a tarefa..." autoFocus />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>DESCRIÇÃO</label>
            <textarea style={{ ...INPUT_STYLE, minHeight: 80, resize: 'vertical' }} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Contexto adicional, critérios de aceite..." />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>PRIORIDADE</label>
              <select style={INPUT_STYLE} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="p1">P1 — Crítica</option>
                <option value="p2">P2 — Normal</option>
                <option value="p3">P3 — Baixa</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>RESPONSÁVEL</label>
              <select style={INPUT_STYLE} value={form.assignee_id} onChange={e => setForm(f => ({ ...f, assignee_id: e.target.value }))}>
                <option value="">Sem responsável</option>
                {crew.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          {err && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--red)', borderRadius: 8, padding: '0.6rem', fontSize: '0.85rem', color: 'var(--red)' }}>{err}</div>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.65rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '0.65rem', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Criando...' : '+ Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Task Detail Modal (Jira-like) ─── */
function TaskDetailModal({ task, crew, onClose, onUpdate }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [moving, setMoving] = useState(false);
  const commentEndRef = useRef(null);

  useEffect(() => {
    api.get(`/tasks/${task.id}/comments`).then(({ data }) => setComments(data)).catch(() => {});
  }, [task.id]);

  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  async function move(status) {
    setMoving(true);
    try {
      const { data } = await api.put(`/tasks/${task.id}`, { status });
      onUpdate(data);
    } finally { setMoving(false); }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/tasks/${task.id}/comments`, { text: newComment.trim() });
      setComments(prev => [...prev, data]);
      setNewComment('');
    } finally { setSending(false); }
  }

  const statusIdx = COLUMNS.findIndex(c => c.key === task.status);
  const prevCol = COLUMNS[statusIdx - 1];
  const nextCol = COLUMNS[statusIdx + 1];

  return (
    <div className="modal-overlay" style={MODAL_BG} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
        width: '100%', maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: PRIO_COLOR[task.priority], background: `${PRIO_COLOR[task.priority]}18`, padding: '2px 8px', borderRadius: 4, letterSpacing: 1 }}>
                  {task.priority?.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4 }}>
                  {COLUMNS.find(c => c.key === task.status)?.label}
                </span>
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>{task.title}</h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.5rem', cursor: 'pointer', flexShrink: 0 }}>×</button>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {task.assignee_name && (
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                👤 <span style={{ color: 'var(--text)' }}>{task.assignee_name}</span>
              </div>
            )}
            {task.created_by_name && (
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Criado por <span style={{ color: 'var(--text)' }}>{task.created_by_name}</span>
              </div>
            )}
            {task.created_at && (
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                {new Date(task.created_at).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '0.75rem', lineHeight: 1.6 }}>{task.description}</p>
          )}

          {/* Move buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            {prevCol && (
              <button onClick={() => move(prevCol.key)} disabled={moving}
                style={{ padding: '0.4rem 0.9rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                ◀ {prevCol.label}
              </button>
            )}
            {nextCol && (
              <button onClick={() => move(nextCol.key)} disabled={moving}
                style={{ padding: '0.4rem 0.9rem', borderRadius: 6, border: 'none', background: nextCol.key === 'done' ? 'rgba(34,197,94,0.15)' : 'rgba(14,165,233,0.15)', color: nextCol.key === 'done' ? 'var(--green)' : 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                {nextCol.label} ▶
              </button>
            )}
            {task.status === 'done' && <span style={{ fontSize: '0.8rem', color: 'var(--green)', padding: '0.4rem 0.5rem' }}>✓ Concluída</span>}
          </div>
        </div>

        {/* Comments section — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.75rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: '1rem' }}>
            💬 Comentários ({comments.length})
          </div>

          {comments.length === 0 && (
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', padding: '1.5rem 0' }}>
              Nenhum comentário ainda. Seja o primeiro.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: 'var(--surface2)',
                  border: '1px solid var(--accent)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0,
                }}>
                  {c.user_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent2)' }}>{c.user_name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                      {new Date(c.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div style={{
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: '0 8px 8px 8px', padding: '0.6rem 0.85rem',
                    fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text)',
                    whiteSpace: 'pre-wrap',
                  }}>{c.text}</div>
                </div>
              </div>
            ))}
            <div ref={commentEndRef} />
          </div>
        </div>

        {/* Add comment */}
        <div style={{ padding: '1rem 1.75rem 1.5rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <form onSubmit={submitComment} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: 'var(--surface2)',
              border: '1px solid var(--accent)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitComment(e); }}
                placeholder="Adicione um comentário... (Ctrl+Enter para enviar)"
                style={{
                  ...INPUT_STYLE, minHeight: 60, resize: 'none',
                  display: 'block', lineHeight: 1.5,
                }}
              />
            </div>
            <button type="submit" disabled={sending || !newComment.trim()}
              style={{
                padding: '0.6rem 1rem', borderRadius: 8, border: 'none',
                background: newComment.trim() ? 'var(--accent)' : 'var(--surface2)',
                color: newComment.trim() ? '#fff' : 'var(--muted)',
                cursor: newComment.trim() ? 'pointer' : 'default',
                fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap',
                opacity: sending ? 0.7 : 1,
              }}>
              {sending ? '...' : 'Enviar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── Task Card ─── */
function TaskCard({ task, onMove, onOpen }) {
  return (
    <div
      onClick={() => onOpen(task)}
      style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderLeft: `3px solid ${PRIO_COLOR[task.priority]}`,
        borderRadius: 8, padding: '0.85rem', cursor: 'pointer',
        transition: 'border-color 0.15s, transform 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.4 }}>{task.title}</span>
        <span style={{ fontSize: '0.68rem', color: PRIO_COLOR[task.priority], flexShrink: 0, fontWeight: 700, letterSpacing: 0.5 }}>
          {task.priority?.toUpperCase()}
        </span>
      </div>
      {task.assignee_name && (
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>👤 {task.assignee_name}</div>
      )}
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
        {task.status !== 'todo' && (
          <MoveBtn label="◀ Voltar" onClick={() => onMove(task.id, task.status === 'done' ? 'in_progress' : 'todo')} />
        )}
        {task.status !== 'done' && (
          <MoveBtn label={task.status === 'todo' ? 'Iniciar ▶' : 'Concluir ✓'} accent onClick={() => onMove(task.id, task.status === 'todo' ? 'in_progress' : 'done')} />
        )}
        <MoveBtn label="💬 Detalhe" onClick={() => onOpen(task)} muted />
      </div>
    </div>
  );
}

function MoveBtn({ label, onClick, accent, muted }) {
  return (
    <button onClick={onClick} style={{
      fontSize: '0.7rem', padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
      background: accent ? 'rgba(14,165,233,0.15)' : 'var(--surface)',
      color: accent ? 'var(--accent)' : muted ? 'var(--muted)' : 'var(--muted)',
      border: `1px solid ${accent ? 'var(--accent)' : 'var(--border)'}`,
      fontWeight: accent ? 700 : 400,
    }}>{label}</button>
  );
}

/* ─── Main Page ─── */
export default function Tasks() {
  const [tasks,      setTasks]      = useState([]);
  const [crew,       setCrew]       = useState([]);
  const [showNew,    setShowNew]    = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/tasks'), api.get('/crew')]).then(([t, c]) => {
      setTasks(t.data); setCrew(c.data);
    });
  }, []);

  function handleMove(id, status) {
    api.put(`/tasks/${id}`, { status }).then(({ data }) =>
      setTasks(prev => prev.map(t => t.id === id ? data : t))
    );
    // Atualiza o modal se estiver aberto
    if (activeTask?.id === id) setActiveTask(prev => ({ ...prev, status }));
  }

  function handleUpdate(updated) {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setActiveTask(updated);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Coordenação</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Tarefas</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>{tasks.length} tarefa{tasks.length !== 1 ? 's' : ''} · clique num card para ver detalhes e comentários</p>
        </div>
        <button onClick={() => setShowNew(true)} style={{ padding: '0.6rem 1.25rem', background: 'var(--accent)', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
          + Nova Tarefa
        </button>
      </div>

      {/* Kanban */}
      <div className="kanban-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: col.color }}>{col.label}</span>
                <span style={{ background: 'var(--surface2)', color: 'var(--muted)', fontSize: '0.72rem', padding: '2px 8px', borderRadius: 20 }}>{colTasks.length}</span>
              </div>
              <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 120 }}>
                {colTasks.map(task => (
                  <TaskCard key={task.id} task={task} onMove={handleMove} onOpen={setActiveTask} />
                ))}
                {colTasks.length === 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', padding: '1.5rem 0', opacity: 0.5 }}>Vazio</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showNew && (
        <NewTaskModal crew={crew} onClose={() => setShowNew(false)} onCreate={t => setTasks(prev => [t, ...prev])} />
      )}

      {activeTask && (
        <TaskDetailModal task={activeTask} crew={crew} onClose={() => setActiveTask(null)} onUpdate={handleUpdate} />
      )}
    </div>
  );
}
