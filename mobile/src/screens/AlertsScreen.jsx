import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../services/api';

const C = { bg:'#050a14', surface:'#0c1628', border:'#1a2f50', red:'#ef4444', orange:'#f97316', accent:'#0ea5e9', green:'#22c55e', muted:'#64748b', text:'#e2e8f0' };
const SEV = {
  critical: { color: C.red,    bg: 'rgba(239,68,68,0.1)',  icon: '🔴', label: 'Crítico' },
  warning:  { color: C.orange, bg: 'rgba(249,115,22,0.1)', icon: '🟡', label: 'Aviso' },
  info:     { color: C.accent, bg: 'rgba(14,165,233,0.1)', icon: '🔵', label: 'Info' },
};

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => { api.get('/alerts').then(({ data }) => setAlerts(data)); }, []);

  async function resolve(id) {
    await api.put(`/alerts/${id}/resolve`);
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  return (
    <FlatList
      style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      data={alerts} keyExtractor={i => i.id}
      ListEmptyComponent={
        <View style={s.empty}><Text style={s.emptyIcon}>✓</Text><Text style={s.emptyText}>Nenhum alerta ativo</Text></View>
      }
      renderItem={({ item }) => {
        const sc = SEV[item.severity] || SEV.info;
        return (
          <View style={[s.card, { backgroundColor: sc.bg, borderColor: `${sc.color}40` }]}>
            <View style={s.cardTop}>
              <Text style={{ fontSize: 22 }}>{sc.icon}</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={s.title}>{item.title}</Text>
                <Text style={[s.sev, { color: sc.color }]}>{sc.label} · {item.category}</Text>
              </View>
            </View>
            {item.description ? <Text style={s.desc}>{item.description}</Text> : null}
            <View style={s.footer}>
              <Text style={s.time}>{new Date(item.created_at).toLocaleString('pt-BR')}</Text>
              <TouchableOpacity onPress={() => resolve(item.id)} style={s.resolveBtn}>
                <Text style={s.resolveBtnText}>✓ Resolver</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: C.bg },
  card:           { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTop:        { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  title:          { fontSize: 14, fontWeight: '700', color: C.text },
  sev:            { fontSize: 11, marginTop: 2 },
  desc:           { fontSize: 13, color: '#94a3b8', marginBottom: 8, lineHeight: 18 },
  footer:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time:           { fontSize: 11, color: C.muted },
  resolveBtn:     { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', borderRadius: 6 },
  resolveBtnText: { fontSize: 12, color: '#22c55e', fontWeight: '600' },
  empty:          { alignItems: 'center', marginTop: 80 },
  emptyIcon:      { fontSize: 40, marginBottom: 12 },
  emptyText:      { color: C.muted, fontSize: 15 },
});
