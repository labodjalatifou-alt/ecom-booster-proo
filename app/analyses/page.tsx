"use client";

import React, { useState } from 'react';
import { Bot, Sparkles, Loader2, Zap, Globe, DollarSign, User, Megaphone, Mic, CheckCircle2, ArrowRight, Plus, X, ImageIcon, Link as LinkIcon, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useStore } from '@/components/StoreProvider';

export default function AnalysesPage() {
  const { currency } = useStore();
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [sourceLink, setSourceLink] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    if (images.length + newFiles.length > 3) {
      toast.error('3 images maximum');
      return;
    }
    setImages(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!productName.trim()) { toast.error('Le nom du produit est requis'); return; }
    if (!costPrice) { toast.error('Le prix d\'achat est requis pour le calcul de rentabilité'); return; }

    setLoading(true);
    setAnalysisResult(null);

    try {
      const prompt = `Tu es l'expert stratégique Ecom Booster Pro. Analyse ce produit :
NOM : ${productName}
PRIX D'ACHAT : ${costPrice} ${currency}
DESCRIPTION : ${productDesc || 'Non fournie'}
LIEN SOURCE : ${sourceLink || 'Non fourni'}

RÈGLES DE PRIX STRICTES :
1. Coût d'achat = ${costPrice} ${currency}.
2. "price_min" DOIT être : ${costPrice} + 8000 ${currency}.
3. "price_max" DOIT être : ${costPrice} + 15000 ${currency}.
4. "price_recommendation" DOIT être un prix marketing entre les deux.

Réponds UNIQUEMENT en JSON valide :
{
  "score": 85,
  "price_recommendation": "X ${currency}",
  "price_min": "Y ${currency}",
  "price_max": "Z ${currency}",
  "avatar": { "title": "...", "age": "...", "income": "...", "pains": [], "goals": [] },
  "shopify_page": { "title": "...", "hook": "...", "features": [] },
  "facebook_ad": { "primary_text": "...", "headline": "..." },
  "voiceover_script": "..."
}`;

      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, contextType: 'product_analysis' }),
      });

      const data = await res.json();
      if (data.error) {
        console.error('[Claude API Error]', data.detail);
        throw new Error(`${data.error} ${data.detail || ''}`);
      }

      console.log('[Claude Response]', data.text);

      let result;
      try {
        // Recherche plus robuste du JSON
        const jsonMatch = data.text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : data.text;
        result = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.error('[JSON Parse Error]', parseErr);
        throw new Error("Format IA invalide. Essayez de simplifier la description.");
      }

      setAnalysisResult(result);

      // Save to Supabase
      const { data: savedData, error: saveError } = await supabase.from('analyses').insert([{
        id: crypto.randomUUID(), // Satisfy the not-null constraint
        product_name: productName,
        score: result.score,
        price_recommendation: result.price_recommendation,
        cost_price: costPrice,
        customer_avatar: result.avatar,
        shopify_page_content: result.shopify_page,
        facebook_ad_content: result.facebook_ad,
        voiceover_script: result.voiceover_script
      }]).select();

      if (saveError) throw saveError;

      if (savedData && savedData[0]) {
        localStorage.setItem('activeAnalysisId', savedData[0].id);
      }

      toast.success('Analyse terminée !');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  }

  // --- RESULTS VIEW ---
  if (analysisResult) {
    return (
      <div className="max-w-5xl mx-auto pb-20 px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" /> Analyse Stratégique Prête
          </div>
          <h2 className="text-5xl font-black tracking-tighter mb-2">{productName}</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">IA Engine Version 2.1</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <Link href="/score-et-prix" className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all group hover:-translate-y-2 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl group-hover:rotate-12 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gagnant ?</span>
                <p className="text-3xl font-black text-amber-600">{analysisResult.score}%</p>
              </div>
            </div>
            <h3 className="text-xl font-black mb-1 tracking-tight">Score & Rentabilité</h3>
            <p className="text-xs text-slate-400 font-bold mb-6">Prix recommandé : <span className="text-primary-600">{analysisResult.price_recommendation}</span></p>
            <div className="flex items-center gap-2 text-primary-600 text-[10px] font-black uppercase tracking-widest">Détails financiers <ArrowRight className="w-3 h-3" /></div>
          </Link>

          {/* Card 2 */}
          <Link href="/avatar" className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all group hover:-translate-y-2 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl group-hover:rotate-12 transition-transform">
                <User className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-black mb-1 tracking-tight">Avatar Client</h3>
            <p className="text-xs text-slate-400 font-bold mb-6 line-clamp-2">Comprenez qui achète et pourquoi.</p>
            <div className="flex items-center gap-2 text-primary-600 text-[10px] font-black uppercase tracking-widest">Voir le profil <ArrowRight className="w-3 h-3" /></div>
          </Link>

          {/* Card 3 */}
          <Link href="/page-shopify" className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all group hover:-translate-y-2 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl group-hover:rotate-12 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-black mb-1 tracking-tight">Page Shopify</h3>
            <p className="text-xs text-slate-400 font-bold mb-6 line-clamp-2">Générez votre fiche produit en 1 clic.</p>
            <div className="flex items-center gap-2 text-primary-600 text-[10px] font-black uppercase tracking-widest">Accéder au builder <ArrowRight className="w-3 h-3" /></div>
          </Link>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => { setAnalysisResult(null); setProductName(''); setProductDesc(''); setSourceLink(''); setCostPrice(''); setImages([]); }}
            className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
          >
            ← Analyser un autre produit
          </button>
        </div>
      </div>
    );
  }

  // --- FORM VIEW ---
  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 animate-in fade-in duration-700">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="p-5 bg-primary-600 text-white rounded-[2rem] mb-6 shadow-xl shadow-primary-500/20 rotate-3">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-5xl font-black tracking-tighter mb-3">Intelligence Stratégique</h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">Transformez un produit en succès commercial</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[4rem] p-10 md:p-16 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <form onSubmit={handleAnalyze} className="relative z-10 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Nom */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400">
                <FileText className="w-4 h-4" />
                <label className="text-[10px] font-black uppercase tracking-widest">Nom du Produit *</label>
              </div>
              <input
                required
                type="text"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder="Ex: Robot Mixeur Premium"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl px-8 py-5 text-base font-black outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
              />
            </div>

            {/* Prix Achat */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400">
                <DollarSign className="w-4 h-4" />
                <label className="text-[10px] font-black uppercase tracking-widest">Prix d'Achat (FCFA) *</label>
              </div>
              <input
                required
                type="number"
                value={costPrice}
                onChange={e => setCostPrice(e.target.value)}
                placeholder="Ex: 4500"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl px-8 py-5 text-base font-black outline-none focus:ring-4 focus:ring-primary-500/10 transition-all text-primary-600"
              />
            </div>
          </div>

          {/* Lien Source */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <LinkIcon className="w-4 h-4" />
              <label className="text-[10px] font-black uppercase tracking-widest">Lien Source (Optionnel)</label>
            </div>
            <input
              type="url"
              value={sourceLink}
              onChange={e => setSourceLink(e.target.value)}
              placeholder="https://alibaba.com/item/..."
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl px-8 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Bot className="w-4 h-4" />
              <label className="text-[10px] font-black uppercase tracking-widest">Description (Optionnel)</label>
            </div>
            <textarea
              value={productDesc}
              onChange={e => setProductDesc(e.target.value)}
              placeholder="Décrivez les avantages clés pour une meilleure analyse..."
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] px-8 py-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all h-32 resize-none"
            />
          </div>

          {/* Images */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-4">Photos du Produit (2 ou 3 max)</label>
            <div className="flex gap-6 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl group">
                  <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <label className="cursor-pointer w-32 h-32 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:border-primary-200 transition-all group">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageAdd} />
                  <ImageIcon className="w-8 h-8 text-slate-200 group-hover:text-primary-400 mb-2 transition-colors" />
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Ajouter</span>
                </label>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-primary-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary-500/40 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyse en cours...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5" /> Lancer l'Analyse Stratégique
                </div>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
