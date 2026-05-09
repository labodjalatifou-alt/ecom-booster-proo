"use client";

import React, { useState } from 'react';
import { Store, Copy, Check, DollarSign, Database, Send, CheckCircle2, Eye, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import EmptyAnalysisState from '@/components/dashboard/EmptyAnalysisState';

export default function PageShopifyPage() {
  const [copied, setCopied] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(0);
  const [selectedSections, setSelectedSections] = useState<number[]>([0, 1, 2, 3]);
  const [price, setPrice] = useState('25000');
  const [stock, setStock] = useState('100');
  const [loading, setLoading] = useState(false);

  const [latestProduct, setLatestProduct] = useState<any>(null);
  const [loadingLatest, setLoadingLatest] = useState(true);

  React.useEffect(() => {
    async function fetchLatest() {
      const { data } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data[0]) {
        setLatestProduct(data[0]);
        // Pre-fill price from recommendation
        const rec = data[0].price_recommendation;
        if (rec) {
          const match = rec.match(/[\d\s]+/);
          if (match) setPrice(match[0].replace(/\s/g, ''));
        }
      }
      setLoadingLatest(false);
    }
    fetchLatest();
  }, []);

  const getProductData = () => {
    if (!latestProduct?.shopify_page_content) return { titles: [], sections: [] };
    const content = latestProduct.shopify_page_content;
    return {
      titles: [
        content.title,
        `${content.title} — Offre Spéciale`,
        `Promotion : ${content.title}`
      ],
      sections: (content.features || []).map((f: string, i: number) => ({
        id: i,
        h2: f,
        p: `${content.hook} — Découvrez comment notre ${latestProduct.product_name} peut transformer votre quotidien grâce à ${f.toLowerCase()}.`
      }))
    };
  };

  const productData = getProductData();

  const handleExport = async () => {
    setLoading(true);
    try {
      const selectedContent = productData.sections
        .filter((s: any) => selectedSections.includes(s.id))
        .map((s: any) => `<h2>${s.h2}</h2><p>${s.p}</p>`)
        .join('');

      const res = await fetch('/api/create-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productData.titles[selectedTitle],
          price,
          stock,
          description: selectedContent,
          category: 'Shopify Builder'
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success('🚀 Produit créé sur Shopify !', { duration: 5000 });
    } catch (err: any) {
      toast.error('Erreur : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (id: number) => {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  if (loadingLatest) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  if (!latestProduct) return (
    <div className="pt-20">
      <EmptyAnalysisState 
        icon={<Store />} 
        title="Shopify Builder" 
        description="Créez votre page de vente Shopify en un clin d'œil dès que l'analyse du produit est prête." 
      />
    </div>
  );

  if (!latestProduct.shopify_page_content) return (
    <div className="max-w-7xl mx-auto pb-10 px-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 opacity-40">
        <Store className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-sm font-black text-slate-600 mb-1">Données Shopify incomplètes</p>
      <p className="text-[10px] font-bold text-slate-400 mb-6">Relancez une analyse pour générer la page.</p>
      <Link href="/analyses" className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all">
        Nouvelle Analyse
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Shopify Builder · {latestProduct.product_name}</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Générateur de Page</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Titre */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-7 shadow-sm">
            <h3 className="text-[10px] font-black mb-5 uppercase tracking-widest text-slate-400">1. Titre du Produit</h3>
            <div className="space-y-3">
              {productData.titles.map((title, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTitle(i)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${selectedTitle === i ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                >
                  <span className={`text-sm font-black ${selectedTitle === i ? 'text-primary-700 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300'}`}>{title}</span>
                  {selectedTitle === i && <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Paragraphes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-7 shadow-sm">
            <h3 className="text-[10px] font-black mb-5 uppercase tracking-widest text-slate-400">2. Sections à inclure</h3>
            <div className="space-y-3">
              {productData.sections.map((section: any, i: number) => (
                <div
                  key={i}
                  onClick={() => toggleSection(section.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedSections.includes(section.id) ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${selectedSections.includes(section.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
                      {selectedSections.includes(section.id) && <Check className="w-3 h-3" />}
                    </div>
                    <h4 className="text-sm font-black tracking-tight">{section.h2}</h4>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic ml-8 line-clamp-2">{section.p}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Prix & Stock */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-7 shadow-sm">
            <h3 className="text-[10px] font-black mb-5 uppercase tracking-widest text-slate-400">3. Prix & Inventaire</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prix (FCFA)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-black outline-none focus:ring-4 focus:ring-primary-500/10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stock Initial</label>
                <div className="relative">
                  <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-black outline-none focus:ring-4 focus:ring-primary-500/10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Preview & Export */}
        <div>
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-24 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 blur-2xl" />
            <h3 className="text-base font-black mb-6 flex items-center gap-3 relative z-10">
              <Eye className="w-5 h-5 text-emerald-400" /> Aperçu Shopify
            </h3>

            <div className="space-y-5 mb-8 max-h-[400px] overflow-y-auto pr-2 relative z-10">
              <div>
                <span className="text-[9px] font-black text-white/30 uppercase block mb-1">Titre</span>
                <p className="text-sm font-black leading-relaxed">{productData.titles[selectedTitle]}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <div>
                  <span className="text-[9px] font-black text-white/30 uppercase block mb-1">Prix</span>
                  <p className="text-base font-black text-emerald-400">{new Intl.NumberFormat('fr-FR').format(parseInt(price || '0'))} FCFA</p>
                </div>
                <div>
                  <span className="text-[9px] font-black text-white/30 uppercase block mb-1">Stock</span>
                  <p className="text-base font-black text-amber-400">{stock} PCS</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <span className="text-[9px] font-black text-white/30 uppercase block">{selectedSections.length} section(s)</span>
                {productData.sections.filter((s: any) => selectedSections.includes(s.id)).map((s: any, i: number) => (
                  <div key={i}>
                    <h5 className="text-[10px] font-black uppercase text-emerald-400 mb-1">{s.h2}</h5>
                    <p className="text-[10px] font-bold text-white/60 italic leading-relaxed line-clamp-2">{s.p}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              disabled={loading}
              onClick={handleExport}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 relative z-10"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Création...' : 'Créer sur Shopify'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
