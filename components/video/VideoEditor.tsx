"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Film, Upload, Download, Loader2, Scissors, RotateCcw, Play, Square } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VideoEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [outputUrl, setOutputUrl] = useState('');
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
    const url = URL.createObjectURL(selected);
    setFile(selected);
    setLocalVideoUrl(url);
    setOutputUrl('');
    setStartTime(0);
    setEndTime(0);
  };

  const handleLoadedMetadata = () => {
    const duration = videoRef.current?.duration ?? 0;
    setVideoDuration(Math.floor(duration));
    setEndTime(Math.floor(duration));
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSetStart = () => {
    const t = Math.floor(videoRef.current?.currentTime ?? 0);
    setStartTime(t);
    if (t >= endTime) setEndTime(Math.min(t + 5, videoDuration));
    toast.success(`Début défini : ${formatTime(t)}`);
  };

  const handleSetEnd = () => {
    const t = Math.floor(videoRef.current?.currentTime ?? 0);
    if (t <= startTime) {
      toast.error('La fin doit être après le début !');
      return;
    }
    setEndTime(t);
    toast.success(`Fin définie : ${formatTime(t)}`);
  };

  const processVideo = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setOutputUrl('');

    try {
      setProgress('Chargement de FFmpeg…');
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

      const ffmpeg = new FFmpeg();

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      setProgress('Lecture de la vidéo…');
      const inputData = await fetchFile(file);

      // Determine extension
      const ext = file.name.split('.').pop() || 'mp4';
      await ffmpeg.writeFile(`input.${ext}`, inputData);

      const duration = endTime - startTime;

      setProgress('Traitement de la vidéo…');
      await ffmpeg.exec([
        '-ss', String(startTime),
        '-t', String(duration),
        '-i', `input.${ext}`,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'fast',
        'output.mp4'
      ]);

      setProgress('Finalisation…');
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data as any], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      toast.success('Vidéo traitée avec succès !');
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur : ' + (err.message || 'Problème lors du traitement.'));
    } finally {
      setProcessing(false);
      setProgress('');
    }
  }, [file, startTime, endTime]);

  const handleReset = () => {
    setFile(null);
    setLocalVideoUrl('');
    setOutputUrl('');
    setStartTime(0);
    setEndTime(0);
    setVideoDuration(0);
  };

  return (
    <div className="p-6 md:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border-2 border-slate-100 dark:border-slate-800">
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-primary-600 dark:text-primary-400">
          <Film className="w-6 h-6" />
        </div>
        Montage Vidéo — 100% Local (Aucune API)
      </h2>

      {!localVideoUrl ? (
        <div
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] p-16 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) {
              const input = fileInputRef.current;
              if (input) {
                const dt = new DataTransfer();
                dt.items.add(f);
                input.files = dt.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          }}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
          <Upload className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-5" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Glissez ou sélectionnez une vidéo</h3>
          <p className="text-sm text-slate-400 mt-2">MP4, WebM, MOV… Le traitement se fait entièrement dans votre navigateur.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Panneau gauche : vidéo + contrôles */}
          <div className="space-y-5">

            {/* Lecteur vidéo */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                1. Aperçu de la vidéo originale
              </p>
              <video
                ref={videoRef}
                src={localVideoUrl}
                className="w-full max-h-[300px] object-contain rounded-xl bg-black"
                controls
                onLoadedMetadata={handleLoadedMetadata}
              />
              {videoDuration > 0 && (
                <p className="text-center text-xs text-slate-400 mt-2 font-medium">
                  Durée totale : {formatTime(videoDuration)}
                </p>
              )}
            </div>

            {/* Sélection du segment */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                2. Sélectionner le segment à garder
              </p>

              {/* Barre de sélection visuelle */}
              <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                {videoDuration > 0 && (
                  <div
                    className="absolute h-full bg-primary-500 rounded-full"
                    style={{
                      left: `${(startTime / videoDuration) * 100}%`,
                      width: `${((endTime - startTime) / videoDuration) * 100}%`
                    }}
                  />
                )}
              </div>

              <div className="flex gap-3 text-sm font-bold text-slate-600 dark:text-slate-300 justify-between">
                <span>Début : <span className="text-primary-600">{formatTime(startTime)}</span></span>
                <span>Durée sélectionnée : <span className="text-primary-600">{formatTime(endTime - startTime)}</span></span>
                <span>Fin : <span className="text-primary-600">{formatTime(endTime)}</span></span>
              </div>

              {/* Boutons Fixer */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSetStart}
                  className="flex items-center justify-center gap-2 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 rounded-xl text-xs font-bold transition-colors"
                >
                  <Play className="w-3.5 h-3.5" /> Fixer le début ici
                </button>
                <button
                  onClick={handleSetEnd}
                  className="flex items-center justify-center gap-2 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 rounded-xl text-xs font-bold transition-colors"
                >
                  <Square className="w-3.5 h-3.5" /> Fixer la fin ici
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Changer
              </button>
              <button
                onClick={processVideo}
                disabled={processing || endTime <= startTime}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all"
              >
                {processing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {progress || 'Traitement…'}</>
                ) : (
                  <><Scissors className="w-4 h-4" /> 3. Découper & Exporter</>
                )}
              </button>
            </div>
          </div>

          {/* Panneau droit : résultat */}
          <div className="bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-6 flex flex-col items-center justify-center min-h-[400px]">
            {outputUrl ? (
              <div className="w-full space-y-5 text-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Résultat</p>
                <video
                  src={outputUrl}
                  className="w-full max-h-[300px] object-contain rounded-2xl shadow-lg bg-black"
                  controls
                />
                <a
                  href={outputUrl}
                  download="video-editee.mp4"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform text-sm"
                >
                  <Download className="w-5 h-5" />
                  Télécharger le MP4
                </a>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Film className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium px-8">
                  Votre vidéo découpée apparaîtra ici.<br />
                  Le traitement se fait en local, sans aucune API ni connexion externe.
                </p>
                <div className="text-xs text-slate-300 dark:text-slate-600 space-y-1">
                  <p>📌 Lancez la vidéo, puis cliquez :</p>
                  <p><strong>"Fixer le début ici"</strong> → au moment voulu</p>
                  <p><strong>"Fixer la fin ici"</strong> → au moment voulu</p>
                  <p>Puis <strong>"Découper & Exporter"</strong></p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
