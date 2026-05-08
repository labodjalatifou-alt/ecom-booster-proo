"use client";

import React, { useState } from 'react';
import { History, Search, ArrowRight, CheckCircle2, XCircle, Clock, MapPin, DollarSign, Package, User, Filter, Eye } from 'lucide-react';

const mockOrderHistory = [
  { id: 1, client: "Awa Diop", product: "Brosse 5-en-1", price: "25 000 F", date: "08 Mai 2026", status: "Livré", store: "Boutique Abidjan", profit: "18 000 F" },
  { id: 2, client: "Moussa Traoré", product: "Mini Projecteur", price: "45 000 F", date: "07 Mai 2026", status: "Livré", store: "Boutique Dakar", profit: "32 000 F" },
  { id: 3, client: "Fatou Kane", product: "Montre Connectée", price: "35 000 F", date: "07 Mai 2026", status: "Annulé", store: "Boutique Conakry", profit: "0 F" },
  { id: 4, client: "Jean Kouassi", product: "Sac Premium", price: "30 000 F", date: "06 Mai 2026", status: "Livré", store: "Boutique Abidjan", profit: "21 000 F" },
  { id: 5, client: "Saliou Diallo", product: "Brosse 5-en-1", price: "25 000 F", date: "05 Mai 2026", status: "Livré", store: "Boutique Bamako", profit: "18 000 F" },
];

export default function HistoriqueCommandesPage() {
  const [activeOrder, setActiveOrder] = useState<number | null>(null);

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
              <History className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Archives Ventes</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Historique des Commandes</h2>
        </div>
        
        <div className="flex gap-4">
          <div className="relative w-full max-w-xs group">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
            <input type="text" placeholder="Rechercher une commande..." className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all" />
          </div>
          <button className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary-600 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client & Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Produit & Boutique</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Statut</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Profit Net</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
              {mockOrderHistory.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => setActiveOrder(activeOrder === order.id ? null : order.id)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                >
                  <td className="px-8 py-6">
                    <div className="font-black text-sm group-hover:text-primary-600 transition-colors">{order.client}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{order.date}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-slate-700 dark:text-slate-200">{order.product}</div>
                    <div className="text-[10px] font-bold text-primary-500 mt-1 uppercase tracking-tighter">{order.store}</div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      order.status === 'Livré' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                      'bg-red-50 text-red-500 border border-red-100'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-sm text-emerald-600">
                    {order.profit}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
