"use client";

import React from 'react';
import { Bell, CheckCircle2, Truck, AlertTriangle, UserPlus, ShoppingCart, Clock, ArrowRight } from 'lucide-react';
import DatePicker from '@/components/DatePicker';

export default function NotificationsPage() {
  const notifications = [
    { id: 1, type: 'order', title: 'Nouvelle Commande #CMD-1048', desc: 'Amina Diaby vient de commander une Brosse Soufflante.', time: 'il y a 2 min', icon: ShoppingCart, color: 'text-primary-600', bg: 'bg-primary-50' },
    { id: 2, type: 'closer', title: 'Commande Confirmée', desc: 'Le closer Fatou Diop a confirmé la commande #CMD-1042.', time: 'il y a 15 min', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 3, type: 'delivery', title: 'Colis Livré !', desc: 'Le livreur Moussa a livré avec succès le colis #LIV-1042.', time: 'il y a 1h', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 4, type: 'stock', title: 'Alerte Rupture', desc: 'Le stock de "Sac à Main Cuir" est épuisé.', time: 'il y a 3h', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 5, type: 'team', title: 'Nouvel Accès Créé', desc: 'Un accès Closer a été créé pour jean@ecom.com.', time: 'Hier', icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Flux d'activité</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Notifications</h2>
        </div>
        <DatePicker />
      </div>

      <div className="space-y-4">
        {notifications.map((notif, i) => (
          <div key={notif.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-primary-500/20 transition-all duration-300 group cursor-pointer animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-start gap-6">
              <div className={`w-14 h-14 rounded-2xl ${notif.bg} dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <notif.icon className={`w-7 h-7 ${notif.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-base font-black tracking-tight">{notif.title}</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                    <Clock className="w-3 h-3" /> {notif.time}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-500 italic mb-4">{notif.desc}</p>
                <button className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest group/btn hover:translate-x-2 transition-transform">
                  Voir les détails <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button className="px-10 py-5 bg-slate-100 dark:bg-slate-800 rounded-3xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-all active:scale-95">
          Charger plus de notifications
        </button>
      </div>
    </div>
  );
}
