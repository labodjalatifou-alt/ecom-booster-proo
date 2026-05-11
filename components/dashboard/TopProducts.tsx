"use client";

import React, { useEffect, useState } from 'react';
import { Star, Package } from 'lucide-react';
import { useStore } from '../StoreProvider';
import { supabase } from '@/lib/supabase';

export default function TopProducts() {
  const { currency, selectedStore } = useStore();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTopProducts() {
      setLoading(true);
      try {
        let query = supabase.from('orders').select('product, price, status');
        if (selectedStore) {
          query = query.eq('store_id', selectedStore);
        }
        const { data: orders, error } = await query;
        if (error) throw error;

        if (orders) {
          // Group by product
          const grouped = orders.reduce((acc: any, curr: any) => {
            if (!acc[curr.product]) {
              acc[curr.product] = { name: curr.product, sold: 0, profit: 0, review: 5.0 };
            }
            acc[curr.product].sold += 1;
            if (curr.status === 'Livré') {
              acc[curr.product].profit += parseInt(curr.price.replace(/\s/g, ''));
            }
            return acc;
          }, {});

          const sorted = Object.values(grouped)
            .sort((a: any, b: any) => b.sold - a.sold)
            .slice(0, 5);

          setProducts(sorted);
        }
      } catch (err) {
        console.error('Error fetching top products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopProducts();

    const channel = supabase
      .channel('top-products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchTopProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedStore]);

  const emojis = ['✨', '🎥', '⌚', '🛍️', '🔥'];

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
        {products.length > 0 ? products.map((product, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:scale-[1.05] transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-primary-100 dark:hover:border-primary-900/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-2xl shadow-sm group-hover:rotate-12 transition-transform">
                {emojis[idx % emojis.length]}
              </div>
              <div>
                <div className="font-black text-slate-800 dark:text-slate-200 text-sm leading-tight mb-1 truncate max-w-[120px]">{product.name}</div>
                <div className="flex items-center gap-1 text-amber-500 text-[10px] font-black">
                  <Star className="w-3 h-3 fill-amber-500" />
                  {product.review.toFixed(1)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-slate-800 dark:text-slate-100">{new Intl.NumberFormat('fr-FR').format(product.profit)}</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{product.sold} Ventes</div>
            </div>
          </div>
        )) : (
          <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest italic">
            Aucune vente enregistrée
          </div>
        )}
      </div>

      <button className="w-full mt-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all">
        Rapport Complet
      </button>
    </div>
  );
}
