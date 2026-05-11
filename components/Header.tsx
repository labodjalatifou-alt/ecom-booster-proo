"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Store, Menu, Check, LogOut, User, Mail } from 'lucide-react';
import { useSidebar } from './SidebarProvider';
import { useStore } from './StoreProvider';
import Link from 'next/link';

export default function Header() {
  const { toggle } = useSidebar();
  const { selectedStore, setSelectedStore, stores, loadingStores, noStoreConnected, activeStore } = useStore();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStoreName = (id: string | null) => {
    if (!id) return 'Aucune boutique';
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
          Bonjour, <span className="text-primary-600">LABOSTAR</span>
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
              {noStoreConnected ? 'Aucune boutique' : getStoreName(selectedStore)}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
          </div>
          
          <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden transform origin-top-right sm:origin-top-left group-hover:translate-y-0 translate-y-2">
            <div className="p-2 space-y-1">
              {loadingStores ? (
                <div className="px-3 py-2 text-xs text-slate-400 italic">Chargement...</div>
              ) : stores.length === 0 ? (
                <div className="p-3 space-y-3">
                  <div className="px-1 text-xs text-slate-400 italic">Aucune boutique connectée</div>
                  <Link href="/boutiques" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all">
                    <Store className="w-3.5 h-3.5" /> Connecter une boutique
                  </Link>
                </div>
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

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <div onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-80 active:scale-95 transition-all">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold border border-primary-200">L</div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
          </div>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-black text-lg border-2 border-primary-200">L</div>
                    <div>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100">LABOSTAR</p>
                      <p className="text-[10px] font-bold text-slate-400">Administrateur</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                    <Mail className="w-3 h-3" /> labostar@ecombooster.pro
                  </div>
                </div>
                {activeStore && (
                  <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Boutique Active</p>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-200">{activeStore.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">{activeStore.country || 'Non défini'} · {activeStore.currency}</p>
                  </div>
                )}
                <div className="p-2">
                  <Link href="/boutiques" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                    <Store className="w-4 h-4 text-primary-500" /> Mes Boutiques
                  </Link>
                  <Link href="/equipe" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                    <User className="w-4 h-4 text-blue-500" /> Mon Profil
                  </Link>
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2" />
                  <button onClick={() => setShowProfile(false)} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
