"use client";

import React, { useEffect, useState } from 'react';
import { Headset, PhoneForwarded, MessageSquare, CheckCircle2, MapPin, Edit3, Loader2, X, MoreVertical, XCircle, Clock, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useStore } from '@/components/StoreProvider';
import { cleanCity, cleanCountry, sanitizeError } from '@/lib/utils';
import ConfirmationModal from '@/components/ConfirmationModal';

type Tab = 'pending' | 'confirmed' | 'cancelled' | 'programmed';
type Period = 'TODAY' | 'YESTERDAY' | '7D' | '30D' | 'ALL';

export default function InterfaceCloserPage() {
  const { currency, selectedStore, stores } = useStore();
  const [tab, setTab] = useState<Tab>('pending');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmedToday, setConfirmedToday] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('ALL');
  const [myEarnings, setMyEarnings] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  function getDateRange(p: Period): { from: string | null; to: string | null } {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (p) {
      case 'TODAY':
        return { from: startOfToday.toISOString(), to: null };
      case 'YESTERDAY': {
        const yesterday = new Date(startOfToday);
        yesterday.setDate(yesterday.getDate() - 1);
        return { from: yesterday.toISOString(), to: startOfToday.toISOString() };
      }
      case '7D': {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { from: sevenDaysAgo.toISOString(), to: null };
      }
      case '30D': {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { from: thirtyDaysAgo.toISOString(), to: null };
      }
      default:
        return { from: null, to: null };
    }
  }

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

    // Filtrage par période
    const { from, to } = getDateRange(period);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lt('created_at', to);

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

      // 1. Calcul des gains filtrés (pour info ou logs)
      // const filteredCommissions = data.reduce((acc: number, o: any) => acc + (o.closer_paid || 0), 0);
      
      // 2. Calcul des gains TOTAUX (Indépendant du filtre de date)
      let totalQuery = supabase.from('orders').select('closer_paid');
      if (selectedStore) totalQuery = totalQuery.eq('store_id', selectedStore);
      const { data: allData } = await totalQuery;
      const allTimeGains = allData?.reduce((acc, o) => acc + (o.closer_paid || 0), 0) || 0;
      setMyEarnings(allTimeGains);
    }
    
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
    // Plus besoin de fetchUserEarnings ici pour les comptes fictifs

    const channel = supabase
      .channel('closer-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [period, selectedStore]);

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
    if (tab === 'pending') return o.status === 'A Confirmer';
    if (tab === 'confirmed') return o.status === 'Confirmé' || o.status === 'Livré';
    if (tab === 'cancelled') return o.status === 'Annulé';
    if (tab === 'programmed') return o.status === 'Programmé';
    return false;
  });

  const handleCall = (phone: string) => { window.location.href = `tel:${phone}`; };
  const handleWhatsApp = (phone: any) => { window.open(`https://wa.me/${String(phone || '').replace(/\D/g, '')}`, '_blank'); };

  const periods: { id: Period; label: string }[] = [
    { id: 'TODAY', label: "Aujourd'hui" },
    { id: 'YESTERDAY', label: 'Hier' },
    { id: '7D', label: '7 Jours' },
    { id: '30D', label: '30 Jours' },
    { id: 'ALL', label: 'Tout' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
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

      {/* Date Selector */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-slate-400 mr-2">
          <Calendar className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">Période</span>
        </div>
        <div className="flex bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-1 shadow-sm">
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                period === p.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-1 shadow-sm mb-8 w-fit">
        {[
          { id: 'pending', label: 'À Confirmer', icon: Clock, count: orders.filter(o => o.status === 'A Confirmer').length },
          { id: 'confirmed', label: 'Confirmées', icon: CheckCircle2, count: orders.filter(o => o.status === 'Confirmé' || o.status === 'Livré').length },
          { id: 'programmed', label: 'Programmées', icon: Calendar, count: orders.filter(o => o.status === 'Programmé').length },
          { id: 'cancelled', label: 'Annulées', icon: XCircle, count: orders.filter(o => o.status === 'Annulé').length },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === t.id
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[8px] ${tab === t.id ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-400'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-visible min-h-[400px]">
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
        ) : (
          <div className="overflow-x-auto">
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
                {filteredOrders.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                    <td className="px-8 py-4">
                      <div className="font-black text-sm">{item.customer}</div>
                      <div className="text-[10px] font-bold text-primary-500 mt-0.5">{item.phone}</div>
                      {item.note && (
                        <div className="text-[9px] font-black text-amber-600 mt-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-800/30">
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
                          <div className="absolute right-8 top-full mt-2 w-48 bg-white dark:bg-slate-900 border-2 border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in zoom-in-95 duration-200">
                            <button onClick={() => { handleCall(item.phone); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors"><PhoneForwarded className="w-4 h-4 text-emerald-500" /> Appeler</button>
                            <button onClick={() => { handleWhatsApp(item.phone); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors"><MessageSquare className="w-4 h-4 text-green-500" /> WhatsApp</button>
                            <button onClick={() => { setSelectedOrder(item); setShowNote(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors"><Edit3 className="w-4 h-4 text-amber-500" /> Note</button>
                            <div className="h-px bg-slate-100 my-2" />
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
        )}
      </div>

      {showNote && selectedOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowNote(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black flex items-center gap-3"><Edit3 className="w-7 h-7 text-amber-500" /> Note Closer</h3>
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
                      status: 'Programmé',
                      note: noteText,
                      userId: userId
                    })
                  });
                  if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
                  toast.success("Note enregistrée et commande programmée ! 📅");
                  setShowNote(false); 
                  setNoteText(''); 
                  fetchData();
                } catch (err: any) {
                  toast.error(sanitizeError(err));
                }
              }} 
              className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 transition-all"
            >
              Enregistrer & Programmer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
