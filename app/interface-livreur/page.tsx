"use client";

import React, { useEffect, useState } from 'react';
import { Truck, PhoneForwarded, MessageSquare, CheckCircle2, MapPin, DollarSign, Loader2, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function InterfaceLivreurPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCash, setTotalCash] = useState(0);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Confirmé')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
      const total = data.reduce((acc, o) => acc + parseFloat(o.price || '0'), 0);
      setTotalCash(total);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('livreur-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function markDelivered(orderId: any) {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    
    const { error } = await supabase
      .from('orders')
      .update({ status: 'Livré' })
      .eq('id', orderId);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
      fetchOrders();
    } else {
      toast.success("Colis marqué comme livré ! Bon travail.", { 
        icon: '💰',
        style: {
          borderRadius: '1.5rem',
          background: '#10b981',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '16px 24px'
        }
      });
      fetchOrders();
    }
  }

  async function markFailed(orderId: any) {
    setOrders(prev => prev.filter(o => o.id !== orderId));

    const { error } = await supabase
      .from('orders')
      .update({ status: 'Annulé' })
      .eq('id', orderId);

    if (error) {
      toast.error("Erreur");
      fetchOrders();
    } else {
      toast.error("Livraison annulée", {
        style: {
          borderRadius: '1.5rem',
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '16px 24px'
        }
      });
      fetchOrders();
    }
  }

  const handleCall = (phone: string) => { window.location.href = `tel:${phone}`; };
  const handleWhatsApp = (phone: string) => { window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank'); };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Tableau de Bord Livreur</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Mes Livraisons</h2>
          <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse inline-block"></span>
            {orders.length} colis à livrer · Temps réel
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full md:w-auto">
          <div className="bg-blue-500 text-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-500/20 flex flex-col items-center justify-center min-w-[180px]">
            <Package className="w-8 h-8 mb-2 opacity-60" />
            <span className="text-4xl font-black tracking-tighter">{orders.length}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">À Livrer</span>
          </div>
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center min-w-[180px]">
            <DollarSign className="w-8 h-8 mb-2 text-emerald-400" />
            <span className="text-2xl font-black tracking-tighter">{new Intl.NumberFormat('fr-FR').format(totalCash)}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Cash à collecter</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Chargement...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Truck className="w-16 h-16 opacity-20" />
            <p className="text-xl font-black text-slate-600">Aucune livraison en attente</p>
            <p className="text-sm text-slate-400">Les commandes confirmées par le Closer apparaîtront ici.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                  <th className="w-[28%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client & Téléphone</th>
                  <th className="w-[28%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Produit & Ville</th>
                  <th className="w-[14%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Montant</th>
                  <th className="w-[30%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                {orders.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                    <td className="px-8 py-4">
                      <div className="font-black text-sm">{item.customer}</div>
                      <div className="text-[11px] font-bold text-primary-500 mt-0.5">{item.phone}</div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="text-sm font-black text-slate-700 dark:text-slate-200 truncate">{item.product}</div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-0.5 uppercase">
                        <MapPin className="w-3 h-3" /> {item.city}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right font-black text-sm">{item.price}</td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleCall(item.phone)} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all" title="Appeler">
                          <PhoneForwarded className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleWhatsApp(item.phone)} className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all" title="WhatsApp">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button onClick={() => markDelivered(item.id)} className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95">
                          ✓ Livré
                        </button>
                        <button onClick={() => markFailed(item.id)} className="px-3 py-2 bg-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95">
                          ✗ Annuler
                        </button>
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
