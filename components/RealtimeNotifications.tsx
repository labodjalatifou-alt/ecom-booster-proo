"use client";

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppSounds } from '@/lib/hooks/useAppSounds';
import toast from 'react-hot-toast';
import { useStore } from './StoreProvider';
import { usePathname } from 'next/navigation';

export default function RealtimeNotifications() {
  const { playSound } = useAppSounds();
  const { selectedStore } = useStore();
  const pathname = usePathname();
  const isPublicRoute = pathname?.startsWith('/s/') || pathname?.startsWith('/terms') || pathname?.startsWith('/privacy');

  // --- Nouveau : mémoire des commandes déjà vues + timestamp du dernier check ---
  const seenOrderIds = useRef<Set<string>>(new Set());
  const lastCheckRef = useRef<string>(new Date().toISOString());

  const handleOrderInsert = (newOrder: any) => {
    if (seenOrderIds.current.has(newOrder.id)) return; // déjà traité, on évite le doublon
    seenOrderIds.current.add(newOrder.id);

    if (selectedStore && newOrder.store_id !== selectedStore) return;

    playSound('order');
    toast.success("Nouvelle commande !", {
      icon: '💰',
      duration: 6000,
      style: {
        borderRadius: '1rem',
        background: '#0f172a',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        padding: '16px 24px'
      }
    });
  };

  useEffect(() => {
    if (isPublicRoute) return;

    console.log('[Realtime] Initializing global listener with sounds...');

    const channel = supabase
      .channel('global-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as any;
          const oldOrder = payload.old as any;

          if (payload.eventType === 'INSERT') {
            handleOrderInsert(newOrder);
          }

          if (payload.eventType === 'UPDATE') {
            if (selectedStore && newOrder.store_id !== selectedStore) return;

            if (newOrder.status !== oldOrder.status) {
              if (newOrder.status === 'Confirmé') {
                playSound('confirm');
                toast.success(`Commande de ${newOrder.customer} CONFIRMÉE`, { icon: '✅' });
              } else if (newOrder.status === 'Livré') {
                playSound('deliver');
                toast.success(`Commande de ${newOrder.customer} LIVRÉE !`, { icon: '📦' });
              } else if (newOrder.status === 'Annulé') {
                toast.error(`Commande de ${newOrder.customer} ANNULÉE`, { icon: '❌' });
              } else if (newOrder.status === 'Programmé') {
                playSound('confirm');
                toast.success(`Commande de ${newOrder.customer} PROGRAMMÉE !`, { icon: '📅' });
              }
            }

            if (newOrder.cash_received === true && oldOrder.cash_received === false) {
              playSound('cash');
              toast.success("💰 Cash validé en comptabilité !", { icon: '💵' });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
        // --- Nouveau : dès qu'on (re)devient SUBSCRIBED, on rattrape ce qui a pu être raté ---
        if (status === 'SUBSCRIBED') {
          catchUpMissedOrders();
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('[Realtime] Connexion perdue, tentative de reconnexion...');
        }
      });

    // --- Nouveau : fonction de rattrapage ---
    const catchUpMissedOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gt('created_at', lastCheckRef.current)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[Realtime] Erreur catch-up:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log(`[Realtime] Rattrapage : ${data.length} commande(s) potentiellement manquée(s)`);
        data.forEach((order) => handleOrderInsert(order));
      }

      lastCheckRef.current = new Date().toISOString();
    };

    // --- Nouveau : polling de sécurité toutes les 20 secondes, même si le websocket est SUBSCRIBED ---
    const pollInterval = setInterval(catchUpMissedOrders, 20000);

    return () => {
      console.log('[Realtime] Cleaning up global listener...');
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [playSound, selectedStore]);

  // Polling check for Programmed Orders (inchangé)
  useEffect(() => {
    const checkProgrammed = async () => {
      try {
        await fetch('/api/cron/check-programmed');
      } catch (err) {
        console.error("Cron check failed", err);
      }
    };
    const initialTimeout = setTimeout(checkProgrammed, 5000);
    const interval = setInterval(checkProgrammed, 60000);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return null;
}