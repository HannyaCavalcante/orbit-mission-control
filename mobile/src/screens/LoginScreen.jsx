import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const C = { bg: '#050a14', surface: '#0c1628', border: '#1a2f50', accent: '#0ea5e9', muted: '#64748b', text: '#e2e8f0' };

export default function LoginScreen() {
  const [email,    setEmail]    = useState('sarah@orbit.space');
  const [password, setPassword] = useState('orbit123');
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();

  async function handleLogin() {
    if (!email || !password) return Alert.alert('Atenção', 'Preencha email e senha');
    setLoading(true);
    try { await login(email, password); }
    catch (err) { Alert.alert('Erro', err.response?.data?.error || 'Falha na autenticação'); }
    finally { setLoading(false); }
  }

  return (
    <View style={s.container}>
      <View style={s.logoArea}>
        <Text style={s.logo}>◉ ORBIT</Text>
        <Text style={s.sub}>CREW INTERFACE</Text>
      </View>
      <View style={s.card}>
        <Text style={s.title}>Identificação</Text>
        <Text style={s.label}>Email</Text>
        <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="sarah@orbit.space" placeholderTextColor={C.muted} keyboardType="email-address" autoCapitalize="none" />
        <Text style={s.label}>Senha</Text>
        <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={C.muted} secureTextEntry />
        <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Entrar na Nave</Text>}
        </TouchableOpacity>
        <Text style={s.hint}>Demo: sarah@orbit.space / orbit123</Text>
      </View>
      <Text style={s.footer}>ORBIT · FIAP Global Solution 2026</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, padding: 24, justifyContent: 'center' },
  logoArea:  { alignItems: 'center', marginBottom: 40 },
  logo:      { fontSize: 42, fontWeight: '900', color: C.accent, letterSpacing: 6 },
  sub:       { fontSize: 11, color: C.muted, letterSpacing: 3, marginTop: 4 },
  card:      { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 24 },
  title:     { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 20 },
  label:     { fontSize: 12, color: C.muted, marginBottom: 6, marginTop: 12 },
  input:     { backgroundColor: '#0f1e36', borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12, color: C.text, fontSize: 14 },
  btn:       { backgroundColor: C.accent, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  btnOff:    { backgroundColor: C.border },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 15 },
  hint:      { fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 12 },
  footer:    { textAlign: 'center', color: C.muted, fontSize: 11, marginTop: 32 },
});
