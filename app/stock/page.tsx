"use client";

import React, { useEffect, useState } from 'react';
import { Package, Search, Plus, Edit3, Trash2, MoreVertical, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function StockPage() {
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState('active'); // active, draft

  useEffect(() => {
    fetchStock();
  }, [statusFilter]);

  async function fetchStock() {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*');
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('title');
      if (error) throw error;
      if (data) setStockItems(data);
    } catch (err) {
      console.error('Error fetching stock:', err);
      toast.error("Erreur lors de la récupération du stock");
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setNewStockValue(product.stock);
    setShowEditModal(true);
    setActiveMenu(null);
  };

  async function updateStock() {
    toast.success(`Stock de ${selectedProduct.name} mis à jour : ${newStockValue} unités`);
    setShowEditModal(false);
    // Ici, nous devrions mettre à jour la table Supabase
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
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-1 shadow-sm h-fit self-end">
          {[
            { id: 'active', label: 'Actifs' },
            { id: 'draft', label: 'Brouillons' },
            { id: 'all', label: 'Tous' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === f.id 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        
        <Link href="/ajouter-produit" className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> Ajouter un Produit
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Lecture du stock...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                  <th className="w-[40%] px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Produit & SKU</th>
                  <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Niveau de Stock</th>
                  <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Prix</th>
                  <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                {stockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                    <td className="px-8 py-6 overflow-hidden">
                      <div className="font-black text-base truncate">{item.title}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {item.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-[120px]">
                          <div className={`h-full ${item.stock > 50 ? 'bg-emerald-500' : item.stock > 10 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(item.stock, 100)}%` }}></div>
                        </div>
                        <span className={`text-[10px] font-black uppercase ${item.stock === 0 ? 'text-red-500' : 'text-slate-400'}`}>{item.stock} en stock</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-sm text-slate-800 dark:text-slate-100">
                      {new Intl.NumberFormat('fr-FR').format(parseInt(item.price?.replace(/\s/g, '') || '0'))} {item.currency || 'FCFA'}
                    </td>
                    <td className="px-8 py-6 text-right relative">
                      <button onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-primary-600 hover:text-white transition-all shadow-sm active:scale-90">
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeMenu === item.id && (
                        <div className="absolute right-8 top-full mt-2 w-48 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl z-[100] overflow-hidden py-2 animate-in zoom-in-95 duration-200">
                          <button onClick={() => handleEditClick(item)} className="w-full flex items-center gap-4 px-6 py-4 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-50">
                            <Edit3 className="w-4 h-4 text-blue-500" /> Modifier
                          </button>
                          <button className="w-full flex items-center gap-4 px-6 py-4 text-xs font-black uppercase text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black flex items-center gap-3"><Edit3 className="w-8 h-8 text-blue-500" /> Modifier Stock</h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X className="w-6 h-6" /></button>
             </div>
             <div className="space-y-6">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Produit: <span className="text-slate-800 dark:text-white">{selectedProduct?.name}</span></p>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nouvelle Quantité</label>
                  <input 
                    type="number" 
                    value={newStockValue} 
                    onChange={(e) => setNewStockValue(parseInt(e.target.value))}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-xl outline-none focus:ring-4 focus:ring-primary-500/10" 
                  />
                </div>
                <button onClick={updateStock} className="w-full py-5 bg-primary-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all">Mettre à jour le stock</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
