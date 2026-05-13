import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

// Configure how notifications behave when the app is OPEN
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications(userId: string | undefined) {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (userId) {
      registerForPushNotificationsAsync().then(token => {
        setExpoPushToken(token);
        if (token) saveTokenToSupabase(userId, token);
      });
    }
  }, [userId]);

  async function saveTokenToSupabase(uid: string, token: string) {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: uid,
        subscription: { type: 'expo', token: token },
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) console.error('Error saving push token:', error);
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('emergency', {
        name: 'Emergency Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id' // Replace with your Expo project ID if using EAS
      })).data;
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  return { expoPushToken };
}
