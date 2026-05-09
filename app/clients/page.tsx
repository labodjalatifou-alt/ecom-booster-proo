"use client";

import React, { useEffect, useState } from 'react';
import { Users, Search, Phone, Star, Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Client {
  customer: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  currency: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchClients() {
      const { data, error } = await supabase
        .from('orders')
        .select('customer, phone, city, price, created_at, currency')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Grouper par client (nom + téléphone)
        const map = new Map<string, Client>();

        data.forEach((order: any) => {
          const key = `${order.customer}|${order.phone}`;
          const price = parseFloat(String(order.price || '0').replace(/\s/g, '')) || 0;
          const city = order.city?.split(',').map((s: string) => s.trim()).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).join(', ') || '-';

          if (map.has(key)) {
            const existing = map.get(key)!;
            existing.totalOrders += 1;
            existing.totalSpent += price;
          } else {
            map.set(key, {
              customer: order.customer,
              phone: order.phone,
              city,
              totalOrders: 1,
              totalSpent: price,
              lastOrder: order.created_at,
              currency: order.currency || 'FCFA',
            });
          }
        });

        setClients(Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent));
      }
      setLoading(false);
    }
    fetchClients();
  }, []);

  const filtered = clients.filter(c =>
    c.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLabel = (c: Client) => {
    if (c.totalOrders >= 4) return { label: 'VIP', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    if (c.totalOrders >= 2) return { label: 'Régulier', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    return { label: 'Nouveau', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  };

  const fmt = (n: number, currency: string) =>
    `${new Intl.NumberFormat('fr-FR').format(Math.round(n))} ${currency}`;

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Base Clients</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">CRM Clients</h2>
          {!loading && <p className="text-slate-400 text-xs font-bold mt-1">{clients.length} clients uniques</p>}
        </div>

        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Nom, téléphone, ville..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all w-64"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">Chargement des clients...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-300">
            <Users className="w-12 h-12" />
            <p className="text-sm font-black text-slate-500">
              {searchTerm ? 'Aucun client trouvé' : 'Aucun client enregistré'}
            </p>
            {!searchTerm && <p className="text-[10px] font-bold text-slate-400">Les clients apparaîtront après synchronisation des commandes.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest">Client</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest">Contact</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest">Ville</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Commandes</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Total Dépensé</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                {filtered.map((client, i) => {
                  const badge = getLabel(client);
                  const initials = client.customer.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                  return (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-black text-xs shrink-0">
                            {initials}
                          </div>
                          <span className="font-black text-sm">{client.customer}</span>
                          {client.totalOrders >= 4 && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 text-[11px] font-bold text-primary-500 hover:text-primary-700 transition-colors">
                          <Phone className="w-3 h-3" /> {client.phone}
                        </a>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                          <MapPin className="w-3 h-3" /> {client.city}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-sm font-black">{client.totalOrders}</span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-sm text-emerald-600">
                        {fmt(client.totalSpent, client.currency)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
