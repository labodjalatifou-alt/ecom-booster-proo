"use client";

import React, { useEffect, useState } from 'react';
import { Truck, PhoneForwarded, MessageSquare, CheckCircle2, MapPin, DollarSign, Loader2, Package, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

type Tab = 'pending' | 'delivered' | 'cancelled';

export default function InterfaceLivreurPage() {
  const [tab, setTab] = useState<Tab>('pending');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCashPending, setTotalCashPending] = useState(0);
  const [totalCashCollected, setTotalCashCollected] = useState(0);

  async function fetchOrders() {
    setLoading(true);
    // Fetch all relevant orders in one go
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['Confirmé', 'Livré', 'Annulé'])
      .order('created_at', { ascending: false });

    if (!error && data) {
      const pending = data.filter(o => o.status === 'Confirmé');
      const delivered = data.filter(o => o.status === 'Livré');

      setTotalCashPending(pending.reduce((acc, o) => acc + parseFloat(String(o.price || '0').replace(/\s/g, '')), 0));
      setTotalCashCollected(delivered.reduce((acc, o) => acc + parseFloat(String(o.price || '0').replace(/\s/g, '')), 0));
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
  }, []);

  const filteredOrders = orders.filter(o => {
    if (tab === 'pending') return o.status === 'Confirmé';
    if (tab === 'delivered') return o.status === 'Livré';
    if (tab === 'cancelled') return o.status === 'Annulé';
    return true;
  });

  async function markDelivered(orderId: any) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Livré' } : o));
    const { error } = await supabase.from('orders').update({ status: 'Livré' }).eq('id', orderId);
    if (error) {
      toast.error("Erreur");
      fetchOrders();
    } else {
      toast.success("💰 Colis livré !");
      fetchOrders();
    }
  }

  async function markFailed(orderId: any) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Annulé' } : o));
    const { error } = await supabase.from('orders').update({ status: 'Annulé' }).eq('id', orderId);
    if (error) {
      toast.error("Erreur");
      fetchOrders();
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
    { id: 'delivered', label: 'Livrées', color: 'text-emerald-600' },
    { id: 'cancelled', label: 'Annulées', color: 'text-red-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
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
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500 text-white p-6 rounded-2xl shadow-xl shadow-blue-500/20 flex flex-col items-center justify-center min-w-[150px]">
            <Package className="w-6 h-6 mb-1 opacity-70" />
            <span className="text-3xl font-black">{orders.filter(o => o.status === 'Confirmé').length}</span>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-80">À Livrer</span>
          </div>
          <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-xl shadow-emerald-500/20 flex flex-col items-center justify-center min-w-[150px]">
            <DollarSign className="w-6 h-6 mb-1 opacity-70" />
            <span className="text-xl font-black tracking-tight">{new Intl.NumberFormat('fr-FR').format(totalCashPending)}</span>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Cash à collecter</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-1 shadow-sm mb-8 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === t.id
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
            {t.id === 'pending' && orders.filter(o => o.status === 'Confirmé').length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-[8px]">
                {orders.filter(o => o.status === 'Confirmé').length}
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
              : <Truck className="w-12 h-12 opacity-20" />
            }
            <p className="text-sm font-black text-slate-500">
              {tab === 'pending' ? 'Aucune livraison en attente' : tab === 'delivered' ? 'Aucune livraison effectuée' : 'Aucune livraison annulée'}
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
                      <div className="font-black text-sm text-emerald-600">{item.price}</div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleCall(item.phone)} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all" title="Appeler">
                          <PhoneForwarded className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleWhatsApp(item.phone)} className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all" title="WhatsApp">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        {tab === 'pending' && (
                          <>
                            <button onClick={() => markDelivered(item.id)} className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95">
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
    </div>
  );
}
