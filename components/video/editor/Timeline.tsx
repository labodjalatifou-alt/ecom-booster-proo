"use client";

import React, { useRef, useCallback } from 'react';
import { useEditor, uid } from './useEditorStore';
import type { Clip } from './useEditorStore';

const TRACK_HEIGHT = 52;
const HEADER_WIDTH = 90;

const TRACK_COLORS: Record<string, string> = {
  video: 'bg-blue-500/80 border-blue-400',
  audio: 'bg-emerald-500/80 border-emerald-400',
  text:  'bg-violet-500/80 border-violet-400',
  image: 'bg-amber-500/80 border-amber-400',
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function Timeline() {
  const { state, dispatch } = useEditor();
  const timelineRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ clipId: string; startMouseX: number; origStartTime: number } | null>(null);

  const { zoom, currentTime, duration, tracks, clips } = state;

  const totalWidth = Math.max(duration * zoom + 200, 800);

  // ── Clic sur la timeline pour déplacer la tête de lecture ────────────────
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current) return;
    const rect = timelineRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - HEADER_WIDTH;
    if (x < 0) return;
    dispatch({ type: 'SET_CURRENT_TIME', time: x / zoom });
  }, [zoom, dispatch]);

  // ── Drag clip ────────────────────────────────────────────────────────────
  const startDrag = useCallback((e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    dragRef.current = { clipId: clip.id, startMouseX: e.clientX, origStartTime: clip.startTime };

    const onMove = (mv: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = (mv.clientX - dragRef.current.startMouseX) / zoom;
      const newStart = Math.max(0, dragRef.current.origStartTime + delta);
      dispatch({ type: 'UPDATE_CLIP', clipId: dragRef.current.clipId, changes: { startTime: newStart } });
    };

    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [zoom, dispatch]);

  // ── Trim (resize) right edge ─────────────────────────────────────────────
  const startTrimRight = useCallback((e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    const origDuration = clip.duration;
    const startMouseX = e.clientX;

    const onMove = (mv: MouseEvent) => {
      const delta = (mv.clientX - startMouseX) / zoom;
      const newDur = Math.max(0.5, origDuration + delta);
      dispatch({ type: 'UPDATE_CLIP', clipId: clip.id, changes: { duration: newDur } });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [zoom, dispatch]);

  // ── Ruler ticks ─────────────────────────────────────────────────────────
  const rulerTicks: number[] = [];
  const step = zoom >= 60 ? 1 : zoom >= 30 ? 2 : 5;
  for (let t = 0; t <= duration + 5; t += step) {
    rulerTicks.push(t);
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border-t-2 border-slate-700 select-none">

      {/* Barre de contrôle zoom */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-mono">{formatTime(currentTime)}</span>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[10px] text-slate-500">ZOOM</span>
          <button onClick={() => dispatch({ type: 'SET_ZOOM', zoom: zoom / 1.4 })}
            className="w-6 h-6 rounded text-slate-300 hover:bg-slate-700 text-sm font-bold flex items-center justify-center">−</button>
          <button onClick={() => dispatch({ type: 'SET_ZOOM', zoom: zoom * 1.4 })}
            className="w-6 h-6 rounded text-slate-300 hover:bg-slate-700 text-sm font-bold flex items-center justify-center">+</button>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-auto" style={{ overflowX: 'scroll' }}>
        <div style={{ width: `${totalWidth + HEADER_WIDTH}px`, minHeight: '100%' }}>

          {/* Ruler */}
          <div
            className="sticky top-0 z-10 bg-slate-800 border-b border-slate-700 flex"
            style={{ height: 28 }}
            onClick={handleTimelineClick}
            ref={timelineRef}
          >
            <div style={{ width: HEADER_WIDTH, minWidth: HEADER_WIDTH }} className="border-r border-slate-700" />
            <div className="relative flex-1">
              {rulerTicks.map(t => (
                <div
                  key={t}
                  className="absolute top-0 h-full flex flex-col items-center"
                  style={{ left: t * zoom }}
                >
                  <div className="w-px h-2 bg-slate-500 mt-1" />
                  <span className="text-[9px] text-slate-500 mt-0.5">{formatTime(t)}</span>
                </div>
              ))}
              {/* Scrubber */}
              <div
                className="absolute top-0 h-full w-0.5 bg-primary-500 z-20"
                style={{ left: currentTime * zoom }}
              >
                <div className="w-3 h-3 bg-primary-500 rounded-full -translate-x-1/2 -translate-y-0.5" />
              </div>
            </div>
          </div>

          {/* Pistes */}
          {tracks.map(track => {
            const trackClips = clips.filter(c => c.trackId === track.id);
            return (
              <div key={track.id} className="flex border-b border-slate-700/50" style={{ height: TRACK_HEIGHT }}>

                {/* En-tête piste */}
                <div
                  style={{ width: HEADER_WIDTH, minWidth: HEADER_WIDTH }}
                  className="flex items-center px-3 border-r border-slate-700 bg-slate-800/60"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{track.name}</span>
                </div>

                {/* Zone clips */}
                <div
                  className="relative flex-1"
                  onClick={handleTimelineClick}
                >
                  {/* Quadrillage */}
                  {rulerTicks.map(t => (
                    <div
                      key={t}
                      className="absolute top-0 h-full w-px bg-slate-700/30"
                      style={{ left: t * zoom }}
                    />
                  ))}

                  {/* Scrubber line */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-primary-500/60 z-10 pointer-events-none"
                    style={{ left: currentTime * zoom }}
                  />

                  {/* Clips */}
                  {trackClips.map(clip => {
                    const colorClass = TRACK_COLORS[clip.type] || 'bg-slate-500/80 border-slate-400';
                    const isSelected = state.selectedClipId === clip.id;
                    return (
                      <div
                        key={clip.id}
                        className={`absolute top-1.5 bottom-1.5 rounded-md border ${colorClass} ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''} cursor-grab active:cursor-grabbing overflow-hidden flex items-center px-2`}
                        style={{
                          left: clip.startTime * zoom,
                          width: Math.max(clip.duration * zoom, 4),
                        }}
                        onMouseDown={e => startDrag(e, clip)}
                        onClick={e => { e.stopPropagation(); dispatch({ type: 'SELECT_CLIP', clipId: clip.id }); }}
                      >
                        <span className="text-[10px] text-white font-semibold truncate pointer-events-none">
                          {clip.type === 'text' ? clip.textStyle?.text || 'Texte' : clip.name || clip.type}
                        </span>

                        {/* Poignée de trim droite */}
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/20 hover:bg-white/40 transition-colors"
                          onMouseDown={e => startTrimRight(e, clip)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
