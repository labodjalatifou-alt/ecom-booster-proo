"use client";

import React, { useEffect, useState } from 'react';
import { Star, Zap, TrendingUp, Target, Loader2, CheckCircle2, Lightbulb, AlertTriangle, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useStore } from '@/components/StoreProvider';

const CRITERIA_LABELS: Record<string, { label: string; icon: string }> = {
  popularityInAfrica: { label: "Popularité en Afrique", icon: '🌍' },
  marketingEase: { label: "Facilité à marketer", icon: '📈' },
  competition: { label: "Concurrence", icon: '🤝' },
  pricing: { label: "Prix adapté", icon: '💰' },
  targetAudience: { label: "Audience cible", icon: '👥' },
  marketTrend: { label: "Tendance marché", icon: '🔥' },
};

export default function ScorePage() {
  const { currency } = useStore();
  const [latestProduct, setLatestProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalysis() {
      const activeId = localStorage.getItem('activeAnalysisId');
      let query = supabase.from('analyses').select('*');
      if (activeId) {
        query = query.eq('id', activeId);
      } else {
        query = query.order('created_at', { ascending: false }).limit(1);
      }
      const { data } = await query;
      if (data && data[0]) setLatestProduct(data[0]);
      setLoading(false);
    }
    fetchAnalysis();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  if (!latestProduct) return (
    <div className="max-w-7xl mx-auto pb-10 px-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 opacity-40">
        <Star className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-sm font-black text-slate-600 mb-1">Score & Prix</p>
      <p className="text-[10px] font-bold text-slate-400 mb-6">Analysez un produit pour voir le score et les prix.</p>
      <Link href="/analyses" className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all">
        Analyser un produit
      </Link>
    </div>
  );

  const rawScore = latestProduct.score;
  const score = typeof rawScore === 'object' ? (rawScore?.total || 0) : (rawScore || 0);
  const scoreExplication = typeof rawScore === 'object' ? rawScore?.explication : null;
  const scoreCriteria = typeof rawScore === 'object' ? rawScore?.criteria : null;
  const launchStrategy = latestProduct.launch_strategy;

  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-red-500';
  const strokeColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  const getBarColor = (note: number) => {
    if (note >= 80) return 'bg-emerald-500';
    if (note >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      {/* HEADER SECTION WITH CIRCULAR SCORE */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3.5rem] p-10 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-amber-500 mb-6">
            <Star className="w-4 h-4 fill-amber-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Score Produit</span>
          </div>
          
          <h1 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-10">{latestProduct.product_name}</h1>

          <div className="relative w-48 h-48 mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50 dark:text-slate-800" />
              <circle cx="100" cy="100" r="85" stroke={strokeColor} strokeWidth="12" fill="transparent" strokeDasharray={534} strokeDashoffset={534 * (1 - score / 100)} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-black tracking-tighter ${scoreColor}`}>{score}</span>
              <span className="text-[10px] font-black text-slate-400 tracking-widest -mt-1">/100</span>
            </div>
          </div>

          <h2 className="text-2xl font-black tracking-tight mb-3">{scoreExplication || "Analyse en cours..."}</h2>
          <p className="text-xs font-bold text-slate-400 max-w-lg leading-relaxed">
            {score >= 80 ? 'Potentiel exceptionnel détecté sur le marché local.' : score >= 60 ? 'Marché en croissance mais une éducation de l\'audience est nécessaire.' : 'Prudence recommandée, le marché semble saturé ou la demande est faible.'}
          </p>
        </div>
      </div>

      {/* STRATEGIC LAUNCH BOX */}
      {launchStrategy && (
        <div className="bg-red-950/10 dark:bg-red-950/20 border-2 border-red-500/20 rounded-[2.5rem] p-8 mb-10 relative group hover:border-red-500/40 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/20">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-red-600">Dois-je lancer ce produit ?</h3>
          </div>
          <p className="text-[13px] font-bold text-slate-700 dark:text-red-100/80 leading-relaxed pl-2">
            {launchStrategy.strategy_text}
          </p>
          <div className="absolute top-6 right-8 px-4 py-1.5 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
            {launchStrategy.should_launch || "Prudence"}
          </div>
        </div>
      )}

      {/* CRITERIA GRID */}
      {scoreCriteria && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(scoreCriteria).map(([key, value]: [string, any]) => {
            const meta = CRITERIA_LABELS[key] || { label: key, icon: '📊' };
            const note = value?.score || value?.note || 0;
            return (
              <div key={key} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col shadow-sm hover:border-primary-500/20 transition-all group">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">{meta.label}</h4>
                  <span className={`text-sm font-black ${note >= 80 ? 'text-emerald-500' : note >= 60 ? 'text-amber-500' : 'text-red-500'}`}>{note}/100</span>
                </div>
                
                <div className="w-full h-2 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
                  <div className={`h-full rounded-full transition-all duration-1000 ${getBarColor(note)}`} style={{ width: `${note}%` }} />
                </div>

                <p className="text-[11px] font-bold text-slate-400 mb-6 leading-relaxed">
                  {value.justification}
                </p>

                {value.tip && (
                  <div className="mt-auto bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 italic leading-snug">
                      {value.tip}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PRICING FOOTER */}
      <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary-600 text-white rounded-[2rem] shadow-xl shadow-primary-500/20">
             <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Prix de vente conseillé</p>
            <p className="text-3xl font-black text-primary-600">{latestProduct.price_recommendation || `Non défini`}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-800 rounded-2xl text-center">
            <p className="text-[9px] font-black uppercase text-emerald-600 mb-1">Marge Estimeé</p>
            <p className="text-sm font-black text-emerald-700">Optimale</p>
          </div>
          <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800 rounded-2xl text-center">
            <p className="text-[9px] font-black uppercase text-blue-600 mb-1">Volume de vente</p>
            <p className="text-sm font-black text-blue-700">Elevé</p>
          </div>
        </div>
      </div>
    </div>
  );
}
