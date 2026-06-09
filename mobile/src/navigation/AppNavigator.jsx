import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator }     from '@react-navigation/stack';
import { Text }                     from 'react-native';
import { useAuth }                  from '../context/AuthContext';

import LoginScreen      from '../screens/LoginScreen';
import HomeScreen       from '../screens/HomeScreen';
import MessagesScreen   from '../screens/MessagesScreen';
import TasksScreen      from '../screens/TasksScreen';
import AlertsScreen     from '../screens/AlertsScreen';
import CrewStatusScreen from '../screens/CrewStatusScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const C = { surface: '#0c1628', border: '#1a2f50', accent: '#0ea5e9', muted: '#64748b', text: '#e2e8f0' };

const TABS = [
  { name: 'Home',      comp: HomeScreen,       icon: '🏠', title: 'ORBIT' },
  { name: 'Mensagens', comp: MessagesScreen,    icon: '💬' },
  { name: 'Tarefas',   comp: TasksScreen,       icon: '✅' },
  { name: 'Alertas',   comp: AlertsScreen,      icon: '🚨' },
  { name: 'Tripulação',comp: CrewStatusScreen,  icon: '👨‍🚀' },
];

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerStyle:            { backgroundColor: C.surface, borderBottomColor: C.border, borderBottomWidth: 1 },
      headerTintColor:        C.text,
      headerTitleStyle:       { fontWeight: '700' },
      tabBarStyle:            { backgroundColor: C.surface, borderTopColor: C.border },
      tabBarActiveTintColor:  C.accent,
      tabBarInactiveTintColor:C.muted,
      tabBarIcon: ({ focused }) => (
        <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>
          {TABS.find(t => t.name === route.name)?.icon || '•'}
        </Text>
      ),
    })}>
      {TABS.map(t => <Tab.Screen key={t.name} name={t.name} component={t.comp} options={t.title ? { title: t.title } : {}} />)}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token, ready } = useAuth();
  if (!ready) return null;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token
        ? <Stack.Screen name="Main"  component={MainTabs} />
        : <Stack.Screen name="Login" component={LoginScreen} />
      }
    </Stack.Navigator>
  );
}
