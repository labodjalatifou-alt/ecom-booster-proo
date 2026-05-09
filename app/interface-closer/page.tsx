"use client";

import React, { useEffect, useState } from 'react';
import { Headset, PhoneForwarded, MessageSquare, CheckCircle2, MapPin, Edit3, Loader2, X, MoreVertical, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useStore } from '@/components/StoreProvider';

type Tab = 'pending' | 'confirmed' | 'cancelled';

export default function InterfaceCloserPage() {
  const { currency } = useStore();
  const [tab, setTab] = useState<Tab>('pending');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmedToday, setConfirmedToday] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    // Fetch all relevant orders
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    
    // Fetch count confirmed today
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Confirmé')
      .gte('created_at', today);
    setConfirmedToday(count || 0);
    
    setLoading(false);
  }

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('closer-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function updateStatus(orderId: any, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success(newStatus === 'Confirmé' ? "Commande propulsée ! 🚀" : "Commande annulée");
      fetchData();
    }
  }

  const filteredOrders = orders.filter(o => {
    if (tab === 'pending') return o.status === 'A Confirmer';
    if (tab === 'confirmed') return o.status === 'Confirmé';
    if (tab === 'cancelled') return o.status === 'Annulé';
    return false;
  });

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
        </div>
        <div className="flex gap-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 p-4 rounded-2xl shadow-sm text-center min-w-[120px]">
            <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Confirmés Aujourd'hui</span>
            <span className="text-xl font-black text-emerald-600">{confirmedToday}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 p-4 rounded-2xl shadow-sm text-center min-w-[120px]">
            <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">En Attente</span>
            <span className="text-xl font-black text-primary-600">{orders.filter(o => o.status === 'A Confirmer').length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-1 shadow-sm mb-8 w-fit">
        {[
          { id: 'pending', label: 'À Confirmer', icon: Clock },
          { id: 'confirmed', label: 'Confirmées', icon: CheckCircle2 },
          { id: 'cancelled', label: 'Annulées', icon: XCircle },
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
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[400px]">
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
            <table className="w-full text-left border-collapse table-fixed">
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
                    </td>
                    <td className="px-8 py-4 text-xs font-black text-slate-600 dark:text-slate-300 truncate">{item.product}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                        <MapPin className="w-3 h-3" /> {item.city?.split(',').map((s: string) => s.trim()).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).join(', ')}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="font-black text-sm text-emerald-600">{item.price} {currency}</div>
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
            <button onClick={() => { toast.success("Note enregistrée !"); setShowNote(false); setNoteText(''); }} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 transition-all">Enregistrer</button>
          </div>
        </div>
      )}
    </div>
  );
}
