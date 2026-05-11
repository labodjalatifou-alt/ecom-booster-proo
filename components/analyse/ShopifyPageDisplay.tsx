import React from 'react';
import { ShopifyPageParsed } from '@/lib/claude-prompts';

interface Props {
  parsed: ShopifyPageParsed;
  selectedTitle: number;
  onSelectTitle: (i: number) => void;
  onCreateProduct: () => void;
  hasShopify: boolean;
  isCreating?: boolean;
}

export function ShopifyPageDisplay({ parsed, selectedTitle, onSelectTitle, onCreateProduct, hasShopify, isCreating }: Props) {
  return (
    <div className="space-y-6">
      
      {/* Titres à choisir */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
          Choisissez un titre
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {parsed.titres.map((titre, i) => (
            <button
              key={i}
              onClick={() => onSelectTitle(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                selectedTitle === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 dark:bg-slate-900 dark:border-slate-800'
              }`}
            >
              {titre}
            </button>
          ))}
        </div>
      </div>

      {/* Paragraphes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Description produit ({parsed.paragraphes.length} paragraphes)
          </h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Format: 3 phrases par paragraphe</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parsed.paragraphes.map((p, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              {/* Titre court mis en valeur */}
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-[10px]">{i + 1}</span>
                {p.titre}
              </h4>
              {/* 3 phrases séparées */}
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
                {p.texte.split(/(?<=\.)\s+/).filter(s => s.trim()).map((phrase, j) => (
                  <p key={j} className="pl-4 border-l-2 border-slate-200 dark:border-slate-800">{phrase}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bullets */}
      {parsed.bullets.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Caractéristiques Clés
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {parsed.bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Boutons action */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={() => {
            const text = parsed.paragraphes.map(p => `${p.titre}\n\n${p.texte}`).join('\n\n');
            navigator.clipboard.writeText(text);
          }}
          className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
        >
          📋 Copier le texte
        </button>
        {hasShopify && (
          <button 
            onClick={onCreateProduct} 
            disabled={isCreating}
            className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isCreating ? '🚀 Création en cours...' : '🛍️ Créer sur Shopify'}
          </button>
        )}
      </div>
    </div>
  );
}
