"use client";

import React, { useEffect, useState } from 'react';
import { History, Search, Star, Calendar, Zap, ArrowUpRight, Loader2, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function HistoriquePage() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAnalyses();
  }, []);

  async function fetchAnalyses() {
    setLoading(true);
    const { data } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false });
    setAnalyses(data || []);
    setLoading(false);
  }

  const handleClearHistory = async () => {
    if (!confirm("⚠️ Voulez-vous vraiment supprimer tout l'historique d'analyse ? Cette action est irréversible et réinitialisera toutes les pages (Shopify, Concurrent, etc.).")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('analyses').delete().neq('id', '0'); // Delete all
      if (error) throw error;
      setAnalyses([]);
      toast.success("Historique vidé ! Toutes les pages sont désormais réinitialisées.");
    } catch (err: any) {
      toast.error("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = analyses.filter(a =>
    a.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <History className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Archives Stratégiques</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Historique des Analyses</h2>
        </div>

        <div className="flex items-center gap-4">
          {analyses.length > 0 && (
            <>
              <div className="relative group">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all w-48"
                />
              </div>
              <button 
                onClick={handleClearHistory}
                className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all border-2 border-rose-100"
                title="Vider l'historique"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
          <p className="text-[10px] font-black uppercase tracking-widest">Mise à jour...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-300 text-center">
          <div className="p-10 bg-slate-100 dark:bg-slate-800 rounded-[3rem] mb-6 opacity-30">
            <History className="w-16 h-16" />
          </div>
          <p className="text-lg font-black text-slate-500 uppercase tracking-tighter">
            {searchTerm ? 'Aucun résultat' : 'Historique Vide'}
          </p>
          <p className="text-xs font-bold text-slate-400 mb-8 max-w-xs">
            {searchTerm ? 'Essayez un autre mot-clé.' : 'Toutes les pages stratégiques sont réinitialisées. Lancez une nouvelle analyse pour les remplir.'}
          </p>
          {!searchTerm && (
            <Link href="/analyses" className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20">
              <Zap className="w-4 h-4" /> Nouvelle Analyse
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-7 shadow-sm hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />

              <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <Zap className={`w-6 h-6 ${item.score > 80 ? 'text-amber-500' : 'text-primary-500'}`} />
                </div>
                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase border bg-blue-50 text-blue-600 border-blue-100">Analysé</span>
              </div>

              <h3 className="text-lg font-black tracking-tight mb-2 line-clamp-1 relative z-10">{item.product_name}</h3>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-black">{item.score}%</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.created_at ? format(new Date(item.created_at), 'dd MMM yyyy', { locale: fr }) : '-'}
                </span>
              </div>

              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Prix Suggéré</span>
                  <span className="text-sm font-black text-primary-600">{item.price_recommendation}</span>
                </div>
                <Link
                  href="/score-et-prix"
                  className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-primary-600 hover:text-white transition-all"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
