"use client";

import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, MoreVertical, Edit3, Trash2, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProduitsList() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [produits, setProduits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error("Supabase fetch error:", error);
      }
      if (data) {
        setProduits(data);
      }
    } catch (err) {
      console.error("Unexpected fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const requestDelete = (id: string) => {
    setActiveMenu(null);
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from('products').delete().eq('id', deleteConfirmId);
    if (!error) {
      setProduits(produits.filter(p => p.id !== deleteConfirmId));
    }
    setDeleteConfirmId(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 pt-8 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Boutique</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Mes Produits</h2>
          <p className="text-slate-400 text-xs font-bold mt-1">
            {produits.length} produit{produits.length !== 1 ? 's' : ''} enregistré{produits.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-400 transition-colors w-full sm:w-64"
            />
          </div>
          <Link 
            href="/produits/ajouter"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nouveau Produit
          </Link>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-black text-slate-600">Chargement...</p>
          </div>
        ) : produits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Package className="w-12 h-12 opacity-20" />
            <p className="text-sm font-black text-slate-600">Aucun produit</p>
            <Link href="/produits/ajouter" className="text-indigo-500 font-bold hover:underline">
              Commencez par ajouter un produit
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                  <th className="w-[45%] px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Produit</th>
                  <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Catégorie</th>
                  <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Stock</th>
                  <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Prix</th>
                  <th className="w-[10%] px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                {produits.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group cursor-pointer" 
                    onClick={() => router.push(`/produits/ajouter?id=${item.id}`)}
                  >
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
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-500' : item.status === 'draft' ? 'bg-gray-400' : 'bg-red-500'}`} />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.status === 'active' ? 'Actif' : item.status === 'draft' ? 'Brouillon' : item.status === 'archived' ? 'Archivé' : item.status}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">{item.category || 'Général'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`text-xs font-black uppercase ${item.stock === 0 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>{item.stock} unités</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-black text-sm text-right">
                      {new Intl.NumberFormat('fr-FR').format(parseInt(item.price || '0'))} {item.currency || 'FCFA'}
                    </td>
                    <td className="px-8 py-5 text-right relative" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                        className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeMenu === item.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                          <div className="absolute right-8 top-full mt-2 w-44 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in zoom-in-95 duration-200">
                            <button onClick={() => { router.push(`/produits/ajouter?id=${item.id}`); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors">
                              <Edit3 className="w-4 h-4 text-blue-500" /> Modifier
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); requestDelete(item.id); }} className="w-full flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 transition-colors">
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={cancelDelete} />
          <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-black mb-2">Supprimer le produit ?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Cette action est irréversible. Le produit sera définitivement supprimé de votre boutique.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 py-3 px-4 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/30"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
