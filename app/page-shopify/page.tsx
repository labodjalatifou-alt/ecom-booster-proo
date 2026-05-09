"use client";

import React, { useState } from 'react';
import { Store, Copy, Check, Sparkles, Layout, DollarSign, Database, Send, CheckCircle2, Eye, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PageShopifyPage() {
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(0);
  const [selectedSections, setSelectedSections] = useState<number[]>([0, 1, 2, 3]);
  const [price, setPrice] = useState('25000');
  const [stock, setStock] = useState('100');
  const [currency, setCurrency] = useState('FCFA');
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');

  const productData = {
    titles: [
      "Brosse Soufflante 5-en-1 : Votre Salon Professionnel à Domicile",
      "Révolution Beauté : La Brosse 5-en-1 qui Remplace tous vos Appareils",
      "Cheveux Parfaits en 5 Minutes : Le Secret des Femmes Actives"
    ],
    sections: [
      { id: 0, h2: "✨ Une Coiffure de Star en un Temps Record", p: "Marre de passer des heures à vous battre avec votre sèche-cheveux et votre lisseur ? Notre Brosse Soufflante 5-en-1 est l'outil ultime qui combine séchage, lissage et bouclage en un seul geste." },
      { id: 1, h2: "💁‍♀️ Technologie Ionique : Dites Adieu aux Frisottis", p: "Contrairement aux fers classiques qui brûlent vos cheveux, notre technologie ionique avancée scelle l'humidité naturelle et laisse vos cheveux brillants, soyeux et sans aucun frisottis." },
      { id: 2, h2: "🌍 Adaptée à Tous les Types de Cheveux", p: "Que vous ayez les cheveux crépus, bouclés, frisés ou lisses, nos 5 accessoires interchangeables s'adaptent parfaitement à votre texture pour un résultat digne d'un grand salon." },
      { id: 3, h2: "🚚 Commandez Aujourd'hui, Payez à la Livraison !", p: "Profitez de notre offre spéciale limitée ! Commandez dès maintenant en toute confiance et ne payez qu'à la réception de votre colis. Livraison rapide partout." },
      { id: 4, h2: "💎 Qualité Premium & Garantie", p: "Conçue avec des matériaux de haute qualité, notre brosse assure une durabilité exceptionnelle. Votre satisfaction est notre priorité absolue avec une garantie de 12 mois." },
      { id: 5, h2: "🎁 Le Cadeau Parfait pour Elle", p: "Offrez le secret d'une chevelure magnifique. Notre coffret élégant fait de cette brosse le cadeau idéal pour un anniversaire ou une occasion spéciale." }
    ]
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const selectedContent = productData.sections
        .filter(s => selectedSections.includes(s.id))
        .map(s => `<h2>${s.h2}</h2><p>${s.p}</p>`)
        .join('');

      const res = await fetch('/api/create-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productData.titles[selectedTitle],
          price: price,
          stock: stock,
          description: selectedContent,
          category: 'Shopify Builder'
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("🚀 Page Shopify créée et produit exporté !");
      setExported(true);
      setTimeout(() => setExported(false), 5000);
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (id: number) => {
    if (selectedSections.includes(id)) {
      setSelectedSections(selectedSections.filter(s => s !== id));
    } else {
      setSelectedSections([...selectedSections, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Shopify Builder</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Générateur de Page</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Partie Blanche Centrale - Liste Verticale */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xs font-black mb-6 uppercase tracking-widest text-slate-400">1. Titre du Produit</h3>
            <div className="space-y-3">
              {productData.titles.map((title, i) => (
                <button key={i} onClick={() => setSelectedTitle(i)} className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${selectedTitle === i ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}>
                  <span className={`text-sm font-black ${selectedTitle === i ? 'text-primary-700' : 'text-slate-600'}`}>{title}</span>
                  {selectedTitle === i && <CheckCircle2 className="w-5 h-5 text-primary-500" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xs font-black mb-6 uppercase tracking-widest text-slate-400">2. Sélectionner les Paragraphes (Liste Verticale)</h3>
            <div className="space-y-4">
              {productData.sections.map((section, i) => (
                <div key={i} onClick={() => toggleSection(section.id)} className={`p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all ${selectedSections.includes(section.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selectedSections.includes(section.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
                      {selectedSections.includes(section.id) && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <h4 className="text-sm font-black tracking-tight">{section.h2}</h4>
                  </div>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed italic ml-9">{section.p}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xs font-black mb-6 uppercase tracking-widest text-slate-400">3. Inventaire & Prix</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Prix (En {currency})</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary-500/10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Stock Initial</label>
                <div className="relative">
                  <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary-500/10" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aperçu Dynamique TEXTUEL (A droite) */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl sticky top-24 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <Eye className="w-6 h-6 text-emerald-400" /> Aperçu Shopify
            </h3>
            
            <div className="space-y-6 mb-10 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
              {/* Titre */}
              <div>
                <span className="text-[9px] font-black text-white/30 uppercase block mb-2">Titre du produit</span>
                <p className="text-sm font-black leading-relaxed">{productData.titles[selectedTitle]}</p>
              </div>

              {/* Prix & Stock */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <span className="text-[9px] font-black text-white/30 uppercase block mb-1">Prix de vente</span>
                  <p className="text-lg font-black text-emerald-400">{price} {currency}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black text-white/30 uppercase block mb-1">Quantité Stock</span>
                  <p className="text-lg font-black text-amber-400">{stock} PCS</p>
                </div>
              </div>

              {/* Contenu Paragraphes TEXTUELS */}
              <div className="space-y-6 pt-4 border-t border-white/10">
                <span className="text-[9px] font-black text-white/30 uppercase block">Description ({selectedSections.length} paragraphes)</span>
                {productData.sections.filter(s => selectedSections.includes(s.id)).map((s, i) => (
                  <div key={i} className="animate-in fade-in slide-in-from-right-4">
                    <h5 className="text-[10px] font-black uppercase text-emerald-400 mb-1">{s.h2}</h5>
                    <p className="text-[11px] font-bold text-white/70 leading-relaxed italic">{s.p}</p>
                  </div>
                ))}
              </div>
            </div>

            <button 
              disabled={loading}
              onClick={handleExport} 
              className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? "Création..." : "Créer sur Shopify"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
