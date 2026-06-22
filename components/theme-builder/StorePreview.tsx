'use client';
import React, { useState } from 'react';
import { ShoppingCart, Star, Truck, Shield, Award, RotateCcw, ChevronLeft, ChevronRight, Minus, Plus, Check } from 'lucide-react';

const TRUST_BADGES = [
  { icon: Truck, label: 'Livraison\nRapide' },
  { icon: Shield, label: 'Paiement\nSécurisé' },
  { icon: Award, label: 'Qualité\nPremium' },
  { icon: RotateCcw, label: 'Retours\nFaciles' },
];

export default function StorePreview({ product, blocks, globalSettings }: { product: any; blocks: any[]; globalSettings: any }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const primaryColor = globalSettings?.primaryColor || '#e63946';

  // Product data
  const title = product?.title || 'Produit Exemple';
  const price = product?.price ? `${parseInt(product.price).toLocaleString('fr-FR')} FCFA` : '0 FCFA';
  const comparePrice = product?.compare_price ? `${parseInt(product.compare_price).toLocaleString('fr-FR')} FCFA` : null;
  const description = product?.description || '';
  const images: string[] = product?.images && product.images.length > 0
    ? product.images
    : product?.image_url
    ? [product.image_url]
    : [];
  const hasDiscount = comparePrice && product?.compare_price && product?.price && parseInt(product.compare_price) > parseInt(product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - parseInt(product.price) / parseInt(product.compare_price)) * 100)
    : null;

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Filter active blocks
  const activeBlocks = blocks.filter(b => !b.hidden);
  const showTitle = activeBlocks.some(b => b.type === 'Titre');
  const showStars = activeBlocks.some(b => b.type === 'Note de produit');
  const showPrice = activeBlocks.some(b => b.type === 'Prix');
  const showDesc = activeBlocks.some(b => b.type === 'Description');
  const showBtn = activeBlocks.some(b => b.type === "Boutons d'achat");

  return (
    <div className="w-full bg-white font-sans text-gray-900 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Announcement Bar ── */}
      <div className="overflow-hidden bg-gray-900 text-white py-2 text-xs font-bold tracking-wider">
        <div className="flex animate-marquee whitespace-nowrap" style={{ animation: 'marquee 18s linear infinite' }}>
          {[...Array(6)].map((_, i) => (
            <span key={i} className="mx-8">🚚 LIVRAISON GRATUITE À PARTIR DE 50 000 FCFA</span>
          ))}
        </div>
      </div>

      {/* ── Store Name ── */}
      <div className="text-center py-3 border-b border-gray-100">
        <span className="font-black text-xl tracking-tighter text-gray-900">
          {product?.store_name || 'Zenvyra'}
        </span>
      </div>

      {/* ── Main Product Section ── */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Mobile: stacked | Desktop: 2 columns */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left: Image Gallery ── */}
          <div className="w-full lg:w-5/12 flex flex-col gap-3">
            {/* Main image */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage] || images[0]}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                  Aucune image produit
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(i => Math.max(0, i - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(i => Math.min(images.length - 1, i + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              {discountPct && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full">
                  -{discountPct}%
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.slice(0, 5).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-80'}`}
                    style={{ borderColor: selectedImage === i ? primaryColor : 'transparent' }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <div className="w-full lg:w-7/12 flex flex-col gap-4">

            {/* Stars */}
            {showStars && (
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span className="text-sm text-gray-500 font-semibold">4.9 · <span className="text-gray-400">128 avis</span></span>
              </div>
            )}

            {/* Title */}
            {showTitle && (
              <h1 className="text-2xl md:text-3xl font-black leading-tight text-gray-900">{title}</h1>
            )}

            {/* Price */}
            {showPrice && (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-gray-900">{price}</span>
                {comparePrice && (
                  <span className="text-base text-gray-400 line-through font-medium">{comparePrice}</span>
                )}
                {discountPct && (
                  <span className="text-xs bg-red-100 text-red-600 font-black px-2 py-1 rounded-full">-{discountPct}%</span>
                )}
              </div>
            )}

            {/* Buy Buttons */}
            {showBtn && (
              <div className="space-y-3">
                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-700">Quantité</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-bold text-base min-w-[40px] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-2xl text-white font-black text-base uppercase tracking-widest transition-all flex justify-center items-center gap-3 hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: primaryColor, boxShadow: `0 8px 25px -5px ${primaryColor}60` }}
                >
                  {added ? <><Check className="w-5 h-5" /> Ajouté !</> : <><ShoppingCart className="w-5 h-5" /> AJOUTER AU PANIER</>}
                </button>
                <button className="w-full py-3.5 rounded-2xl bg-black text-white font-black text-sm hover:bg-gray-800 transition-colors">
                  💳 ACHETER MAINTENANT
                </button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-4 gap-2 py-4 border-y border-gray-100">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 text-center leading-tight whitespace-pre-line">{label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Description Section (full width, below) ── */}
        {showDesc && description && (
          <div className="mt-10">
            <div
              className="prose prose-sm md:prose-base max-w-none text-gray-800
                [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-center [&_h1]:my-6
                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-center [&_h2]:my-5
                [&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-4
                [&_p]:leading-relaxed [&_p]:my-3 [&_p]:text-sm [&_p]:text-gray-700
                [&_img]:w-full [&_img]:rounded-xl [&_img]:my-4 [&_img]:object-cover
                [&_video]:w-full [&_video]:rounded-xl [&_video]:my-4
                [&_strong]:font-bold [&_em]:italic
                [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
                [&_li]:my-1 [&_li]:text-sm"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        )}

        {/* ── Order Form (bottom CTA) ── */}
        {showBtn && (
          <div className="mt-10 bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <h3 className="text-lg font-black text-center mb-4 text-gray-900">📦 Commander maintenant</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Votre nom complet"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 bg-white"
                readOnly
              />
              <input
                type="tel"
                placeholder="Votre numéro de téléphone"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 bg-white"
                readOnly
              />
              <input
                type="text"
                placeholder="Votre ville / adresse de livraison"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 bg-white"
                readOnly
              />
              <button
                className="w-full py-4 rounded-2xl text-white font-black text-base uppercase tracking-widest"
                style={{ backgroundColor: primaryColor }}
              >
                ✅ VALIDER MA COMMANDE
              </button>
              <p className="text-center text-xs text-gray-400">🔒 Paiement 100% sécurisé · Livraison rapide</p>
            </div>
          </div>
        )}

      </div>

      {/* ── Footer ── */}
      <div className="mt-8 py-6 border-t border-gray-100 text-center text-xs text-gray-400">
        © 2024 · Tous droits réservés
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: flex; width: max-content; }
      `}} />
    </div>
  );
}
