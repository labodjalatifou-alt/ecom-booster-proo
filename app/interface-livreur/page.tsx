"use client";

import React, { useEffect, useState } from 'react';
import { Truck, PhoneForwarded, MessageSquare, CheckCircle2, MapPin, DollarSign, Loader2, Package, XCircle, Clock, X, Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useStore } from '@/components/StoreProvider';
import { formatFullAddress, sanitizeError } from '@/lib/utils';
import ConfirmationModal from '@/components/ConfirmationModal';
import DateRangePicker, { DateRange, DEFAULT_RANGE } from '@/components/DateRangePicker';

type Tab = 'pending' | 'delivered' | 'cancelled' | 'programmed';

export default function InterfaceLivreurPage() {
  const { currency, selectedStore, stores } = useStore();
  const [tab, setTab] = useState<Tab>('pending');
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCashPending, setTotalCashPending] = useState(0);
  const [totalCashCollected, setTotalCashCollected] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_RANGE);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 30;
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { resolveUserProfile } = await import('@/lib/utils');
      const profile = await resolveUserProfile(supabase);
      if (profile && profile.id) {
        setUserId(profile.id);
      }
    }
    loadUser();
  }, []);

  const [myEarnings, setMyEarnings] = useState(0);
  
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<any>(null);
  const [collectionAmount, setCollectionAmount] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [isDeliveryFeeIncluded, setIsDeliveryFeeIncluded] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    
    let query = supabase
      .from('orders')
      .select('*')
      .in('status', ['Confirmé', 'Livré', 'Annulé', 'Programmé'])
      .order('created_at', { ascending: false });

    // Store filtering — filtre par boutique active
    if (selectedStore) {
      query = query.eq('store_id', selectedStore);
    } else if (stores.length > 0) {
      query = query.in('store_id', stores.map(s => s.id));
    }

    // Filtrage par période (appliqué à toutes les commandes)
    if (dateRange.from) query = query.gte('created_at', new Date(dateRange.from).toISOString());
    if (dateRange.to) query = query.lte('created_at', new Date(dateRange.to).toISOString());

    const { data, error } = await query;

    if (!error && data) {
      const pending = data.filter(o => o.status === 'Confirmé');
      const delivered = data.filter(o => o.status === 'Livré');

      setTotalCashPending(pending.reduce((acc, o) => acc + parseFloat(String(o.price || '0').replace(/\s/g, '')), 0));
      setTotalCashCollected(delivered.reduce((acc, o) => acc + (o.cash_collected || parseFloat(String(o.price || '0').replace(/\s/g, ''))), 0));
      
      // Calcul des gains TOTAUX (Indépendant du filtre de date)
      let totalQuery = supabase.from('orders').select('livreur_paid');
      if (selectedStore) totalQuery = totalQuery.eq('store_id', selectedStore);
      const { data: allData } = await totalQuery;
      const allTimeGains = allData?.reduce((acc, o) => acc + (o.livreur_paid || 0), 0) || 0;
      setMyEarnings(allTimeGains);

      setOrders(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    setCurrentPage(1);
    fetchOrders();
    const channel = supabase
      .channel('livreur-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [dateRange, selectedStore]);

  const filteredOrders = orders.filter(o => {
    if (tab === 'pending') return o.status === 'Confirmé';
    if (tab === 'delivered') return o.status === 'Livré' && (!dateRange.from || new Date(o.created_at) >= new Date(dateRange.from)) && (!dateRange.to || new Date(o.created_at) <= new Date(dateRange.to));
    if (tab === 'cancelled') return o.status === 'Annulé' && (!dateRange.from || new Date(o.created_at) >= new Date(dateRange.from)) && (!dateRange.to || new Date(o.created_at) <= new Date(dateRange.to));
    if (tab === 'programmed') return o.status === 'Programmé';
    return false;
  });

  const openCollectionModal = (orderId: any, price: any) => {
    setSelectedOrderId(orderId);
    setCollectionAmount(String(price).replace(/\s/g, '').replace(/[^\d]/g, ''));
    setDeliveryFee('0');
    setIsDeliveryFeeIncluded(false);
    setShowCollectionModal(true);
  };

  async function handleCollectionSubmit() {
    if (!selectedOrderId) return;
    
    const amount = parseInt(collectionAmount) || 0;
    const fee = parseInt(deliveryFee) || 0;
    
    try {
      console.log("Submitting Collection for Order:", selectedOrderId, "Amount:", amount);
      const res = await fetch('/api/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderId,
          status: 'Livré',
          userId: userId,
          cashCollected: amount,
          deliveryFee: fee,
          deliveryFeeIncluded: isDeliveryFeeIncluded
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("Collection API Error:", errData);
        throw new Error(errData.error || "Erreur API");
      }

      toast.success(`💰 Colis livré ! (${new Intl.NumberFormat('fr-FR').format(amount)} ${currency} encaissés)`);
      setShowCollectionModal(false);
      fetchOrders();
    } catch (error: any) {
      console.error("Collection Catch Error:", error);
      toast.error(sanitizeError(error));
    }
  }

  async function markFailed(orderId: any) {
    try {
      console.log("Marking Failed Order:", orderId);
      const res = await fetch('/api/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          status: 'Annulé',
          userId: userId
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("Cancel API Error:", errData);
        throw new Error(errData.error || "Erreur API");
      }

      toast.error("Livraison annulée");
      fetchOrders();
    } catch (err: any) {
      console.error("Cancel Catch Error:", err);
      toast.error(sanitizeError(err));
    }
  }

  const handleCall = (phone: string) => { window.location.href = `tel:${phone}`; };
  const handleWhatsApp = (phone: any) => { window.open(`https://wa.me/${String(phone || '').replace(/\D/g, '')}`, '_blank'); };

  const tabs: { id: Tab; label: string; color: string }[] = [
    { id: 'pending', label: 'À Livrer', color: 'text-blue-600' },
    { id: 'programmed', label: 'Programmés', color: 'text-amber-600' },
    { id: 'delivered', label: 'Livrées', color: 'text-emerald-600' },
    { id: 'cancelled', label: 'Annulées', color: 'text-red-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-10 px-2 md:px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Tableau de Bord Livreur</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Mes Livraisons</h2>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-blue-500 text-white p-5 rounded-2xl shadow-xl shadow-blue-500/20 flex flex-col items-center justify-center min-w-[110px]">
            <Package className="w-5 h-5 mb-1 opacity-70" />
            <span className="text-2xl font-black">{orders.filter((o: any) => o.status === 'Confirmé').length}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-80">À Livrer</span>
          </div>
          <div className="bg-amber-500 text-white p-5 rounded-2xl shadow-xl shadow-amber-500/20 flex flex-col items-center justify-center min-w-[110px]">
            <Clock className="w-5 h-5 mb-1 opacity-70" />
            <span className="text-2xl font-black">{orders.filter((o: any) => o.status === 'Programmé').length}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Programmées</span>
          </div>
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl shadow-slate-900/20 flex flex-col items-center justify-center min-w-[110px]">
            <DollarSign className="w-5 h-5 mb-1 opacity-70" />
            <span className="text-lg font-black tracking-tight">{new Intl.NumberFormat('fr-FR').format(totalCashPending)} {currency}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Reste à collecter</span>
          </div>
          <div className="bg-emerald-600 text-white p-5 rounded-2xl shadow-xl shadow-emerald-500/20 flex flex-col items-center justify-center min-w-[110px]">
            <CheckCircle2 className="w-5 h-5 mb-1 opacity-70" />
            <span className="text-lg font-black tracking-tight">{new Intl.NumberFormat('fr-FR').format(totalCashCollected)} {currency}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Argent collecté</span>
          </div>
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl shadow-slate-900/20 flex flex-col items-center justify-center min-w-[110px]">
            <DollarSign className="w-5 h-5 mb-1 opacity-70" />
            <span className="text-lg font-black tracking-tight">{new Intl.NumberFormat('fr-FR').format(myEarnings)} {currency}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Mes Gains</span>
          </div>
        </div>
      </div>

      {/* Filters Row — Date + Statut sur la même ligne */}
      <div className="flex items-center gap-3 mb-8 w-full flex-nowrap">
        <div className="shrink-0">
          <DateRangePicker value={dateRange} onChange={setDateRange} align="left" />
        </div>

        {/* Status Dropdown */}
        <div className="relative shrink-0">
          <button 
            onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:border-slate-200 transition-all"
          >
            {(() => {
              const active = tabs.find(t => t.id === tab);
              return (
                <>
                  <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${active?.color}`}>
                    Statut : {active?.label}
                  </span>
                  {active && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black">
                      {active.id === 'pending' ? orders.filter(o => o.status === 'Confirmé').length :
                       active.id === 'programmed' ? orders.filter(o => o.status === 'Programmé').length :
                       active.id === 'delivered' ? orders.filter(o => o.status === 'Livré' && (!dateRange.from || new Date(o.created_at) >= new Date(dateRange.from)) && (!dateRange.to || new Date(o.created_at) <= new Date(dateRange.to))).length :
                       orders.filter(o => o.status === 'Annulé' && (!dateRange.from || new Date(o.created_at) >= new Date(dateRange.from)) && (!dateRange.to || new Date(o.created_at) <= new Date(dateRange.to))).length}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isTabDropdownOpen ? 'rotate-180' : ''}`} />
                </>
              );
            })()}
          </button>
          
          {isTabDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsTabDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {tabs.map(t => {
                  const count = t.id === 'pending' ? orders.filter(o => o.status === 'Confirmé').length :
                               t.id === 'programmed' ? orders.filter(o => o.status === 'Programmé').length :
                               t.id === 'delivered' ? orders.filter(o => o.status === 'Livré' && (!dateRange.from || new Date(o.created_at) >= new Date(dateRange.from)) && (!dateRange.to || new Date(o.created_at) <= new Date(dateRange.to))).length :
                               orders.filter(o => o.status === 'Annulé' && (!dateRange.from || new Date(o.created_at) >= new Date(dateRange.from)) && (!dateRange.to || new Date(o.created_at) <= new Date(dateRange.to))).length;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setTab(t.id); setIsTabDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                        tab === t.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className={tab === t.id ? 'text-primary-600' : t.color}>{t.label}</span>
                      {count > 0 && <span className={`px-2 py-0.5 rounded-full text-[10px] ${tab === t.id ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{count}</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-transparent md:bg-white md:dark:bg-slate-900 md:border-2 border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-[2.5rem] shadow-none md:shadow-sm overflow-visible min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">Chargement...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            {tab === 'delivered'
              ? <CheckCircle2 className="w-12 h-12 text-emerald-300" />
              : tab === 'cancelled'
              ? <XCircle className="w-12 h-12 text-red-300" />
              : tab === 'programmed'
              ? <Clock className="w-12 h-12 text-amber-300" />
              : <Truck className="w-12 h-12 opacity-20" />
            }
            <p className="text-sm font-black text-slate-500">
              {tab === 'pending' ? 'Aucune livraison en attente' : tab === 'delivered' ? 'Aucune livraison effectuée' : tab === 'programmed' ? 'Aucune livraison programmée' : 'Aucune livraison annulée'}
            </p>
          </div>
        ) : (() => {
          const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
          const pagedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
          return (
          <>
            {/* VUE MOBILE */}
            <div className="lg:hidden flex flex-col gap-3 py-2">
              {pagedOrders.map((item: any) => (
                <div key={item.id} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-sm">{item.customer}</div>
                      <div className="text-[10px] font-bold text-primary-500 mt-0.5">{item.phone}</div>
                    </div>
                    {tab === 'delivered' && <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-xl text-[8px] font-black uppercase">✓ Livré</span>}
                    {tab === 'cancelled' && <span className="px-3 py-1 bg-red-100 text-red-500 rounded-xl text-[8px] font-black uppercase">✗ Annulé</span>}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-700 dark:text-slate-200 line-clamp-2">{item.product}</div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-1 uppercase">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {formatFullAddress(item.address, item.city, item.country)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end">
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Montant</div>
                      <div className="font-black text-sm text-emerald-600">{item.price} {item.currency || currency}</div>
                      {item.cash_collected != null && item.cash_collected > 0 && (
                        <div className="text-[9px] font-bold text-slate-400 mt-0.5 italic">Reçu: {new Intl.NumberFormat('fr-FR').format(item.cash_collected)} {item.currency || currency}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleCall(item.phone)} className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                        <PhoneForwarded className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleWhatsApp(item.phone)} className="p-2.5 bg-green-100 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {(tab === 'pending' || tab === 'programmed') && (
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => openCollectionModal(item.id, item.price)} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95">
                        ✓ Livré
                      </button>
                      <button onClick={() => markFailed(item.id)} className="flex-1 py-3 bg-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95">
                        ✗ Annuler
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* VUE DESKTOP */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px] table-fixed">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                    <th className="w-[28%] px-8 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Client</th>
                    <th className="w-[28%] px-8 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Produit & Ville</th>
                    <th className="w-[16%] px-8 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Montant</th>
                    <th className="w-[28%] px-8 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                  {pagedOrders.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                      <td className="px-8 py-4">
                        <div className="font-black text-sm">{item.customer}</div>
                        <div className="text-[10px] font-bold text-primary-500 mt-0.5">{item.phone}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{item.product}</div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[200px] uppercase">
                            {formatFullAddress(item.address, item.city, item.country)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="font-black text-sm text-emerald-600">{item.price} {item.currency || currency}</div>
                        {item.cash_collected != null && item.cash_collected > 0 && (
                          <div className="text-[9px] font-bold text-slate-400 mt-1 italic">Reçu: {new Intl.NumberFormat('fr-FR').format(item.cash_collected)} {item.currency || currency}</div>
                        )}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleCall(item.phone)} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all" title="Appeler">
                            <PhoneForwarded className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleWhatsApp(item.phone)} className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all" title="WhatsApp">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          {(tab === 'pending' || tab === 'programmed') && (
                            <>
                              <button onClick={() => openCollectionModal(item.id, item.price)} className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95">
                                ✓ Livré
                              </button>
                              <button onClick={() => markFailed(item.id)} className="px-3 py-2 bg-red-100 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95">
                                ✗ Annuler
                              </button>
                            </>
                          )}
                          {tab === 'delivered' && (
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-xl text-[9px] font-black uppercase">✓ Livré</span>
                          )}
                          {tab === 'cancelled' && (
                            <span className="px-3 py-1.5 bg-red-100 text-red-500 rounded-xl text-[9px] font-black uppercase">✗ Annulé</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-8 py-4 border-t-2 border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Page {currentPage} / {totalPages} · {filteredOrders.length} commandes
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${
                          p === currentPage ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
          );
        })()}
      </div>

      {/* Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCollectionModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black flex items-center gap-3"><DollarSign className="w-7 h-7 text-emerald-500" /> Encaisser le Cash</h3>
              <button onClick={() => setShowCollectionModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Combien avez-vous pris chez le client ?</label>
                <div className="relative mt-2">
                  <input
                    type="number"
                    value={collectionAmount}
                    onChange={(e) => setCollectionAmount(e.target.value)}
                    className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-black text-2xl outline-none focus:ring-4 focus:ring-emerald-500/10"
                    placeholder="0"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-400">{currency}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Frais de livraison</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="w-full p-4 mt-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-black text-lg outline-none focus:ring-4 focus:ring-blue-500/10"
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                    <input
                      type="checkbox"
                      checked={isDeliveryFeeIncluded}
                      onChange={(e) => setIsDeliveryFeeIncluded(e.target.checked)}
                      className="w-5 h-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] font-black text-slate-500 uppercase leading-tight">Inclus dans le total</span>
                  </label>
                </div>
              </div>

              {isDeliveryFeeIncluded && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                    💡 Les {new Intl.NumberFormat('fr-FR').format(parseInt(deliveryFee) || 0)} {currency} seront déduits du CA net.
                  </p>
                </div>
              )}

              <button 
                onClick={handleCollectionSubmit}
                className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95"
              >
                Confirmer la Livraison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
