import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Emulador Android: 10.0.2.2 | iOS Simulator / Expo Go: IP da sua máquina
const BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3002/api/v1';

const api = axios.create({ baseURL: BASE, timeout: 1400000 });

api.interceptors.request.use(async cfg => {
  const token = await AsyncStorage.getItem('orbit_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
