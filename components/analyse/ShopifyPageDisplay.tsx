import React, { useState, useEffect } from 'react';
import { ShopifyPageParsed } from '@/lib/claude-prompts';
import { Check, Copy, Eye, Send, DollarSign, Database, CheckCircle2, ChevronDown, ChevronUp, Image as ImageIcon, Layers, Edit2 } from 'lucide-react';
import ShopifyImagePicker, { ImagePickerState } from './ShopifyImagePicker';

interface Props {
  parsed: ShopifyPageParsed;
  selectedTitle: number;
  onSelectTitle: (i: number) => void;
  onCreateProduct: (data: { title: string; price: string; stock: string; description: string }) => void;
  hasShopify: boolean;
  isCreating?: boolean;
  currency: string;
  initialPrice?: string;
  produit?: string;
  pays?: string;
}

export function ShopifyPageDisplay({
  parsed, selectedTitle, onSelectTitle, onCreateProduct,
  hasShopify, isCreating, currency, initialPrice,
  produit = '', pays = 'Sénégal',
}: Props) {
  const [selectedParagraphs, setSelectedParagraphs] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const [price, setPrice] = useState(initialPrice || '25000');
  const [stock, setStock] = useState('100');
  const [publishStatus, setPublishStatus] = useState<'draft' | 'active'>('draft');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // État local d'édition
  const [editableTitres, setEditableTitres] = useState<string[]>([]);
  const [editableParagraphes, setEditableParagraphes] = useState<{ titre: string; texte: string }[]>([]);
  const [editableBullets, setEditableBullets] = useState<string[]>([]);
  const [editingPara, setEditingPara] = useState<number | null>(null);

  // Synchronisation avec les données de l'IA
  useEffect(() => {
    setEditableTitres([...parsed.titres]);
    setEditableParagraphes([...parsed.paragraphes]);
    setEditableBullets([...parsed.bullets]);
  }, [parsed]);

  // État images synchronisé depuis ShopifyImagePicker → pour Live Preview
  const [pickerState, setPickerState] = useState<ImagePickerState>({
    mediaSelected: [],
    paraImages: {},
  });

  const toggleParagraph = (idx: number) => {
    setSelectedParagraphs(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleTitleChange = (i: number, val: string) => {
    const newTitres = [...editableTitres];
    newTitres[i] = val;
    setEditableTitres(newTitres);
  };

  const handleParaChange = (i: number, field: 'titre' | 'texte', val: string) => {
    const newParas = [...editableParagraphes];
    newParas[i] = { ...newParas[i], [field]: val };
    setEditableParagraphes(newParas);
  };

  const getPreviewHtml = () => {
    const selected = editableParagraphes.filter((_, i) => selectedParagraphs.includes(i));
    let html = '';
    selected.forEach(p => {
      html += `<h2>${p.titre}</h2>\n`;
      p.texte.split(/(?<=\.)\s+/).filter(s => s.trim()).forEach(phrase => {
        html += `<p>${phrase.trim()}</p>\n`;
      });
      html += '\n';
    });
    if (editableBullets.length > 0) {
      html += `<ul>\n${editableBullets.map(b => `  <li>${b}</li>`).join('\n')}\n</ul>\n`;
    }
    return html;
  };

  const handleDownloadCsv = () => {
    const htmlContent = getPreviewHtml();
    const cleanTitle = (editableTitres[selectedTitle] || produit || 'Produit').trim();
    const handle = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Échapper les guillemets pour le CSV
    const escapeCsv = (str: string) => `"${String(str).replace(/"/g, '""')}"`;
    
    // Colonnes standards de Shopify
    const headers = [
      'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
      'Option1 Name', 'Option1 Value', 'Variant Inventory Tracker', 'Variant Inventory Qty',
      'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price',
      'Variant Requires Shipping', 'Variant Taxable', 'Status'
    ];
    
    const row = [
      escapeCsv(handle),
      escapeCsv(cleanTitle),
      escapeCsv(htmlContent),
      escapeCsv('ECOM BOOSTER PRO'),
      escapeCsv(''),
      escapeCsv(produit || ''),
      'TRUE',
      escapeCsv('Title'),
      escapeCsv('Default Title'),
      escapeCsv('shopify'),
      escapeCsv(stock || '100'),
      escapeCsv('deny'),
      escapeCsv('manual'),
      escapeCsv(price || '0'),
      'TRUE',
      'TRUE',
      escapeCsv(publishStatus)
    ];
    
    const csvContent = headers.join(',') + '\n' + row.join(',');
    
    // Ajout du BOM pour l'encodage UTF-8 dans Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopify_${handle}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedParas = editableParagraphes.filter((_, i) => selectedParagraphs.includes(i));
  const { mediaSelected, paraImages } = pickerState;

  // Image principale pour le preview (première image galerie)
  const heroImage = mediaSelected[0] || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* ── Colonne gauche (7/12) ──────────────────────────── */}
      <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">

        {/* 1. Titres */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-5 md:p-8 shadow-sm">
          <h3 className="text-[10px] font-black mb-6 uppercase tracking-widest text-slate-400">1. Sélectionnez & Modifiez votre Titre</h3>
          <div className="space-y-3">
            {editableTitres.map((titre, i) => (
              <div
                key={i} 
                onClick={() => { if (selectedTitle !== i) onSelectTitle(i); }}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group cursor-pointer ${
                  selectedTitle === i
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                }`}
              >
                {selectedTitle === i ? (
                  <input 
                    type="text"
                    value={titre}
                    onChange={(e) => handleTitleChange(i, e.target.value)}
                    className="text-sm font-black text-blue-700 dark:text-blue-400 bg-transparent border-none outline-none w-full mr-2"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm font-black text-slate-600 dark:text-slate-300">
                    {titre}
                  </span>
                )}
                {selectedTitle === i && <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </section>

        {/* 2. Paragraphes */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-5 md:p-8 shadow-sm">
          <h3 className="text-[10px] font-black mb-6 uppercase tracking-widest text-slate-400">2. Modifiez la Description Neuromarketing</h3>
          <div className="space-y-4">
            {editableParagraphes.map((p, i) => (
              <div
                key={i}
                className={`p-5 rounded-2xl border-2 transition-all ${
                  selectedParagraphs.includes(i)
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10'
                    : 'border-slate-100 dark:border-slate-800 opacity-50 grayscale'
                }`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div 
                    onClick={() => toggleParagraph(i)}
                    className={`cursor-pointer w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                      selectedParagraphs.includes(i) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                    }`}
                  >
                    {selectedParagraphs.includes(i) && <Check className="w-4 h-4" />}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {editingPara === i ? (
                       <input 
                         value={p.titre}
                         onChange={(e) => handleParaChange(i, 'titre', e.target.value)}
                         className="flex-1 text-sm font-black tracking-tight bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none"
                       />
                    ) : (
                       <h4 className="text-sm font-black tracking-tight truncate">{p.titre}</h4>
                    )}
                    {/* Badge image assignée */}
                    {paraImages[i] && (
                      <span className="flex-shrink-0 flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-black px-2 py-0.5 rounded-full">
                        <ImageIcon className="w-2.5 h-2.5" /> IMG
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setEditingPara(editingPara === i ? null : i)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-600 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    {editingPara === i ? <CheckCircle2 size={14} /> : <Edit2 size={14} />}
                    {editingPara === i ? 'Terminer' : 'Éditer'}
                  </button>
                </div>
                
                {editingPara === i ? (
                   <div className="pl-10">
                     <textarea
                       value={p.texte}
                       onChange={(e) => handleParaChange(i, 'texte', e.target.value)}
                       className="w-full text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 outline-none resize-y min-h-[100px]"
                     />
                   </div>
                ) : (
                   <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-10 cursor-pointer" onClick={() => setEditingPara(i)}>
                     {p.texte.split(/(?<=\.)\s+/).filter(s => s.trim()).map((phrase, j) => (
                       <p key={j} className="mb-1 italic">&ldquo;{phrase}&rdquo;</p>
                     ))}
                   </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 3. Configuration boutique */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-5 md:p-8 shadow-sm">
          <h3 className="text-[10px] font-black mb-6 uppercase tracking-widest text-slate-400">3. Configuration Boutique</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-2">Prix ({currency})</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-2">Stock Initial</label>
              <div className="relative">
                <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="number" value={stock} onChange={e => setStock(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-2">Statut Shopify</label>
              <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl h-[56px] items-center">
                <button 
                  onClick={() => setPublishStatus('draft')}
                  className={`flex-1 h-full flex items-center justify-center text-xs font-black rounded-xl transition-all ${publishStatus === 'draft' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >Brouillon</button>
                <button 
                  onClick={() => setPublishStatus('active')}
                  className={`flex-1 h-full flex items-center justify-center text-xs font-black rounded-xl transition-all ${publishStatus === 'active' ? 'bg-emerald-500 shadow-sm text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >Actif</button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Images + Publication */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-5 md:p-8 shadow-sm">
          <button
            onClick={() => setShowImagePicker(prev => !prev)}
            className="w-full flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:rotate-12 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">4. Images Produit & Publication</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {mediaSelected.length > 0
                    ? `${mediaSelected.length} image(s) galerie · ${Object.keys(paraImages).length} inline`
                    : 'Google Images · Fond blanc · Lifestyle · Action · Gros plan'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {showImagePicker ? 'Masquer' : 'Ouvrir'}
              </span>
              {showImagePicker ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showImagePicker && (
            <ShopifyImagePicker
              produit={produit}
              pays={pays}
              prix={parseInt(price) || 0}
              currency={currency}
              paragraphes={selectedParas}
              bullets={editableBullets}
              titre={editableTitres[selectedTitle] || ''}
              tags={produit}
              quantite={parseInt(stock) || 10}
              status={publishStatus}
              onPublished={url => setPublishedUrl(url)}
              onImagesChange={state => setPickerState(state)}
            />
          )}

          {publishedUrl && !showImagePicker && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <a href={publishedUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all"
              >
                ✅ Voir le produit sur Shopify ↗
              </a>
            </div>
          )}
        </section>
      </div>

      {/* ── Colonne droite — Live Preview (5/12) ──────────── */}
      <div className="lg:col-span-5 order-1 lg:order-2">
        <div className="sticky top-24 bg-slate-900 rounded-[3rem] text-white shadow-2xl overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

          {/* Header preview */}
          <div className="flex items-center justify-between px-8 pt-8 pb-4 relative z-10">
            <h3 className="text-base font-black flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" /> Aperçu Shopify
            </h3>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
              LIVE PREVIEW
            </span>
          </div>

          <div className="space-y-0 max-h-[600px] overflow-y-auto scrollbar-hide relative z-10">

            {/* Image hero principale */}
            {heroImage ? (
              <div className="px-8 pb-5">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                  <img
                    src={heroImage}
                    alt="Image principale produit"
                    className="w-full aspect-square object-cover"
                    onError={e => (e.target as HTMLImageElement).style.display = 'none'}
                  />
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-sm">
                    Photo 1/{mediaSelected.length}
                  </div>
                </div>
                {/* Bande miniatures */}
                {mediaSelected.length > 1 && (
                  <div className="flex gap-2.5 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                    {mediaSelected.slice(1).map((url, i) => (
                      <div key={i} className="relative flex-shrink-0">
                        <img src={url} alt=""
                          className="w-20 h-20 object-cover rounded-xl border-2 border-white/10 hover:border-blue-400 transition-colors"
                          onError={e => (e.target as HTMLImageElement).style.display = 'none'}
                        />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-black px-1.5 py-0.5 rounded backdrop-blur-sm">
                          {i + 2}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-8 mb-5 h-40 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 bg-white/[0.02]">
                <ImageIcon className="w-10 h-10 text-white/15" />
                <p className="text-[10px] text-white/30 font-bold text-center px-4">
                  Sélectionnez des images dans<br/>la section "4. Images Produit"
                </p>
              </div>
            )}

            <div className="px-8 pb-8 space-y-5">
              {/* Titre */}
              <div className="border-b border-white/10 pb-4">
                <span className="text-[9px] font-black text-white/30 uppercase block mb-1">Titre</span>
                <h2 className="text-lg font-black text-blue-400 leading-tight">
                  {editableTitres[selectedTitle]}
                </h2>
              </div>

              {/* Prix + Stock */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[9px] font-black text-white/30 uppercase block mb-0.5">Prix</span>
                  <p className="text-xl font-black">{new Intl.NumberFormat().format(parseInt(price || '0'))} {currency}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-white/30 uppercase block mb-0.5">Stock</span>
                  <p className="text-sm font-bold text-emerald-400">{stock} unités</p>
                </div>
              </div>

              {/* Description avec images inline */}
              <div>
                <span className="text-[9px] font-black text-white/30 uppercase block mb-3">
                  {selectedParagraphs.length} section(s)
                </span>
                <div className="space-y-4">
                  {editableParagraphes.filter((_, i) => selectedParagraphs.includes(i)).map((p, idx) => {
                    // L'index dans selectedParas correspond à idx
                    const paraIdx = selectedParagraphs[idx]
                    const assignedImg = paraImages[paraIdx]
                    return (
                      <div key={idx} className="space-y-1.5">
                        <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">{p.titre}</h4>
                        <p className="text-[11px] text-white/60 leading-relaxed">{p.texte}</p>
                        {/* Image inline assignée */}
                        {assignedImg && (
                          <div className="pt-2 pb-1">
                            <img
                              src={assignedImg}
                              alt={p.titre}
                              className="w-full aspect-square object-cover rounded-2xl border border-white/10 shadow-lg"
                              onError={e => (e.target as HTMLImageElement).style.display = 'none'}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Bullets */}
                {editableBullets.length > 0 && (
                  <div className="pt-4 border-t border-white/10 mt-4">
                    <ul className="space-y-1.5">
                      {editableBullets.map((b, i) => (
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
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 space-y-3 relative z-10 border-t border-white/5 pt-4">
            <button onClick={handleDownloadCsv}
              className="w-full py-3.5 bg-white/5 text-white/70 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" /> Télécharger CSV Shopify
            </button>
            {!showImagePicker && (
              <button
                disabled={isCreating || !hasShopify}
                onClick={() => onCreateProduct({ title: editableTitres[selectedTitle] || '', price, stock, description: getPreviewHtml() })}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isCreating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                {isCreating ? 'Publication...' : 'Publier sans images'}
              </button>
            )}
            {!hasShopify && (
              <p className="text-[9px] text-center text-white/30 font-bold uppercase tracking-wider">Connectez une boutique pour publier</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
