"use client";

import React, { useEffect, useState } from 'react';
import { Star, Zap, TrendingUp, Target, Loader2, CheckCircle2, Lightbulb, AlertTriangle, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useStore } from '@/components/StoreProvider';

const CRITERIA_LABELS: Record<string, { label: string; icon: string }> = {
  problemSolving: { label: "Résolution Problème", icon: '🎯' },
  wowEffect: { label: "Effet Wow", icon: '✨' },
  localAvailability: { label: "Disponibilité locale", icon: '📍' },
  shippingEase: { label: "Facilité Transport", icon: '📦' },
  popularityInAfrica: { label: "Popularité Afrique", icon: '🌍' },
  marketingEase: { label: "Facilité Marketing", icon: '📈' },
  competition: { label: "Concurrence", icon: '🤝' },
  targetAudience: { label: "Audience Cible", icon: '👥' },
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
  const scoreDetails = latestProduct.score_details;
  const score = scoreDetails?.total || (typeof rawScore === 'number' ? rawScore : 0);
  const scoreExplication = scoreDetails?.explication || (typeof rawScore === 'object' ? rawScore?.explication : null);
  const scoreCriteria = scoreDetails?.criteria || (typeof rawScore === 'object' ? rawScore?.criteria : null);
  const launchStrategy = latestProduct.launch_strategy;

  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-red-500';
  const strokeColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  const getBarColor = (note: number) => {
    if (note >= 80) return 'bg-emerald-500';
    if (note >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 animate-in fade-in duration-700">
      
      {/* HEADER SECTION: SCORE & PRICE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Score Block */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-full mb-8 border border-amber-200/50 dark:border-amber-800/50">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Score Stratégique</span>
            </div>
            
            <h1 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-10 truncate max-w-full" title={latestProduct.product_name}>
              {latestProduct.product_name}
            </h1>

            <div className="relative w-48 h-48 mb-8 group-hover:scale-105 transition-transform duration-500">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800/50" />
                <circle cx="100" cy="100" r="85" stroke={strokeColor} strokeWidth="12" fill="transparent" strokeDasharray={534} strokeDashoffset={534 * (1 - score / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-7xl font-black tracking-tighter ${scoreColor}`}>{score}</span>
                <span className="text-xs font-black text-slate-400 tracking-widest uppercase">/100</span>
              </div>
            </div>

            <h2 className="text-2xl font-black tracking-tight mb-3 text-slate-800 dark:text-white">
              {scoreExplication || "Analyse en cours..."}
            </h2>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              {score >= 80 ? 'Potentiel exceptionnel détecté sur le marché local.' : score >= 60 ? 'Marché en croissance mais une éducation de l\'audience est nécessaire.' : 'Prudence recommandée, le marché semble saturé ou la demande est faible.'}
            </p>
          </div>
        </div>

        {/* Pricing Block */}
        <div className="flex flex-col gap-8">
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Recommandation Prix</span>
              </div>
              
              <div className="mb-8">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Prix de vente conseillé</p>
                <div className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                  {latestProduct.price_recommendation || `Non défini`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="px-6 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem]">
                  <p className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-1">Marge Estimeé</p>
                  <p className="text-sm font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Optimale
                  </p>
                </div>
                <div className="px-6 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem]">
                  <p className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-1">Volume Prévu</p>
                  <p className="text-sm font-black text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> Élevé
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* STRATEGIC LAUNCH BOX */}
          {launchStrategy && (
            <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-500/20 rounded-[3rem] p-8 relative group transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/20">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-red-600 dark:text-red-500">Dois-je lancer ce produit ?</h3>
              </div>
              <p className="text-[13px] font-bold text-slate-700 dark:text-red-100/80 leading-relaxed pl-2">
                {launchStrategy.strategy_text}
              </p>
              <div className="absolute top-6 right-8 px-4 py-1.5 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/30">
                {launchStrategy.should_launch || "Prudence"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CRITERIA GRID */}
      {scoreCriteria && (
        <>
          <div className="flex items-center gap-3 mb-8 px-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Détails du Score</h3>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(scoreCriteria).map(([key, value]: [string, any]) => {
              const meta = CRITERIA_LABELS[key] || { label: key, icon: '📊' };
              const note = value?.score || value?.note || 0;
              return (
                <div key={key} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] p-6 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xl opacity-80">{meta.icon}</span>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 line-clamp-1">{meta.label}</h4>
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${note >= 80 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : note >= 60 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {note}%
                    </span>
                  </div>
                  
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-5">
                    <div className={`h-full rounded-full transition-all duration-1000 ${getBarColor(note)}`} style={{ width: `${note}%` }} />
                  </div>

                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-5 leading-relaxed flex-1">
                    {value.justification}
                  </p>

                  {value.tip && (
                    <div className="mt-auto bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 group-hover:border-amber-200 dark:group-hover:border-amber-900/50 transition-colors">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed">
                          {value.tip}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
