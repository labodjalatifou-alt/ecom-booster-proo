"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, ImageIcon, Loader2, Download, CheckCircle2, RefreshCw } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { removeBackground } from '@imgly/background-removal';

function getAverageColor(imgElement: HTMLImageElement): { r: number, g: number, b: number } {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = imgElement.width;
  canvas.height = imgElement.height;
  
  if (!context) return { r: 255, g: 255, b: 255 };
  
  context.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let r = 0, g = 0, b = 0;
  let count = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] > 128) { // Only consider non-transparent pixels
      r += data[i];
      g += data[i+1];
      b += data[i+2];
      count++;
    }
  }
  
  if (count === 0) return { r: 255, g: 255, b: 255 };
  
  return {
    r: Math.floor(r / count),
    g: Math.floor(g / count),
    b: Math.floor(b / count)
  };
}

function colorToName(r: number, g: number, b: number) {
  // Simple heuristic to pass a color name to the prompt
  if (r > 200 && g > 200 && b > 200) return 'white';
  if (r < 50 && g < 50 && b < 50) return 'black';
  if (r > g && r > b) return 'red or warm';
  if (g > r && g > b) return 'green or nature';
  if (b > r && b > g) return 'blue or cool';
  return 'neutral';
}

function hexColor(r: number, g: number, b: number) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

export default function ImageGenerator() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [advantages, setAdvantages] = useState(['', '', '', '']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const advantagesRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage(event.target?.result as string);
        setGeneratedImages([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdvantageChange = (index: number, value: string) => {
    const newAdv = [...advantages];
    newAdv[index] = value;
    setAdvantages(newAdv);
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const generateImages = async () => {
    if (!sourceImage) return;
    setIsGenerating(true);
    setGeneratedImages([]);
    
    try {
      setStatusText('Étape 1/4 : Détourage de l\'image (exécution locale)...');
      
      // 1. Remove background
      const imageBlob = await fetch(sourceImage).then(r => r.blob());
      const transparentBlob = await removeBackground(imageBlob);
      const transparentUrl = URL.createObjectURL(transparentBlob);
      const transparentImg = await loadImage(transparentUrl);

      setStatusText('Étape 2/4 : Analyse des couleurs...');
      // 2. Get average color
      const color = getAverageColor(transparentImg);
      const colorName = colorToName(color.r, color.g, color.b);
      const domHex = hexColor(color.r, color.g, color.b);

      const images: string[] = [];

      // Image 1: White background
      setStatusText('Étape 3/4 : Génération des décors IA...');
      const canvasWhite = document.createElement('canvas');
      canvasWhite.width = 1080;
      canvasWhite.height = 1080;
      const ctxWhite = canvasWhite.getContext('2d')!;
      ctxWhite.fillStyle = '#ffffff';
      ctxWhite.fillRect(0, 0, 1080, 1080);
      
      // Draw product centered
      const scale = Math.min(800 / transparentImg.width, 800 / transparentImg.height);
      const w = transparentImg.width * scale;
      const h = transparentImg.height * scale;
      ctxWhite.drawImage(transparentImg, (1080 - w) / 2, (1080 - h) / 2, w, h);
      images.push(canvasWhite.toDataURL('image/jpeg', 0.9));

      // Images 2 & 3: AI Backgrounds via Hugging Face FLUX.1
      const prompts = [
        `a clean minimalistic product photography empty podium, ${colorName} tones, soft studio lighting, 8k resolution, highly detailed, photorealistic, professional`,
        `a beautiful empty lifestyle setting on a table, ${colorName} theme, natural window light, aesthetic, photorealistic, professional photography`
      ];

      for (let i = 0; i < prompts.length; i++) {
        try {
          // Call our new internal API which uses Hugging Face
          const response = await fetch('/api/image-ia/generate-bg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompts[i] })
          });
          
          if (!response.ok) {
            throw new Error("Erreur de l'API de génération de décor");
          }
          
          const data = await response.json();
          if (data.error) throw new Error(data.error);

          const bgImg = await loadImage(data.image);
          const canvasBg = document.createElement('canvas');
          canvasBg.width = 1080;
          canvasBg.height = 1080;
          const ctxBg = canvasBg.getContext('2d')!;
          
          ctxBg.drawImage(bgImg, 0, 0, 1080, 1080);
          // Add soft shadow
          ctxBg.shadowColor = 'rgba(0,0,0,0.4)';
          ctxBg.shadowBlur = 50;
          ctxBg.shadowOffsetY = 25;
          ctxBg.drawImage(transparentImg, (1080 - w) / 2, (1080 - h) / 2 + 50, w, h);
          
          images.push(canvasBg.toDataURL('image/jpeg', 0.9));
        } catch (e) {
          console.error("Failed to generate AI background", e);
        }
      }

      setStatusText('Étape 4/4 : Création des images d\'avantages...');
      
      // Images 4, 5, 6, 7: Advantages
      // We will render these via hidden DOM elements and htmlToImage
      if (advantagesRef.current) {
        const advNodes = advantagesRef.current.querySelectorAll('.advantage-card');
        for (let i = 0; i < advNodes.length; i++) {
          const node = advNodes[i] as HTMLElement;
          // Set transparent image dynamically for the generator
          const imgEl = node.querySelector('img.product-img') as HTMLImageElement;
          if (imgEl) imgEl.src = transparentUrl;
          
          // Force layout
          node.style.display = 'flex';
          const dataUrl = await htmlToImage.toJpeg(node, { quality: 0.9, width: 1080, height: 1080, pixelRatio: 1 });
          node.style.display = 'none';
          images.push(dataUrl);
        }
      }

      setGeneratedImages(images);
      setStatusText('Terminé !');

    } catch (error) {
      console.error(error);
      setStatusText('Une erreur est survenue lors de la génération.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Column */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">1. Image du produit</h3>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group"
            >
              {sourceImage ? (
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <img src={sourceImage} alt="Source" className="object-contain w-full h-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cliquez pour uploader</p>
                    <p className="text-xs text-slate-500 mt-1">PNG ou JPG, fond clair de préférence</p>
                  </div>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">2. Avantages du produit</h3>
            <div className="space-y-4">
              {advantages.map((adv, idx) => (
                <div key={idx}>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                    Avantage {idx + 1}
                  </label>
                  <input
                    type="text"
                    value={adv}
                    onChange={(e) => handleAdvantageChange(idx, e.target.value)}
                    placeholder={`Ex: Avantage ${idx + 1}...`}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={generateImages}
            disabled={!sourceImage || isGenerating}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-4 font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5" />
                Générer les 7 images
              </>
            )}
          </button>

          {isGenerating && (
            <div className="text-center text-sm font-medium text-primary-600 animate-pulse">
              {statusText}
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[600px]">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center justify-between">
              <span>Résultats ({generatedImages.length}/7)</span>
              {generatedImages.length > 0 && (
                <span className="text-sm font-normal text-emerald-500 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4" /> Terminé
                </span>
              )}
            </h3>

            {generatedImages.length === 0 ? (
              <div className="h-[500px] flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                <p>Uploadez une image et cliquez sur générer</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {generatedImages.map((src, idx) => (
                  <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-800">
                    <img src={src} alt={`Generated ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a 
                        href={src} 
                        download={`produit-${idx + 1}.jpg`}
                        className="bg-white text-slate-900 p-3 rounded-full hover:scale-110 transition-transform"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden DOM Elements for html-to-image to render Advantage Cards */}
      <div ref={advantagesRef} className="fixed -left-[9999px] top-0 pointer-events-none">
        {advantages.map((adv, idx) => (
          <div 
            key={idx}
            className="advantage-card w-[1080px] h-[1080px] bg-gradient-to-br from-slate-50 to-slate-200 flex flex-row items-center p-20 hidden"
          >
            <div className="flex-1 flex justify-center items-center h-full relative">
              <div className="absolute inset-0 bg-white/40 blur-3xl rounded-full scale-75"></div>
              <img className="product-img object-contain w-full h-full max-w-[80%] max-h-[80%] drop-shadow-2xl z-10" />
            </div>
            <div className="flex-1 pl-16">
              <div className="bg-white/80 backdrop-blur-md border border-white/50 shadow-2xl rounded-[3rem] p-16 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-6 mb-8 relative z-10">
                  <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-lg shadow-primary-500/30">
                    {idx + 1}
                  </div>
                  <h2 className="text-4xl font-black text-slate-300 uppercase tracking-widest">Avantage</h2>
                </div>
                <p className="text-5xl font-black text-slate-800 leading-tight relative z-10">
                  {adv || "Super avantage produit !"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
