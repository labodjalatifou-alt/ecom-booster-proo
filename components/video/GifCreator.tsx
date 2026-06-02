"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Image as ImageIcon, Upload, Download, Loader2, Play, Square, RotateCcw, Crop, RefreshCw } from 'lucide-react';
import ReactCrop, { type Crop as CropType, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import toast from 'react-hot-toast';

// ── Phases ────────────────────────────────────────────────────────────────────
type Phase = 'upload' | 'trim' | 'generating' | 'result';

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function GifCreator() {
  // Phases
  const [phase, setPhase] = useState<Phase>('upload');

  // Vidéo source
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);

  // Sélection temporelle
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime]     = useState(5);

  // Génération
  const [progress, setProgress] = useState('');

  // Résultat
  const [gifUrl, setGifUrl]   = useState('');
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);

  // Crop sur le GIF généré
  const [crop, setCrop]               = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [cropping, setCropping]       = useState(false);
  const [croppedGifUrl, setCroppedGifUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const gifImgRef    = useRef<HTMLImageElement>(null);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) { toast.error('Fichier vidéo requis.'); return; }
    const url = URL.createObjectURL(f);
    setFile(f);
    setVideoUrl(url);
    setStartTime(0);
    setEndTime(5);
    setGifUrl('');
    setCroppedGifUrl('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setPhase('trim');
    e.target.value = '';
  };

  // ── Trim controls ─────────────────────────────────────────────────────────
  const setStart = () => {
    const t = videoRef.current?.currentTime ?? 0;
    setStartTime(t);
    if (t >= endTime) setEndTime(Math.min(t + 3, videoDuration));
    toast.success(`Début : ${formatTime(t)}`);
  };

  const setEnd = () => {
    const t = videoRef.current?.currentTime ?? 0;
    if (t <= startTime) { toast.error('La fin doit être après le début !'); return; }
    setEndTime(t);
    toast.success(`Fin : ${formatTime(t)}`);
  };

  // ── Génération GIF ────────────────────────────────────────────────────────
  const generateGif = useCallback(async (cropParams?: { w: number; h: number; x: number; y: number }) => {
    if (!file) return;

    if (cropParams) {
      setCropping(true);
    } else {
      setPhase('generating');
      setProgress('Chargement de FFmpeg…');
    }

    try {
      const { FFmpeg }               = await import('@ffmpeg/ffmpeg');
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util');
      const ffmpeg = new FFmpeg();

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`,   'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      if (!cropParams) setProgress('Lecture de la vidéo…');

      const ext  = file.name.split('.').pop() || 'mp4';
      const data = await fetchFile(file);
      await ffmpeg.writeFile(`input.${ext}`, data);

      const duration = endTime - startTime;

      // Filtre vidéo
      let vf = 'fps=10,scale=500:-1:flags=lanczos';
      if (cropParams) {
        const { w, h, x, y } = cropParams;
        vf = `crop=${w}:${h}:${x}:${y},fps=10,scale=500:-1:flags=lanczos`;
      }

      if (!cropParams) setProgress('Génération du GIF…');

      await ffmpeg.exec([
        '-ss', String(startTime),
        '-t',  String(duration),
        '-i',  `input.${ext}`,
        '-vf', `${vf},split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        '-loop', '0',
        'output.gif',
      ]);

      if (!cropParams) setProgress('Finalisation…');

      const out  = await ffmpeg.readFile('output.gif');
      const blob = new Blob([out as any], { type: 'image/gif' });
      const url  = URL.createObjectURL(blob);

      if (cropParams) {
        setCroppedGifUrl(url);
        toast.success('Recadrage appliqué !');
      } else {
        setGifBlob(blob);
        setGifUrl(url);
        setCroppedGifUrl('');
        setCrop(undefined);
        setCompletedCrop(undefined);
        setPhase('result');
        toast.success('GIF généré avec succès !');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur : ' + (err.message || 'Problème lors de la génération.'));
      if (!cropParams) setPhase('trim');
    } finally {
      if (cropParams) setCropping(false);
      setProgress('');
    }
  }, [file, startTime, endTime]);

  // ── Appliquer le crop sur le GIF ─────────────────────────────────────────
  const applyCrop = useCallback(() => {
    if (!completedCrop || !gifImgRef.current) return;

    const img    = gifImgRef.current;
    const scaleX = img.naturalWidth  / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;

    const w = Math.round(completedCrop.width  * scaleX);
    const h = Math.round(completedCrop.height * scaleY);
    const x = Math.round(completedCrop.x      * scaleX);
    const y = Math.round(completedCrop.y      * scaleY);

    generateGif({ w, h, x, y });
  }, [completedCrop, generateGif]);

  // ── URL finale à afficher ─────────────────────────────────────────────────
  const displayUrl = croppedGifUrl || gifUrl;

  // ── Segment progress bar ──────────────────────────────────────────────────
  const segmentLeft  = videoDuration > 0 ? (startTime / videoDuration) * 100 : 0;
  const segmentWidth = videoDuration > 0 ? ((endTime - startTime) / videoDuration) * 100 : 0;

  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-6 md:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border-2 border-slate-100 dark:border-slate-800">

      {/* En-tête */}
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-primary-600 dark:text-primary-400">
          <ImageIcon className="w-6 h-6" />
        </div>
        Créateur de GIF — 100% Local
      </h2>

      {/* ── PHASE : UPLOAD ────────────────────────────────────────────────── */}
      {phase === 'upload' && (
        <div
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] p-16 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (!f) return;
            const dt = new DataTransfer();
            dt.items.add(f);
            if (fileInputRef.current) {
              fileInputRef.current.files = dt.files;
              fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
          <Upload className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-5" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Glissez ou sélectionnez une vidéo</h3>
          <p className="text-sm text-slate-400 mt-2">MP4, WebM, MOV… La conversion se fait entièrement dans votre navigateur.</p>
        </div>
      )}

      {/* ── PHASE : TRIM ──────────────────────────────────────────────────── */}
      {phase === 'trim' && (
        <div className="space-y-6">

          {/* Lecteur vidéo */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 border border-slate-100 dark:border-slate-700">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              Étape 1 — Jouez la vidéo et choisissez votre séquence
            </p>
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full max-h-[340px] object-contain rounded-xl bg-black"
              controls
              onLoadedMetadata={() => {
                const dur = videoRef.current?.duration ?? 0;
                setVideoDuration(dur);
                setEndTime(Math.min(5, dur));
              }}
            />
          </div>

          {/* Barre visuelle de sélection */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>0:00</span>
              <span>{formatTime(videoDuration)}</span>
            </div>
            <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-primary-500 rounded-full transition-all"
                style={{ left: `${segmentLeft}%`, width: `${segmentWidth}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-primary-600">
              <span>Début : {formatTime(startTime)}</span>
              <span>Durée : {formatTime(endTime - startTime)}</span>
              <span>Fin : {formatTime(endTime)}</span>
            </div>
          </div>

          {/* Boutons fixer + générer */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={setStart}
              className="flex items-center justify-center gap-2 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 rounded-2xl text-sm font-bold transition-colors border-2 border-slate-200 dark:border-slate-700"
            >
              <Play className="w-4 h-4" /> Fixer le début ici
            </button>
            <button
              onClick={setEnd}
              className="flex items-center justify-center gap-2 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 rounded-2xl text-sm font-bold transition-colors border-2 border-slate-200 dark:border-slate-700"
            >
              <Square className="w-4 h-4" /> Fixer la fin ici
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setPhase('upload'); setFile(null); setVideoUrl(''); }}
              className="flex items-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Changer
            </button>
            <button
              onClick={() => generateGif()}
              disabled={endTime <= startTime}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all"
            >
              <ImageIcon className="w-4 h-4" />
              Étape 2 — Générer le GIF
            </button>
          </div>
        </div>
      )}

      {/* ── PHASE : GENERATING ────────────────────────────────────────────── */}
      {phase === 'generating' && (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800 dark:text-white">{progress || 'Traitement en cours…'}</p>
            <p className="text-sm text-slate-400 mt-1">FFmpeg travaille dans votre navigateur</p>
          </div>
        </div>
      )}

      {/* ── PHASE : RÉSULTAT ──────────────────────────────────────────────── */}
      {phase === 'result' && (
        <div className="space-y-8">

          {/* GIF avec outil de crop */}
          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-3xl p-5 border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              Étape 3 — Dessinez pour recadrer votre GIF (optionnel)
            </p>

            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(_, pct) => setCrop(pct)}
                onComplete={px => setCompletedCrop(px)}
                ruleOfThirds
              >
                {/* On affiche le GIF final (ou rognÃ©) */}
                <img
                  ref={gifImgRef}
                  src={displayUrl}
                  alt="GIF généré"
                  className="max-w-full max-h-[400px] object-contain rounded-xl"
                />
              </ReactCrop>
            </div>

            <p className="text-center text-[11px] text-slate-400 mt-3">
              Dessinez un rectangle sur le GIF pour le recadrer, puis cliquez "Appliquer le recadrage"
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { setPhase('trim'); }}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Recommencer
            </button>

            <button
              onClick={applyCrop}
              disabled={!completedCrop || cropping}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all"
            >
              {cropping
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Recadrage…</>
                : <><Crop className="w-4 h-4" /> Appliquer le recadrage</>
              }
            </button>

            <a
              href={displayUrl}
              download={croppedGifUrl ? 'produit-recadre.gif' : 'produit.gif'}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:scale-105 transition-transform text-sm"
            >
              <Download className="w-5 h-5" />
              Télécharger le GIF
            </a>
          </div>

          {croppedGifUrl && (
            <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              ✅ GIF recadré — prêt au téléchargement !
            </p>
          )}
        </div>
      )}
    </div>
  );
}
