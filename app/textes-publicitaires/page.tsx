"use client";

import React, { useEffect, useState } from 'react';
import {
  FileText, Copy, Check, Loader2, Zap, Target, Heart, Sparkles,
  ArrowRight, AlertCircle, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';
import EmptyAnalysisState from '@/components/dashboard/EmptyAnalysisState';

const ANGLE_STYLES = [
  {
    icon: Zap,
    label: 'Angle Problème',
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-900/10',
    border: 'border-red-100 dark:border-red-800',
    dot: 'bg-red-500',
  },
  {
    icon: Target,
    label: 'Angle Bénéfice',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-100 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  {
    icon: Heart,
    label: 'Angle Émotion',
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/10',
    border: 'border-purple-100 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
];

interface AdItem {
  angle: string;
  hook: string;
  explanation: string;
  benefits: string[];
  cta: string;
}

export default function TextesPublicitairesPage() {
  const [latestProduct, setLatestProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      const activeId = localStorage.getItem('activeAnalysisId');
      let query = supabase.from('analyses').select('*');
      if (activeId) query = query.eq('id', activeId);
      else query = query.order('created_at', { ascending: false }).limit(1);
      const { data } = await query;
      if (data && data[0]) setLatestProduct(data[0]);
      setLoading(false);
    }
    fetchAnalysis();
  }, []);

  const getAds = (): AdItem[] => {
    if (!latestProduct?.facebook_ad_content) return [];
    const content = latestProduct.facebook_ad_content;
    if (Array.isArray(content)) {
      return content.map((item: any) => {
        // If it is the old formatting where item is { text: string }
        if (item.text && !item.hook) {
          const lines = item.text.split('\n').map((l: any) => l.trim()).filter(Boolean);
          const hook = lines[0] || '';
          const benefits = lines.slice(1, -1)
            .filter((l: string) => l.startsWith('-') || l.startsWith('*') || l.startsWith('•') || l.startsWith('✔') || l.length > 5)
            .map((l: string) => l.replace(/^[-*•✔]\s*/, ''));
          const cta = lines[lines.length - 1] || '';
          return {
            angle: item.angle || 'Publicité',
            hook,
            explanation: '',
            benefits: benefits.slice(0, 4),
            cta
          };
        }
        return {
          angle: item.angle || 'Publicité',
          hook: item.hook || '',
          explanation: item.explanation || '',
          benefits: Array.isArray(item.benefits) ? item.benefits : [],
          cta: item.cta || ''
        };
      });
    }
    return [{
      angle: 'Publicité Principale',
      hook: content.headline || content.hook || content.text || '',
      explanation: content.primary_text || content.explanation || '',
      benefits: content.benefits || [],
      cta: content.cta || 'Commandez maintenant',
    }];
  };

  const handleCopy = (idx: number) => {
    const ad = ads[idx];
    const benefitsText = (ad.benefits || []).map((b: string) => {
      const trimmed = b.trim();
      // If the bullet already starts with an emoji, don't prepend '✔'
      if (/^[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/u.test(trimmed)) {
        return trimmed;
      }
      return `✔ ${trimmed}`;
    }).join('\n');
    
    const parts = [ad.hook];
    if (ad.explanation) parts.push(ad.explanation);
    if (benefitsText) parts.push(benefitsText);
    parts.push(ad.cta);
    
    navigator.clipboard.writeText(parts.join('\n\n'));
    setCopiedIdx(idx);
    toast.success('Texte publicitaire copié !');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleCopyAll = () => {
    const all = ads.map((ad, i) => {
      const style = ANGLE_STYLES[i % ANGLE_STYLES.length];
      const benefitsText = (ad.benefits || []).map((b: string) => {
        const trimmed = b.trim();
        if (/^[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/u.test(trimmed)) {
          return trimmed;
        }
        return `✔ ${trimmed}`;
      }).join('\n');
      
      const parts = [`=== ${style.label} ===`, ad.hook];
      if (ad.explanation) parts.push(ad.explanation);
      if (benefitsText) parts.push(benefitsText);
      parts.push(ad.cta);
      return parts.join('\n\n');
    }).join('\n\n────────────────────────\n\n');
    
    navigator.clipboard.writeText(all);
    toast.success('Tous les textes copiés !');
  };

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  if (!latestProduct) return (
    <div className="pt-20">
      <EmptyAnalysisState
        icon={<FileText />}
        title="Textes Publicitaires"
        description="Analysez un produit d'abord pour générer vos textes publicitaires Facebook."
      />
    </div>
  );

  const ads = getAds();

  return (
    <div className="max-w-5xl mx-auto pb-20 px-2 md:px-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
              <FileText className="w-5 h-5 text-violet-600" />
            </div>
            <span className="text-[10px] font-black text-violet-600 uppercase tracking-[0.2em]">
              {latestProduct.product_name}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
            Textes Publicitaires
          </h1>
          <p className="text-slate-400 text-sm font-bold mt-1">
            Créatifs IA générés pour Facebook Ads — prêts à copier.
          </p>
        </div>

        {ads.length > 1 && (
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-500/20 flex-shrink-0"
          >
            <Copy className="w-4 h-4" />
            Tout copier
          </button>
        )}
      </div>

      {ads.length === 0 ? (
        /* No ads yet — prompt to run analysis */
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-20 text-center">
          <div className="w-20 h-20 bg-violet-50 dark:bg-violet-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-violet-400" />
          </div>
          <h2 className="text-xl font-black mb-2">Aucun texte publicitaire généré</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 font-medium">
            Lancez une Analyse IA sur votre produit pour obtenir 3 textes publicitaires optimisés avec différents angles marketing.
          </p>
          <Link
            href="/analyses"
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-violet-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Lancer l&apos;Analyse IA
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {ads.map((ad, idx) => {
            const style = ANGLE_STYLES[idx % ANGLE_STYLES.length];
            const Icon = style.icon;
            const isCopied = copiedIdx === idx;
            const benefitsText = (ad.benefits || []);

            return (
              <div
                key={idx}
                className={`bg-white dark:bg-slate-900 border-2 ${style.border} rounded-[2rem] overflow-hidden transition-all hover:shadow-xl group`}
              >
                {/* Card Header */}
                <div className={`${style.bg} px-6 py-4 flex items-center justify-between border-b ${style.border}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-white/60 dark:bg-black/20`}>
                      <Icon className={`w-4 h-4 ${style.color}`} />
                    </div>
                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${style.color}`}>
                        Texte {idx + 1}
                      </div>
                      <div className="text-xs font-black text-slate-700 dark:text-slate-200">
                        {ad.angle || style.label}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(idx)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isCopied
                        ? 'bg-emerald-500 text-white'
                        : `bg-white dark:bg-slate-800 ${style.color} hover:bg-opacity-80 border ${style.border}`
                    }`}
                  >
                    {isCopied ? (
                      <><Check className="w-3.5 h-3.5" /> Copié !</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copier</>
                    )}
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Hook / Headline */}
                  {ad.hook && (
                    <div className="space-y-1">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Accroche (Headline)
                      </div>
                      <p className="text-base font-black text-slate-800 dark:text-slate-100 leading-snug">
                        {ad.hook}
                      </p>
                    </div>
                  )}

                  {/* Primary text */}
                  {ad.explanation && (
                    <div className="space-y-1">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Texte Principal
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                        {ad.explanation}
                      </p>
                    </div>
                  )}

                  {/* Benefits */}
                  {benefitsText.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Points Clés
                      </div>
                      <ul className="space-y-1.5">
                        {benefitsText.map((b: string, bi: number) => (
                          <li key={bi} className="flex items-start gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mt-1.5 flex-shrink-0`} />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA */}
                  {ad.cta && (
                    <div className={`${style.bg} rounded-xl px-4 py-3 border ${style.border} flex items-center gap-2`}>
                      <ChevronRight className={`w-4 h-4 ${style.color} flex-shrink-0`} />
                      <span className={`text-sm font-black ${style.color}`}>{ad.cta}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Link to re-run analysis */}
          <div className="mt-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-700 dark:text-slate-200">
                  Vous souhaitez régénérer ces textes ?
                </div>
                <div className="text-[10px] font-bold text-slate-400">
                  Relancez une Analyse IA depuis la page Analyse IA.
                </div>
              </div>
            </div>
            <Link
              href="/analyses"
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Analyse IA
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
