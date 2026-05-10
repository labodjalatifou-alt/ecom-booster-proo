"use client";

import React, { useEffect, useState } from 'react';
import { Truck, PhoneForwarded, MessageSquare, CheckCircle2, MapPin, DollarSign, Loader2, Package, XCircle, Clock, X, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useStore } from '@/components/StoreProvider';

type Tab = 'pending' | 'delivered' | 'cancelled' | 'programmed';
type Period = 'TODAY' | 'YESTERDAY' | '7D' | '30D' | 'ALL';

export default function InterfaceLivreurPage() {
  const { currency } = useStore();
  const [tab, setTab] = useState<Tab>('pending');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCashPending, setTotalCashPending] = useState(0);
  const [totalCashCollected, setTotalCashCollected] = useState(0);
  const [period, setPeriod] = useState<Period>('ALL');
  
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [collectionAmount, setCollectionAmount] = useState<string>('');

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
        const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { from: d.toISOString(), to: null };
      }
      case '30D': {
        const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { from: d.toISOString(), to: null };
      }
      default:
        return { from: null, to: null };
    }
  }

  async function fetchOrders() {
    setLoading(true);
    
    let query = supabase
      .from('orders')
      .select('*')
      .in('status', ['Confirmé', 'Livré', 'Annulé', 'Programmé'])
      .order('created_at', { ascending: false });

    const { from, to } = getDateRange(period);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lt('created_at', to);

    const { data, error } = await query;

    if (!error && data) {
      const pending = data.filter(o => o.status === 'Confirmé');
      const delivered = data.filter(o => o.status === 'Livré');

      setTotalCashPending(pending.reduce((acc, o) => acc + parseFloat(String(o.price || '0').replace(/\s/g, '')), 0));
      setTotalCashCollected(delivered.reduce((acc, o) => acc + (o.cash_collected || parseFloat(String(o.price || '0').replace(/\s/g, ''))), 0));
      setOrders(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('livreur-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [period]);

  const filteredOrders = orders.filter(o => {
    if (tab === 'pending') return o.status === 'Confirmé';
    if (tab === 'delivered') return o.status === 'Livré';
    if (tab === 'cancelled') return o.status === 'Annulé';
    if (tab === 'programmed') return o.status === 'Programmé';
    return true;
  });

  const openCollectionModal = (orderId: string, defaultAmount: string) => {
    setSelectedOrderId(orderId);
    setCollectionAmount(String(defaultAmount || '0').replace(/\s/g, ''));
    setShowCollectionModal(true);
  };

  async function handleCollectionSubmit() {
    if (!selectedOrderId) return;
    
    const amount = parseInt(collectionAmount) || 0;
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'Livré',
        cash_collected: amount
      })
      .eq('id', selectedOrderId);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success(`💰 Colis livré ! (${new Intl.NumberFormat('fr-FR').format(amount)} ${currency} encaissés)`);
      setShowCollectionModal(false);
      fetchOrders();
    }
  }

  async function markFailed(orderId: any) {
    const { error } = await supabase.from('orders').update({ status: 'Annulé' }).eq('id', orderId);
    if (error) {
      toast.error("Erreur");
    } else {
      toast.error("Livraison annulée");
      fetchOrders();
    }
  }

  const cleanCity = (city: string) => city?.split(',').map(s => s.trim()).filter((v, i, a) => a.indexOf(v) === i).join(', ') || '-';
  const handleCall = (phone: string) => { window.location.href = `tel:${phone}`; };
  const handleWhatsApp = (phone: string) => { window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank'); };

  const tabs: { id: Tab; label: string; color: string }[] = [
    { id: 'pending', label: 'À Livrer', color: 'text-blue-600' },
    { id: 'programmed', label: 'Programmés', color: 'text-amber-600' },
    { id: 'delivered', label: 'Livrées', color: 'text-emerald-600' },
    { id: 'cancelled', label: 'Annulées', color: 'text-red-500' },
  ];

  const periods: { id: Period; label: string }[] = [
    { id: 'TODAY', label: "Aujourd'hui" },
    { id: 'YESTERDAY', label: 'Hier' },
    { id: '7D', label: '7 Jours' },
    { id: '30D', label: '30 Jours' },
    { id: 'ALL', label: 'Tout' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-1 shadow-sm mb-8 w-fit overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === t.id
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
            {orders.filter(o => o.status === (t.id === 'pending' ? 'Confirmé' : t.id === 'programmed' ? 'Programmé' : t.id === 'delivered' ? 'Livré' : 'Annulé')).length > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[8px] ${tab === t.id ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-400'}`}>
                {orders.filter(o => o.status === (t.id === 'pending' ? 'Confirmé' : t.id === 'programmed' ? 'Programmé' : t.id === 'delivered' ? 'Livré' : 'Annulé')).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[300px]">
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                  <th className="w-[28%] px-8 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Client</th>
                  <th className="w-[28%] px-8 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Produit & Ville</th>
                  <th className="w-[16%] px-8 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Montant</th>
                  <th className="w-[28%] px-8 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                    <td className="px-8 py-4">
                      <div className="font-black text-sm">{item.customer}</div>
                      <div className="text-[10px] font-bold text-primary-500 mt-0.5">{item.phone}</div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{item.product}</div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3" /> {cleanCity(item.city)}
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
        )}
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
