import { Tabs } from 'expo-router';
import { Theme } from '../../theme';
import { useDonorAuth } from '../../hooks/useDonorAuth';
import { Heart, Map as MapIcon, ShieldCheck, Settings } from 'lucide-react-native';

export default function TabLayout() {
  const { role } = useDonorAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: Theme.colors.card,
          borderTopColor: Theme.colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: Theme.colors.background,
        },
        headerTitleStyle: {
          color: Theme.colors.text,
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
          headerTitle: 'LifeLink Emergencies',
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <MapIcon size={24} color={color} />,
          headerTitle: 'Nearby Network',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
          headerTitle: 'Settings',
        }}
        href="/settings"
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: role === 'admin' ? '/admin' : null,
          tabBarIcon: ({ color }) => <ShieldCheck size={24} color={color} />,
          headerTitle: 'System Control',
        }}
      />
    </Tabs>
  );
}