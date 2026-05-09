"use client";

import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Truck, ShoppingCart, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifs() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        const mapped = data.map((order: any) => {
          let title = `Commande #${String(order.shopify_id || order.id).slice(-4)}`;
          let desc = `${order.customer} a passé une commande.`;
          let icon = ShoppingCart;
          let color = 'text-primary-600';
          let bg = 'bg-primary-50 dark:bg-primary-900/20';

          if (order.status === 'Livré') {
            title = 'Colis Livré !';
            desc = `La commande de ${order.customer} a été livrée avec succès.`;
            icon = Truck;
            color = 'text-emerald-600';
            bg = 'bg-emerald-50 dark:bg-emerald-900/20';
          } else if (order.status === 'Confirmé') {
            title = 'Commande Confirmée';
            desc = `La commande de ${order.customer} a été validée par le closer.`;
            icon = CheckCircle2;
            color = 'text-blue-600';
            bg = 'bg-blue-50 dark:bg-blue-900/20';
          }

          return {
            id: order.id,
            title,
            desc,
            time: formatDistanceToNow(new Date(order.updated_at || order.created_at), { addSuffix: true, locale: fr }),
            icon,
            color,
            bg
          };
        });
        setNotifications(mapped);
      }
      setLoading(false);
    }
    fetchNotifs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Flux d'activité</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Notifications</h2>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-300">
            <Bell className="w-10 h-10" />
            <p className="text-[10px] font-black uppercase tracking-widest">Aucune notification pour le moment</p>
          </div>
        ) : (
          notifications.map((notif, i) => (
            <div
              key={notif.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-lg hover:border-primary-500/20 transition-all duration-300 group cursor-pointer animate-in fade-in slide-in-from-left-4"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${notif.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <notif.icon className={`w-5 h-5 ${notif.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-black tracking-tight">{notif.title}</h3>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" /> {notif.time}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 italic mb-3">{notif.desc}</p>
                  <button className="flex items-center gap-1.5 text-[9px] font-black text-primary-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                    Voir <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
