import React from 'react';
import { Tabs } from 'expo-router';
import { Theme } from '../../theme';
import { Heart, Map as MapIcon, History, User } from 'lucide-react-native';

export default function TabLayout() {
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
          tabBarIcon: ({ color }) => <Heart size={24} color={color} fill={color === Theme.colors.primary ? color : 'transparent'} />,
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
    </Tabs>
  );
}
