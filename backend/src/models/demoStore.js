// In-memory store — ativo quando DATABASE_URL não está configurado
const crypto = require('crypto');
function id()  { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

// Sol marciano: ~24h 37min = 88620s
const MISSION_START_EPOCH = Date.now() - (47 * 88620000); // missão começou há 47 sols
function currentSol() { return Math.floor((Date.now() - MISSION_START_EPOCH) / 88620000); }

const USERS = [
  { id: 'u-control', name: 'Control Houston',      email: 'houston@orbit.earth',  role: 'control', position: 'Mission Control',        password: '' },
  { id: 'u-sarah',   name: 'Cmd. Sarah Chen',      email: 'sarah@orbit.space',    role: 'crew',    position: 'Commander',               password: '' },
  { id: 'u-marcus',  name: 'Dr. Marcus Webb',      email: 'marcus@orbit.space',   role: 'crew',    position: 'Medical Officer',          password: '' },
  { id: 'u-lena',    name: 'Eng. Lena Sousa',      email: 'lena@orbit.space',     role: 'crew',    position: 'Systems Engineer',         password: '' },
  { id: 'u-omar',    name: 'Sci. Omar Khalil',     email: 'omar@orbit.space',     role: 'crew',    position: 'Science Officer',          password: '' },
  { id: 'u-hannya',  name: 'Hannya Cavalcante',    email: 'hannya@orbit.space',   role: 'crew',    position: 'Product Design & FullStack',      password: '' },
  { id: 'u-mariana', name: 'Mariana Nikaido',      email: 'mariana@orbit.space',  role: 'crew',    position: 'UX & Visão Estratégica',          password: '' },
  { id: 'u-gabriel', name: 'Gabriel Oliveira',     email: 'gabriel@orbit.space',  role: 'crew',    position: 'UI & UX Centrada no Usuário',     password: '' },
];

const CREW_STATUS = {
  'u-sarah':   { heart_rate: 72, hydration: 88, sleep_hours: 7.2, o2_saturation: 98, location: 'Módulo Hab A',       updated_at: now() },
  'u-marcus':  { heart_rate: 68, hydration: 91, sleep_hours: 6.8, o2_saturation: 97, location: 'Enfermaria',          updated_at: now() },
  'u-lena':    { heart_rate: 75, hydration: 82, sleep_hours: 7.5, o2_saturation: 99, location: 'Sala de Máquinas',    updated_at: now() },
  'u-omar':    { heart_rate: 64, hydration: 95, sleep_hours: 8.1, o2_saturation: 98, location: 'Laboratório Geo',     updated_at: now() },
  'u-hannya':  { heart_rate: 70, hydration: 90, sleep_hours: 7.8, o2_saturation: 98, location: 'Área de Escavação',   updated_at: now() },
  'u-mariana': { heart_rate: 73, hydration: 86, sleep_hours: 6.5, o2_saturation: 97, location: 'Centro de Controle', updated_at: now() },
  'u-gabriel': { heart_rate: 66, hydration: 93, sleep_hours: 8.0, o2_saturation: 99, location: 'Enfermaria',          updated_at: now() },
};

// Recursos da missão
const RESOURCES = {
  o2:    { value: 87.4, unit: '%',  label: 'Oxigênio',         icon: '💨', min: 0,   max: 100, warn: 30, crit: 15, rate: -0.02 },
  water: { value: 74.2, unit: '%',  label: 'Reserva de Água',  icon: '💧', min: 0,   max: 100, warn: 25, crit: 10, rate: -0.015 },
  power: { value: 91.8, unit: '%',  label: 'Energia Solar',    icon: '⚡', min: 0,   max: 100, warn: 40, crit: 20, rate: +0.008 },
  food:  { value: 68.5, unit: '%',  label: 'Suprimentos',      icon: '🥫', min: 0,   max: 100, warn: 20, crit: 10, rate: -0.01  },
  fuel:  { value: 95.1, unit: '%',  label: 'Combustível',      icon: '🔥', min: 0,   max: 100, warn: 20, crit: 10, rate: -0.005 },
};

// Clima marciano
const WEATHER = {
  temperature: -43,
  wind_speed:  12,
  dust_storm:  false,
  dust_opacity: 0.4,
  pressure:    650,
  updated_at:  now(),
};

let messages = [
  { id: id(), sender_id: 'u-control', receiver_id: 'u-sarah',  content: 'Chen, confirme status dos painéis solares após a tempestade de ontem. Eficiência abaixo do esperado nos relatórios de telemetria.', priority: 'high',   status: 'read',      sent_at: new Date(Date.now()-5400000).toISOString(), sender_name: 'Control Houston',  receiver_name: 'Cmd. Sarah Chen' },
  { id: id(), sender_id: 'u-sarah',   receiver_id: 'u-control', content: 'Houston, painéis OK. Eficiência em 94%. A queda foi temporária — depósito de poeira. Lena realizou limpeza esta manhã. Relatório completo em 20 min.',      priority: 'normal', status: 'read',      sent_at: new Date(Date.now()-4800000).toISOString(), sender_name: 'Cmd. Sarah Chen',   receiver_name: 'Control Houston' },
  { id: id(), sender_id: 'u-marcus',  receiver_id: 'u-control', content: 'Relatório médico Sol 47: todos os tripulantes com sinais vitais dentro dos parâmetros. Omar apresentou leve fadiga — prescrito descanso adicional de 2h.', priority: 'normal', status: 'delivered', sent_at: new Date(Date.now()-2400000).toISOString(), sender_name: 'Dr. Marcus Webb',  receiver_name: 'Control Houston' },
  { id: id(), sender_id: 'u-control', receiver_id: 'u-lena',   content: 'Sousa, precisamos do diagnóstico completo do gerador auxiliar. Houston detectou irregularidade nos dados de telemetria. Prioridade P1.', priority: 'critical', status: 'in_transit', sent_at: new Date(Date.now()-900000).toISOString(),  sender_name: 'Control Houston',  receiver_name: 'Eng. Lena Sousa' },
  { id: id(), sender_id: 'u-omar',    receiver_id: 'u-sarah',  content: 'Comandante, coletei amostras na área B7 próxima ao cânion. Detectei estratos de minerais com alta concentração de ferro. Possível evidência de atividade hídrica antiga.', priority: 'high', status: 'sent', sent_at: new Date(Date.now()-300000).toISOString(), sender_name: 'Sci. Omar Khalil', receiver_name: 'Cmd. Sarah Chen' },
];

let tasks = [
  { id: id(), title: 'Calibrar sensores de pressão do Módulo C',        description: 'Pressão apresentando variação de ±0.3 kPa. Requer recalibração manual.', assignee_id: 'u-lena',   created_by: 'u-control', priority: 'p1', status: 'in_progress', assignee_name: 'Eng. Lena Sousa',  created_by_name: 'Control Houston', created_at: new Date(Date.now()-86400000).toISOString(), updated_at: now() },
  { id: id(), title: 'Coleta de amostras geológicas — Área B7',          description: 'Setor identificado por satélite como de alto interesse científico.', assignee_id: 'u-omar',   created_by: 'u-control', priority: 'p2', status: 'in_progress', assignee_name: 'Sci. Omar Khalil', created_by_name: 'Control Houston', created_at: new Date(Date.now()-43200000).toISOString(), updated_at: now() },
  { id: id(), title: 'Verificação do sistema de regeneração de O₂',      description: 'Inspeção periódica obrigatória. Última realizada no Sol 42.', assignee_id: 'u-marcus', created_by: 'u-sarah',   priority: 'p1', status: 'todo',        assignee_name: 'Dr. Marcus Webb',  created_by_name: 'Cmd. Sarah Chen', created_at: new Date(Date.now()-21600000).toISOString(), updated_at: now() },
  { id: id(), title: 'Diagnóstico do gerador auxiliar',                  description: 'Telemetria indica irregularidade no ciclo de 8h. Verificar fusíveis e circuito de controle.', assignee_id: 'u-lena',   created_by: 'u-control', priority: 'p1', status: 'todo',        assignee_name: 'Eng. Lena Sousa',  created_by_name: 'Control Houston', created_at: new Date(Date.now()-3600000).toISOString(),  updated_at: now() },
  { id: id(), title: 'Relatório semanal de saúde da tripulação',         description: '', assignee_id: 'u-marcus', created_by: 'u-sarah',   priority: 'p2', status: 'done',        assignee_name: 'Dr. Marcus Webb',  created_by_name: 'Cmd. Sarah Chen', created_at: new Date(Date.now()-172800000).toISOString(), updated_at: new Date(Date.now()-3600000).toISOString() },
  { id: id(), title: 'Limpeza dos painéis solares após tempestade',      description: 'Depósito de poeira reduzindo eficiência em 6%.', assignee_id: 'u-lena',   created_by: 'u-sarah',   priority: 'p2', status: 'done',        assignee_name: 'Eng. Lena Sousa',  created_by_name: 'Cmd. Sarah Chen', created_at: new Date(Date.now()-86400000).toISOString(),  updated_at: new Date(Date.now()-7200000).toISOString() },
  { id: id(), title: 'Atualização do software de navegação (v4.2.1)',    description: 'Patch obrigatório enviado pela Terra. Janela de manutenção: próximas 48h.', assignee_id: 'u-lena',   created_by: 'u-control', priority: 'p2', status: 'todo',        assignee_name: 'Eng. Lena Sousa',  created_by_name: 'Control Houston', created_at: new Date(Date.now()-7200000).toISOString(),  updated_at: now() },
  { id: id(), title: 'Exercícios físicos diários — protocolo cardiovascular', description: 'Prevenção de perda de massa muscular em microgravidade simulada.', assignee_id: null, created_by: 'u-marcus', priority: 'p3', status: 'todo', assignee_name: null, created_by_name: 'Dr. Marcus Webb', created_at: now(), updated_at: now() },
];

let taskComments = {}; // { [taskId]: [{id, user_id, user_name, text, created_at}] }

let alerts = [
  { id: id(), title: 'Variação de pressão — Módulo C',    description: 'Queda de 0.3 kPa nas últimas 2h. Módulo isolado e em monitoramento ativo. Causa provável: micro-fissura na junta de vedação.', category: 'system',  severity: 'warning',  created_by: 'u-lena',   created_by_name: 'Eng. Lena Sousa', resolved_at: null, created_at: new Date(Date.now()-7200000).toISOString() },
  { id: id(), title: 'Irregularidade no gerador auxiliar', description: 'Telemetria mostra ciclo irregular a cada 8h. Não representa risco imediato mas exige diagnóstico até Sol 49.', category: 'system',  severity: 'warning',  created_by: 'u-control', created_by_name: 'Control Houston', resolved_at: null, created_at: new Date(Date.now()-3600000).toISOString() },
];

let missionLog = [
  { id: id(), event_type: 'mission_start',  description: 'Missão ORBIT iniciada. Nave em órbita estável. Todos os sistemas operacionais. Tripulação de 4 membros confirmada.', user_id: 'u-control', user_name: 'Control Houston', user_role: 'control', created_at: new Date(MISSION_START_EPOCH).toISOString() },
  { id: id(), event_type: 'crew_update',    description: 'Sol 12: Primeira caminhada marciana realizada. Sarah Chen e Omar Khalil coletaram primeiras amostras do solo.', user_id: 'u-sarah',  user_name: 'Cmd. Sarah Chen', user_role: 'crew',    created_at: new Date(MISSION_START_EPOCH + 12*88620000).toISOString() },
  { id: id(), event_type: 'alert_created',  description: 'Sol 31: Tempestade de poeira localizada. Atividades externas suspensas por 48h. Painéis solares impactados.', user_id: 'u-lena',   user_name: 'Eng. Lena Sousa', user_role: 'crew',    created_at: new Date(MISSION_START_EPOCH + 31*88620000).toISOString() },
  { id: id(), event_type: 'task_completed', description: 'Sol 38: Instalação bem-sucedida da antena de backup. Comunicações com Terra agora redundantes.', user_id: 'u-lena',   user_name: 'Eng. Lena Sousa', user_role: 'crew',    created_at: new Date(MISSION_START_EPOCH + 38*88620000).toISOString() },
  { id: id(), event_type: 'message_sent',   description: 'Sol 45: Confirmação de descoberta geológica significativa na Área B7 enviada ao Centro de Ciências.', user_id: 'u-omar',  user_name: 'Sci. Omar Khalil', user_role: 'crew',    created_at: new Date(MISSION_START_EPOCH + 45*88620000).toISOString() },
  { id: id(), event_type: 'alert_created',  description: 'Sol 47: Variação de pressão detectada no Módulo C. Investigação em andamento.', user_id: 'u-lena',   user_name: 'Eng. Lena Sousa', user_role: 'crew',    created_at: new Date(Date.now()-7200000).toISOString() },
  { id: id(), event_type: 'alert_created',  description: 'Sol 47: Irregularidade detectada no gerador auxiliar pela telemetria da Terra.', user_id: 'u-control', user_name: 'Control Houston', user_role: 'control', created_at: new Date(Date.now()-3600000).toISOString() },
];

// Simulação em tempo real: atualiza vitais e recursos a cada 15s
function simulate() {
  // Vitais: pequenas variações aleatórias
  for (const uid of Object.keys(CREW_STATUS)) {
    const s = CREW_STATUS[uid];
    s.heart_rate   = Math.round(Math.min(120, Math.max(55, s.heart_rate   + (Math.random()-0.5)*3)));
    s.hydration    = Math.round(Math.min(100, Math.max(40, s.hydration    - Math.random()*0.2)));
    s.o2_saturation = Math.min(100, Math.max(90, +(s.o2_saturation + (Math.random()-0.4)*0.1).toFixed(1)));
    s.updated_at   = now();
  }
  // Recursos: taxa de consumo
  for (const key of Object.keys(RESOURCES)) {
    const r = RESOURCES[key];
    r.value = Math.min(r.max, Math.max(0, +(r.value + r.rate + (Math.random()-0.5)*0.05).toFixed(2)));
  }
  // Clima: variação lenta
  WEATHER.temperature  = Math.round(Math.min(-10, Math.max(-80, WEATHER.temperature + (Math.random()-0.5)*2)));
  WEATHER.wind_speed   = Math.round(Math.min(80,  Math.max(0,   WEATHER.wind_speed  + (Math.random()-0.5)*3)));
  WEATHER.dust_opacity = Math.min(1, Math.max(0, +(WEATHER.dust_opacity + (Math.random()-0.5)*0.02).toFixed(2)));
  WEATHER.dust_storm   = WEATHER.dust_opacity > 0.7;
  WEATHER.updated_at   = now();
}
setInterval(simulate, 15000);

module.exports = {
  getMissionInfo() {
    return {
      sol:      currentSol(),
      distance_km: 225000000 + Math.round(Math.sin(Date.now()/1e10)*50000000),
      phase:    'Surface Operations',
      crew:     USERS.filter(u => u.role === 'crew').length,
      start_date: new Date(MISSION_START_EPOCH).toISOString(),
    };
  },

  getCrew() {
    return USERS.filter(u => u.role === 'crew').map(u => ({
      ...u, ...(CREW_STATUS[u.id] || {}),
      status_updated_at: (CREW_STATUS[u.id] || {}).updated_at,
    }));
  },

  getCrewMember(id) {
    const u = USERS.find(u => u.id === id);
    return u ? { ...u, ...(CREW_STATUS[u.id] || {}) } : null;
  },

  createCrew({ name, position, email, location }) {
    const uid = 'u-' + id().split('-')[0];
    const newUser = {
      id: uid, name, position,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@orbit.space`,
      role: 'crew', password: '',
    };
    USERS.push(newUser);
    CREW_STATUS[uid] = {
      heart_rate: 70, hydration: 90, sleep_hours: 7.5, o2_saturation: 98,
      location: location || 'Módulo Hab A', updated_at: now(),
    };
    const sol = currentSol();
    missionLog.unshift({
      id: id(), event_type: 'crew_update',
      description: `Sol ${sol}: ${name} (${position}) incorporado(a) à tripulação.`,
      user_id: 'u-control', user_name: 'Control Houston', user_role: 'control', created_at: now(),
    });
    return { ...newUser, ...CREW_STATUS[uid], status_updated_at: CREW_STATUS[uid].updated_at };
  },

  updateCrewStatus(userId, fields) {
    CREW_STATUS[userId] = { ...CREW_STATUS[userId], ...fields, updated_at: now() };
    return { user_id: userId, ...CREW_STATUS[userId] };
  },

  getResources() {
    return Object.entries(RESOURCES).map(([key, r]) => ({
      key,
      ...r,
      status: r.value <= r.crit ? 'critical' : r.value <= r.warn ? 'warning' : 'ok',
    }));
  },

  getWeather() { return { ...WEATHER, sol: currentSol() }; },

  getMessages({ from, to, status } = {}) {
    let res = [...messages];
    if (from)   res = res.filter(m => m.sender_id   === from);
    if (to)     res = res.filter(m => m.receiver_id === to);
    if (status) res = res.filter(m => m.status === status);
    return res.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
  },

  createMessage(senderId, { receiver_id, content, priority }) {
    const sender   = USERS.find(u => u.id === senderId)   || { name: 'Desconhecido', role: 'crew' };
    const receiver = USERS.find(u => u.id === receiver_id) || { name: receiver_id };
    const msg = {
      id: id(), sender_id: senderId, receiver_id,
      content, priority: priority || 'normal', status: 'sent',
      sent_at: now(), delivered_at: null, read_at: null,
      sender_name: sender.name, receiver_name: receiver.name,
    };
    messages.unshift(msg);
    missionLog.unshift({ id: id(), event_type: 'message_sent', description: `Mensagem enviada para ${receiver.name}`, user_id: senderId, user_name: sender.name, user_role: sender.role, created_at: now() });
    // Simula transições de estado
    const delayMs = parseInt(process.env.MARS_DELAY_MS) || 800;
    setTimeout(() => { const m = messages.find(x => x.id === msg.id); if (m) m.status = 'in_transit'; }, 1000);
    setTimeout(() => { const m = messages.find(x => x.id === msg.id); if (m) { m.status = 'delivered'; m.delivered_at = now(); } }, delayMs + 2000);
    return msg;
  },

  ackMessage(msgId) {
    const m = messages.find(x => x.id === msgId);
    if (!m) return null;
    m.status = 'delivered'; m.delivered_at = now(); return m;
  },

  readMessage(msgId) {
    const m = messages.find(x => x.id === msgId);
    if (!m) return null;
    m.status = 'read'; m.read_at = now(); return m;
  },

  getTasks({ status, assignee, priority } = {}) {
    let res = [...tasks];
    if (status)   res = res.filter(t => t.status   === status);
    if (assignee) res = res.filter(t => t.assignee_id === assignee);
    if (priority) res = res.filter(t => t.priority  === priority);
    return res.sort((a, b) => a.priority.localeCompare(b.priority) || new Date(b.created_at) - new Date(a.created_at));
  },

  createTask(creatorId, { title, description, assignee_id, priority, due_at }) {
    const creator  = USERS.find(u => u.id === creatorId)  || { name: 'Control Houston' };
    const assignee = USERS.find(u => u.id === assignee_id);
    const task = {
      id: id(), title, description: description || '',
      assignee_id: assignee_id || null, created_by: creatorId,
      priority: priority || 'p2', status: 'todo', due_at: due_at || null,
      assignee_name: assignee ? assignee.name : null,
      created_by_name: creator.name,
      created_at: now(), updated_at: now(),
    };
    tasks.unshift(task);
    return task;
  },

  updateTask(taskId, { status, priority, title, description, assignee_id }, userId) {
    const t = tasks.find(x => x.id === taskId);
    if (!t) return null;
    if (status !== undefined)      t.status      = status;
    if (priority !== undefined)    t.priority    = priority;
    if (title !== undefined)       t.title       = title;
    if (description !== undefined) t.description = description;
    if (assignee_id !== undefined) {
      t.assignee_id   = assignee_id;
      const a = USERS.find(u => u.id === assignee_id);
      t.assignee_name = a ? a.name : null;
    }
    t.updated_at = now();
    if (status === 'done') {
      const u = USERS.find(x => x.id === userId) || { name: 'Control Houston', role: 'control' };
      missionLog.unshift({ id: id(), event_type: 'task_completed', description: `Tarefa concluída: ${t.title}`, user_id: userId, user_name: u.name, user_role: u.role, created_at: now() });
    }
    return t;
  },

  getAlerts({ category, severity } = {}) {
    let res = alerts.filter(a => !a.resolved_at);
    if (category) res = res.filter(a => a.category === category);
    if (severity) res = res.filter(a => a.severity === severity);
    return res.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  createAlert(creatorId, { title, description, category, severity }) {
    const creator = USERS.find(u => u.id === creatorId) || { name: 'Control Houston', role: 'control' };
    const alert = {
      id: id(), title, description: description || '', category,
      severity: severity || 'warning', created_by: creatorId,
      created_by_name: creator.name, resolved_at: null, resolved_by: null,
      created_at: now(),
    };
    alerts.unshift(alert);
    missionLog.unshift({ id: id(), event_type: 'alert_created', description: `Alerta ${severity || 'warning'}: ${title}`, user_id: creatorId, user_name: creator.name, user_role: creator.role, created_at: now() });
    return alert;
  },

  resolveAlert(alertId, userId) {
    const a = alerts.find(x => x.id === alertId);
    if (!a) return null;
    a.resolved_by = userId; a.resolved_at = now();
    const u = USERS.find(x => x.id === userId) || { name: 'Control Houston', role: 'control' };
    missionLog.unshift({ id: id(), event_type: 'task_completed', description: `Alerta resolvido: ${a.title}`, user_id: userId, user_name: u.name, user_role: u.role, created_at: now() });
    return a;
  },

  getMissionLog(limit = 50) {
    return missionLog.slice(0, limit);
  },

  getUserByEmail(email) {
    return USERS.find(u => u.email === email) || null;
  },

  getUsers() { return USERS; },

  createUser({ name, email, password, position, role }) {
    if (USERS.find(u => u.email === email)) return null; // já existe
    const uid = 'u-' + id().split('-')[0];
    const newUser = { id: uid, name, email, role: role || 'crew', position: position || 'Mission Specialist', password: password || '' };
    USERS.push(newUser);
    if (newUser.role === 'crew') {
      CREW_STATUS[uid] = { heart_rate: 70, hydration: 90, sleep_hours: 7.5, o2_saturation: 98, location: 'Módulo Hab A', updated_at: now() };
      missionLog.unshift({ id: id(), event_type: 'crew_update', description: `${name} (${newUser.position}) cadastrado(a) e incorporado(a) à tripulação.`, user_id: uid, user_name: name, user_role: newUser.role, created_at: now() });
    }
    return newUser;
  },

  getComments(taskId) {
    return (taskComments[taskId] || []).slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  },

  addComment(taskId, userId, text) {
    const user = USERS.find(u => u.id === userId) || { name: 'Usuário' };
    const comment = { id: id(), task_id: taskId, user_id: userId, user_name: user.name, text, created_at: now() };
    if (!taskComments[taskId]) taskComments[taskId] = [];
    taskComments[taskId].push(comment);
    return comment;
  },
};
