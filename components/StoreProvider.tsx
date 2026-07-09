"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type Currency = 'FCFA' | 'GNF';

export type StoreInfo = {
  id: string;
  name: string;
  currency: string;
  country: string;
  shopifyUrl: string;
};

type StoreContextType = {
  selectedStore: string | null;
  storeId: string | null;
  setSelectedStore: (store: string) => void;
  currency: Currency;
  stores: StoreInfo[];
  loadingStores: boolean;
  noStoreConnected: boolean;
  activeStore: StoreInfo | null;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  useEffect(() => {
    async function fetchStores() {
      // Security: Only fetch stores if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoadingStores(false);
        return;
      }

      const { data: storeData, error: err1 } = await supabase
        .from('Store')
        .select('id, name, currency, country, shopifyUrl')
        .order('createdAt', { ascending: true });
        
      const { data: boutiquesData, error: err2 } = await supabase
        .from('stores')
        .select('id, name')
        .order('created_at', { ascending: true });

      const combined: StoreInfo[] = [];
      if (storeData) combined.push(...storeData);
      if (boutiquesData) {
        boutiquesData.forEach(b => {
          // Avoid duplicates if ids somehow match
          if (!combined.find(s => s.id === b.id)) {
            combined.push({
              id: b.id,
              name: `${b.name} (Boutique)`,
              currency: 'FCFA',
              country: 'Côte d\'Ivoire',
              shopifyUrl: ''
            });
          }
        });
      }

      if (combined.length > 0) {
        setStores(combined);
        if (!selectedStore) {
          setSelectedStore(combined[0].id);
        }
      }
      setLoadingStores(false);
    }
    fetchStores();
  }, []);

  // Active store object
  const activeStore = stores.find(s => s.id === selectedStore) || null;

  // Currency from the active store
  const currency = (activeStore?.currency || 'FCFA') as string;
  const country = activeStore?.country || 'Côte d\'Ivoire';

  const noStoreConnected = !loadingStores && stores.length === 0;

  return (
    <StoreContext.Provider value={{ 
      selectedStore, 
      storeId: selectedStore,
      setSelectedStore, 
      currency: currency as any, 
      stores, 
      loadingStores, 
      noStoreConnected,
      activeStore 
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
