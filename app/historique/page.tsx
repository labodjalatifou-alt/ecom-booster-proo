"use client";

import React from 'react';
import { History, Search, ArrowRight, Star, ExternalLink, Calendar, Zap, Layout, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const mockHistory = [
  { id: 1, name: 'Brosse Soufflante 5-en-1', score: 85, price: '25 000 FCFA', date: '08 Mai 2026', status: 'Analysé', path: '/score-et-prix' },
  { id: 2, name: 'Montre Connectée Pro', score: 92, price: '35 000 FCFA', date: '07 Mai 2026', status: 'Exporté', path: '/score-et-prix' },
  { id: 3, name: 'Mini Projecteur HD', score: 78, price: '45 000 FCFA', date: '06 Mai 2026', status: 'Analysé', path: '/score-et-prix' },
  { id: 4, name: 'Sac à Main Cuir', score: 81, price: '30 000 FCFA', date: '05 Mai 2026', status: 'Analysé', path: '/score-et-prix' },
  { id: 5, name: 'Écouteurs Sans Fil Pro', score: 88, price: '15 000 FCFA', date: '04 Mai 2026', status: 'Exporté', path: '/score-et-prix' },
];

export default function HistoriquePage() {
  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
              <History className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Archives Stratégiques</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Historique des Analyses</h2>
        </div>
        
        <div className="relative w-full max-w-xs group">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
          <input type="text" placeholder="Rechercher un produit..." className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockHistory.map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <Zap className={`w-7 h-7 ${item.score > 80 ? 'text-amber-500' : 'text-primary-500'}`} />
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                item.status === 'Exporté' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
                {item.status}
              </span>
            </div>

            <h3 className="text-xl font-black tracking-tight mb-2 line-clamp-1 relative z-10">{item.name}</h3>
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-black">{item.score}%</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {item.date}
              </span>
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between relative z-10">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Prix Analyse</span>
                <span className="text-sm font-black text-primary-600">{item.price}</span>
              </div>
              <Link 
                href={item.path}
                className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm group/btn"
              >
                <ArrowUpRight className="w-5 h-5 group-hover/btn:scale-110" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
          <History className="w-4 h-4" /> Fin de l'historique récent
        </div>
      </div>
    </div>
  );
}
