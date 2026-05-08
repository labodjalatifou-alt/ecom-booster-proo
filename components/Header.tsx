"use client";

import React from 'react';
import { Search, Bell, ChevronDown, Store, Menu, Check } from 'lucide-react';
import { useSidebar } from './SidebarProvider';
import { useStore, StoreId } from './StoreProvider';

export default function Header() {
  const { toggle } = useSidebar();
  const { selectedStore, setSelectedStore } = useStore();

  const getStoreName = (id: StoreId) => {
    switch(id) {
      case 'ALL': return 'Toutes les boutiques';
      case 'ABIDJAN': return 'Boutique Abidjan';
      case 'DAKAR': return 'Boutique Dakar';
      case 'CONAKRY': return 'Boutique Conakry';
    }
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
              {(['ALL', 'ABIDJAN', 'DAKAR', 'CONAKRY'] as StoreId[]).map(store => (
                <div 
                  key={store}
                  onClick={() => setSelectedStore(store)}
                  className={`px-3 py-2.5 text-sm rounded-xl cursor-pointer font-medium flex items-center justify-between transition-all duration-200 ${
                    selectedStore === store 
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm' 
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {store === 'ALL' && <Store className="w-4 h-4" />}
                    {getStoreName(store)}
                  </div>
                  {selectedStore === store && <Check className="w-4 h-4" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative hidden md:block group/search focus-within:z-10">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-hover/search:text-primary-500 group-focus-within/search:text-primary-600 dark:group-focus-within/search:text-primary-400 transition-colors duration-300 z-10" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="pl-9 pr-4 py-2 w-48 lg:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:shadow-md hover:bg-white dark:hover:bg-slate-700/50 focus:bg-white dark:focus:bg-slate-900 focus:scale-[1.02] lg:focus:w-72 focus:shadow-lg text-slate-700 dark:text-slate-200 relative z-0"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-110 active:scale-95 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

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
