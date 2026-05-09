"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search, Filter, Eye, MapPin, Phone, Package, X, Globe, User, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CommandesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [liveCount, setLiveCount] = useState(0);

  async function fetchOrders(silent = false) {
    if (!silent) setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setOrders(data);
      setLiveCount(data.length);
    }
    if (!silent) setLoading(false);
  }

  useEffect(() => {
    fetchOrders();

    // Temps réel — nouvelles commandes sans actualisation
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders(true);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = orders.filter(o =>
    o.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (s: string) => {
    if (s === 'Livré') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'Annulé') return 'bg-red-50 text-red-500 border-red-100';
    if (s === 'Confirmé') return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-amber-50 text-amber-600 border-amber-100';
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Gestion des Flux</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Toutes les Commandes</h2>
          <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
            {liveCount} commandes · Temps réel
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-full max-w-xs group">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher client, produit, ville..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all"
            />
          </div>
          <button onClick={fetchOrders} className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary-600 transition-all">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Chargement des commandes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <ShoppingCart className="w-12 h-12 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Aucune commande trouvée</p>
            <p className="text-xs text-slate-400">Utilisez le bouton "Sync Shopify" sur le Dashboard</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client & Mobile</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Produit</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Ville</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Statut</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Montant</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-8 py-5">
                      <div className="font-black text-sm group-hover:text-primary-600 transition-colors">{order.customer}</div>
                      <div className="text-[10px] font-bold text-primary-500 mt-0.5">{order.phone}</div>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-slate-700 dark:text-slate-200 max-w-[200px] truncate">{order.product}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                        <MapPin className="w-3 h-3" /> {order.city}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-sm">{order.price}</td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modale détails */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-primary-600 p-8 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black flex items-center gap-3"><ShoppingCart className="w-8 h-8" /> Fiche Commande</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X className="w-7 h-7" /></button>
            </div>
            <div className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User className="w-3 h-3" /> Client</span>
                  <p className="text-lg font-black">{selectedOrder.customer}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 justify-end"><Phone className="w-3 h-3" /> Numéro</span>
                  <p className="text-lg font-black text-primary-600">{selectedOrder.phone}</p>
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Globe className="w-3 h-3" /> Ville</span>
                  <span className="text-xs font-black uppercase">{selectedOrder.city}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-6 bg-primary-50 dark:bg-primary-900/10 rounded-3xl border border-primary-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm"><Package className="w-6 h-6 text-primary-600" /></div>
                  <div>
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest block">Produit</span>
                    <p className="text-sm font-black">{selectedOrder.product}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest block">Total</span>
                  <p className="text-xl font-black">{selectedOrder.price}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <a
                  href={`tel:${selectedOrder.phone}`}
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-center text-xs hover:bg-emerald-600 transition-all"
                >
                  📞 Appeler
                </a>
                <a
                  href={`https://wa.me/${selectedOrder.phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest text-center text-xs hover:bg-green-600 transition-all"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
