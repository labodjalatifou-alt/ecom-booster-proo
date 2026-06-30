"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Package, Truck, DollarSign, ShoppingCart, Loader2, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  ORDER_CREATED: { icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ORDER_CONFIRMED: { icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ORDER_DELIVERED: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  MONEY_ADDED: { icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ORDER_ASSIGNED: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (data) setNotifications(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchNotifications();

    // Temps réel
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'all', read: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('Toutes les notifications marquées comme lues');
  };

  const handleClick = async (n: any) => {
    if (!n.read) await markRead(n.id);
    if (n.type === 'ORDER_CREATED') {
      router.push(n.target_role === 'CLOSER' ? '/interface-closer' : '/commandes');
    } else if (n.order_id) {
      router.push('/commandes');
    }
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
              <Bell className="w-6 h-6 text-primary-600" />
            </div>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-black">{unreadCount} nouvelles</span>
            )}
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Notifications</h2>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            <CheckCheck className="w-4 h-4" /> Tout marquer lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-3xl mb-4 opacity-40">
            <Inbox className="w-10 h-10 text-slate-400" />
          </div>
          <p className="text-sm font-black text-slate-500 mb-1">Aucune notification</p>
          <p className="text-[10px] font-bold text-slate-400">Les notifications apparaîtront ici en temps réel.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.ORDER_CREATED;
            const Icon = config.icon;
            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  n.read
                    ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60'
                    : `${config.bg} border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md`
                }`}
              >
                <div className={`p-2.5 rounded-xl ${config.bg} ${config.color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-black truncate">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />}
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0 mt-1">
                  {timeAgo(n.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
