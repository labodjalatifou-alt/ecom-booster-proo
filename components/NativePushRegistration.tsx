"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

async function syncNativeToken(token: string, userId: string) {
  try {
    await fetch('/api/push/subscribe-native', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId, platform: 'android' })
    });
    console.log(`Native FCM token synced for user: ${userId}`);
  } catch (err) {
    console.error('Error syncing native push subscription:', err);
  }
}

// Global ref so we can re-sync after login
let latestFcmToken: string | null = null;

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
          console.log('Native Push Token received:', token.value);
          latestFcmToken = token.value;
          // Try to sync immediately with whoever is logged in
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

    initNativePush();

    // KEY FIX: Re-sync the FCM token whenever the user logs in
    // This covers the case where the app opens before login, or the token arrives late
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && latestFcmToken) {
        console.log('User signed in, re-syncing FCM token...');
        await syncNativeToken(latestFcmToken, session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
