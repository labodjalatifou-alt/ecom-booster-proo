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
      const { data, error } = await supabase
        .from('Store')
        .select('id, name, currency, country, shopifyUrl')
        .order('createdAt', { ascending: true });
      
      if (!error && data) {
        setStores(data);
        // Auto-select first store if none selected
        if (data.length > 0 && !selectedStore) {
          setSelectedStore(data[0].id);
        }
      }
      setLoadingStores(false);
    }
    fetchStores();
  }, []);

  // Active store object
  const activeStore = stores.find(s => s.id === selectedStore) || null;

  // Currency from the active store
  const currency: Currency = (() => {
    if (activeStore?.currency === 'GNF') return 'GNF';
    return activeStore?.currency as Currency || 'FCFA';
  })();

  const noStoreConnected = !loadingStores && stores.length === 0;

  return (
    <StoreContext.Provider value={{ 
      selectedStore, 
      setSelectedStore, 
      currency, 
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
