"use client";

import React, { useEffect, useState } from 'react';
import { User, Target, Brain, Wallet, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
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

  // Safety check if avatar is not properly formatted
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

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-5">
          <Target className="w-4 h-4" /> Ciblage Précis
        </div>
        <h2 className="text-4xl font-black tracking-tighter mb-2">{avatar.title || 'Client Idéal'}</h2>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Profil Psychographique · {latestProduct.product_name}</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm text-center">
          <User className="w-6 h-6 text-blue-500 mx-auto mb-3" />
          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Tranche d'âge</span>
          <p className="text-lg font-black">{avatar.age || '-'}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm text-center">
          <Wallet className="w-6 h-6 text-emerald-500 mx-auto mb-3" />
          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Revenu Estimé</span>
          <p className="text-lg font-black">{avatar.income || '-'}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm text-center">
          <Brain className="w-6 h-6 text-purple-500 mx-auto mb-3" />
          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Profil Psy</span>
          <p className="text-lg font-black">Pragmatique</p>
        </div>
      </div>

      {/* Pains & Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-rose-50 dark:bg-rose-900/10 border-2 border-rose-100 dark:border-rose-800 p-8 rounded-[2.5rem]">
          <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-rose-600">
            <ShieldAlert className="w-5 h-5" /> Points de Douleur
          </h3>
          <ul className="space-y-3">
            {(avatar.pains || []).map((pain: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600 dark:text-slate-300 italic">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 shrink-0" />
                {pain}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-800 p-8 rounded-[2.5rem]">
          <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" /> Objectifs & Désirs
          </h3>
          <ul className="space-y-3">
            {(avatar.goals || []).map((goal: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600 dark:text-slate-300 italic">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                {goal}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
