import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { logger } from '../utils/logger';

const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

// Configure how notifications behave when the app is OPEN
// Gate by isExpoGo since Expo SDK 53 removed this from Expo Go
if (!isExpoGo) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    logger.warn('Push notification handler skipped (Not supported in this environment)');
  }
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
      logger.info('Bypassing Push Token registration in Expo Go to prevent crashes');
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
        logger.error('Push registration failed', { error: error.message });
      }
    } catch (e) {
      logger.error('Network error during push registration', { error: e instanceof Error ? e.message : 'Unknown' });
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
        logger.warn('Failed to set notification channel', { error: e instanceof Error ? e.message : 'Unknown' });
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
        logger.warn('Failed to get push token for push notification');
        return;
      }
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        token = (await Notifications.getExpoPushTokenAsync({
          ...(projectId ? { projectId } : {}),
        })).data;
      } catch (e) {
        logger.warn('Push Token Fetch Failed', { error: e instanceof Error ? e.message : 'Unknown' });
        return;
      }
    } else {
      logger.info('Must use physical device for Push Notifications');
    }

    return token;
  }

  return { expoPushToken };
}
