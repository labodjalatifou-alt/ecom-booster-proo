"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { useEditor } from './useEditorStore';
import type { Clip } from './useEditorStore';

interface PreviewProps {
  videoRefs: React.MutableRefObject<Record<string, HTMLVideoElement>>;
  audioRefs: React.MutableRefObject<Record<string, HTMLAudioElement>>;
}

export function Preview({ videoRefs, audioRefs }: PreviewProps) {
  const { state, dispatch } = useEditor();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Cherche le clip vidéo actif à currentTime
  const activeVideoClip: Clip | undefined = state.clips.find(c =>
    c.type === 'video' &&
    c.startTime <= state.currentTime &&
    c.startTime + c.duration > state.currentTime
  );

  // Clips texte actifs
  const activeTextClips = state.clips.filter(c =>
    c.type === 'text' &&
    c.startTime <= state.currentTime &&
    c.startTime + c.duration > state.currentTime
  );

  // Clips image actifs
  const activeImageClips = state.clips.filter(c =>
    c.type === 'image' &&
    c.startTime <= state.currentTime &&
    c.startTime + c.duration > state.currentTime
  );

  // Dessiner le canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner la vidéo
    if (activeVideoClip) {
      const video = videoRefs.current[activeVideoClip.id];
      if (video && video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    }

    // Dessiner les images overlay
    activeImageClips.forEach(clip => {
      if (!clip.url) return;
      const img = new Image();
      img.src = clip.url;
      if (img.complete) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    });

    // Dessiner les textes overlay
    activeTextClips.forEach(clip => {
      if (!clip.textStyle) return;
      const { text, fontSize, color, backgroundColor, bold, x, y } = clip.textStyle;
      if (!text) return;
      const px = (x / 100) * canvas.width;
      const py = (y / 100) * canvas.height;

      ctx.font = `${bold ? 'bold ' : ''}${fontSize}px Inter, Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const metrics = ctx.measureText(text);
      const tw = metrics.width;
      const th = fontSize * 1.4;
      const pad = 12;

      if (backgroundColor && backgroundColor !== 'transparent') {
        const rx = px - tw / 2 - pad;
        const ry = py - th / 2 - pad / 2;
        const rw = tw + pad * 2;
        const rh = th + pad;
        const r = 8;
        ctx.fillStyle = backgroundColor;
        ctx.beginPath();
        ctx.moveTo(rx + r, ry);
        ctx.lineTo(rx + rw - r, ry);
        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
        ctx.lineTo(rx + rw, ry + rh - r);
        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
        ctx.lineTo(rx + r, ry + rh);
        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
        ctx.lineTo(rx, ry + r);
        ctx.quadraticCurveTo(rx, ry, rx + r, ry);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = color;
      ctx.fillText(text, px, py);
    });
  }, [activeVideoClip, activeTextClips, activeImageClips, videoRefs]);

  // Loop de lecture
  useEffect(() => {
    if (!state.isPlaying) {
      cancelAnimationFrame(rafRef.current);
      draw();
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const newTime = state.currentTime + delta;
      if (newTime >= state.duration) {
        dispatch({ type: 'SET_PLAYING', playing: false });
        dispatch({ type: 'SET_CURRENT_TIME', time: 0 });
        return;
      }

      dispatch({ type: 'SET_CURRENT_TIME', time: newTime });
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isPlaying]);

  // Redessiner quand currentTime change (hors lecture)
  useEffect(() => {
    if (!state.isPlaying) draw();
  }, [state.currentTime, state.isPlaying, draw]);

  // Sync vidéo avec currentTime
  useEffect(() => {
    if (!activeVideoClip) return;
    const video = videoRefs.current[activeVideoClip.id];
    if (!video) return;
    const target = (state.currentTime - activeVideoClip.startTime) / activeVideoClip.speed + activeVideoClip.sourceOffset;
    if (!state.isPlaying && Math.abs(video.currentTime - target) > 0.05) {
      video.currentTime = target;
    }
    video.volume = activeVideoClip.volume;
    video.playbackRate = activeVideoClip.speed;
    if (state.isPlaying) { video.play().catch(() => {}); }
    else { video.pause(); }
  }, [state.currentTime, state.isPlaying, activeVideoClip, videoRefs]);

  // Sync audio
  useEffect(() => {
    state.clips.filter(c => c.type === 'audio').forEach(clip => {
      const audio = audioRefs.current[clip.id];
      if (!audio) return;
      const isActive = clip.startTime <= state.currentTime && clip.startTime + clip.duration > state.currentTime;
      audio.volume = clip.volume;
      audio.playbackRate = clip.speed;
      if (state.isPlaying && isActive) { audio.play().catch(() => {}); }
      else { audio.pause(); }
    });
  }, [state.currentTime, state.isPlaying, state.clips, audioRefs]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-xl">
      {/* Éléments cachés vidéo */}
      {state.clips.filter(c => c.type === 'video' && c.url).map(clip => (
        <video
          key={clip.id}
          ref={el => { if (el) videoRefs.current[clip.id] = el; }}
          src={clip.url}
          className="hidden"
          playsInline
          preload="auto"
        />
      ))}

      {/* Éléments cachés audio */}
      {state.clips.filter(c => c.type === 'audio' && c.url).map(clip => (
        <audio
          key={clip.id}
          ref={el => { if (el) audioRefs.current[clip.id] = el; }}
          src={clip.url}
          preload="auto"
        />
      ))}

      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="max-w-full max-h-full object-contain"
      />

      {state.clips.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500 pointer-events-none">
          <span className="text-5xl">🎬</span>
          <p className="text-sm font-medium">Importez une vidéo pour commencer</p>
        </div>
      )}
    </div>
  );
}
