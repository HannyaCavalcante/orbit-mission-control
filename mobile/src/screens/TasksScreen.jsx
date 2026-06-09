import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../services/api';

const C = { bg:'#050a14', surface:'#0c1628', surface2:'#0f1e36', border:'#1a2f50', accent:'#0ea5e9', orange:'#f97316', green:'#22c55e', red:'#ef4444', muted:'#64748b', text:'#e2e8f0' };
const PRI_COLORS = { p1: '#ef4444', p2: '#f97316', p3: '#64748b' };
const STATUS_COLORS = { todo: C.muted, in_progress: C.orange, done: C.green };

export default function TasksScreen() {
  const [tasks,  setTasks]  = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { api.get('/tasks').then(({ data }) => setTasks(data)); }, []);

  async function move(id, status) {
    const { data } = await api.put(`/tasks/${id}`, { status });
    setTasks(prev => prev.map(t => t.id === id ? data : t));
  }

  const shown = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <View style={s.container}>
      <View style={s.filters}>
        {['all', 'todo', 'in_progress', 'done'].map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[s.filter, filter === f && s.filterActive]}>
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>
              {f === 'all' ? 'Todas' : f === 'todo' ? 'A Fazer' : f === 'in_progress' ? 'Em Andamento' : 'Concluídas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={shown} keyExtractor={i => i.id} contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardTop}>
              <Text style={s.title} numberOfLines={2}>{item.title}</Text>
              <Text style={[s.pri, { color: PRI_COLORS[item.priority] }]}>{item.priority.toUpperCase()}</Text>
            </View>
            {item.assignee_name && <Text style={s.assignee}>👤 {item.assignee_name}</Text>}
            <View style={s.btns}>
              {item.status !== 'todo' && (
                <TouchableOpacity onPress={() => move(item.id, item.status === 'done' ? 'in_progress' : 'todo')} style={s.btn}>
                  <Text style={s.btnText}>◀ Voltar</Text>
                </TouchableOpacity>
              )}
              {item.status !== 'done' && (
                <TouchableOpacity onPress={() => move(item.id, item.status === 'todo' ? 'in_progress' : 'done')} style={[s.btn, s.btnAccent]}>
                  <Text style={[s.btnText, s.btnTextAccent]}>Avançar ▶</Text>
                </TouchableOpacity>
              )}
              <View style={[s.statusBadge, { backgroundColor: `${STATUS_COLORS[item.status]}20` }]}>
                <Text style={[s.statusText, { color: STATUS_COLORS[item.status] }]}>
                  {item.status === 'todo' ? 'A fazer' : item.status === 'in_progress' ? 'Em andamento' : 'Feito'}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  filters:      { flexDirection: 'row', gap: 6, padding: 12, borderBottomWidth: 1, borderBottomColor: C.border, flexWrap: 'wrap' },
  filter:       { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
  filterActive: { borderColor: C.accent, backgroundColor: 'rgba(14,165,233,0.15)' },
  filterText:   { fontSize: 11, color: C.muted },
  filterTextActive: { color: C.accent },
  card:         { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  title:        { flex: 1, fontSize: 14, fontWeight: '700', color: C.text, marginRight: 8 },
  pri:          { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  assignee:     { fontSize: 12, color: C.muted, marginBottom: 10 },
  btns:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  btn:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface2 },
  btnAccent:    { borderColor: C.accent, backgroundColor: 'rgba(14,165,233,0.1)' },
  btnText:      { fontSize: 11, color: C.muted },
  btnTextAccent:{ color: C.accent },
  statusBadge:  { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText:   { fontSize: 10, fontWeight: '600' },
});
