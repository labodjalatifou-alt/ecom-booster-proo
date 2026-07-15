"use client";

import { useEffect, useRef } from 'react';
import { useAppSounds } from '@/lib/hooks/useAppSounds';
import toast from 'react-hot-toast';
import { useStore } from './StoreProvider';
import { usePathname } from 'next/navigation';

export default function RealtimeNotifications() {
  const { playSound } = useAppSounds();
  const { selectedStore } = useStore();
  const pathname = usePathname();
  const isPublicRoute = pathname?.startsWith('/s/') || pathname?.startsWith('/terms') || pathname?.startsWith('/privacy');

  // Polling state - track last seen order ID
  const lastOrderIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  // Fetch latest orders via API (polling)
  const fetchLatestOrders = async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      const response = await fetch('/api/orders/realtime', {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.warn('[Polling] Response not ok:', response.status);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.orders.length > 0) {
        // Filter by selected store if applicable
        const orders = selectedStore 
          ? data.orders.filter((order: any) => order.store_id === selectedStore)
          : data.orders;

        // Process new orders only - compare order IDs
        for (const order of orders) {
          // If we haven't seen any order yet, or this is a newer order
          if (!lastOrderIdRef.current || order.id !== lastOrderIdRef.current) {
            // NEW ORDER (INSERT) - only notify if we've seen orders before
            if (lastOrderIdRef.current) {
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
            }
          }
        }

        // Update last seen order ID
        if (orders.length > 0) {
          lastOrderIdRef.current = orders[0].id;
        }
      }
    } catch (error) {
      console.error('[Polling] Error fetching orders:', error);
    } finally {
      isPollingRef.current = false;
    }
  };

  useEffect(() => {
    if (isPublicRoute) return;

    console.log('[Polling] Initializing order notifications...');
    
    // Initial fetch
    fetchLatestOrders();

    // Poll every 30 seconds
    pollIntervalRef.current = setInterval(fetchLatestOrders, 30000);

    return () => {
      console.log('[Polling] Cleaning up...');
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [playSound, selectedStore]);

  // Polling check for Programmed Orders
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