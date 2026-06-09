import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import api from '../services/api';

const C = { bg:'#050a14', surface:'#0c1628', border:'#1a2f50', accent:'#0ea5e9', accent2:'#38bdf8', green:'#22c55e', red:'#ef4444', muted:'#64748b', text:'#e2e8f0' };

function Bar({ label, value, max, color }) {
  const pct = Math.min(100, ((parseFloat(value) || 0) / max) * 100);
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 11, color: C.muted }}>{label}</Text>
        <Text style={{ fontSize: 11, fontWeight: '700', color }}>{value || '—'}</Text>
      </View>
      <View style={{ height: 4, backgroundColor: C.border, borderRadius: 2 }}>
        <View style={{ height: 4, width: `${pct}%`, backgroundColor: color, borderRadius: 2 }} />
      </View>
    </View>
  );
}

export default function CrewStatusScreen() {
  const [crew, setCrew] = useState([]);

  useEffect(() => {
    api.get('/crew').then(({ data }) => setCrew(data));
    const i = setInterval(() => api.get('/crew').then(({ data }) => setCrew(data)).catch(() => {}), 10000);
    return () => clearInterval(i);
  }, []);

  return (
    <FlatList
      style={s.container} contentContainerStyle={{ paddingBottom: 32 }}
      data={crew} keyExtractor={i => i.id}
      ListHeaderComponent={<Text style={s.header}>Status da Tripulação</Text>}
      ListEmptyComponent={<Text style={{ color: C.muted, padding: 20 }}>Carregando tripulação...</Text>}
      renderItem={({ item }) => (
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.avatar}><Text style={{ fontSize: 20 }}>👤</Text></View>
            <View>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.pos}>{item.position}</Text>
            </View>
          </View>
          {item.heart_rate  && <Bar label="❤️ Freq. cardíaca" value={`${item.heart_rate} bpm`} max={180} color={C.red} />}
          {item.hydration   && <Bar label="💧 Hidratação"     value={`${item.hydration}%`}      max={100} color={C.accent} />}
          {item.sleep_hours && <Bar label="😴 Sono (24h)"     value={`${item.sleep_hours}h`}    max={9}   color={C.green} />}
          {item.location && (
            <View style={s.loc}><Text style={s.locText}>📍 {item.location}</Text></View>
          )}
          {item.status_updated_at && (
            <Text style={s.updated}>Atualizado: {new Date(item.status_updated_at).toLocaleTimeString('pt-BR')}</Text>
          )}
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg, padding: 16 },
  header:     { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 16 },
  card:       { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0f1e36', borderWidth: 2, borderColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  name:       { fontSize: 16, fontWeight: '700', color: '#fff' },
  pos:        { fontSize: 12, color: C.accent2 },
  loc:        { backgroundColor: '#0f1e36', borderRadius: 8, padding: 8, marginTop: 6 },
  locText:    { fontSize: 12, color: C.muted },
  updated:    { fontSize: 10, color: C.muted, marginTop: 8 },
});
