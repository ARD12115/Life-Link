import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

// Configure how notifications behave when the app is OPEN
// Wrap in try-catch because Expo SDK 53 completely removed this from Expo Go and it can throw on module load.
try {
  if (!isExpoGo) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (e) {
  console.log('Push notification handler skipped (Not supported in this environment)');
}

export function usePushNotifications(userId: string | undefined) {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (userId && !isExpoGo) {
      registerForPushNotificationsAsync().then(token => {
        setExpoPushToken(token);
        if (token) saveTokenToSupabase(userId, token);
      });
    } else if (isExpoGo) {
      console.log('Bypassing Push Token registration in Expo Go to prevent crashes.');
    }
  }, [userId]);

  async function saveTokenToSupabase(uid: string, token: string) {
    if (!uid || !token) return;

    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: uid,
          subscription: { type: 'expo', token: token },
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        // Silent fail in production, but log for dev
        console.error('Push registration failed:', error.message);
      }
    } catch (e) {
      console.error('Network error during push registration:', e);
    }
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('emergency', {
          name: 'Emergency Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      } catch (e) {
        console.warn('Failed to set notification channel:', e);
      }
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
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        token = (await Notifications.getExpoPushTokenAsync({
          ...(projectId ? { projectId } : {}),
        })).data;
      } catch (e) {
        console.warn('📡 Push Token Fetch Failed:', e);
        return;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  return { expoPushToken };
}
