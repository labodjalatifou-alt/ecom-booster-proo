import React, { useState } from 'react';
import { ShopifyPageParsed, shopifyPageToHtml } from '@/lib/claude-prompts';
import { Check, Copy, Eye, Send, Store, DollarSign, Database, CheckCircle2 } from 'lucide-react';

interface Props {
  parsed: ShopifyPageParsed;
  selectedTitle: number;
  onSelectTitle: (i: number) => void;
  onCreateProduct: (data: { title: string, price: string, stock: string, description: string }) => void;
  hasShopify: boolean;
  isCreating?: boolean;
  currency: string;
  initialPrice?: string;
}

export function ShopifyPageDisplay({ parsed, selectedTitle, onSelectTitle, onCreateProduct, hasShopify, isCreating, currency, initialPrice }: Props) {
  const [selectedParagraphs, setSelectedParagraphs] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const [price, setPrice] = useState(initialPrice || '25000');
  const [stock, setStock] = useState('100');

  const toggleParagraph = (idx: number) => {
    setSelectedParagraphs(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const getPreviewHtml = () => {
    const selected = parsed.paragraphes.filter((_, i) => selectedParagraphs.includes(i));
    let html = '';
    selected.forEach(p => {
      html += `<h2>${p.titre}</h2>\n`;
      const phrases = p.texte.split(/(?<=\.)\s+/).filter(s => s.trim());
      phrases.forEach(phrase => {
        html += `<p>${phrase.trim()}</p>\n`;
      });
      html += `\n`;
    });
    
    if (parsed.bullets.length > 0) {
      html += `<ul>\n`;
      parsed.bullets.forEach(b => {
        html += `  <li>${b}</li>\n`;
      });
      html += `</ul>\n`;
    }
    return html;
  };

  const handleCopy = () => {
    const selected = parsed.paragraphes.filter((_, i) => selectedParagraphs.includes(i));
    const text = selected.map(p => `${p.titre}\n\n${p.texte}`).join('\n\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column — Selection (8/12) */}
      <div className="lg:col-span-7 space-y-8">
        
        {/* Titres */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-[10px] font-black mb-6 uppercase tracking-widest text-slate-400">1. Sélectionnez votre Titre</h3>
          <div className="space-y-3">
            {parsed.titres.map((titre, i) => (
              <button
                key={i}
                onClick={() => onSelectTitle(i)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                  selectedTitle === i 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                }`}
              >
                <span className={`text-sm font-black ${selectedTitle === i ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {titre}
                </span>
                {selectedTitle === i && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
              </button>
            ))}
          </div>
        </section>

        {/* Paragraphes */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-[10px] font-black mb-6 uppercase tracking-widest text-slate-400">2. Description Neuromarketing (SÉLECTIONNEZ VOS PARAGRAPHES)</h3>
          <div className="space-y-4">
            {parsed.paragraphes.map((p, i) => (
              <div
                key={i}
                onClick={() => toggleParagraph(i)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedParagraphs.includes(i)
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10'
                    : 'border-slate-100 dark:border-slate-800 opacity-60 grayscale'
                }`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                    selectedParagraphs.includes(i) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                  }`}>
                    {selectedParagraphs.includes(i) && <Check className="w-4 h-4" />}
                  </div>
                  <h4 className="text-sm font-black tracking-tight">{p.titre}</h4>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-10">
                  {p.texte.split(/(?<=\.)\s+/).filter(s => s.trim()).map((phrase, j) => (
                    <p key={j} className="mb-1 italic">&ldquo;{phrase}&rdquo;</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prix & Stock */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-[10px] font-black mb-6 uppercase tracking-widest text-slate-400">3. Configuration Boutique</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-2">Prix de Vente ({currency})</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-2">Stock Initial</label>
              <div className="relative">
                <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column — Preview (4/12) */}
      <div className="lg:col-span-5">
        <div className="sticky top-24 bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-base font-black flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-400" /> Aperçu Shopify
            </h3>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">LIVE PREVIEW</span>
          </div>

          <div className="space-y-6 mb-10 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide relative z-10">
            {/* Title Preview */}
            <div className="pb-6 border-b border-white/10">
              <span className="text-[9px] font-black text-white/30 uppercase block mb-2">Titre du produit</span>
              <h2 className="text-xl font-black text-blue-400 leading-tight">
                {parsed.titres[selectedTitle]}
              </h2>
            </div>

            {/* Price Preview */}
            <div className="flex items-center justify-between py-4 border-b border-white/10">
              <div>
                <span className="text-[9px] font-black text-white/30 uppercase block mb-1">Prix de vente</span>
                <p className="text-2xl font-black text-white">{new Intl.NumberFormat().format(parseInt(price || '0'))} {currency}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black text-white/30 uppercase block mb-1">Stock</span>
                <p className="text-sm font-bold text-emerald-400">{stock} unités</p>
              </div>
            </div>

            {/* Description Preview */}
            <div className="space-y-6">
              <span className="text-[9px] font-black text-white/30 uppercase block mb-2">{selectedParagraphs.length} section(s) sélectionnée(s)</span>
              {parsed.paragraphes.filter((_, i) => selectedParagraphs.includes(i)).map((p, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">{p.titre}</h4>
                  <div className="text-xs text-white/60 leading-relaxed font-medium">
                    {p.texte}
                  </div>
                </div>
              ))}

              {/* Bullets Preview */}
              {parsed.bullets.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <ul className="space-y-2">
                    {parsed.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-[10px] text-white/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            <button
              onClick={handleCopy}
              className="w-full py-4 bg-white/5 text-white/70 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copier le contenu HTML
            </button>
            <button
              disabled={isCreating || !hasShopify}
              onClick={() => onCreateProduct({ title: parsed.titres[selectedTitle], price, stock, description: getPreviewHtml() })}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isCreating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
              {isCreating ? 'PUBLICATION...' : 'PUBLIER SUR SHOPIFY'}
            </button>
            {!hasShopify && (
              <p className="text-[9px] text-center text-white/30 font-bold uppercase tracking-wider">Connectez une boutique pour publier</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
