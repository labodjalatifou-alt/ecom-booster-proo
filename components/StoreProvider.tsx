"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type StoreId = string; // Now uses real DB IDs or 'ALL'
export type Currency = 'FCFA' | 'GNF';

export type StoreInfo = {
  id: string;
  name: string;
  currency: string;
  shopifyUrl: string;
};

type StoreContextType = {
  selectedStore: StoreId;
  setSelectedStore: (store: StoreId) => void;
  currency: Currency;
  stores: StoreInfo[];
  loadingStores: boolean;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [selectedStore, setSelectedStore] = useState<StoreId>('ALL');
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  useEffect(() => {
    async function fetchStores() {
      const { data, error } = await supabase
        .from('Store')
        .select('id, name, currency, shopifyUrl')
        .order('createdAt', { ascending: true });
      
      if (!error && data) {
        setStores(data);
      }
      setLoadingStores(false);
    }
    fetchStores();
  }, []);

  // Computed currency based on selected store
  const currency: Currency = (() => {
    if (selectedStore === 'ALL') {
      // Default to FCFA when "ALL" is selected
      return 'FCFA';
    }
    const store = stores.find(s => s.id === selectedStore);
    if (store?.currency === 'GNF') return 'GNF';
    return 'FCFA';
  })();

  return (
    <StoreContext.Provider value={{ selectedStore, setSelectedStore, currency, stores, loadingStores }}>
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
