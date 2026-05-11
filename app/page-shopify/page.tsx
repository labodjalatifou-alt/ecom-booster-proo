"use client";

import React, { useState } from 'react';
import { Store, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import EmptyAnalysisState from '@/components/dashboard/EmptyAnalysisState';
import { useStore } from '@/components/StoreProvider';
import { sanitizeError } from '@/lib/utils';
import { genererPageShopify, parseShopifyPage, ShopifyPageParsed, shopifyPageToHtml } from '@/lib/claude-prompts';
import { ShopifyPageDisplay } from '@/components/analyse/ShopifyPageDisplay';

export default function PageShopifyPage() {
  const { currency, storeId } = useStore();
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [latestProduct, setLatestProduct] = useState<any>(null);
  const [parsedPage, setParsedPage] = useState<ShopifyPageParsed | null>(null);
  const [selectedTitle, setSelectedTitle] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  React.useEffect(() => {
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
        
        // If we already have the new format (raw string starting with ---TITRES--- or similar)
        // or if it's the old object format, we need to handle it.
        if (data[0].shopify_page_raw) {
          setParsedPage(parseShopifyPage(data[0].shopify_page_raw));
        } else if (data[0].shopify_page_content) {
          // It's the old format, we'll suggest re-generating
        }
      }
      setLoadingLatest(false);
    }
    fetchAnalysis();
  }, []);

  const handleGenerate = async () => {
    if (!latestProduct) return;
    setIsGenerating(true);
    try {
      // Get country from analysis or default to Senegal/Guinea
      const country = latestProduct.pays || 'Sénégal';
      const raw = await genererPageShopify(
        latestProduct.product_name,
        parseInt(latestProduct.price_recommendation || latestProduct.cost_price || '0'),
        currency,
        country,
        latestProduct.marketing || '',
        latestProduct.marketing || '' // Advantages
      );

      const parsed = parseShopifyPage(raw);
      setParsedPage(parsed);

      // Save to Supabase
      await supabase.from('analyses').update({
        shopify_page_raw: raw
      }).eq('id', latestProduct.id);

      toast.success('Page de vente générée avec succès !');
    } catch (err: any) {
      toast.error(sanitizeError(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateOnShopify = async (data: { title: string, price: string, stock: string, description: string }) => {
    if (!parsedPage || !latestProduct) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/create-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.title,
          price: data.price,
          stock: parseInt(data.stock),
          description: data.description,
          category: 'AI Generated',
          store_id: storeId
        }),
      });

      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);

      toast.success('🚀 Produit créé sur Shopify !');
    } catch (err: any) {
      toast.error(sanitizeError(err));
    } finally {
      setIsCreating(false);
    }
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
        description="Analysez un produit d'abord pour générer sa page de vente." 
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Shopify Builder · {latestProduct.product_name}</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Copywriting Neuromarketing</h2>
          <p className="text-slate-400 text-sm font-bold mt-1">Structure optimisée pour le taux de conversion (CRO).</p>
        </div>

        {!parsedPage && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Générer la Page (Format 2024)
          </button>
        )}
      </div>

      {parsedPage ? (
        <ShopifyPageDisplay
          parsed={parsedPage}
          selectedTitle={selectedTitle}
          onSelectTitle={setSelectedTitle}
          onCreateProduct={handleCreateOnShopify}
          hasShopify={!!storeId}
          isCreating={isCreating}
          currency={currency}
          initialPrice={latestProduct.price_recommendation?.match(/\d+/)?.[0]}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black mb-2">Générez une page irrésistible</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 font-medium">
            Notre IA va créer 6 paragraphes basés sur le neuromarketing, avec des titres percutants de 3-5 mots et exactement 3 phrases par section.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-10 py-5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 mx-auto"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Lancer le Copywriter IA
          </button>
        </div>
      )}

      {latestProduct.shopify_page_content && !parsedPage && (
        <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
          <div>
            <h4 className="text-sm font-black text-amber-800 dark:text-amber-400 mb-1">Ancien format détecté</h4>
            <p className="text-xs font-bold text-amber-700/70 dark:text-amber-400/70 leading-relaxed">
              Une page a été générée avec l'ancien format. Cliquez sur "Générer la Page" pour obtenir la nouvelle structure optimisée avec 6 paragraphes de 3 phrases.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
