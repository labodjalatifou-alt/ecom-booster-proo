"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search, Eye, MapPin, Phone, Package, X, Globe, User, Loader2, RefreshCw, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/components/StoreProvider';
import { formatFullAddress } from '@/lib/utils';
import DateRangePicker, { DateRange, DEFAULT_RANGE } from '@/components/DateRangePicker';
import toast from 'react-hot-toast';

type StatusFilter = 'ALL' | 'A Confirmer' | 'Confirmé' | 'Livré' | 'Annulé';

const PAGE_SIZE = 30;

export default function CommandesPage() {
  const { selectedStore, stores, loadingStores } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_RANGE);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);

  async function fetchOrders(p = page, silent = false) {
    if (!silent) setLoading(true);

    try {
      const params = new URLSearchParams();
      if (selectedStore) params.set('store_id', selectedStore);
      else if (stores.length > 0) params.set('store_ids', stores.map(s => s.id).join(','));
      if (dateRange.from) params.set('from', dateRange.from);
      if (dateRange.to) params.set('to', dateRange.to);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      params.set('page', String(p));
      params.set('page_size', String(PAGE_SIZE));

      const res = await fetch(`/api/orders/list?${params.toString()}`);
      const data = await res.json();

      if (data.orders) setOrders(data.orders);
      if (data.total != null) setTotalCount(data.total);
    } catch (err) {
      console.error('Erreur fetch orders:', err);
    }

    if (!silent) setLoading(false);
  }

  useEffect(() => {
    if (loadingStores) return; // Attendre que les stores soient chargés
    setPage(1);
    fetchOrders(1);
  }, [dateRange, statusFilter, selectedStore, loadingStores]);

  useEffect(() => {
    fetchOrders(page);
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders(page, true))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [page]);

  const filtered = orders.filter(o =>
    o.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleSync = async () => {
    toast.promise(
      fetch('/api/sync-shopify').then(r => r.json()),
      {
        loading: 'Synchronisation Shopify en cours...',
        success: (data) => {
          fetchOrders(1);
          return `${data.count || 0} commandes synchronisées !`;
        },
        error: 'Erreur lors de la synchronisation',
      }
    );
  };

  const statusColor = (s: string) => {
    if (s === 'Livré') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s === 'Annulé') return 'bg-red-100 text-red-700 border-red-200';
    if (s === 'Confirmé') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  const statuses: { id: StatusFilter; label: string }[] = [
    { id: 'ALL', label: 'Tous' },
    { id: 'A Confirmer', label: 'À Confirmer' },
    { id: 'Confirmé', label: 'Confirmées' },
    { id: 'Livré', label: 'Livrées' },
    { id: 'Annulé', label: 'Annulées' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-10 px-2 md:px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Gestion des Flux</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Toutes les Commandes</h2>
          <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block" />
            {totalCount} commandes · Page {page}/{totalPages || 1}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all w-56"
            />
          </div>
          <button
            onClick={handleSync}
            className="p-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary-600 transition-all"
            title="Synchroniser avec Shopify"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3 mb-6 w-full flex-nowrap">
        {/* Date Selector */}
        <div className="shrink-0">
          <DateRangePicker value={dateRange} onChange={setDateRange} align="left" />
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative shrink-0">
          <button 
            onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
            className="flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:border-slate-200 transition-all"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 whitespace-nowrap">
              Statut: {statuses.find(s => s.id === statusFilter)?.label || 'Tous'}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isTabDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isTabDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsTabDropdownOpen(false)} />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {statuses.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setStatusFilter(s.id); setIsTabDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                      statusFilter === s.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-visible min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">Chargement des commandes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <ShoppingCart className="w-12 h-12 opacity-20" />
            <p className="text-sm font-black text-slate-600">{searchTerm ? 'Aucun résultat' : 'Aucune commande'}</p>
            {!searchTerm && <p className="text-xs text-slate-400">Synchronisez vos commandes depuis le tableau de bord.</p>}
          </div>
        ) : (
          <>
            {/* VUE MOBILE */}
            <div className="lg:hidden flex flex-col gap-4 p-4">
              {filtered.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-3 cursor-pointer active:scale-[0.98] transition-all" 
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-sm uppercase">{order.customer}</div>
                      <div className="text-[10px] font-bold text-primary-500 mt-0.5 flex items-center gap-1"><Phone className="w-3 h-3" /> {order.phone}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-2">{order.product}</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-2">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate uppercase">
                        {formatFullAddress(order.address, order.city, order.country)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Total</div>
                      <div className="font-black text-sm">{new Intl.NumberFormat('fr-FR').format(Number(String(order.price || '0').replace(/\s/g, '')))} {order.currency || 'FCFA'}</div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} className="p-2.5 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500"><Eye className="w-4 h-4" /></button>
                       <a href={`tel:${order.phone}`} onClick={e => e.stopPropagation()} className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl"><Phone className="w-4 h-4" /></a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* VUE DESKTOP */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest">Client</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest">Produit</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest">Ville</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Statut</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Montant</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                  {filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-8 py-5">
                        <div className="font-black text-sm uppercase">{order.customer}</div>
                        <div className="text-[9px] font-bold text-slate-400 mt-0.5">#{String(order.shopify_id || order.id).slice(-6)}</div>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[200px] truncate">
                        {order.product}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase mt-1">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {formatFullAddress(order.address, order.city, order.country)}
                          </span>
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" /> {order.phone}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="font-black text-sm">{new Intl.NumberFormat('fr-FR').format(Number(String(order.price || '0').replace(/\s/g, '')))}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase">{order.currency || 'FCFA'}</div>
                      </td>
                      <td className="px-8 py-5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-primary-600 hover:text-white transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`tel:${order.phone}`}
                            className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        </div>
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
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-primary-600 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${page === p ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary-600'}`}
                >
                  {p}
                </button>
              );
            })}
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

      {/* Modal détails */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-primary-600 p-8 text-white flex justify-between items-center">
              <h3 className="text-xl font-black flex items-center gap-3"><ShoppingCart className="w-6 h-6" /> Fiche Commande</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1"><User className="w-3 h-3" /> Client</span>
                  <p className="text-base font-black">{selectedOrder.customer}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 justify-end mb-1"><Phone className="w-3 h-3" /> Téléphone</span>
                  <p className="text-base font-black text-primary-600">{selectedOrder.phone}</p>
                </div>
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><Globe className="w-3 h-3" /> Ville / Pays</span>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 max-w-[200px]">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs font-black uppercase text-right text-balance truncate">
                      {formatFullAddress(selectedOrder.address, selectedOrder.city, selectedOrder.country)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><Package className="w-3 h-3" /> Statut</span>
                  <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase border ${statusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-5 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100">
                <div>
                  <span className="text-[9px] font-black text-primary-600 uppercase block">Produit</span>
                  <p className="text-sm font-black">{selectedOrder.product}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-primary-600 uppercase block">Total</span>
                  <p className="text-lg font-black">{new Intl.NumberFormat('fr-FR').format(Number(String(selectedOrder.price || '0').replace(/\s/g, '')))} {selectedOrder.currency || 'FCFA'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <a href={`tel:${selectedOrder.phone}`} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] text-center hover:bg-emerald-600 transition-all">📞 Appeler</a>
                <a href={`https://wa.me/${selectedOrder.phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-green-500 text-white rounded-xl font-black uppercase text-[10px] text-center hover:bg-green-600 transition-all">💬 WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
