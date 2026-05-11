"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppSounds } from '@/lib/hooks/useAppSounds';
import toast from 'react-hot-toast';
import { useStore } from './StoreProvider';

export default function RealtimeNotifications() {
  const { playSound } = useAppSounds();
  const { selectedStore } = useStore();

  useEffect(() => {
    console.log('[Realtime] Initializing global listener with sounds...');
    
    const channel = supabase
      .channel('global-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          const newOrder = payload.new as any;
          const oldOrder = payload.old as any;

          // --- FILTRE PAR BOUTIQUE ---
          if (selectedStore && newOrder.store_id !== selectedStore) {
            return; 
          }

          console.log('[Realtime] Order event:', payload.eventType, newOrder);

          // NOUVELLE COMMANDE (INSERT)
          if (payload.eventType === 'INSERT') {
            playSound('order'); // Son Shopify
            toast.success("Nouvelle commande Shopify !", { 
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
          }

          // CHANGEMENT DE STATUT OU CASH (UPDATE)
          if (payload.eventType === 'UPDATE') {
            // 1. Changement de Statut
            if (newOrder.status !== oldOrder.status) {
              if (newOrder.status === 'Confirmé') {
                playSound('confirm'); // Son Téléphone raccroché
                toast.success(`Commande de ${newOrder.customer} CONFIRMÉE`, { icon: '✅' });
              } else if (newOrder.status === 'Livré') {
                playSound('deliver'); // Son Klaxon
                toast.success(`Commande de ${newOrder.customer} LIVRÉE !`, { icon: '📦' });
              } else if (newOrder.status === 'Annulé') {
                toast.error(`Commande de ${newOrder.customer} ANNULÉE`, { icon: '❌' });
              }
            }

            // 2. Réception du Cash (cash_received passe de false à true)
            if (newOrder.cash_received === true && oldOrder.cash_received === false) {
              playSound('cash'); // Son Pièces
              toast.success("💰 Cash validé en comptabilité !", { icon: '💵' });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Subscription error. Realtime might not be enabled on the table "orders" in Supabase.');
        }
      });

    return () => {
      console.log('[Realtime] Cleaning up global listener...');
      supabase.removeChannel(channel);
    };
  }, [playSound, selectedStore]);

  return null;
}
