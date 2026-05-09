"use client";

import React, { useState } from 'react';
import { Bot, Sparkles, Loader2, Send, Zap, Globe, DollarSign, UserSquare2, Megaphone, Mic, CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AnalysesPage() {
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!productName) return;

    setLoading(true);
    setAnalysisResult(null);

    try {
      const prompt = `Analyse ce produit pour le marché d'Afrique de l'Ouest (Abidjan, Dakar, Conakry) :
      Nom : ${productName}
      Description : ${productDesc}
      
      Réponds UNIQUEMENT en JSON avec cette structure :
      {
        "score": 0-100,
        "price_recommendation": "Prix en FCFA/GNF",
        "avatar": {
          "title": "Nom du persona",
          "age": "Tranche d'âge",
          "income": "Revenu estimé",
          "pains": ["douleur 1", "douleur 2"],
          "goals": ["objectif 1", "objectif 2"]
        },
        "shopify_page": {
          "title": "Titre accrocheur",
          "hook": "Phrase d'accroche",
          "features": ["caractéristique 1", "caractéristique 2"]
        },
        "facebook_ad": {
          "primary_text": "Texte de la pub",
          "headline": "Titre de la pub"
        },
        "voiceover_script": "Script pour vidéo de 30 secondes"
      }`;

      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, contextType: 'product_analysis' }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Parse JSON from Claude response
      let result;
      try {
        const jsonMatch = data.text.match(/\{[\s\S]*\}/);
        result = JSON.parse(jsonMatch ? jsonMatch[0] : data.text);
      } catch (e) {
        console.error("JSON Parse Error", e);
        throw new Error("Erreur de formatage de l'IA. Réessayez.");
      }

      setAnalysisResult(result);

      // Sauvegarder dans Supabase (table 'analyses')
      const { error } = await supabase.from('analyses').insert([{
        product_name: productName,
        score: result.score,
        price_recommendation: result.price_recommendation,
        customer_avatar: result.avatar,
        shopify_page_content: result.shopify_page,
        facebook_ad_content: result.facebook_ad,
        voiceover_script: result.voiceover_script
      }]);

      if (error) console.error("Supabase Save Error:", error);
      
      toast.success("Analyse terminée avec succès !");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (analysisResult) {
    return (
      <div className="max-w-4xl mx-auto pb-20 px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <CheckCircle2 className="w-4 h-4" /> Analyse Terminée
          </div>
          <h2 className="text-5xl font-black tracking-tighter mb-4">{productName}</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Propulsé par Claude 3.5 Sonnet</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score & Prix Card */}
          <Link href="/score-et-prix" className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 hover:border-primary-500 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl group-hover:rotate-6 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase">Potentiel</span>
                <p className="text-2xl font-black text-amber-600">{analysisResult.score}%</p>
              </div>
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">Score & Prix</h3>
            <p className="text-xs text-slate-400 font-bold mb-6">Prix conseillé : <span className="text-primary-600">{analysisResult.price_recommendation}</span></p>
            <div className="flex items-center gap-2 text-primary-600 text-[10px] font-black uppercase">
              Voir détails <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Avatar Card */}
          <Link href="/avatar" className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 hover:border-primary-500 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl group-hover:rotate-6 transition-transform">
                <UserSquare2 className="w-6 h-6" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase">Cible</span>
                <p className="text-sm font-black text-blue-600 truncate max-w-[120px]">{analysisResult.avatar.title}</p>
              </div>
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">Avatar Client</h3>
            <p className="text-xs text-slate-400 font-bold mb-6 italic leading-relaxed">Profil psychologique et financier précis pour le marché ciblé.</p>
            <div className="flex items-center gap-2 text-primary-600 text-[10px] font-black uppercase">
              Voir détails <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Shopify Card */}
          <Link href="/page-shopify" className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 hover:border-primary-500 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl group-hover:rotate-6 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">Page Shopify</h3>
            <p className="text-xs text-slate-400 font-bold mb-6 line-clamp-2">"{analysisResult.shopify_page.hook}"</p>
            <div className="flex items-center gap-2 text-primary-600 text-[10px] font-black uppercase">
              Générer Page <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Facebook Ads Card */}
          <Link href="/publicite-facebook" className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 hover:border-primary-500 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:rotate-6 transition-transform">
                <Megaphone className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">Publicité Facebook</h3>
            <p className="text-xs text-slate-400 font-bold mb-6 line-clamp-2">{analysisResult.facebook_ad.headline}</p>
            <div className="flex items-center gap-2 text-primary-600 text-[10px] font-black uppercase">
              Voir Pubs <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={() => setAnalysisResult(null)}
            className="px-8 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
          >
            Analyser un autre produit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="p-6 bg-primary-100 dark:bg-primary-900/30 rounded-[2.5rem] mb-6">
          <Bot className="w-12 h-12 text-primary-600" />
        </div>
        <h2 className="text-5xl font-black tracking-tighter mb-4">Analyse de Produit IA</h2>
        <p className="text-slate-400 font-medium text-sm max-w-md italic">
          Entrez les détails de votre produit et laissez Claude IA générer une stratégie marketing complète pour l'Afrique.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3.5rem] p-10 md:p-16 shadow-sm">
        <form onSubmit={handleAnalyze} className="space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Nom du Produit</label>
            <input 
              required
              type="text" 
              placeholder="Ex: Brosse Soufflante 5-en-1"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-[2rem] font-black text-lg outline-none focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Description (Optionnel)</label>
            <textarea 
              placeholder="Ajoutez des détails pour une analyse plus précise..."
              value={productDesc}
              onChange={e => setProductDesc(e.target.value)}
              className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-[2rem] font-bold text-sm outline-none focus:ring-4 focus:ring-primary-500/10 transition-all h-32 resize-none placeholder:text-slate-300"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-8 bg-primary-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-primary-500/40 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-4">
                <Loader2 className="w-6 h-6 animate-spin" /> Analyse par Claude IA...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <Sparkles className="w-6 h-6" /> Lancer l'Analyse Stratégique
              </div>
            )}
          </button>
        </form>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center opacity-40">
        <div className="space-y-2">
          <Zap className="w-6 h-6 mx-auto text-amber-500" />
          <h4 className="text-[10px] font-black uppercase tracking-widest">Rapidité</h4>
          <p className="text-[10px] font-bold">Analyse en &lt; 15 secondes</p>
        </div>
        <div className="space-y-2">
          <Globe className="w-6 h-6 mx-auto text-emerald-500" />
          <h4 className="text-[10px] font-black uppercase tracking-widest">Localisé</h4>
          <p className="text-[10px] font-bold">Insights pour Abidjan/Dakar/Conakry</p>
        </div>
        <div className="space-y-2">
          <Send className="w-6 h-6 mx-auto text-primary-500" />
          <h4 className="text-[10px] font-black uppercase tracking-widest">Prêt à l'export</h4>
          <p className="text-[10px] font-bold">Synchronisation directe Shopify</p>
        </div>
      </div>
    </div>
  );
}
