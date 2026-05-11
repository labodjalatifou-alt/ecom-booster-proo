"use client";

import React, { useEffect, useState } from 'react';
import { Star, Zap, TrendingUp, DollarSign, Target, Loader2, ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useStore } from '@/components/StoreProvider';

const CRITERIA_LABELS: Record<string, { label: string; icon: string }> = {
  resolution_probleme: { label: "Résolution d'un vrai problème", icon: '🎯' },
  effet_wow: { label: 'Effet Wow', icon: '✨' },
  disponibilite_locale: { label: 'Disponibilité locale', icon: '📍' },
  transportabilite: { label: 'Transportabilité', icon: '📦' },
  potentiel_marketing: { label: 'Potentiel marketing', icon: '📣' },
  potentiel_viral: { label: 'Potentiel viral', icon: '🔥' },
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

  const costPrice = parseInt(latestProduct.cost_price || '0') || 0;
  const priceMin = costPrice > 0 ? costPrice + 8000 : null;
  const priceMax = costPrice > 0 ? costPrice + 15000 : null;
  
  const rawScore = latestProduct.score;
  const score = typeof rawScore === 'object' ? (rawScore?.total || 0) : (rawScore || 0);
  const scoreExplication = typeof rawScore === 'object' ? rawScore?.explication : null;
  const scoreCriteria = typeof rawScore === 'object' ? rawScore?.criteria : null;

  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-red-500';
  const scoreLabel = score >= 80 ? 'Excellent Potentiel' : score >= 60 ? 'Bon Potentiel' : 'Potentiel Moyen';
  const strokeColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  const getBarColor = (note: number) => {
    if (note >= 8) return 'bg-emerald-500';
    if (note >= 6) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-5">
          <Zap className="w-4 h-4" /> Score de Potentiel
        </div>
        <h2 className="text-4xl font-black tracking-tighter mb-2">{latestProduct.product_name}</h2>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Analyse Financière & Stratégique</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Score Gauge */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-44 h-44 mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-100 dark:text-slate-800" />
              <circle cx="100" cy="100" r="88" stroke={strokeColor} strokeWidth="16" fill="transparent" strokeDasharray={553} strokeDashoffset={553 * (1 - score / 100)} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black ${scoreColor}`}>{score}%</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{scoreLabel}</span>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-500 italic max-w-xs">
            Score de {score}% — {score > 80 ? 'très fort' : score > 60 ? 'bon' : 'potentiel modéré'} potentiel marché West Africa.
          </p>
        </div>

        {/* Pricing Block */}
        <div className="space-y-4">
          <div className="bg-primary-600 text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary-500/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-white/20 rounded-xl"><DollarSign className="w-5 h-5" /></div>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Prix Recommandé par l&apos;IA</span>
            </div>
            <p className="text-3xl font-black mb-1">{latestProduct.price_recommendation}</p>
            <p className="text-[10px] text-white/60 font-bold">Optimal pour le marché Afrique de l&apos;Ouest</p>
          </div>

          {priceMin && priceMax ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-800 p-5 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                  <ArrowDown className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Prix Minimum</span>
                </div>
                <p className="text-xl font-black text-emerald-700">{new Intl.NumberFormat('fr-FR').format(priceMin)}</p>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">Coût + 8 000 {currency}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800 p-5 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <ArrowUp className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Prix Maximum</span>
                </div>
                <p className="text-xl font-black text-blue-700">{new Intl.NumberFormat('fr-FR').format(priceMax)}</p>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">Coût + 15 000 {currency}</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 rounded-2xl text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase">Ajoutez votre prix d&apos;achat pour voir les prix min/max</p>
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-800 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-2 text-amber-600">
              <Target className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Conseil Stratégique</span>
            </div>
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed">
              &quot;Utilisez le Cash on Delivery (CoD). Proposez une offre &apos;Achetez 1, obtenez une réduction sur le 2ème&apos; pour augmenter votre panier moyen.&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Trending */}
      <div className="mt-8 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-5">
        <div className="p-3 bg-primary-100 text-primary-600 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Recommandation de marché</p>
          <p className="text-sm font-black">
            {score >= 80 ? '🔥 Produit Winner — Lancez une campagne Meta Ads immédiatement.' : score >= 60 ? '✅ Produit viable — Testez avec un budget modéré.' : '⚠️ Produit risqué — Validez avec une campagne organique.'}
          </p>
        </div>
      </div>

      {/* DETAILED CRITERIA SCORES */}
      {scoreCriteria && (
        <div className="mt-8 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
          <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" /> Décomposition du Score ({score}/100)
          </h3>
          <div className="space-y-5">
            {Object.entries(scoreCriteria).map(([key, value]: [string, any]) => {
              const meta = CRITERIA_LABELS[key] || { label: key, icon: '📊' };
              const note = value?.note || 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{meta.icon}</span>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">{meta.label}</span>
                    </div>
                    <span className={`text-sm font-black ${note >= 8 ? 'text-emerald-600' : note >= 6 ? 'text-amber-600' : 'text-red-600'}`}>{note}/10</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full transition-all duration-700 ${getBarColor(note)}`} style={{ width: `${note * 10}%` }} />
                  </div>
                  {value?.justification && (
                    <p className="text-[11px] font-medium text-slate-400 italic pl-6">{value.justification}</p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-primary-600" />
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Calcul Final</span>
            </div>
            <p className="text-xs font-bold text-slate-500">
              Score total = moyenne pondérée des {Object.keys(scoreCriteria).length} critères × 10 = <span className={`font-black ${scoreColor}`}>{score}%</span>
            </p>
          </div>
        </div>
      )}

      {/* Fallback text explication */}
      {!scoreCriteria && scoreExplication && (
        <div className="mt-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-[2rem] p-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4" /> Analyse Détaillée du Score ({score}/100)
          </h3>
          <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{scoreExplication}</p>
        </div>
      )}
    </div>
  );
}
