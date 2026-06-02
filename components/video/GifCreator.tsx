"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Image as ImageIcon, Upload, Download, Loader2, RefreshCw } from 'lucide-react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import toast from 'react-hot-toast';

export default function GifCreator() {
  const [file, setFile] = useState<File | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState('');
  const [startOffset, setStartOffset] = useState(0);
  const [endOffset, setEndOffset] = useState(5);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [gifUrl, setGifUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith('video/')) {
      toast.error('Veuillez sélectionner un fichier vidéo.');
      return;
    }
    setFile(selected);
    setLocalVideoUrl(URL.createObjectURL(selected));
    setGifUrl('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setStartOffset(0);
    setEndOffset(5);
  };

  const handleSetStart = () => {
    const t = Math.floor(videoRef.current?.currentTime ?? 0);
    setStartOffset(t);
    if (t >= endOffset) setEndOffset(t + 3);
    toast.success(`Début : ${t}s`);
  };

  const handleSetEnd = () => {
    const t = Math.floor(videoRef.current?.currentTime ?? 0);
    if (t <= startOffset) { toast.error('La fin doit être après le début !'); return; }
    setEndOffset(t);
    toast.success(`Fin : ${t}s`);
  };

  const generateGif = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setGifUrl('');

    try {
      setProgress('Chargement de FFmpeg…');
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

      const ffmpeg = new FFmpeg();

      // Charger FFmpeg en mode single-thread (pas besoin de SharedArrayBuffer)
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      setProgress('Lecture de la vidéo…');
      const inputData = await fetchFile(file);
      await ffmpeg.writeFile('input.mp4', inputData);

      const duration = endOffset - startOffset;

      // Construire le filtre vidéo
      let vf = `fps=10`;

      // Appliquer le crop si défini
      if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0 && videoRef.current) {
        const video = videoRef.current;
        const scaleX = video.videoWidth / video.clientWidth;
        const scaleY = video.videoHeight / video.clientHeight;
        const cropW = Math.round(completedCrop.width * scaleX);
        const cropH = Math.round(completedCrop.height * scaleY);
        const cropX = Math.round(completedCrop.x * scaleX);
        const cropY = Math.round(completedCrop.y * scaleY);
        vf = `crop=${cropW}:${cropH}:${cropX}:${cropY},fps=10,scale=500:-1:flags=lanczos`;
      } else {
        vf = `fps=10,scale=500:-1:flags=lanczos`;
      }

      setProgress('Génération du GIF…');
      await ffmpeg.exec([
        '-ss', String(startOffset),
        '-t', String(duration),
        '-i', 'input.mp4',
        '-vf', `${vf},split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        '-loop', '0',
        'output.gif'
      ]);

      setProgress('Finalisation…');
      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data as any], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      setGifUrl(url);
      toast.success('GIF généré avec succès !');
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur : ' + (err.message || 'Problème lors de la génération.'));
    } finally {
      setProcessing(false);
      setProgress('');
    }
  }, [file, startOffset, endOffset, completedCrop]);

  return (
    <div className="p-6 md:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border-2 border-slate-100 dark:border-slate-800">
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-primary-600 dark:text-primary-400">
          <ImageIcon className="w-6 h-6" />
        </div>
        Créateur de GIF — 100% Local (Aucune API)
      </h2>

      {!localVideoUrl ? (
        <div
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] p-16 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
          <Upload className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-5" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Sélectionnez une vidéo depuis votre PC</h3>
          <p className="text-sm text-slate-400 mt-2">MP4, WebM, MOV… La conversion se fait entièrement dans votre navigateur.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Panneau gauche : config */}
          <div className="space-y-5">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 overflow-hidden">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                1. Aperçu — Dessinez pour recadrer (optionnel)
              </p>
              <ReactCrop
                crop={crop}
                onChange={(_, pct) => setCrop(pct)}
                onComplete={(px) => setCompletedCrop(px)}
              >
                <video
                  ref={videoRef}
                  src={localVideoUrl}
                  className="max-h-[280px] w-full object-contain rounded-xl"
                  controls
                  controlsList="nodownload nofullscreen"
                />
              </ReactCrop>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                Dessinez un rectangle sur la vidéo pour recadrer (optionnel)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Début : <span className="text-primary-600">{startOffset}s</span>
                </p>
                <button
                  onClick={handleSetStart}
                  className="w-full py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 rounded-xl text-xs font-bold transition-colors"
                >
                  ▶ Fixer ici
                </button>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Fin : <span className="text-primary-600">{endOffset}s</span>
                </p>
                <button
                  onClick={handleSetEnd}
                  className="w-full py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 rounded-xl text-xs font-bold transition-colors"
                >
                  ⏹ Fixer ici
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setLocalVideoUrl(''); setFile(null); setGifUrl(''); }}
                className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Changer
              </button>
              <button
                onClick={generateGif}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all"
              >
                {processing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {progress || 'En cours…'}</>
                ) : (
                  '2. Générer le GIF'
                )}
              </button>
            </div>
          </div>

          {/* Panneau droit : résultat */}
          <div className="bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-6 flex flex-col items-center justify-center min-h-[400px]">
            {gifUrl ? (
              <div className="w-full space-y-5 text-center">
                <img src={gifUrl} alt="GIF généré" className="max-w-full max-h-[350px] mx-auto rounded-2xl shadow-lg object-contain" />
                <a
                  href={gifUrl}
                  download="produit.gif"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform text-sm"
                >
                  <Download className="w-5 h-5" />
                  Télécharger le GIF
                </a>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <ImageIcon className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium px-8">
                  Votre GIF apparaîtra ici. La génération se fait en local, sans aucune API.
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
