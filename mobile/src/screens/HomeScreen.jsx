import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const C = { bg:'#050a14', surface:'#0c1628', surface2:'#0f1e36', border:'#1a2f50', accent:'#0ea5e9', accent2:'#38bdf8', orange:'#f97316', green:'#22c55e', red:'#ef4444', muted:'#64748b', text:'#e2e8f0' };

function StatCard({ icon, label, value, color }) {
  return (
    <View style={[s.card, { borderLeftColor: color || C.accent }]}>
      <Text style={s.cardIcon}>{icon}</Text>
      <Text style={s.cardLabel}>{label}</Text>
      <Text style={[s.cardValue, { color: color || C.accent2 }]}>{value}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [alerts,   setAlerts]   = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [messages, setMessages] = useState([]);
  const [delay,    setDelay]    = useState(null);

  useEffect(() => {
    Promise.allSettled([api.get('/alerts'), api.get('/tasks'), api.get('/messages'), api.get('/config/latency')])
      .then(([a, t, m, d]) => {
        if (a.status === 'fulfilled') setAlerts(a.value.data);
        if (t.status === 'fulfilled') setTasks(t.value.data);
        if (m.status === 'fulfilled') setMessages(m.value.data);
        if (d.status === 'fulfilled') setDelay(d.value.data);
      });
  }, []);

  const openTasks   = tasks.filter(t => t.status !== 'done');
  const inTransit   = messages.filter(m => m.status === 'sent' || m.status === 'in_transit');

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Sol {Math.floor(Date.now() / 88775000)} 🔴</Text>
          <Text style={s.name}>{user?.name}</Text>
          <Text style={s.position}>{user?.position}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={s.logoutBtn}><Text style={s.logoutText}>Sair</Text></TouchableOpacity>
      </View>

      {delay && (
        <View style={s.delayBadge}>
          <Text style={s.delayLabel}>DELAY TERRA–MARTE</Text>
          <Text style={s.delayValue}>{delay.delayLabel}</Text>
        </View>
      )}

      <Text style={s.section}>Status da Missão</Text>
      <View style={s.statsRow}>
        <StatCard icon="🚨" label="Alertas"      value={alerts.length}      color={alerts.length > 0 ? C.red : C.green} />
        <StatCard icon="📡" label="Em trânsito"  value={inTransit.length}   color={C.orange} />
        <StatCard icon="✅" label="Tarefas"      value={openTasks.length}   color={C.accent} />
      </View>

      {alerts.length > 0 && <>
        <Text style={s.section}>⚠️ Alertas Ativos</Text>
        {alerts.slice(0, 3).map(a => (
          <View key={a.id} style={[s.alertCard, a.severity === 'critical' && s.alertCritical]}>
            <Text style={s.alertTitle}>{a.title}</Text>
            <Text style={s.alertMeta}>{a.category} · {a.severity}</Text>
          </View>
        ))}
      </>}

      <Text style={s.section}>💬 Últimas Mensagens</Text>
      {messages.slice(0, 3).map(m => (
        <View key={m.id} style={s.msgCard}>
          <Text style={s.msgFrom}>{m.sender_name}</Text>
          <Text style={s.msgText} numberOfLines={2}>{m.content}</Text>
          <Text style={s.msgStatus}>
            {m.status === 'read' ? '✓✓ Lida' : m.status === 'delivered' ? '✓✓ Entregue' : m.status === 'in_transit' ? '📡 Em trânsito' : '🕐 Enviada'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg, padding: 16 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, marginTop: 8 },
  greeting:     { fontSize: 12, color: C.muted, letterSpacing: 1 },
  name:         { fontSize: 20, fontWeight: '800', color: C.text },
  position:     { fontSize: 12, color: C.accent2 },
  logoutBtn:    { padding: 8 },
  logoutText:   { color: C.muted, fontSize: 13 },
  delayBadge:   { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, marginBottom: 20, alignItems: 'center' },
  delayLabel:   { fontSize: 10, color: C.muted, letterSpacing: 2 },
  delayValue:   { fontSize: 22, fontWeight: '900', color: C.orange },
  section:      { fontSize: 13, fontWeight: '700', color: C.accent2, marginBottom: 10, marginTop: 20, letterSpacing: 1 },
  statsRow:     { flexDirection: 'row', gap: 8 },
  card:         { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderRadius: 10, padding: 12 },
  cardIcon:     { fontSize: 18, marginBottom: 4 },
  cardLabel:    { fontSize: 10, color: C.muted, letterSpacing: 1 },
  cardValue:    { fontSize: 20, fontWeight: '900', marginTop: 2 },
  alertCard:    { backgroundColor: C.surface, borderWidth: 1, borderColor: '#f9731640', borderRadius: 10, padding: 12, marginBottom: 8 },
  alertCritical:{ borderColor: '#ef444440', backgroundColor: 'rgba(239,68,68,0.08)' },
  alertTitle:   { fontWeight: '700', color: C.text, fontSize: 14 },
  alertMeta:    { fontSize: 11, color: C.muted, marginTop: 2 },
  msgCard:      { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, marginBottom: 8 },
  msgFrom:      { fontSize: 12, color: C.accent2, fontWeight: '600', marginBottom: 2 },
  msgText:      { fontSize: 13, color: C.text, lineHeight: 18 },
  msgStatus:    { fontSize: 11, color: C.muted, marginTop: 6 },
});
