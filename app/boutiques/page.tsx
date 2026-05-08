"use client";

import React, { useState } from 'react';
import { Store, Plus, MoreVertical, Link as LinkIcon, Edit3, Trash2, X, CheckCircle2, AlertCircle, Key, Globe, Database, RefreshCw, ShoppingCart } from 'lucide-react';

const initialStores = [
  { id: 1, name: 'Boutique Abidjan', currency: 'FCFA', url: 'abidjan-store.myshopify.com', status: 'Connecté' },
  { id: 2, name: 'Boutique Dakar', currency: 'FCFA', url: 'dakar-ecom.myshopify.com', status: 'Connecté' },
  { id: 3, name: 'Boutique Conakry', currency: 'GNF', url: 'conakry-shop.myshopify.com', status: 'Erreur API' },
];

export default function BoutiquesPage() {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulation d'importation MASSIVE (Commandes + Produits)
    setTimeout(() => {
      setLoading(false);
      setShowAddModal(false);
      alert('SYNCHRONISATION TERMINÉE ! \n\n- Toutes les commandes existantes ont été importées. \n- Le catalogue produits (Actifs, Brouillons) est à jour. \n- La connexion avec Shopify est stable.');
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Store className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Multi-Store Sync</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Mes Boutiques</h2>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 bg-primary-600 text-white px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-500/30 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Ajouter une boutique
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initialStores.map((store) => (
          <div key={store.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-300 group relative">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-inner">
                <Store className="w-8 h-8 text-primary-600" />
              </div>
              <div className="relative">
                <button onClick={() => setActiveMenu(activeMenu === store.id ? null : store.id)} className="p-3 text-slate-400 hover:text-primary-600 rounded-2xl transition-all active:scale-90">
                  <MoreVertical className="w-6 h-6" />
                </button>
                {activeMenu === store.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 rounded-[2rem] shadow-2xl z-50 overflow-hidden py-2 animate-in zoom-in-95 duration-200">
                      <button className="w-full flex items-center gap-3 px-6 py-4 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors"><Edit3 className="w-4 h-4 text-blue-500" /> Modifier</button>
                      <button className="w-full flex items-center gap-3 px-6 py-4 text-xs font-black uppercase text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /> Supprimer</button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <h3 className="text-2xl font-black mb-2">{store.name}</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
              <LinkIcon className="w-3.5 h-3.5" /> {store.url}
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Devise</span><span className="text-sm font-black">{store.currency}</span></div>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 ${store.status === 'Connecté' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {store.status === 'Connecté' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />} {store.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Store & Connect Shopify Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden p-10 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3"><Store className="w-8 h-8 text-primary-600" /> Connecter Shopify</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleConnect} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nom de la boutique</label>
                <input type="text" required placeholder="Ex: Ma Boutique Abidjan" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">URL Shopify (.myshopify.com)</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required placeholder="ma-boutique.myshopify.com" className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Admin API Access Token</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" required placeholder="shpat_xxxxxxxxxxxxxxxxxxxx" className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10" />
                </div>
              </div>

              <div className="p-5 bg-primary-50 dark:bg-primary-900/10 rounded-[2rem] border border-primary-100 flex items-center gap-4">
                <RefreshCw className={`w-8 h-8 text-primary-600 ${loading ? 'animate-spin' : ''}`} />
                <div className="flex-1">
                   <p className="text-[10px] font-black text-primary-800 dark:text-primary-300 uppercase tracking-widest mb-1">Synchronisation massive</p>
                   <p className="text-[9px] font-bold text-primary-700/60 dark:text-primary-400/60 italic uppercase leading-tight">L'importation inclura TOUTES les commandes existantes et les produits du catalogue.</p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-primary-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-primary-700 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? "Synchronisation..." : "Lancer la Synchronisation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
