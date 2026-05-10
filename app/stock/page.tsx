"use client";

import React, { useEffect, useState } from 'react';
import { Package, Plus, Edit3, Trash2, MoreVertical, X, Loader2, RefreshCw, ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useStore } from '@/components/StoreProvider';
import Link from 'next/link';

export default function StockPage() {
  const { currency } = useStore();
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchStock();
  }, [statusFilter]);

  async function fetchStock() {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('products').select('*');
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      const { data, error: err } = await query.order('created_at', { ascending: false });
      
      if (err) {
        // If table doesn't exist or has permission issue, show empty state
        console.warn('Stock fetch warning:', err.message);
        setStockItems([]);
        // Don't set error for "relation does not exist" - just show empty state
        if (err.message?.includes('does not exist') || err.code === '42P01') {
          setError(null);
        } else {
          setError(err.message);
        }
      } else {
        setStockItems(data || []);
      }
    } catch (err: any) {
      console.warn('Stock fetch exception:', err?.message || err);
      setStockItems([]);
      setError(null); // Show empty state instead of error
    } finally {
      setLoading(false);
    }
  }

  async function syncProducts() {
    return toast.promise(
      fetch('/api/sync-products').then(r => r.json()).then(data => {
        if (data.error) throw new Error(data.error);
        fetchStock();
        return data;
      }),
      {
        loading: 'Synchronisation des produits Shopify...',
        success: (d) => `${d.count || 0} produits synchronisés !`,
        error: (e) => `Erreur: ${e.message || 'Synchronisation échouée'}`,
      }
    );
  }

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setNewStockValue(product.stock || 0);
    setShowEditModal(true);
    setActiveMenu(null);
  };

  async function updateStock() {
    if (!selectedProduct) return;
    try {
      const { error: err } = await supabase
        .from('products')
        .update({ stock: newStockValue })
        .eq('id', selectedProduct.id);
      if (err) throw err;
      toast.success(`Stock mis à jour : ${newStockValue} unités`);
      setShowEditModal(false);
      fetchStock();
    } catch (err: any) {
      toast.error('Erreur : ' + err.message);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Supprimer ce produit de l'inventaire ?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error("Erreur suppression");
    } else {
      toast.success("Produit supprimé");
      setStockItems(prev => prev.filter(p => p.id !== id));
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Inventaire Global</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Gestion du Stock</h2>
          <p className="text-slate-400 text-xs font-bold mt-1">
            {stockItems.length} produit{stockItems.length !== 1 ? 's' : ''} dans l'inventaire
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-1 shadow-sm">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'active', label: 'Actifs' },
              { id: 'draft', label: 'Brouillons' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === f.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={syncProducts}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-primary-600 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Sync Shopify
          </button>
          <Link
            href="/ajouter-produit"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Chargement du stock...</p>
          </div>
        ) : stockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Package className="w-12 h-12 opacity-20" />
            <p className="text-sm font-black text-slate-600">Aucun produit dans l'inventaire</p>
            <p className="text-xs text-slate-400 text-center max-w-xs">Synchronisez vos produits Shopify ou ajoutez un produit manuellement.</p>
            <button onClick={syncProducts} className="mt-4 flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all">
              <RefreshCw className="w-4 h-4" /> Sync Shopify
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                  <th className="w-[40%] px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Produit</th>
                  <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Stock</th>
                  <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Prix</th>
                  <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                {stockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                    <td className="px-8 py-5 overflow-hidden">
                      <div className="flex items-center gap-4">
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="w-12 h-12 rounded-xl object-cover border-2 border-slate-100 dark:border-slate-800" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                        <div>
                          <div className="font-black text-sm truncate max-w-[250px]">{item.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.status === 'active' ? 'Actif' : 'Brouillon'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className={`h-full ${(item.stock || 0) > 50 ? 'bg-emerald-500' : (item.stock || 0) > 10 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(item.stock || 0, 100)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-black uppercase ${!item.stock ? 'text-red-500' : 'text-slate-400'}`}>{item.stock || 0} unités</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-black text-sm">
                      {new Intl.NumberFormat('fr-FR').format(parseInt(String(item.price || '0').replace(/\s/g, '')))} {item.currency || currency}
                    </td>
                    <td className="px-8 py-5 text-right relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                        className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-primary-600 hover:text-white transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeMenu === item.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                          <div className="absolute right-8 top-full mt-2 w-44 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in zoom-in-95 duration-200">
                            <button onClick={() => handleEditClick(item)} className="w-full flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors">
                              <Edit3 className="w-4 h-4 text-blue-500" /> Modifier Stock
                            </button>
                            <button onClick={() => { deleteProduct(item.id); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" /> Supprimer
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black flex items-center gap-3"><Edit3 className="w-6 h-6 text-blue-500" /> Modifier Stock</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-6">{selectedProduct.title}</p>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nouvelle Quantité</label>
              <input
                type="number"
                value={newStockValue}
                onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-xl outline-none focus:ring-4 focus:ring-primary-500/10"
              />
              <button onClick={updateStock} className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-700 transition-all">
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
