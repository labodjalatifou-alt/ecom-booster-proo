"use client";

import React, { useEffect, useState } from 'react';
import { Headset, PhoneForwarded, MessageSquare, CheckCircle2, MapPin, Edit3, Loader2, X, MoreVertical, XCircle, Clock, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useStore } from '@/components/StoreProvider';
import { cleanCity, cleanCountry, sanitizeError } from '@/lib/utils';
import ConfirmationModal from '@/components/ConfirmationModal';
import DateRangePicker, { DateRange, DEFAULT_RANGE } from '@/components/DateRangePicker';

type Tab = 'pending' | 'notes' | 'confirmed' | 'cancelled' | 'programmed';

export default function InterfaceCloserPage() {
  const { currency, selectedStore, stores } = useStore();
  const [tab, setTab] = useState<Tab>('pending');
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmedToday, setConfirmedToday] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [showProgram, setShowProgram] = useState(false);
  const [programDate, setProgramDate] = useState('');
  const [programTime, setProgramTime] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_RANGE);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 30;
  const [myEarnings, setMyEarnings] = useState(0);
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

  async function fetchData() {
    setLoading(true);
    
    let query = supabase
      .from('orders')
      .select('*')
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
      setOrders(data);
      
      // Calcul des confirmés aujourd'hui (toujours basé sur "aujourd'hui")
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayConfirmed = data.filter(
        o => (o.status === 'Confirmé' || o.status === 'Livré') && new Date(o.updated_at || o.created_at) >= startOfToday
      ).length;
      setConfirmedToday(todayConfirmed);

      // Calcul des gains TOTAUX (Indépendant du filtre de date)
      let totalQuery = supabase.from('orders').select('closer_paid');
      if (selectedStore) totalQuery = totalQuery.eq('store_id', selectedStore);
      const { data: allData } = await totalQuery;
      const allTimeGains = allData?.reduce((acc, o) => acc + (o.closer_paid || 0), 0) || 0;
      setMyEarnings(allTimeGains);
    }
    
    setLoading(false);
  }

  useEffect(() => {
    setCurrentPage(1);
    fetchData();

    const channel = supabase
      .channel('closer-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [dateRange, selectedStore]);

  async function updateStatus(orderId: any, newStatus: string) {
    console.log("Updating Order ID:", orderId, "to Status:", newStatus);
    
    try {
      const res = await fetch('/api/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          userId: userId
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        console.error("Update Error:", data.error);
        throw new Error(data.error || "Erreur API");
      }

      toast.success(newStatus === 'Confirmé' ? "Commande propulsée ! 🚀" : "Commande annulée");
      fetchData();
    } catch (err: any) {
      console.error("Catch Error:", err);
      toast.error(sanitizeError(err));
    }
  }

  const filteredOrders = orders.filter(o => {
    // Only pending without specific note (or note is empty)
    if (tab === 'pending') return o.status === 'A Confirmer' && (!o.note || o.note.trim() === '');
    // Notes tab: A Confirmer with a note
    if (tab === 'notes') return o.status === 'A Confirmer' && o.note && o.note.trim() !== '';
    if (tab === 'confirmed') return (o.status === 'Confirmé' || o.status === 'Livré') && (!dateRange.from || new Date(o.created_at) >= new Date(dateRange.from)) && (!dateRange.to || new Date(o.created_at) <= new Date(dateRange.to));
    if (tab === 'cancelled') return o.status === 'Annulé' && (!dateRange.from || new Date(o.created_at) >= new Date(dateRange.from)) && (!dateRange.to || new Date(o.created_at) <= new Date(dateRange.to));
    if (tab === 'programmed') return o.status === 'Programmé';
    return false;
  });

  const handleCall = (phone: string) => { window.location.href = `tel:${phone}`; };
  const handleWhatsApp = (phone: any) => { window.open(`https://wa.me/${String(phone || '').replace(/\D/g, '')}`, '_blank'); };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-2 md:px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Headset className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Centre d'Appels</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Interface Closer</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-emerald-500 text-white p-5 rounded-2xl shadow-xl shadow-emerald-500/20 flex flex-col items-center justify-center min-w-[110px]">
            <CheckCircle2 className="w-5 h-5 mb-1 opacity-70" />
            <span className="text-2xl font-black">{confirmedToday}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Confirmés Aujourd'hui</span>
          </div>
          <div className="bg-primary-600 text-white p-5 rounded-2xl shadow-xl shadow-primary-500/20 flex flex-col items-center justify-center min-w-[110px]">
            <Clock className="w-5 h-5 mb-1 opacity-70" />
            <span className="text-2xl font-black">{orders.filter(o => o.status === 'A Confirmer').length}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-80">En Attente</span>
          </div>
          <div className="bg-rose-500 text-white p-5 rounded-2xl shadow-xl shadow-rose-500/20 flex flex-col items-center justify-center min-w-[110px]">
            <XCircle className="w-5 h-5 mb-1 opacity-70" />
            <span className="text-2xl font-black">{orders.filter(o => o.status === 'Annulé').length}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Annulées</span>
          </div>
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl shadow-slate-900/20 flex flex-col items-center justify-center min-w-[110px]">
            <DollarSign className="w-5 h-5 mb-1 opacity-70" />
            <span className="text-lg font-black">{new Intl.NumberFormat('fr-FR').format(myEarnings)} {currency}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Mes Gains</span>
          </div>
        </div>
      </div>

      {/* Filters Row — Date + Statut sur la même ligne */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <DateRangePicker value={dateRange} onChange={setDateRange} align="left" />

        {/* Status Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:border-slate-200 transition-all"
          >
            {(() => {
              const active = [
                { id: 'pending', label: 'À Confirmer', icon: Clock, count: orders.filter(o => o.status === 'A Confirmer' && (!o.note || o.note.trim() === '')).length },
                { id: 'notes', label: 'Suivi / Notes', icon: MessageSquare, count: orders.filter(o => o.status === 'A Confirmer' && o.note && o.note.trim() !== '').length },
                { id: 'confirmed', label: 'Confirmées', icon: CheckCircle2, count: orders.filter(o => o.status === 'Confirmé' || o.status === 'Livré').length },
                { id: 'programmed', label: 'Programmées', icon: Calendar, count: orders.filter(o => o.status === 'Programmé').length },
                { id: 'cancelled', label: 'Annulées', icon: XCircle, count: orders.filter(o => o.status === 'Annulé').length },
              ].find(t => t.id === tab);
              const Icon = active?.icon || Clock;
              return (
                <>
                  <Icon className="w-4 h-4 text-primary-500 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 whitespace-nowrap">
                    Statut : {active?.label}
                  </span>
                  {active && active.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black">{active.count}</span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isTabDropdownOpen ? 'rotate-180' : ''}`} />
                </>
              );
            })()}
          </button>
          
          {isTabDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsTabDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-2 min-w-[220px] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {[
                  { id: 'pending', label: 'À Confirmer', icon: Clock, count: orders.filter(o => o.status === 'A Confirmer' && (!o.note || o.note.trim() === '')).length },
                  { id: 'notes', label: 'Suivi / Notes', icon: MessageSquare, count: orders.filter(o => o.status === 'A Confirmer' && o.note && o.note.trim() !== '').length },
                  { id: 'confirmed', label: 'Confirmées', icon: CheckCircle2, count: orders.filter(o => (o.status === 'Confirmé' || o.status === 'Livré') && (!dateRange.from || new Date(o.created_at) >= new Date(dateRange.from)) && (!dateRange.to || new Date(o.created_at) <= new Date(dateRange.to))).length },
                  { id: 'programmed', label: 'Programmées', icon: Calendar, count: orders.filter(o => o.status === 'Programmé').length },
                  { id: 'cancelled', label: 'Annulées', icon: XCircle, count: orders.filter(o => o.status === 'Annulé' && (!dateRange.from || new Date(o.created_at) >= new Date(dateRange.from)) && (!dateRange.to || new Date(o.created_at) <= new Date(dateRange.to))).length },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTab(t.id as Tab); setIsTabDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                      tab === t.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <t.icon className={`w-4 h-4 ${tab === t.id ? 'text-primary-500' : 'text-slate-400'}`} />
                      {t.label}
                    </div>
                    {t.count > 0 && <span className={`px-2 py-0.5 rounded-full text-[10px] ${tab === t.id ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{t.count}</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-transparent md:bg-white md:dark:bg-slate-900 md:border-2 border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-[2.5rem] shadow-none md:shadow-sm overflow-visible min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Chargement...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 opacity-50" />
            <p className="text-lg font-black text-slate-600">Aucune commande dans cette liste</p>
          </div>
        ) : (() => {
          const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
          const pagedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
          return (
          <>
            {/* VUE MOBILE */}
            <div className={`lg:hidden flex flex-col gap-3 py-2 ${activeMenu ? 'pb-64' : ''}`}>
              {pagedOrders.map((item: any) => (
                <div key={item.id} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-3 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-sm">{item.customer}</div>
                      <div className="text-[10px] font-bold text-primary-500 mt-0.5">{item.phone}</div>
                    </div>
                    <button 
                      onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                      className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-primary-600 rounded-xl transition-all"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {activeMenu === item.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-4 top-10 w-48 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in zoom-in-95 duration-200">
                          <button onClick={() => { handleCall(item.phone); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors"><PhoneForwarded className="w-4 h-4 text-emerald-500" /> Appeler</button>
                          <button onClick={() => { handleWhatsApp(item.phone); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors"><MessageSquare className="w-4 h-4 text-green-500" /> WhatsApp</button>
                          <button onClick={() => { setSelectedOrder(item); setNoteText(''); setShowProgram(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors"><Calendar className="w-4 h-4 text-purple-500" /> Programmer</button>
                          <button onClick={() => { setSelectedOrder(item); setNoteText(''); setShowNote(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors"><Edit3 className="w-4 h-4 text-amber-500" /> Note</button>
                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                          {tab === 'pending' ? (
                            <>
                              <button onClick={() => { updateStatus(item.id, 'Confirmé'); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-primary-600 hover:bg-primary-50 transition-colors"><CheckCircle2 className="w-4 h-4" /> Confirmer</button>
                              <button onClick={() => { updateStatus(item.id, 'Annulé'); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-rose-600 hover:bg-rose-50 transition-colors"><XCircle className="w-4 h-4" /> Annuler</button>
                            </>
                          ) : tab === 'cancelled' ? (
                            <button onClick={() => { updateStatus(item.id, 'A Confirmer'); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 transition-colors"><Clock className="w-4 h-4" /> Remettre en attente</button>
                          ) : (
                            <button onClick={() => { updateStatus(item.id, 'A Confirmer'); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-colors"><XCircle className="w-4 h-4" /> Annuler Confirmation</button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {item.note && (
                    <div className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md border border-amber-100 dark:border-amber-800/30 w-fit">
                      📝 {item.note}
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-black text-slate-700 dark:text-slate-200 line-clamp-2">{item.product}</div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mt-1">
                      <MapPin className="w-3 h-3" /> {cleanCity(item.city)}, {cleanCountry(item.country)}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="font-black text-sm text-emerald-600">{item.price} {item.currency || currency}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* VUE DESKTOP */}
            <div className={`hidden lg:block overflow-x-auto ${activeMenu ? 'pb-64' : ''}`}>
              <table className="w-full text-left border-collapse min-w-[800px] table-fixed">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                    <th className="w-[30%] px-8 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Client</th>
                    <th className="w-[25%] px-8 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Produit</th>
                    <th className="w-[15%] px-8 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Ville</th>
                    <th className="w-[15%] px-8 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Prix</th>
                    <th className="w-[15%] px-8 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                  {pagedOrders.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                      <td className="px-8 py-4">
                        <div className="font-black text-sm">{item.customer}</div>
                        <div className="text-[10px] font-bold text-primary-500 mt-0.5">{item.phone}</div>
                        {item.note && (
                          <div className="text-[9px] font-black text-amber-600 mt-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-800/30 w-fit">
                            📝 {item.note}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-4 text-xs font-black text-slate-600 dark:text-slate-300 truncate">{item.product}</td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                          <MapPin className="w-3 h-3" /> {cleanCity(item.city)}, {cleanCountry(item.country)}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="font-black text-sm text-emerald-600">{item.price} {item.currency || currency}</div>
                      </td>
                      <td className="px-8 py-4 text-right relative">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                          className="p-2.5 text-slate-400 hover:text-primary-600 rounded-xl transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenu === item.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                            <div className="absolute right-8 top-full mt-2 w-48 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in zoom-in-95 duration-200">
                              <button onClick={() => { handleCall(item.phone); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors"><PhoneForwarded className="w-4 h-4 text-emerald-500" /> Appeler</button>
                              <button onClick={() => { handleWhatsApp(item.phone); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors"><MessageSquare className="w-4 h-4 text-green-500" /> WhatsApp</button>
                              <button onClick={() => { setSelectedOrder(item); setNoteText(''); setShowProgram(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors"><Calendar className="w-4 h-4 text-purple-500" /> Programmer</button>
                              <button onClick={() => { setSelectedOrder(item); setNoteText(''); setShowNote(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors"><Edit3 className="w-4 h-4 text-amber-500" /> Note</button>
                              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                              {tab === 'pending' ? (
                                <>
                                  <button onClick={() => { updateStatus(item.id, 'Confirmé'); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-primary-600 hover:bg-primary-50 transition-colors"><CheckCircle2 className="w-4 h-4" /> Confirmer</button>
                                  <button onClick={() => { updateStatus(item.id, 'Annulé'); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-rose-600 hover:bg-rose-50 transition-colors"><XCircle className="w-4 h-4" /> Annuler</button>
                                </>
                              ) : tab === 'cancelled' ? (
                                <button onClick={() => { updateStatus(item.id, 'A Confirmer'); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 transition-colors"><Clock className="w-4 h-4" /> Remettre en attente</button>
                              ) : (
                                <button onClick={() => { updateStatus(item.id, 'A Confirmer'); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-colors"><XCircle className="w-4 h-4" /> Annuler Confirmation</button>
                              )}
                            </div>
                          </>
                        )}
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
                          p === currentPage ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
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

      {showNote && selectedOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowNote(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black flex items-center gap-3"><Edit3 className="w-7 h-7 text-amber-500" /> Note</h3>
              <button onClick={() => setShowNote(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-4">{selectedOrder.customer} — {selectedOrder.product}</p>
            <textarea
              placeholder="Client hésite, rappeler demain..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold mb-6 h-32 outline-none resize-none"
            />
            <button 
              onClick={async () => { 
                try {
                  const res = await fetch('/api/update-order-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      orderId: selectedOrder.id,
                      status: selectedOrder.status, // KEEP CURRENT STATUS
                      note: noteText,
                      userId: userId
                    })
                  });
                  if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
                  toast.success("Note enregistrée !");
                  setShowNote(false); 
                  setNoteText(''); 
                  fetchData();
                } catch (err: any) {
                  toast.error(sanitizeError(err));
                }
              }} 
              className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 transition-all"
            >
              Enregistrer la note
            </button>
          </div>
        </div>
      )}

      {/* PROGRAMMER MODAL */}
      {showProgram && selectedOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowProgram(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black flex items-center gap-3"><Calendar className="w-7 h-7 text-purple-500" /> Programmer</h3>
              <button onClick={() => setShowProgram(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-6">{selectedOrder.customer} — {selectedOrder.product}</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Date prévue</label>
                <input 
                  type="date"
                  value={programDate}
                  onChange={e => setProgramDate(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Heure prévue (optionnel)</label>
                <input 
                  type="time"
                  value={programTime}
                  onChange={e => setProgramTime(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Note / Instruction</label>
                <textarea
                  placeholder="Appeler à l'arrivée..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold h-24 outline-none resize-none"
                />
              </div>
            </div>

            <button 
              onClick={async () => { 
                if (!programDate) return toast.error("Veuillez sélectionner une date");
                try {
                  const scheduleStr = `PROGRAMMÉ LE: ${programDate} ${programTime}\nNOTE: ${noteText}`;
                  const res = await fetch('/api/update-order-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      orderId: selectedOrder.id,
                      status: 'Programmé',
                      note: scheduleStr,
                      userId: userId
                    })
                  });
                  if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
                  toast.success("Commande programmée ! 📅");
                  setShowProgram(false); 
                  setProgramDate('');
                  setProgramTime('');
                  setNoteText(''); 
                  fetchData();
                } catch (err: any) {
                  toast.error(sanitizeError(err));
                }
              }} 
              className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-purple-700 transition-all"
            >
              Programmer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
