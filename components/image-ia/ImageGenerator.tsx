"use client";

import React, { useState, useRef } from 'react';
import { Upload, ImageIcon, Loader2, Download, CheckCircle2, Sparkles } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

function getAverageColorFromDataUrl(dataUrl: string): Promise<{ r: number, g: number, b: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve({ r: 128, g: 128, b: 128 });
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 128) { r += data[i]; g += data[i + 1]; b += data[i + 2]; count++; }
      }
      if (count === 0) return resolve({ r: 128, g: 128, b: 128 });
      resolve({ r: Math.floor(r / count), g: Math.floor(g / count), b: Math.floor(b / count) });
    };
    img.src = dataUrl;
  });
}

function colorToName(r: number, g: number, b: number) {
  if (r > 200 && g > 200 && b > 200) return 'white and clean';
  if (r < 60 && g < 60 && b < 60) return 'black and dark';
  if (r > g && r > b) return 'red and warm';
  if (g > r && g > b) return 'green and natural';
  if (b > r && b > g) return 'blue and cool';
  if (r > 180 && g > 140 && b < 80) return 'golden and luxurious';
  return 'neutral and elegant';
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const IMAGE_LABELS = [
  { label: 'Fond Blanc', emoji: '⬜' },
  { label: 'Décor Studio', emoji: '🎬' },
  { label: 'Décor Lifestyle', emoji: '🌿' },
  { label: 'Avantage 1', emoji: '✨' },
  { label: 'Avantage 2', emoji: '✨' },
  { label: 'Avantage 3', emoji: '✨' },
  { label: 'Avantage 4', emoji: '✨' },
];

export default function ImageGenerator() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [advantages, setAdvantages] = useState(['', '', '', '']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const advantagesRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSourceImage(ev.target?.result as string);
        setGeneratedImages([]);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const generateImages = async () => {
    if (!sourceImage) return;
    setIsGenerating(true);
    setGeneratedImages([]);
    setProgress(0);

    try {
      // STEP 1: Remove background via Fal API
      setStatusText('Étape 1/4 : Détourage de l\'image avec Fal.ai...');
      
      const removeBgRes = await fetch('/api/image-ia/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: sourceImage })
      });
      const removeBgData = await removeBgRes.json();
      if (removeBgData.error) throw new Error(removeBgData.error);

      // The API returns the URL of the transparent image directly from Fal CDN
      const transparentDataUrl: string = removeBgData.image;
      setProgress(20);

      // STEP 2: Analyze color
      setStatusText('Étape 2/4 : Analyse de la couleur dominante...');
      const color = await getAverageColorFromDataUrl(transparentDataUrl);
      const colorName = colorToName(color.r, color.g, color.b);
      setProgress(30);

      const images: string[] = [];
      const transparentImg = await loadImage(transparentDataUrl);
      const scale = Math.min(800 / transparentImg.naturalWidth, 800 / transparentImg.naturalHeight);
      const w = transparentImg.naturalWidth * scale;
      const h = transparentImg.naturalHeight * scale;

      // IMAGE 1: White background
      setStatusText('Étape 3/4 : Création du fond blanc...');
      const canvasWhite = document.createElement('canvas');
      canvasWhite.width = 1080; canvasWhite.height = 1080;
      const ctxW = canvasWhite.getContext('2d')!;
      ctxW.fillStyle = '#ffffff';
      ctxW.fillRect(0, 0, 1080, 1080);
      // Subtle shadow
      ctxW.shadowColor = 'rgba(0,0,0,0.12)';
      ctxW.shadowBlur = 30;
      ctxW.shadowOffsetY = 20;
      ctxW.drawImage(transparentImg, (1080 - w) / 2, (1080 - h) / 2, w, h);
      images.push(canvasWhite.toDataURL('image/jpeg', 0.95));
      setProgress(40);

      // IMAGES 2 & 3: AI generated backgrounds via HF FLUX
      const bgPrompts = [
        `empty clean minimalist product photography studio podium, ${colorName} color tones, soft diffused studio lighting, pure background, highly detailed, photorealistic, 8k`,
        `empty beautiful modern lifestyle flat lay surface, ${colorName} aesthetic, natural sunlight, elegant minimalist composition, professional product photography, 8k photorealistic`
      ];

      for (let i = 0; i < bgPrompts.length; i++) {
        setStatusText(`Étape 3/4 : Génération décor IA ${i + 1}/2 (FLUX.1)...`);
        try {
          const bgRes = await fetch('/api/image-ia/generate-bg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: bgPrompts[i] })
          });
          const bgData = await bgRes.json();
          if (bgData.error) throw new Error(bgData.error);

          const bgImg = await loadImage(bgData.image);
          const canvasBg = document.createElement('canvas');
          canvasBg.width = 1080; canvasBg.height = 1080;
          const ctxBg = canvasBg.getContext('2d')!;
          ctxBg.drawImage(bgImg, 0, 0, 1080, 1080);
          ctxBg.shadowColor = 'rgba(0,0,0,0.45)';
          ctxBg.shadowBlur = 55;
          ctxBg.shadowOffsetY = 30;
          ctxBg.drawImage(transparentImg, (1080 - w) / 2, (1080 - h) / 2 + 40, w, h);
          images.push(canvasBg.toDataURL('image/jpeg', 0.95));
        } catch (e) {
          console.error('Bg generation error', e);
        }
        setProgress(50 + (i + 1) * 10);
      }

      // IMAGES 4-7: Advantage cards
      setStatusText('Étape 4/4 : Création des visuels d\'avantages...');
      if (advantagesRef.current) {
        const cards = advantagesRef.current.querySelectorAll<HTMLElement>('.advantage-card');
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const imgEl = card.querySelector<HTMLImageElement>('img.product-img');
          if (imgEl) imgEl.src = transparentDataUrl;
          card.style.display = 'flex';
          await new Promise(r => setTimeout(r, 100)); // let it render
          try {
            const dataUrl = await htmlToImage.toJpeg(card, { quality: 0.93, pixelRatio: 1 });
            images.push(dataUrl);
          } catch (e) {
            console.error('Card render error', e);
          }
          card.style.display = 'none';
          setProgress(70 + (i + 1) * 7);
        }
      }

      setGeneratedImages(images);
      setProgress(100);
      setStatusText(`✅ ${images.length} images générées avec succès !`);
    } catch (err: any) {
      console.error(err);
      setStatusText('❌ Erreur : ' + (err.message || 'Inconnue'));
    } finally {
      setIsGenerating(false);
    }
  };

  const ADVANTAGE_COLORS = [
    { from: '#6366f1', to: '#8b5cf6' },
    { from: '#0ea5e9', to: '#06b6d4' },
    { from: '#10b981', to: '#059669' },
    { from: '#f59e0b', to: '#ef4444' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* --- SETTINGS COLUMN --- */}
        <div className="col-span-1 space-y-6">
          {/* Upload */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">1. Image du produit</h3>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group"
            >
              {sourceImage ? (
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={sourceImage} alt="Source" className="object-contain w-full h-full" />
                </div>
              ) : (
                <div className="py-8 space-y-3">
                  <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7 text-indigo-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cliquez pour uploader</p>
                  <p className="text-xs text-slate-400">PNG, JPG — fond clair de préférence</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          {/* Advantages */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">2. Avantages produit</h3>
            <div className="space-y-3">
              {advantages.map((adv, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-indigo-400">0{idx + 1}</span>
                  <input
                    type="text"
                    value={adv}
                    onChange={(e) => {
                      const n = [...advantages]; n[idx] = e.target.value; setAdvantages(n);
                    }}
                    placeholder={`Ex: Livraison rapide, Qualité premium...`}
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={generateImages}
            disabled={!sourceImage || isGenerating}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-4 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" />Génération...</> : <><Sparkles className="w-5 h-5" />Générer 7 images IA</>}
          </button>

          {/* Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-center text-indigo-500 font-semibold animate-pulse">{statusText}</p>
            </div>
          )}
          {!isGenerating && statusText && (
            <p className="text-xs text-center text-slate-500">{statusText}</p>
          )}
        </div>

        {/* --- RESULTS COLUMN --- */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[600px]">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between">
              <span>Résultats ({generatedImages.length}/7)</span>
              {generatedImages.length > 0 && (
                <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />Terminé
                </span>
              )}
            </h3>

            {generatedImages.length === 0 ? (
              <div className="h-[480px] flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                <ImageIcon className="w-20 h-20 mb-4" />
                <p className="text-sm">Vos 7 images apparaîtront ici</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {generatedImages.map((src, idx) => (
                  <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm">
                    <img src={src} alt={IMAGE_LABELS[idx]?.label} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-xs font-bold">{IMAGE_LABELS[idx]?.emoji} {IMAGE_LABELS[idx]?.label}</p>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <a
                        href={src}
                        download={`${IMAGE_LABELS[idx]?.label?.toLowerCase().replace(' ', '-')}.jpg`}
                        className="bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-full hover:scale-105 transition-transform flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Télécharger
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden advantage cards for html-to-image rendering */}
      <div ref={advantagesRef} className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden>
        {advantages.map((adv, idx) => {
          const col = ADVANTAGE_COLORS[idx];
          return (
            <div
              key={idx}
              className="advantage-card hidden"
              style={{
                width: '1080px',
                height: '1080px',
                display: 'none',
                background: `linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)`,
                flexDirection: 'row',
                alignItems: 'center',
                padding: '80px',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {/* Product side */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                <div style={{
                  position: 'absolute', width: '400px', height: '400px',
                  background: `radial-gradient(circle, ${col.from}22 0%, transparent 70%)`,
                  borderRadius: '50%',
                }} />
                <img className="product-img" alt="produit" style={{ objectFit: 'contain', maxWidth: '420px', maxHeight: '420px', filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.25))' }} />
              </div>
              {/* Text side */}
              <div style={{ flex: 1, paddingLeft: '60px' }}>
                <div style={{
                  background: 'white',
                  borderRadius: '40px',
                  padding: '60px',
                  boxShadow: '0 25px 80px rgba(0,0,0,0.12)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: '-40px', right: '-40px',
                    width: '200px', height: '200px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${col.from}33, ${col.to}22)`,
                  }} />
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '70px', height: '70px', borderRadius: '20px',
                    background: `linear-gradient(135deg, ${col.from}, ${col.to})`,
                    marginBottom: '24px',
                    boxShadow: `0 10px 30px ${col.from}55`,
                  }}>
                    <span style={{ color: 'white', fontSize: '32px', fontWeight: 900 }}>{idx + 1}</span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    Avantage clé
                  </div>
                  <div style={{ color: '#0f172a', fontSize: '42px', fontWeight: 900, lineHeight: 1.15 }}>
                    {adv || `Avantage ${idx + 1} de votre produit`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
