"use client";

import React, { useEffect, useState } from 'react';
import { History, Search, Filter, MapPin, Loader2, ShoppingCart, RefreshCw, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useStore } from '@/components/StoreProvider';
import { cleanCity } from '@/lib/utils';

const PAGE_SIZE = 50;


function parsePrice(val: any): number {
  if (!val) return 0;
  return parseFloat(String(val).replace(/\s/g, '').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
}



const statusColor = (s: string) => {
  if (s === 'Livré') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  if (s === 'Annulé') return 'bg-red-50 text-red-600 border border-red-100';
  if (s === 'Confirmé') return 'bg-blue-50 text-blue-700 border border-blue-100';
  return 'bg-amber-50 text-amber-700 border border-amber-100';
};

export default function HistoriqueCommandesPage() {
  const { currency: storeCurrency, selectedStore, stores } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);

  async function fetchOrders(p = page) {
    setLoading(true);
    try {
      // Count
      let countQ = supabase.from('orders').select('*', { count: 'exact', head: true });
      // Store filtering
      if (selectedStore) {
        countQ = countQ.eq('store_id', selectedStore);
      } else if (stores.length > 0) {
        countQ = countQ.in('store_id', stores.map(s => s.id));
      }
      if (statusFilter !== 'all') countQ = countQ.eq('status', statusFilter);
      const { count } = await countQ;
      if (count !== null) setTotalCount(count);

      // Data
      const from = (p - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let q = supabase.from('orders').select('*').order('created_at', { ascending: false }).range(from, to);
      // Store filtering
      if (selectedStore) {
        q = q.eq('store_id', selectedStore);
      } else if (stores.length > 0) {
        q = q.in('store_id', stores.map(s => s.id));
      }
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);

      const { data, error } = await q;
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Historique fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    fetchOrders(1);
  }, [statusFilter, selectedStore]);

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const filtered = orders.filter(o =>
    o.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(o.shopify_id || '').includes(searchTerm)
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const statuses = ['all', 'A Confirmer', 'Confirmé', 'Livré', 'Annulé'];
  const statusLabels: Record<string, string> = {
    'all': 'Tous',
    'A Confirmer': 'En attente',
    'Confirmé': 'Confirmés',
    'Livré': 'Livrés',
    'Annulé': 'Annulés',
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-2 md:px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <History className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Archives Ventes</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Historique des Commandes</h2>
          {!loading && (
            <p className="text-slate-400 text-xs font-bold mt-1">
              {totalCount} commandes · Page {page}/{totalPages || 1}
            </p>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all w-52"
            />
          </div>
          <button
            onClick={() => fetchOrders(page)}
            className="p-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary-600 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="mb-8">
        {/* Mobile Dropdown */}
        <div className="md:hidden relative w-full mt-2">
          <button 
            onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm"
          >
            <span className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
              {statusLabels[statusFilter] || 'Tous'}
            </span>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isTabDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isTabDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsTabDropdownOpen(false)} />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {statuses.map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setIsTabDropdownOpen(false); }}
                    className={`w-full flex items-center p-4 text-xs font-black uppercase tracking-widest transition-colors ${
                      statusFilter === s ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-1 shadow-sm w-fit flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-slate-900 dark:bg-primary-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">Chargement des archives...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-300">
            <ShoppingCart className="w-12 h-12" />
            <p className="text-sm font-black text-slate-500">
              {searchTerm ? 'Aucun résultat' : 'Aucune commande dans cette catégorie'}
            </p>
          </div>
        ) : (
          <>
            {/* VUE MOBILE */}
            <div className="lg:hidden flex flex-col gap-4 p-4">
              {filtered.map((order) => (
                <div key={order.id} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-4 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-sm text-slate-800 dark:text-slate-100">{order.customer}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                        {order.created_at ? format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr }) : '-'}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-sm font-black text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight mb-2">
                      {order.product}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-2">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate uppercase">
                        {order.address && order.address !== 'Adresse non précisée' ? `${order.address}, ` : ''}
                        {cleanCity(order.city)} {order.country ? `, ${order.country}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="font-mono text-[9px] text-slate-400">
                      #{String(order.shopify_id || order.id || '').slice(-6)}
                    </div>
                    <div className="text-right">
                      <div className="font-black text-sm text-emerald-600">{new Intl.NumberFormat('fr-FR').format(parsePrice(order.price))} {order.currency || storeCurrency}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* VUE DESKTOP */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest">Client & Date</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest">Produit & Ville</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Statut</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Montant</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Réf.</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                  {filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                      <td className="px-8 py-5">
                        <div className="font-black text-sm">{order.customer}</div>
                        <div className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">
                          {order.created_at
                            ? format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })
                            : '-'}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-black text-slate-700 dark:text-slate-200 truncate max-w-[200px]">{order.product}</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase mt-1">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {order.address && order.address !== 'Adresse non précisée' ? `${order.address}, ` : ''}
                            {cleanCity(order.city)} {order.country ? `, ${order.country}` : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="font-black text-sm">{new Intl.NumberFormat('fr-FR').format(parsePrice(order.price))}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase">{order.currency || storeCurrency}</div>
                      </td>
                      <td className="px-8 py-5 text-right font-mono text-[9px] text-slate-400">
                        #{String(order.shopify_id || order.id || '').slice(-6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-primary-600 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${
                  page === p
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="p-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-primary-600 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
