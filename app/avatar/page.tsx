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

  // Helper pour afficher une liste ou un texte
  const renderList = (items: any) => {
    if (!items) return null;
    if (typeof items === 'string') return [items];
    if (Array.isArray(items)) return items;
    return null;
  };

  const frustrations = renderList(avatar.frustrations || avatar.pains);
  const peurs = renderList(avatar.peurs || avatar.fears);
  const desirs = renderList(avatar.désirs || avatar.desirs || avatar.goals || avatar.desires);
  const objections = renderList(avatar.objections);

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-5">
          <Target className="w-4 h-4" /> Ciblage Précis
        </div>
        <h2 className="text-4xl font-black tracking-tighter mb-2">{avatar.title || 'Client Idéal'}</h2>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Profil Psychographique Complet · {latestProduct.product_name}</p>
      </div>

      {/* Stats rapides — 4 colonnes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm text-center">
          <User className="w-5 h-5 text-blue-500 mx-auto mb-2" />
          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Sexe</span>
          <p className="text-base font-black">{avatar.sexe || avatar.gender || '-'}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm text-center">
          <Target className="w-5 h-5 text-amber-500 mx-auto mb-2" />
          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Âge</span>
          <p className="text-base font-black">{avatar.age || '-'}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm text-center">
          <Wallet className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Revenus</span>
          <p className="text-base font-black">{avatar.revenus || avatar.income || '-'}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm text-center">
          <Brain className="w-5 h-5 text-purple-500 mx-auto mb-2" />
          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Profil</span>
          <p className="text-base font-black">{avatar.profil || avatar.title || '-'}</p>
        </div>
      </div>

      {/* Frustrations & Peurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-rose-50 dark:bg-rose-900/10 border-2 border-rose-100 dark:border-rose-800 p-8 rounded-[2.5rem]">
          <h3 className="text-lg font-black mb-5 flex items-center gap-3 text-rose-600">
            <ShieldAlert className="w-5 h-5" /> Frustrations
          </h3>
          <ul className="space-y-3">
            {(frustrations || []).map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-800 p-8 rounded-[2.5rem]">
          <h3 className="text-lg font-black mb-5 flex items-center gap-3 text-amber-600">
            <AlertTriangle className="w-5 h-5" /> Peurs
          </h3>
          <ul className="space-y-3">
            {(peurs || []).map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Désirs & Objections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-800 p-8 rounded-[2.5rem]">
          <h3 className="text-lg font-black mb-5 flex items-center gap-3 text-emerald-600">
            <Heart className="w-5 h-5" /> Désirs
          </h3>
          <ul className="space-y-3">
            {(desirs || []).map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 p-8 rounded-[2.5rem]">
          <h3 className="text-lg font-black mb-5 flex items-center gap-3 text-slate-600">
            <MessageCircle className="w-5 h-5" /> Objections
          </h3>
          <ul className="space-y-3">
            {(objections || []).map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Déclencheurs — section spéciale */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Phrase déclenchante */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-7 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <Quote className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-widest">Phrase Déclenchante</span>
          </div>
          <p className="text-sm font-bold italic leading-relaxed">
            &ldquo;{avatar.phrase_declenchante || avatar.trigger_phrase || 'Non définie'}&rdquo;
          </p>
        </div>

        {/* Comment le convaincre */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-7 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <Lightbulb className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-widest">Comment le convaincre</span>
          </div>
          <p className="text-sm font-bold leading-relaxed">
            {avatar.comment_le_convaincre || avatar.how_to_convince || 'Non défini'}
          </p>
        </div>

        {/* Déclencheur émotionnel */}
        <div className="bg-gradient-to-br from-rose-600 to-pink-700 text-white p-7 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <Flame className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-widest">Déclencheur Émotionnel</span>
          </div>
          <p className="text-sm font-bold leading-relaxed">
            {avatar.declencheur_emotionnel || avatar.emotional_trigger || 'Non défini'}
          </p>
        </div>
      </div>
    </div>
  );
}
