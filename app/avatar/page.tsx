"use client";

import React, { useEffect, useState } from 'react';
import { User, Target, Brain, Wallet, ShieldAlert, CheckCircle2, Loader2, Heart, MessageCircle, AlertTriangle, Lightbulb, Flame, Quote } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AvatarPage() {
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
        <User className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-sm font-black text-slate-600 mb-1">Avatar Client</p>
      <p className="text-[10px] font-bold text-slate-400 mb-6">Analysez un produit pour générer le profil client.</p>
      <Link href="/analyses" className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all">
        Analyser un produit
      </Link>
    </div>
  );

  const avatar = latestProduct.customer_avatar;

  if (!avatar || typeof avatar !== 'object') return (
    <div className="max-w-7xl mx-auto pb-10 px-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 opacity-40">
        <User className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-sm font-black text-slate-600 mb-1">Données Avatar Incomplètes</p>
      <p className="text-[10px] font-bold text-slate-400 mb-6">Relancez une analyse pour générer un profil complet.</p>
      <Link href="/analyses" className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all">
        Nouvelle Analyse
      </Link>
    </div>
  );

  const ensureArray = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === 'string') return [val];
    return [];
  };

  const interets: string[] = ensureArray(avatar.interets || avatar.interests || ['Shopping en ligne', 'Nouveautés', 'Produits pratiques']);
  const frustrations: string[] = ensureArray(avatar.frustrations || avatar.pains);
  const peurs: string[] = ensureArray(avatar.peurs || avatar.fears);
  const desirs: string[] = ensureArray(avatar.desirs || avatar.désirs || avatar.goals || avatar.desires);

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -z-10 pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-5 shadow-sm">
          <User className="w-4 h-4 text-blue-500" /> Profil Acheteur
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-slate-800 dark:text-white leading-tight">
          {latestProduct.product_name}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Démographie */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-6 group hover:-translate-y-1 transition-transform">
          <div className="p-5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-[1.5rem] group-hover:scale-110 transition-transform">
            <User className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Sexe</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{avatar.sexe || avatar.gender || '-'}</p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-6 group hover:-translate-y-1 transition-transform">
          <div className="p-5 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-[1.5rem] group-hover:scale-110 transition-transform">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tranche d'Âge</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{avatar.age || '-'}</p>
          </div>
        </div>
      </div>

      {/* Centres d'intérêt */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-8 md:p-10 rounded-[3rem] mb-8 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-slate-400">
          <Brain className="w-5 h-5 text-purple-500" /> Centres d'intérêt
        </h3>
        <div className="flex flex-wrap gap-3">
          {(Array.isArray(interets) ? interets : typeof interets === 'string' ? [interets] : []).map((item: string, i: number) => (
            <span key={i} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Douleurs & Désirs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-8 rounded-[3rem] shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" /> Frustrations
          </h3>
          <ul className="space-y-4">
            {(Array.isArray(frustrations) ? frustrations : typeof frustrations === 'string' ? [frustrations] : []).map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-8 rounded-[3rem] shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" /> Peurs
          </h3>
          <ul className="space-y-4">
            {(Array.isArray(peurs) ? peurs : typeof peurs === 'string' ? [peurs] : []).map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-8 rounded-[3rem] shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <Target className="w-5 h-5" /> Désirs & Rêves
          </h3>
          <ul className="space-y-4">
            {(Array.isArray(desirs) ? desirs : typeof desirs === 'string' ? [desirs] : []).map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Phrase déclenchante */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-primary-600 text-white p-10 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-[2rem] shrink-0 group-hover:rotate-6 transition-transform duration-500">
            <Quote className="w-10 h-10 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3 opacity-80">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Phrase Déclenchante</span>
            </div>
            <p className="text-xl md:text-3xl font-black italic leading-tight text-white drop-shadow-sm">
              &ldquo;{avatar.phrase_declenchante || avatar.trigger_phrase || 'Découvrez notre produit dès aujourd\'hui.'}&rdquo;
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
