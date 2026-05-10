"use client";

import React, { useState, useEffect } from 'react';
import { Store, Plus, MoreVertical, Globe, Key, X, RefreshCw, Loader2, Trash2, Edit3, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function BoutiquesPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    shopifyUrl: '',
    shopifyToken: '',
    currency: 'FCFA'
  });

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    setLoading(true);
    const { data, error } = await supabase
      .from('Store')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching stores:', error);
    } else {
      setStores(data || []);
    }
    setLoading(false);
  }

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { data, error } = await supabase
      .from('Store')
      .insert([
        {
          id: crypto.randomUUID(), // Generate a unique ID to satisfy the not-null constraint
          name: formData.name,
          shopifyUrl: formData.shopifyUrl,
          shopifyToken: formData.shopifyToken,
          currency: formData.currency
        }
      ])
      .select();

    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Boutique connectée avec succès !");
      setStores([data[0], ...stores]);
      setShowAddModal(false);
      setFormData({ name: '', shopifyUrl: '', shopifyToken: '', currency: 'FCFA' });
    }
    setSubmitting(false);
  };

  const deleteStore = async (id: string) => {
    if (!confirm("Supprimer cette boutique ? Cela n'effacera pas les commandes déjà synchronisées.")) return;
    
    const { error } = await supabase.from('Store').delete().eq('id', id);
    if (error) toast.error("Erreur suppression");
    else {
      toast.success("Boutique supprimée");
      setStores(stores.filter(s => s.id !== id));
    }
  };

  const syncStore = async (storeId: string) => {
    return toast.promise(
      fetch(`/api/sync-shopify?storeId=${storeId}`).then(r => r.json()),
      {
        loading: 'Synchronisation de la boutique...',
        success: (data) => `${data.count || 0} commandes synchronisées !`,
        error: 'Échec de la synchronisation',
      }
    );
  };

  const syncAllStores = async () => {
    return toast.promise(
      fetch(`/api/sync-shopify`).then(r => r.json()),
      {
        loading: 'Synchronisation de toutes les boutiques...',
        success: (data) => `${data.count || 0} commandes synchronisées au total !`,
        error: 'Échec de la synchronisation globale',
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Store className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Gestion Multi-Boutiques</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Mes Boutiques Shopify</h2>
          <p className="text-slate-400 text-sm mt-1 font-medium italic">Gérez vos inventaires et synchronisations par boutique.</p>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <button 
            onClick={syncAllStores}
            className="flex items-center gap-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-600 px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-sm hover:text-primary-600 transition-all active:scale-95"
          >
            <RefreshCw className="w-5 h-5" /> Sync Tout
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 bg-primary-600 text-white px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-500/30 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Connecter une boutique
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-40 flex flex-col items-center justify-center gap-4 text-slate-400">
             <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
             <p className="text-[10px] font-black uppercase tracking-widest">Chargement des boutiques...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="col-span-full py-40 flex flex-col items-center justify-center gap-6 text-center">
            <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-[3rem] opacity-40">
              <Store className="w-16 h-16 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-600 dark:text-slate-300">Aucune boutique connectée</p>
              <p className="text-xs font-bold text-slate-400 mt-1">Commencez par ajouter votre première boutique Shopify.</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-8 py-4 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20"
            >
              Ajouter Maintenant
            </button>
          </div>
        ) : (
          stores.map((store) => (
            <div key={store.id} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:border-primary-100 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                  <Store className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => deleteStore(store.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-xl font-black tracking-tight mb-1">{store.name}</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 truncate mb-6 italic">
                  <Globe className="w-3 h-3" /> {store.shopifyUrl}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Devise</p>
                    <p className="text-sm font-black">{store.currency}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-xs font-black">Actif</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => syncStore(store.id)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Synchroniser
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden p-10 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3"><Store className="w-8 h-8 text-primary-600" /> Connecter Shopify</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleAddStore} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nom de la boutique</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Boutique Abidjan" 
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">URL Shopify (.myshopify.com)</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required 
                    value={formData.shopifyUrl}
                    onChange={e => setFormData({...formData, shopifyUrl: e.target.value})}
                    placeholder="ma-boutique.myshopify.com" 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Admin API Access Token</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    required 
                    value={formData.shopifyToken}
                    onChange={e => setFormData({...formData, shopifyToken: e.target.value})}
                    placeholder="shpat_xxxxxxxxxxxxxxxxxxxx" 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10" 
                  />
                </div>
              </div>

              <div className="p-5 bg-primary-50 dark:bg-primary-900/10 rounded-[2rem] border border-primary-100 flex items-center gap-4">
                <RefreshCw className={`w-8 h-8 text-primary-600 ${submitting ? 'animate-spin' : ''}`} />
                <div className="flex-1">
                   <p className="text-[10px] font-black text-primary-800 dark:text-primary-300 uppercase tracking-widest mb-1">Synchronisation massive</p>
                   <p className="text-[9px] font-bold text-primary-700/60 dark:text-primary-400/60 italic uppercase leading-tight">L'importation inclura TOUTES les commandes existantes et les produits.</p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-5 bg-primary-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-primary-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? "Connexion..." : "Lancer la Connexion"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
