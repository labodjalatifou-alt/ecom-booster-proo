"use client";

import React, { createContext, useContext, useState } from 'react';

export type StoreId = 'ALL' | 'ABIDJAN' | 'DAKAR' | 'CONAKRY';
export type Currency = 'FCFA' | 'GNF';

type StoreContextType = {
  selectedStore: StoreId;
  setSelectedStore: (store: StoreId) => void;
  currency: Currency;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [selectedStore, setSelectedStore] = useState<StoreId>('ALL');

  // Computed currency based on store
  const currency: Currency = selectedStore === 'CONAKRY' ? 'GNF' : 'FCFA';

  return (
    <StoreContext.Provider value={{ selectedStore, setSelectedStore, currency }}>
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
