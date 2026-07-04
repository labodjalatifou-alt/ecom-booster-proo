"use client";

import React, { useEffect, useState } from 'react';
import { User, Target, Brain, Wallet, ShieldAlert, Loader2, Heart, MessageCircle, AlertTriangle, Flame, Quote, ExternalLink, Clock, Smartphone, ZapIcon, ShoppingCart, TrendingUp, Eye } from 'lucide-react';
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

  const interets: string[] = ensureArray(avatar.interets || avatar.interests);
  const frustrations: string[] = ensureArray(avatar.frustrations || avatar.pains);
  const peurs: string[] = ensureArray(avatar.peurs || avatar.fears);
  const desirs: string[] = ensureArray(avatar.desirs || avatar.désirs || avatar.goals || avatar.desires);
  const declencheursPs: any[] = ensureArray(avatar.declencheurs_psychologiques);
  const objections: any[] = ensureArray(avatar.objections);
  const motsCles: string[] = ensureArray(avatar.mots_cles_resonance);
  const comportement = avatar.comportement_achat || {};

  // Lien Amazon pré-rempli (Option B)
  const amazonSearchUrl = `https://www.amazon.fr/s?k=${encodeURIComponent(latestProduct.product_name)}&i=aps`;

  const TRIGGER_ICONS: Record<string, React.ReactNode> = {
    'FOMO': <Flame className="w-4 h-4 text-orange-500" />,
    'Statut social': <TrendingUp className="w-4 h-4 text-purple-500" />,
    'Appartenance': <Heart className="w-4 h-4 text-pink-500" />,
    'Sécurité': <ShieldAlert className="w-4 h-4 text-emerald-500" />,
    'Réciprocité': <MessageCircle className="w-4 h-4 text-blue-500" />,
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="text-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -z-10 pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-5 shadow-sm">
          <User className="w-4 h-4 text-blue-500" /> Profil Acheteur — Neuromarketing
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-slate-800 dark:text-white leading-tight">
          {latestProduct.product_name}
        </h2>
        <p className="text-slate-400 text-sm font-medium">Comportements d'achat, déclencheurs psychologiques & objections réelles</p>
      </div>

      {/* DEMO CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <User className="w-5 h-5" />, label: 'Profil', value: `${avatar.prenom || ''} · ${avatar.sexe || '-'}`, color: 'blue' },
          { icon: <Target className="w-5 h-5" />, label: 'Âge', value: avatar.age || '-', color: 'amber' },
          { icon: <Wallet className="w-5 h-5" />, label: 'Revenu mensuel', value: avatar.revenu_mensuel || '-', color: 'emerald' },
          { icon: <Clock className="w-5 h-5" />, label: 'Actif(ve)', value: avatar.heure_active || '-', color: 'purple' },
        ].map((item, i) => (
          <div key={i} className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col gap-2 group hover:-translate-y-1 transition-transform`}>
            <div className={`p-2.5 w-fit rounded-xl ${item.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' : item.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' : item.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-500'}`}>
              {item.icon}
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">{item.value}</p>
          </div>
        ))}
      </div>

      {/* PLATEFORMES + INTERETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-[3rem] shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-3 text-slate-400">
            <Smartphone className="w-5 h-5 text-indigo-500" /> Plateformes & Présence
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {ensureArray(avatar.plateformes).map((p: string, i: number) => (
              <span key={i} className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-black rounded-full">{p}</span>
            ))}
          </div>
          {avatar.ville && <p className="text-xs font-bold text-slate-500 mt-2">📍 {avatar.ville} · {avatar.profession}</p>}
          {avatar.situation_familiale && <p className="text-xs font-bold text-slate-500 mt-1">👨‍👩‍👧 {avatar.situation_familiale}</p>}
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-[3rem] shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-3 text-slate-400">
            <Brain className="w-5 h-5 text-purple-500" /> Intérêts Profonds
          </h3>
          <div className="flex flex-wrap gap-2">
            {interets.map((item: string, i: number) => (
              <span key={i} className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full border border-purple-100 dark:border-purple-900/30">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* DOULEURS / DÉSIRS / PEURS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-8 rounded-[3rem] shadow-sm">
          <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" /> Frustrations
          </h3>
          <ul className="space-y-4">
            {frustrations.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-8 rounded-[3rem] shadow-sm">
          <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" /> Peurs
          </h3>
          <ul className="space-y-4">
            {peurs.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-8 rounded-[3rem] shadow-sm">
          <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <Target className="w-5 h-5" /> Désirs & Rêves
          </h3>
          <ul className="space-y-4">
            {desirs.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* DÉCLENCHEURS PSYCHOLOGIQUES */}
      {declencheursPs.length > 0 && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-8 md:p-10 rounded-[3rem] mb-8 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-slate-400">
            <ZapIcon className="w-5 h-5 text-orange-500" /> Déclencheurs Psychologiques (Neuromarketing)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {declencheursPs.map((d: any, i: number) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  {TRIGGER_ICONS[d.type] || <Flame className="w-4 h-4 text-orange-500" />}
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{d.type}</span>
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPORTEMENT D'ACHAT */}
      {Object.keys(comportement).length > 0 && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-8 md:p-10 rounded-[3rem] mb-8 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-slate-400">
            <ShoppingCart className="w-5 h-5 text-blue-500" /> Parcours d'Achat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comportement.moment_decouverte && (
              <div className="flex items-start gap-4 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-[1.5rem]">
                <Eye className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Moment de découverte</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{comportement.moment_decouverte}</p>
                </div>
              </div>
            )}
            {comportement.action_avant_achat && (
              <div className="flex items-start gap-4 p-5 bg-purple-50 dark:bg-purple-900/20 rounded-[1.5rem]">
                <Brain className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Avant de commander</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{comportement.action_avant_achat}</p>
                </div>
              </div>
            )}
            {comportement.temps_decision && (
              <div className="flex items-start gap-4 p-5 bg-amber-50 dark:bg-amber-900/20 rounded-[1.5rem]">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Temps de décision</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{comportement.temps_decision}</p>
                </div>
              </div>
            )}
            {comportement.canal_achat && (
              <div className="flex items-start gap-4 p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-[1.5rem]">
                <Smartphone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Canal de commande</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{comportement.canal_achat}</p>
                </div>
              </div>
            )}
          </div>
          {avatar.declencheur_achat && (
            <div className="mt-4 p-5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-[1.5rem] border border-orange-100 dark:border-orange-900/30 flex items-start gap-3">
              <Flame className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Déclencheur final d'achat</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{avatar.declencheur_achat}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* OBJECTIONS CLIENT */}
      {objections.length > 0 && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-8 md:p-10 rounded-[3rem] mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-slate-400">
              <MessageCircle className="w-5 h-5 text-red-500" /> Objections & Comment les Lever
            </h3>
            {/* Bouton Amazon Avis — Option B */}
            <a
              href={amazonSearchUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Avis Amazon
            </a>
          </div>
          <div className="space-y-4">
            {objections.map((obj: any, i: number) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-700/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2">Elle dit 🗣️</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic">"{typeof obj === 'string' ? obj : obj.objection}"</p>
                  </div>
                  {obj.vrai_blocage && (
                    <div>
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">Elle pense vraiment 🧠</p>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{obj.vrai_blocage}</p>
                    </div>
                  )}
                  {obj.reponse_ideale && (
                    <div>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Réponse idéale ✅</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{obj.reponse_ideale}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MOTS-CLÉS DE RÉSONANCE */}
      {motsCles.length > 0 && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-[3rem] mb-8 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-3 text-slate-400">
            <TrendingUp className="w-5 h-5 text-primary-500" /> Mots-Clés de Résonance
          </h3>
          <p className="text-xs font-bold text-slate-400 mb-4">Utilisez ces mots dans vos publicités pour déclencher une réaction émotionnelle.</p>
          <div className="flex flex-wrap gap-3">
            {motsCles.map((m: string, i: number) => (
              <span key={i} className="px-5 py-2.5 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 text-primary-700 dark:text-primary-300 text-sm font-black rounded-full border border-primary-100 dark:border-primary-900/30 shadow-sm">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* PHRASE DÉCLENCHANTE */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-primary-600 text-white p-10 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-[2rem] shrink-0 group-hover:rotate-6 transition-transform duration-500">
            <Quote className="w-10 h-10 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3 opacity-80">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Phrase Déclenchante — La pub parfaite</span>
            </div>
            <p className="text-xl md:text-2xl font-black italic leading-tight text-white drop-shadow-sm">
              &ldquo;{avatar.phrase_declenchante || avatar.citation_type || 'Découvrez notre produit dès aujourd\'hui.'}&rdquo;
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
