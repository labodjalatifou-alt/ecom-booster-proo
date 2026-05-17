"use client";

import React, { useEffect, useState } from 'react';
import { Mic, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import EmptyAnalysisState from '@/components/dashboard/EmptyAnalysisState';
import { genererScriptsVoixOff, parseScriptsVoixOff, VoixOffScript } from '@/lib/claude-prompts';
import { VoixOffDisplay } from '@/components/analyse/VoixOffDisplay';
import { useStore } from '@/components/StoreProvider';
import { sanitizeError } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ScriptVoixOffPage() {
  const { currency } = useStore();
  const [latestProduct, setLatestProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [parsedScripts, setParsedScripts] = useState<VoixOffScript[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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
      if (data && data[0]) {
        setLatestProduct(data[0]);
        if (data[0].voiceover_script_raw) {
          setParsedScripts(parseScriptsVoixOff(data[0].voiceover_script_raw));
        }
      }
      setLoading(false);
    }
    fetchAnalysis();
  }, []);

  const handleGenerate = async () => {
    if (!latestProduct) return;
    setIsGenerating(true);
    try {
      const country = latestProduct.pays || 'Sénégal';
      const raw = await genererScriptsVoixOff(
        latestProduct.product_name,
        parseInt(latestProduct.price_recommendation || latestProduct.cost_price || '0'),
        currency,
        country,
        latestProduct.marketing || '',
        latestProduct.marketing || ''
      );

      const scripts = parseScriptsVoixOff(raw);
      setParsedScripts(scripts);

      // Save to Supabase
      await supabase.from('analyses').update({
        voiceover_script_raw: raw
      }).eq('id', latestProduct.id);

      toast.success('3 scripts publicitaires générés !');
    } catch (err: any) {
      toast.error(sanitizeError(err));
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  if (!latestProduct) return (
    <div className="pt-20">
      <EmptyAnalysisState 
        icon={<Mic />} 
        title="Scripts Voix Off" 
        description="Analysez un produit d'abord pour générer ses scripts vidéo." 
      />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Mic className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{latestProduct.product_name}</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Scripts Publicitaires</h2>
          <p className="text-slate-400 text-sm font-bold mt-1">3 scripts optimisés pour Facebook Ads & TikTok.</p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {parsedScripts.length > 0 ? 'Régénérer les scripts' : 'Générer les scripts'}
        </button>
      </div>

      {parsedScripts.length > 0 ? (
        <VoixOffDisplay scripts={parsedScripts} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black mb-2">3 Scripts Publicitaires</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 font-medium">
            Générez 3 scripts de durées différentes (20s, 30s, 45s) avec des angles de neuromarketing variés.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-10 py-5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 mx-auto"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Lancer la rédaction IA
          </button>
        </div>
      )}

      {latestProduct.voiceover_script && parsedScripts.length === 0 && (
        <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
          <div>
            <h4 className="text-sm font-black text-amber-800 dark:text-amber-400 mb-1">Ancien format détecté</h4>
            <p className="text-xs font-bold text-amber-700/70 dark:text-amber-400/70 leading-relaxed">
              Des scripts ont été générés avec l'ancien format. Cliquez sur "Générer les scripts" pour obtenir les nouvelles versions optimisées.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
