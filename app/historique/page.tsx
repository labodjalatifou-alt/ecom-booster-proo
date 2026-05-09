"use client";

import React, { useEffect, useState } from 'react';
import { History, Search, Star, Calendar, Zap, ArrowUpRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function HistoriquePage() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAnalyses();
  }, []);

  async function fetchAnalyses() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setAnalyses(data);
    } catch (err) {
      console.error('Error fetching analyses:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = analyses.filter(a => 
    a.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <input 
            type="text" 
            placeholder="Rechercher un produit..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all" 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Chargement des archives...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
          <History className="w-16 h-16 opacity-20" />
          <p className="text-xl font-black text-slate-600">Aucune analyse trouvée</p>
          <Link href="/analyses" className="text-primary-600 text-xs font-bold hover:underline italic">Lancer une nouvelle analyse</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <Zap className={`w-7 h-7 ${item.score > 80 ? 'text-amber-500' : 'text-primary-500'}`} />
                </div>
                <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100">
                  Analysé
                </span>
              </div>

              <h3 className="text-xl font-black tracking-tight mb-2 line-clamp-1 relative z-10">{item.product_name}</h3>
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-black">{item.score}%</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {item.created_at ? format(new Date(item.created_at), 'dd MMMM yyyy', { locale: fr }) : '-'}
                </span>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between relative z-10">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Prix Suggéré</span>
                  <span className="text-sm font-black text-primary-600">{item.price_recommendation}</span>
                </div>
                <Link 
                  href="/score-et-prix"
                  className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm group/btn"
                >
                  <ArrowUpRight className="w-5 h-5 group-hover/btn:scale-110" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
          <History className="w-4 h-4" /> Fin de l'historique récent
        </div>
      </div>
    </div>
  );
}
