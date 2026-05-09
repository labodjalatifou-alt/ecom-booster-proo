"use client";

import React, { useEffect, useState } from 'react';
import { Star, Zap, TrendingUp, DollarSign, Target, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ScorePage() {
  const [latestProduct, setLatestProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      const { data } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data[0]) setLatestProduct(data[0]);
      setLoading(false);
    }
    fetchLatest();
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

  // Calcul des prix basé sur le coût d'achat
  const costPrice = parseInt(latestProduct.cost_price || '0') || 0;
  const priceMin = costPrice > 0 ? costPrice + 8000 : null;
  const priceMax = costPrice > 0 ? costPrice + 15000 : null;
  const score = latestProduct.score || 0;

  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-red-500';
  const scoreLabel = score >= 80 ? 'Excellent Potentiel' : score >= 60 ? 'Bon Potentiel' : 'Potentiel Moyen';
  const strokeColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      {/* Header */}
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
              <circle
                cx="100" cy="100" r="88"
                stroke={strokeColor}
                strokeWidth="16"
                fill="transparent"
                strokeDasharray={553}
                strokeDashoffset={553 * (1 - score / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black ${scoreColor}`}>{score}%</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{scoreLabel}</span>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-500 italic max-w-xs">
            Un score de {score}% indique un {score > 80 ? 'très fort' : score > 60 ? 'bon' : 'potentiel modéré'} potentiel sur le marché West Africa.
          </p>
        </div>

        {/* Pricing Block */}
        <div className="space-y-4">
          {/* Prix recommandé */}
          <div className="bg-primary-600 text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary-500/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-white/20 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Prix Recommandé par l'IA</span>
            </div>
            <p className="text-3xl font-black mb-1">{latestProduct.price_recommendation}</p>
            <p className="text-[10px] text-white/60 font-bold">Optimal pour le marché Afrique de l'Ouest</p>
          </div>

          {/* Min / Max basé sur coût d'achat */}
          {priceMin && priceMax ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-800 p-5 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                  <ArrowDown className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Prix Minimum</span>
                </div>
                <p className="text-xl font-black text-emerald-700">{new Intl.NumberFormat('fr-FR').format(priceMin)}</p>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">Coût + 8 000 FCFA</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800 p-5 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <ArrowUp className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Prix Maximum</span>
                </div>
                <p className="text-xl font-black text-blue-700">{new Intl.NumberFormat('fr-FR').format(priceMax)}</p>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">Coût + 15 000 FCFA</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 rounded-2xl text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase">Ajoutez votre prix d'achat dans le formulaire pour voir les prix min/max</p>
            </div>
          )}

          {/* Conseil stratégique */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-800 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-2 text-amber-600">
              <Target className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Conseil Stratégique</span>
            </div>
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "Utilisez le Cash on Delivery (CoD). Proposez une offre 'Achetez 1, obtenez une réduction sur le 2ème' pour augmenter votre panier moyen et maximiser les marges."
            </p>
          </div>
        </div>
      </div>

      {/* Trending indicator */}
      <div className="mt-8 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-5">
        <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Recommandation de marché</p>
          <p className="text-sm font-black">
            {score >= 80 ? '🔥 Produit Winner — Lancez une campagne Meta Ads immédiatement.' : score >= 60 ? '✅ Produit viable — Testez avec un budget publicitaire modéré.' : '⚠️ Produit risqué — Validez d\'abord avec une campagne organique.'}
          </p>
        </div>
      </div>
    </div>
  );
}
