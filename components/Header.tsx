"use client";

import React from 'react';
import { ChevronDown, Store, Menu, Check } from 'lucide-react';
import { useSidebar } from './SidebarProvider';
import { useStore } from './StoreProvider';

export default function Header() {
  const { toggle } = useSidebar();
  const { selectedStore, setSelectedStore, stores, loadingStores } = useStore();

  const getStoreName = (id: string) => {
    if (id === 'ALL') return 'Toutes les boutiques';
    const store = stores.find(s => s.id === id);
    return store?.name || id;
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="md:hidden p-2 text-slate-500 hover:text-primary-600 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 hidden sm:block">
          Bonjour, Administrateur
        </h1>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Store Selector */}
        <div className="relative group cursor-pointer z-50">
          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="bg-primary-50 dark:bg-primary-900/30 p-1.5 rounded-full group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 pr-1 max-w-[90px] sm:max-w-[150px] truncate">
              {getStoreName(selectedStore)}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
          </div>
          
          <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden transform origin-top-right sm:origin-top-left group-hover:translate-y-0 translate-y-2">
            <div className="p-2 space-y-1">
              {/* "All" option */}
              <div 
                onClick={() => setSelectedStore('ALL')}
                className={`px-3 py-2.5 text-sm rounded-xl cursor-pointer font-medium flex items-center justify-between transition-all duration-200 ${
                  selectedStore === 'ALL' 
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm' 
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4" />
                  Toutes les boutiques
                </div>
                {selectedStore === 'ALL' && <Check className="w-4 h-4" />}
              </div>

              {/* Separator */}
              {stores.length > 0 && <div className="h-px bg-slate-100 dark:bg-slate-700 mx-2" />}

              {/* Dynamic stores from DB */}
              {loadingStores ? (
                <div className="px-3 py-2 text-xs text-slate-400 italic">Chargement...</div>
              ) : stores.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-400 italic">Aucune boutique connectée</div>
              ) : (
                stores.map(store => (
                  <div 
                    key={store.id}
                    onClick={() => setSelectedStore(store.id)}
                    className={`px-3 py-2.5 text-sm rounded-xl cursor-pointer font-medium flex items-center justify-between transition-all duration-200 ${
                      selectedStore === store.id 
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm' 
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded uppercase">{store.currency}</span>
                      {store.name}
                    </div>
                    {selectedStore === store.id && <Check className="w-4 h-4" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-80 active:scale-95 transition-all">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold border border-primary-200">
            A
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
