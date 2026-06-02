"use client";

import React, { useRef, useState } from 'react';
import { Film, Music, Image as ImageIcon, Type, Scissors, Download, Loader2, Plus } from 'lucide-react';
import { useEditor, uid } from './useEditorStore';
import type { Clip } from './useEditorStore';
import toast from 'react-hot-toast';

export function Toolbar() {
  const { state, dispatch } = useEditor();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);

  // ── Import vidéo ──────────────────────────────────────────────────────────
  const handleVideoImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      const duration = tempVideo.duration;
      // Trouver la piste vidéo
      const videoTrack = state.tracks.find(t => t.type === 'video');
      if (!videoTrack) return;

      // Calculer startTime (après le dernier clip sur cette piste)
      const trackClips = state.clips.filter(c => c.trackId === videoTrack.id);
      const lastEnd = trackClips.length
        ? Math.max(...trackClips.map(c => c.startTime + c.duration))
        : 0;

      const clip: Clip = {
        id: uid(),
        type: 'video',
        trackId: videoTrack.id,
        startTime: lastEnd,
        duration,
        sourceOffset: 0,
        file,
        url,
        name: file.name,
        volume: 1,
        speed: 1,
      };
      dispatch({ type: 'ADD_CLIP', clip });
      toast.success(`Vidéo ajoutée : ${file.name}`);
    };
    e.target.value = '';
  };

  // ── Import audio ──────────────────────────────────────────────────────────
  const handleAudioImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const tempAudio = document.createElement('audio');
    tempAudio.src = url;
    tempAudio.onloadedmetadata = () => {
      const audioTrack = state.tracks.find(t => t.type === 'audio');
      if (!audioTrack) return;

      const trackClips = state.clips.filter(c => c.trackId === audioTrack.id);
      const lastEnd = trackClips.length
        ? Math.max(...trackClips.map(c => c.startTime + c.duration))
        : 0;

      const clip: Clip = {
        id: uid(),
        type: 'audio',
        trackId: audioTrack.id,
        startTime: lastEnd,
        duration: tempAudio.duration,
        sourceOffset: 0,
        file,
        url,
        name: file.name,
        volume: 1,
        speed: 1,
      };
      dispatch({ type: 'ADD_CLIP', clip });
      toast.success(`Audio ajouté : ${file.name}`);
    };
    e.target.value = '';
  };

  // ── Import image ──────────────────────────────────────────────────────────
  const handleImageImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    // Trouver ou créer une piste image
    let imageTrack = state.tracks.find(t => t.id === 'image-1');
    if (!imageTrack) {
      imageTrack = { id: 'image-1', type: 'video', name: 'Images' };
      dispatch({ type: 'ADD_TRACK', track: imageTrack });
    }

    const trackClips = state.clips.filter(c => c.trackId === imageTrack!.id);
    const lastEnd = trackClips.length
      ? Math.max(...trackClips.map(c => c.startTime + c.duration))
      : 0;

    const clip: Clip = {
      id: uid(),
      type: 'image',
      trackId: imageTrack.id,
      startTime: lastEnd,
      duration: 5,
      sourceOffset: 0,
      file,
      url,
      name: file.name,
      volume: 0,
      speed: 1,
    };
    dispatch({ type: 'ADD_CLIP', clip });
    toast.success(`Image ajoutée : ${file.name}`);
    e.target.value = '';
  };

  // ── Ajouter texte ─────────────────────────────────────────────────────────
  const handleAddText = () => {
    const textTrack = state.tracks.find(t => t.type === 'text');
    if (!textTrack) return;

    const clip: Clip = {
      id: uid(),
      type: 'text',
      trackId: textTrack.id,
      startTime: state.currentTime,
      duration: 3,
      sourceOffset: 0,
      volume: 0,
      speed: 1,
      textStyle: {
        text: 'Nouveau texte',
        fontSize: 48,
        color: '#ffffff',
        backgroundColor: '#00000099',
        bold: false,
        x: 50,
        y: 80,
      },
    };
    dispatch({ type: 'ADD_CLIP', clip });
    dispatch({ type: 'SELECT_CLIP', clipId: clip.id });
    toast.success('Texte ajouté — modifiez-le dans le panneau de droite');
  };

  // ── Couper ────────────────────────────────────────────────────────────────
  const handleSplit = () => {
    if (!state.selectedClipId) {
      toast.error('Sélectionnez un clip à couper');
      return;
    }
    dispatch({ type: 'SPLIT_CLIP', clipId: state.selectedClipId });
    toast.success('Clip coupé !');
  };

  // ── Export MP4 ────────────────────────────────────────────────────────────
  const handleExport = async () => {
    const videoClips = state.clips.filter(c => c.type === 'video' && c.file);
    if (videoClips.length === 0) {
      toast.error('Ajoutez au moins une vidéo avant d\'exporter');
      return;
    }

    setExporting(true);
    const toastId = toast.loading('Préparation de l\'export…');

    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

      const ffmpeg = new FFmpeg();
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      toast.loading('Traitement vidéo…', { id: toastId });

      // On traite la première vidéo clip pour commencer
      // (export complet multi-clip = très complexe, on fait le premier clip)
      const clip = videoClips[0];
      const ext = clip.file!.name.split('.').pop() || 'mp4';
      const inputData = await fetchFile(clip.file!);
      await ffmpeg.writeFile(`input.${ext}`, inputData);

      const args = [
        '-i', `input.${ext}`,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'fast',
      ];

      // Appliquer la vitesse
      if (clip.speed !== 1) {
        args.push('-filter:v', `setpts=${1/clip.speed}*PTS`);
      }

      // Appliquer le volume
      if (clip.volume !== 1) {
        args.push('-filter:a', `volume=${clip.volume}`);
      }

      args.push('output.mp4');

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data as any], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'montage-video.mp4';
      a.click();

      toast.success('Export terminé ! Vidéo téléchargée.', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur lors de l\'export : ' + (err.message || 'Erreur inconnue'), { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border-b-2 border-slate-700">
      {/* Inputs cachés */}
      <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={handleVideoImport} />
      <input type="file" ref={audioInputRef} accept="audio/*" className="hidden" onChange={handleAudioImport} />
      <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageImport} />

      {/* Logo */}
      <div className="flex items-center gap-2 mr-3 pr-3 border-r border-slate-700">
        <Film className="w-5 h-5 text-primary-400" />
        <span className="text-sm font-black text-white">EcomEditor</span>
      </div>

      {/* Boutons import */}
      <button
        onClick={() => videoInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-colors"
      >
        <Film className="w-3.5 h-3.5 text-blue-400" /> Vidéo
      </button>

      <button
        onClick={() => audioInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-colors"
      >
        <Music className="w-3.5 h-3.5 text-emerald-400" /> Audio
      </button>

      <button
        onClick={() => imageInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-colors"
      >
        <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Image
      </button>

      <button
        onClick={handleAddText}
        className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-colors"
      >
        <Type className="w-3.5 h-3.5 text-violet-400" /> Texte
      </button>

      <div className="w-px h-6 bg-slate-700 mx-1" />

      <button
        onClick={handleSplit}
        className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-colors"
        title="Couper le clip sélectionné à la tête de lecture"
      >
        <Scissors className="w-3.5 h-3.5 text-rose-400" /> Couper
      </button>

      {/* Export */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-primary-500/20"
      >
        {exporting
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Export en cours…</>
          : <><Download className="w-3.5 h-3.5" /> Exporter MP4</>
        }
      </button>
    </div>
  );
}
