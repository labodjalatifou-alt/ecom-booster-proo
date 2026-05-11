"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useShopifySound } from '@/lib/hooks/useShopifySound';
import toast from 'react-hot-toast';

export default function RealtimeNotifications() {
  const { playKaching } = useShopifySound();

  useEffect(() => {
    console.log('[Realtime] Initializing global listener...');
    
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
          console.log('[Realtime] Order event:', payload.eventType, payload.new);

          // NOUVELLE COMMANDE (INSERT)
          if (payload.eventType === 'INSERT') {
            playKaching();
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

          // CHANGEMENT DE STATUT (UPDATE)
          if (payload.eventType === 'UPDATE') {
            const oldOrder = payload.old;
            const newOrder = payload.new;

            if (newOrder.status !== oldOrder.status) {
              if (newOrder.status === 'Confirmé') {
                toast.success(`Commande de ${newOrder.customer} CONFIRMÉE`, { icon: '✅' });
              } else if (newOrder.status === 'Livré') {
                playKaching(); // Son pour la livraison aussi
                toast.success(`Commande de ${newOrder.customer} LIVRÉE !`, { icon: '📦' });
              } else if (newOrder.status === 'Annulé') {
                toast.error(`Commande de ${newOrder.customer} ANNULÉE`, { icon: '❌' });
              }
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
  }, [playKaching]);

  return null; // Component invisible
}
