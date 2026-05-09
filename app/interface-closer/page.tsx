"use client";

import React, { useEffect, useState } from 'react';
import { Headset, PhoneForwarded, MessageSquare, Clock, CheckCircle2, MapPin, Edit3, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function InterfaceCloserPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmedToday, setConfirmedToday] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [showNote, setShowNote] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'A Confirmer')
      .order('created_at', { ascending: false });
    if (!error && data) setOrders(data);
    setLoading(false);
  }

  async function fetchConfirmedCount() {
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Confirmé')
      .gte('created_at', today);
    setConfirmedToday(count || 0);
  }

  useEffect(() => {
    fetchOrders();
    fetchConfirmedCount();

    const channel = supabase
      .channel('closer-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
        fetchConfirmedCount();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function confirmOrder(orderId: any) {
    // Optimistic UI update
    setOrders(prev => prev.filter(o => o.id !== orderId));
    
    const { error } = await supabase
      .from('orders')
      .update({ status: 'Confirmé' })
      .eq('id', orderId);

    if (error) {
      toast.error("Erreur lors de la confirmation");
      fetchOrders(); // Rollback
    } else {
      toast.success("Commande propulsée vers le livreur !", { 
        icon: '🚀',
        style: {
          borderRadius: '1.5rem',
          background: '#0f172a',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '16px 24px'
        }
      });
      fetchConfirmedCount();
    }
  }

  const handleCall = (phone: string) => { window.location.href = `tel:${phone}`; };
  const handleWhatsApp = (phone: string) => { window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank'); };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Headset className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Centre d'Appels</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Interface Closer</h2>
          <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
            {orders.length} commandes à confirmer · Temps réel
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 p-6 rounded-[2rem] shadow-sm text-center min-w-[140px]">
            <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Confirmés Aujourd'hui</span>
            <span className="text-2xl font-black text-emerald-600">{confirmedToday}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 p-6 rounded-[2rem] shadow-sm text-center min-w-[140px]">
            <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">En Attente</span>
            <span className="text-2xl font-black text-primary-600">{orders.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Chargement...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 opacity-50" />
            <p className="text-xl font-black text-slate-600">Aucune commande à confirmer !</p>
            <p className="text-sm text-slate-400">Toutes les commandes ont été traitées. Excellent travail ! 🎉</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                  <th className="w-[30%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client & Téléphone</th>
                  <th className="w-[25%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Produit</th>
                  <th className="w-[15%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Ville</th>
                  <th className="w-[15%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Prix</th>
                  <th className="w-[15%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                {orders.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                    <td className="px-8 py-4">
                      <div className="font-black text-sm">{item.customer}</div>
                      <div className="text-[11px] font-bold text-primary-500 mt-0.5">{item.phone}</div>
                    </td>
                    <td className="px-8 py-4 text-xs font-black text-slate-600 dark:text-slate-300 truncate">{item.product}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                        <MapPin className="w-3 h-3" /> {item.city}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right font-black text-sm">{item.price}</td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCall(item.phone)}
                          className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                          title="Appeler"
                        >
                          <PhoneForwarded className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleWhatsApp(item.phone)}
                          className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedOrder(item); setShowNote(true); }}
                          className="p-2 bg-amber-100 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all"
                          title="Note"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmOrder(item.id)}
                          className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all active:scale-95"
                        >
                          ✓ Confirmer
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

      {/* Modal Note */}
      {showNote && selectedOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowNote(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black flex items-center gap-3"><Edit3 className="w-7 h-7 text-amber-500" /> Note Closer</h3>
              <button onClick={() => setShowNote(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-4">{selectedOrder.customer} — {selectedOrder.product}</p>
            <textarea
              placeholder="Ex: Client hésite, rappeler demain matin..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold mb-6 h-32 outline-none resize-none"
            />
            <button
              onClick={() => { toast.success("Note enregistrée !"); setShowNote(false); setNoteText(''); }}
              className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 transition-all"
            >
              Enregistrer Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
