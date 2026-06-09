import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#050a14', surface:'#0c1628', surface2:'#0f1e36', border:'#1a2f50', accent:'#0ea5e9', orange:'#f97316', green:'#22c55e', muted:'#64748b', text:'#e2e8f0' };
const STATUS_COLORS = { sent: C.muted, in_transit: C.orange, delivered: C.accent, read: C.green };
const STATUS_ICONS  = { sent: '🕐', in_transit: '📡', delivered: '✓✓', read: '✓✓' };

export default function MessagesScreen() {
  const [messages, setMessages] = useState([]);
  const [crew,     setCrew]     = useState([]);
  const [content,  setContent]  = useState('');
  const [receiver, setReceiver] = useState(null);
  const [sending,  setSending]  = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([api.get('/messages'), api.get('/crew')]).then(([m, c]) => {
      setMessages(m.data); setCrew(c.data.filter(cr => cr.id !== user?.id));
    });
  }, []);

  async function send() {
    if (!receiver || !content.trim()) return Alert.alert('Atenção', 'Selecione destinatário e escreva a mensagem');
    setSending(true);
    try {
      const { data } = await api.post('/messages', { receiver_id: receiver.id, content });
      setMessages(prev => [data, ...prev]); setContent('');
    } catch { Alert.alert('Erro', 'Falha ao enviar. Verifique a conexão.'); }
    finally { setSending(false); }
  }

  return (
    <View style={s.container}>
      <View style={s.chips}>
        {crew.map(cr => (
          <TouchableOpacity key={cr.id} onPress={() => setReceiver(cr)} style={[s.chip, receiver?.id === cr.id && s.chipActive]}>
            <Text style={[s.chipText, receiver?.id === cr.id && s.chipTextActive]}>{cr.name.split(' ')[0]}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => setReceiver({ id: 'u-control', name: 'Control Houston' })} style={[s.chip, receiver?.id === 'u-control' && s.chipActive]}>
          <Text style={[s.chipText, receiver?.id === 'u-control' && s.chipTextActive]}>Terra 🌍</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages} keyExtractor={item => item.id} style={{ flex: 1 }}
        renderItem={({ item }) => {
          const mine = item.sender_id === user?.id;
          return (
            <View style={[s.bubble, mine ? s.mine : s.theirs]}>
              {!mine && <Text style={s.from}>{item.sender_name}</Text>}
              <Text style={s.text}>{item.content}</Text>
              <View style={s.meta}>
                <Text style={s.time}>{new Date(item.sent_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
                {mine && <Text style={[s.status, { color: STATUS_COLORS[item.status] }]}>{STATUS_ICONS[item.status]}</Text>}
              </View>
            </View>
          );
        }}
      />

      <View style={s.inputRow}>
        <TextInput style={s.input} value={content} onChangeText={setContent} placeholder={receiver ? `Para ${receiver.name}...` : 'Selecione um destinatário'} placeholderTextColor={C.muted} multiline editable={!!receiver} />
        <TouchableOpacity onPress={send} disabled={sending} style={[s.sendBtn, sending && s.sendOff]}>
          <Text style={{ fontSize: 18 }}>📡</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  chips:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  chip:      { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  chipActive:{ borderColor: C.accent, backgroundColor: 'rgba(14,165,233,0.15)' },
  chipText:  { fontSize: 12, color: C.muted },
  chipTextActive: { color: C.accent },
  bubble:    { maxWidth: '80%', marginHorizontal: 12, marginVertical: 4, padding: 10, borderRadius: 12 },
  mine:      { backgroundColor: 'rgba(14,165,233,0.15)', alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  theirs:    { backgroundColor: C.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
  from:      { fontSize: 10, color: C.accent, marginBottom: 2 },
  text:      { fontSize: 14, color: C.text, lineHeight: 20 },
  meta:      { flexDirection: 'row', justifyContent: 'flex-end', gap: 4, marginTop: 4 },
  time:      { fontSize: 10, color: C.muted },
  status:    { fontSize: 11 },
  inputRow:  { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: C.border },
  input:     { flex: 1, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 10, color: C.text, fontSize: 14, maxHeight: 100 },
  sendBtn:   { width: 44, height: 44, backgroundColor: C.accent, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendOff:   { backgroundColor: C.border },
});
