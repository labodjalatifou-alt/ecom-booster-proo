"use client";

import React, { useState } from 'react';
import { Package, Plus, Image as ImageIcon, Tag, DollarSign, List, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { sanitizeError } from '@/lib/utils';

export default function AjouterProduitPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Beauté',
    stock: '',
    description: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/create-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.error) {
        // Traduire les erreurs Shopify courantes en messages clairs
        if (data.error.includes('401') || data.error.includes('Unauthorized')) {
          throw new Error("Permission refusée. Ton token Shopify doit avoir la permission 'write_products'.");
        }
        if (data.error.includes('403') || data.error.includes('Forbidden')) {
          throw new Error("Accès refusé. Vérifie les scopes de ton API Shopify.");
        }
        throw new Error(data.error);
      }

      toast.success(`✅ "${formData.name}" créé sur Shopify !`);
      setFormData({ name: '', price: '', category: 'Beauté', stock: '', description: '' });
    } catch (err: any) {
      toast.error(sanitizeError(err), { duration: 6000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <Link href="/stock" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-all mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour au Stock
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-3xl">
            <Plus className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter">Nouveau Produit</h2>
            <p className="text-slate-400 text-sm font-medium italic mt-1">Ajoutez un article à votre boutique et à votre inventaire.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm space-y-8">
            {/* Nom du Produit */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Nom du Produit</label>
              <div className="relative group">
                <Tag className="w-5 h-5 text-slate-300 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                <input 
                  required
                  type="text" 
                  placeholder="Ex: Brosse Soufflante 5-en-1"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary-500/20 rounded-2xl font-bold text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Catégorie & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Catégorie</label>
                <div className="relative">
                  <List className="w-5 h-5 text-slate-300 absolute left-5 top-1/2 -translate-y-1/2" />
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary-500/20 rounded-2xl font-bold text-sm outline-none appearance-none cursor-pointer"
                  >
                    <option>Beauté</option>
                    <option>High-Tech</option>
                    <option>Maison</option>
                    <option>Mode</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Stock Initial</label>
                <div className="relative">
                  <Package className="w-5 h-5 text-slate-300 absolute left-5 top-1/2 -translate-y-1/2" />
                  <input 
                    required
                    type="number" 
                    placeholder="Ex: 100"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary-500/20 rounded-2xl font-bold text-sm outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Prix */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Prix de Vente</label>
              <div className="relative">
                <DollarSign className="w-5 h-5 text-slate-300 absolute left-5 top-1/2 -translate-y-1/2" />
                <input 
                  required
                  type="number" 
                  placeholder="Ex: 25000"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary-500/20 rounded-2xl font-bold text-sm outline-none transition-all"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-6 bg-primary-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-primary-500/40 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" /> Création en cours...
                </div>
              ) : "Propulser sur Shopify"}
            </button>
          </form>
        </div>

        <div className="space-y-8">
          {/* Preview Image */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] p-8 shadow-sm text-center">
             <div className="w-full aspect-square bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-4 border-dashed border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-primary-500 transition-all">
                <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl shadow-sm group-hover:scale-110 transition-all">
                  <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-primary-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary-600">Ajouter Image</p>
             </div>
             <p className="text-[9px] font-bold text-slate-300 mt-6 leading-relaxed">Format recommandé : JPG ou PNG<br/>Taille max : 5Mo</p>
          </div>

          {/* Conseils IA */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] p-8 text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-black uppercase tracking-widest">Conseil IA</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
                  "Pour un produit de beauté comme celui-ci, utilisez des photos avant/après et précisez la livraison en 24h à Abidjan pour maximiser vos conversions."
                </p>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-[50px] -mr-16 -mt-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
