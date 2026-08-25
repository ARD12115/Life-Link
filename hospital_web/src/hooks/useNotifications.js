// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useNotifications(user) {
  const [permission, setPermission] = useState(Notification.permission)
  const [subscription, setSubscription] = useState(null)

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      logger.warn('Push messaging is not supported')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      let currentSubscription = await registration.pushManager.getSubscription()

      if (!currentSubscription) {
        const result = await Notification.requestPermission()
        setPermission(result)

        if (result === 'granted') {
          currentSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          })
        }
      }

      if (currentSubscription) {
        // Check if this subscription already exists in Supabase
        const subJson = currentSubscription.toJSON()
        const { data: existing } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .contains('subscription', { endpoint: subJson.endpoint })
          .single()

        if (!existing) {
          await supabase.from('push_subscriptions').insert([{
            user_id: user.id,
            subscription: subJson
          }])
          logger.info('Push subscription saved to cloud')
        }

        setSubscription(currentSubscription)
        logger.info('Push notification service active')
      }
    } catch (error) {
      logger.error('Failed to subscribe', { error: error instanceof Error ? error.message : 'Unknown' })
    }
  }, [user])

  useEffect(() => {
    if (user && permission === 'default') {
      // We don't automatically request on load, but we check if we should
    }
  }, [user, permission])

  return { permission, subscription, subscribe }
}
