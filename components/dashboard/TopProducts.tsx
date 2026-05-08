"use client";

import React from 'react';
import { Star, Package } from 'lucide-react';
import { useStore } from '../StoreProvider';

const products = [
  { id: 1, name: 'Brosse 5-en-1 Pro', review: 4.9, sold: 1240, profit: '12.4M', emoji: '✨' },
  { id: 2, name: 'Mini Projecteur HD', review: 4.8, sold: 850, profit: '8.5M', emoji: '🎥' },
  { id: 3, name: 'Montre Connectée S8', review: 4.7, sold: 620, profit: '6.2M', emoji: '⌚' },
];

export default function TopProducts() {
  const { currency } = useStore();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border-2 border-slate-100 dark:border-slate-800 shadow-sm col-span-1">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">Top Produits</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Volume de Vente</p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
           <Package className="w-5 h-5 text-slate-400" />
        </div>
      </div>
      
      <div className="space-y-6">
        {products.map((product, idx) => (
          <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:scale-[1.05] transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-primary-100 dark:hover:border-primary-900/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-2xl shadow-sm group-hover:rotate-12 transition-transform">
                {product.emoji}
              </div>
              <div>
                <div className="font-black text-slate-800 dark:text-slate-200 text-sm leading-tight mb-1">{product.name}</div>
                <div className="flex items-center gap-1 text-amber-500 text-[10px] font-black">
                  <Star className="w-3 h-3 fill-amber-500" />
                  {product.review}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-slate-800 dark:text-slate-100">{product.profit}</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{product.sold} Ventes</div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all">
        Rapport Complet
      </button>
    </div>
  );
}
