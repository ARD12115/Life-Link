// hooks/usePushNotifications.ts
// Push notification setup for Expo with Supabase integration
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Simple logger (inline to avoid missing import)
const logger = {
  info: (message: string, context?: any) => console.info(`[INFO] ${message}`, context ?? ''),
  warn: (message: string, context?: any) => console.warn(`[WARN] ${message}`, context ?? ''),
  error: (message: string, context?: any) => console.error(`[ERROR] ${message}`, context ?? ''),
};

// Configure how notifications behave when the app is OPEN
// Gate by isExpoGo since Expo SDK 53 removed this from Expo Go
const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

if (!isExpoGo) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
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
          updated_at: new Date().toISOString(),
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
      // Get permissions - use type assertion since expo-notifications types vary
      const permission = await Notifications.getPermissionsAsync() as any;
      
      // Check if notification permission is granted
      const isGranted = permission?.status === 'granted' || 
                       (permission?.expiration !== undefined && permission?.expiration !== null);
      
      if (!isGranted) {
        logger.warn('Notification permission not granted');
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