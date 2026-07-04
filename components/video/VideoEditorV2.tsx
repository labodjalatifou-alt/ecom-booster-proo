"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, Upload, Scissors, Type, Volume2, VolumeX,
  Plus, Trash2, ChevronLeft, ChevronRight, Move, Download,
  Film, Sparkles, X, Bold, AlignCenter, Palette
} from 'lucide-react';

interface Clip {
  id: string;
  file: File;
  url: string;
  duration: number;
  name: string;
  startAt: number; // timeline position in seconds
  trimStart: number;
  trimEnd: number;
}

interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  fontSize: number;
  color: string;
  position: 'top' | 'center' | 'bottom';
  bold: boolean;
  animation: 'fade' | 'slide' | 'bounce' | 'none';
}

const COLORS = ['#FFFFFF', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
const FONT_SIZES = [24, 32, 42, 56, 72];
const ANIMATIONS = ['none', 'fade', 'slide', 'bounce'] as const;

export default function VideoEditorV2() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedPanel, setSelectedPanel] = useState<'clips' | 'text' | 'export'>('clips');
  const [editingOverlay, setEditingOverlay] = useState<TextOverlay | null>(null);
  const [dragOverClipId, setDragOverClipId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Current clip being played
  const currentClip = clips[currentClipIndex];

  // Load clip into video element
  useEffect(() => {
    if (videoRef.current && currentClip) {
      videoRef.current.src = currentClip.url;
      videoRef.current.currentTime = currentClip.trimStart;
      if (isPlaying) videoRef.current.play().catch(() => {});
    }
  }, [currentClipIndex, currentClip]);

  // Time update handler
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !currentClip) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);
    // Auto-advance to next clip at trimEnd
    if (t >= currentClip.trimEnd) {
      if (currentClipIndex < clips.length - 1) {
        setCurrentClipIndex(i => i + 1);
      } else {
        setIsPlaying(false);
        videoRef.current.pause();
      }
    }
  }, [currentClip, currentClipIndex, clips.length]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [handleTimeUpdate]);

  // Add video files
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverClipId(null);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
    addFiles(files);
  }, []);

  const addFiles = (files: File[]) => {
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        const newClip: Clip = {
          id: crypto.randomUUID(),
          file,
          url,
          duration: video.duration,
          name: file.name,
          startAt: clips.reduce((sum, c) => sum + (c.trimEnd - c.trimStart), 0),
          trimStart: 0,
          trimEnd: video.duration,
        };
        setClips(prev => [...prev, newClip]);
      };
    });
  };

  const removeClip = (id: string) => {
    setClips(prev => prev.filter(c => c.id !== id));
    setCurrentClipIndex(0);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      id: crypto.randomUUID(),
      text: 'Votre texte ici',
      startTime: currentTime,
      duration: 3,
      fontSize: 42,
      color: '#FFFFFF',
      position: 'center',
      bold: true,
      animation: 'fade',
    };
    setOverlays(prev => [...prev, newOverlay]);
    setEditingOverlay(newOverlay);
    setSelectedPanel('text');
  };

  const updateOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setOverlays(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    if (editingOverlay?.id === id) {
      setEditingOverlay(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const removeOverlay = (id: string) => {
    setOverlays(prev => prev.filter(o => o.id !== id));
    if (editingOverlay?.id === id) setEditingOverlay(null);
  };

  // Active overlays at current time
  const activeOverlays = overlays.filter(o => {
    const clipStart = clips.slice(0, currentClipIndex).reduce((s, c) => s + (c.trimEnd - c.trimStart), 0);
    const relativeTime = currentTime - clips[currentClipIndex]?.trimStart + clipStart;
    return relativeTime >= o.startTime && relativeTime <= o.startTime + o.duration;
  });

  const totalDuration = clips.reduce((sum, c) => sum + (c.trimEnd - c.trimStart), 0);

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-600 rounded-xl">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">EcomCut — Éditeur Vidéo</h1>
            <p className="text-[10px] text-slate-400 font-bold">V1 · {clips.length} clip{clips.length !== 1 ? 's' : ''} · {Math.round(totalDuration)}s</p>
          </div>
        </div>
        <button
          onClick={() => alert('Export disponible en V2 — Pour l\'instant, téléchargez vos clips originaux via le bouton de chaque clip.')}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Download className="w-4 h-4" /> Exporter
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden shrink-0">

          {/* Panel tabs */}
          <div className="flex border-b border-slate-800">
            {(['clips', 'text', 'export'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedPanel(tab)}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${selectedPanel === tab ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tab === 'clips' ? '🎬 Clips' : tab === 'text' ? '✍️ Texte' : '📤 Export'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {/* CLIPS PANEL */}
            {selectedPanel === 'clips' && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-primary-500 hover:text-primary-400 transition-all text-xs font-black uppercase tracking-widest"
                >
                  <Plus className="w-4 h-4" /> Ajouter une vidéo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={e => e.target.files && addFiles(Array.from(e.target.files))}
                />

                {clips.length === 0 ? (
                  <div
                    onDrop={handleFileDrop}
                    onDragOver={e => e.preventDefault()}
                    className="py-16 text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl"
                  >
                    <Film className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-bold">Glissez vos vidéos ici</p>
                    <p className="text-[10px] opacity-60 mt-1">MP4, MOV, WebM</p>
                  </div>
                ) : (
                  clips.map((clip, idx) => (
                    <div
                      key={clip.id}
                      onClick={() => setCurrentClipIndex(idx)}
                      className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${idx === currentClipIndex ? 'border-primary-500 shadow-lg shadow-primary-500/20' : 'border-slate-800 hover:border-slate-600'}`}
                    >
                      <video src={clip.url} className="w-full h-20 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex flex-col justify-end">
                        <p className="text-[10px] font-black truncate">{clip.name}</p>
                        <p className="text-[9px] text-slate-400">{Math.round(clip.trimEnd - clip.trimStart)}s</p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); removeClip(clip.id); }}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {idx === currentClipIndex && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary-500 rounded text-[9px] font-black">EN COURS</div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}

            {/* TEXT PANEL */}
            {selectedPanel === 'text' && (
              <>
                <button
                  onClick={addTextOverlay}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  <Type className="w-4 h-4" /> Ajouter du texte
                </button>

                {overlays.map(overlay => (
                  <div
                    key={overlay.id}
                    onClick={() => setEditingOverlay(overlay)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${editingOverlay?.id === overlay.id ? 'border-primary-500' : 'border-slate-800 hover:border-slate-600'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-black truncate">{overlay.text}</p>
                      <button onClick={e => { e.stopPropagation(); removeOverlay(overlay.id); }} className="p-1 hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400">{overlay.startTime.toFixed(1)}s → {(overlay.startTime + overlay.duration).toFixed(1)}s</p>
                  </div>
                ))}

                {/* Edit overlay */}
                {editingOverlay && (
                  <div className="bg-slate-800 rounded-xl p-4 space-y-4 border border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Éditer</p>

                    <textarea
                      value={editingOverlay.text}
                      onChange={e => updateOverlay(editingOverlay.id, { text: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-bold resize-none text-white focus:outline-none focus:border-primary-500"
                      rows={2}
                    />

                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Position</p>
                      <div className="grid grid-cols-3 gap-1">
                        {(['top', 'center', 'bottom'] as const).map(pos => (
                          <button
                            key={pos}
                            onClick={() => updateOverlay(editingOverlay.id, { position: pos })}
                            className={`py-1.5 rounded-lg text-[10px] font-black capitalize transition-colors ${editingOverlay.position === pos ? 'bg-primary-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-700'}`}
                          >
                            {pos === 'top' ? 'Haut' : pos === 'center' ? 'Centre' : 'Bas'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Couleur</p>
                      <div className="flex gap-2 flex-wrap">
                        {COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => updateOverlay(editingOverlay.id, { color })}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${editingOverlay.color === color ? 'border-primary-400 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Taille</p>
                      <div className="flex gap-1">
                        {FONT_SIZES.map(size => (
                          <button
                            key={size}
                            onClick={() => updateOverlay(editingOverlay.id, { fontSize: size })}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-colors ${editingOverlay.fontSize === size ? 'bg-primary-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-700'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Animation</p>
                      <div className="grid grid-cols-2 gap-1">
                        {ANIMATIONS.map(anim => (
                          <button
                            key={anim}
                            onClick={() => updateOverlay(editingOverlay.id, { animation: anim })}
                            className={`py-1.5 rounded-lg text-[10px] font-black capitalize transition-colors ${editingOverlay.animation === anim ? 'bg-primary-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-700'}`}
                          >
                            {anim === 'none' ? 'Aucune' : anim === 'fade' ? 'Fondu' : anim === 'slide' ? 'Glisser' : 'Rebond'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Début (s)</p>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={editingOverlay.startTime}
                          onChange={e => updateOverlay(editingOverlay.id, { startTime: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Durée (s)</p>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={editingOverlay.duration}
                          onChange={e => updateOverlay(editingOverlay.id, { duration: parseFloat(e.target.value) || 1 })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingOverlay.bold}
                        onChange={e => updateOverlay(editingOverlay.id, { bold: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs font-bold text-slate-300">Gras</span>
                    </label>
                  </div>
                )}
              </>
            )}

            {/* EXPORT PANEL */}
            {selectedPanel === 'export' && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-900/30 border border-amber-700/50 rounded-xl">
                  <p className="text-xs font-black text-amber-400 mb-2">⚠️ Export V1</p>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    L'export vidéo avec rendu ffmpeg arrive en V2. Pour l'instant vous pouvez télécharger chaque clip individuellement.
                  </p>
                </div>

                {clips.map((clip, i) => (
                  <div key={clip.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black truncate">{clip.name}</p>
                      <p className="text-[10px] text-slate-400">{Math.round(clip.trimEnd - clip.trimStart)}s</p>
                    </div>
                    <a
                      href={clip.url}
                      download={clip.name}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <Download className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CENTER — VIDEO PREVIEW */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Video area */}
          <div
            className="flex-1 relative bg-black flex items-center justify-center overflow-hidden"
            onDrop={handleFileDrop}
            onDragOver={e => e.preventDefault()}
          >
            {clips.length === 0 ? (
              <div className="text-center text-slate-600">
                <Film className="w-20 h-20 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-black text-slate-500">Ajoutez des clips pour commencer</p>
                <p className="text-sm text-slate-600 mt-2">Glissez-déposez vos vidéos ou utilisez le panneau gauche</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  muted={isMuted}
                  className="max-h-full max-w-full object-contain"
                  onEnded={() => {
                    if (currentClipIndex < clips.length - 1) {
                      setCurrentClipIndex(i => i + 1);
                    } else {
                      setIsPlaying(false);
                    }
                  }}
                />

                {/* Text overlays rendered on top */}
                {activeOverlays.map(overlay => (
                  <div
                    key={overlay.id}
                    className={`absolute left-0 right-0 flex justify-center px-8 pointer-events-none
                      ${overlay.position === 'top' ? 'top-8' : overlay.position === 'bottom' ? 'bottom-16' : 'top-1/2 -translate-y-1/2'}
                      ${overlay.animation === 'fade' ? 'animate-in fade-in duration-500' : overlay.animation === 'slide' ? 'animate-in slide-in-from-bottom-4 duration-500' : overlay.animation === 'bounce' ? 'animate-bounce' : ''}
                    `}
                    style={{
                      fontSize: overlay.fontSize,
                      color: overlay.color,
                      fontWeight: overlay.bold ? '900' : '400',
                      textShadow: '2px 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7)',
                      textAlign: 'center',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                    }}
                  >
                    {overlay.text}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* CONTROLS */}
          <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentClipIndex(Math.max(0, currentClipIndex - 1))}
                disabled={currentClipIndex === 0}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                disabled={clips.length === 0}
                className="w-12 h-12 bg-primary-600 hover:bg-primary-700 disabled:opacity-30 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-primary-500/30 active:scale-95"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>

              <button
                onClick={() => setCurrentClipIndex(Math.min(clips.length - 1, currentClipIndex + 1))}
                disabled={currentClipIndex >= clips.length - 1}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={addTextOverlay}
                disabled={clips.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                <Type className="w-4 h-4" /> Texte
              </button>

              <div className="flex-1 text-right">
                <span className="text-[10px] font-black text-slate-500">
                  {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
                </span>
              </div>
            </div>

            {/* TIMELINE */}
            {clips.length > 0 && (
              <div ref={timelineRef} className="mt-4 overflow-x-auto pb-2">
                <div className="flex gap-1 min-w-max">
                  {clips.map((clip, idx) => {
                    const clipDuration = clip.trimEnd - clip.trimStart;
                    const widthPx = Math.max(60, clipDuration * 30);
                    return (
                      <div
                        key={clip.id}
                        onClick={() => setCurrentClipIndex(idx)}
                        className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all shrink-0 group ${idx === currentClipIndex ? 'border-primary-500' : 'border-slate-700 hover:border-slate-500'}`}
                        style={{ width: widthPx, height: 48 }}
                      >
                        <video src={clip.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-[9px] font-black text-white drop-shadow truncate px-1">
                            {clip.name.split('.')[0].slice(0, 12)}
                          </span>
                        </div>
                        {/* Trim indicator */}
                        {idx === currentClipIndex && (
                          <div
                            className="absolute top-0 bottom-0 left-0 bg-primary-500/30 border-r-2 border-primary-400"
                            style={{ width: `${((currentTime - clip.trimStart) / clipDuration) * 100}%` }}
                          />
                        )}
                      </div>
                    );
                  })}
                  {/* Overlay markers */}
                  {overlays.map(overlay => (
                    <div
                      key={overlay.id}
                      className="absolute top-0 h-full w-1 bg-yellow-400 opacity-70"
                      style={{ left: overlay.startTime * 30 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
