"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
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

export default function PWARegistration() {
  useEffect(() => {
    let registration: ServiceWorkerRegistration | null = null;
    let pushSubscription: PushSubscription | null = null;

    async function getSubscription() {
      if (!('serviceWorker' in navigator)) return null;

      try {
        registration = await navigator.serviceWorker.register('/sw.js');
        
        if (!('Notification' in window)) return null;

        let permission = Notification.permission;
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }

        if (permission !== 'granted') return null;

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not defined.');
          return null;
        }

        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
          });
        }

        pushSubscription = subscription;
        return subscription;
      } catch (err) {
        console.error('Error getting push subscription:', err);
        return null;
      }
    }

    async function syncSubscriptionWithUser(userId: string) {
      const subscription = pushSubscription || (await getSubscription());
      if (!subscription) return;

      try {
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subscription,
            userId
          })
        });
        console.log(`Push subscription synced for user: ${userId}`);
      } catch (err) {
        console.error('Error syncing push subscription:', err);
      }
    }

    // Initialize registration on load
    getSubscription().then(async (sub) => {
      if (sub) {
        // Sync with current user
        const { data: { user } } = await supabase.auth.getUser();
        await syncSubscriptionWithUser(user?.id || 'default-user-id');
      }
    });

    // Listen to login/logout events to update the user mapping dynamically
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state changed: ${event}`);
      const userId = session?.user?.id || 'default-user-id';
      await syncSubscriptionWithUser(userId);
    });

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  return null;
}
