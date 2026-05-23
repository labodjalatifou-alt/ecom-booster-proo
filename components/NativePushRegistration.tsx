"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function NativePushRegistration() {
  useEffect(() => {
    async function initNativePush() {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        const { PushNotifications } = await import('@capacitor/push-notifications');

        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.warn('Native Push permission not granted');
          return;
        }

        await PushNotifications.register();

        PushNotifications.addListener('registration', async (token) => {
          console.log('Native Push Registration Token:', token.value);
          // Sync with current user
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await syncNativeToken(token.value, user.id);
          }
        });

        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Error on registration: ' + JSON.stringify(error));
        });

      } catch (err) {
        console.error('Failed to init native push:', err);
      }
    }

    async function syncNativeToken(token: string, userId: string) {
      try {
        await fetch('/api/push/subscribe-native', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token,
            userId,
            platform: 'android' // or ios
          })
        });
        console.log(`Native token synced for user: ${userId}`);
      } catch (err) {
        console.error('Error syncing native push subscription:', err);
      }
    }

    initNativePush();
  }, []);

  return null;
}
