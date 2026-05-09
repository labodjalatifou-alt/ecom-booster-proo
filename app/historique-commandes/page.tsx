"use client";

import React, { useEffect, useState } from 'react';
import { History, Search, ArrowRight, CheckCircle2, XCircle, Clock, MapPin, DollarSign, Package, User, Filter, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function HistoriqueCommandesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shopify_id?.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
              <History className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Archives Ventes</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Historique des Commandes</h2>
        </div>
        
        <div className="flex gap-4">
          <div className="relative w-full max-w-xs group">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher une commande..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all" 
            />
          </div>
          <button className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary-600 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Chargement des archives...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client & Date</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Produit & Ville</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Statut</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Montant</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Shopify ID</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                  >
                    <td className="px-8 py-6">
                      <div className="font-black text-sm group-hover:text-primary-600 transition-colors">{order.customer}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                        {format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-black text-slate-700 dark:text-slate-200">{order.product}</div>
                      <div className="text-[10px] font-bold text-primary-500 mt-1 uppercase tracking-tighter">{order.city}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'Livré' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                        order.status === 'Annulé' ? 'bg-red-50 text-red-500 border border-red-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-sm text-slate-800 dark:text-slate-100">
                      {new Intl.NumberFormat('fr-FR').format(parseInt(order.price.replace(/\s/g, '')))} {order.city === 'Conakry' ? 'GNF' : 'FCFA'}
                    </td>
                    <td className="px-8 py-6 text-right font-mono text-[10px] text-slate-400">
                      #{order.shopify_id || '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Search className="w-10 h-10 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Aucune commande trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
