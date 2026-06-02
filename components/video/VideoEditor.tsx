"use client";

import React, { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { EditorProvider, useEditor } from './editor/useEditorStore';
import { Preview } from './editor/Preview';
import { Timeline } from './editor/Timeline';
import { PropertiesPanel } from './editor/PropertiesPanel';
import { Toolbar } from './editor/Toolbar';

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 10);
  return `${m}:${sec.toString().padStart(2, '0')}.${ms}`;
}

function EditorInner() {
  const { state, dispatch } = useEditor();
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const togglePlay = () => dispatch({ type: 'SET_PLAYING', playing: !state.isPlaying });
  const goToStart  = () => { dispatch({ type: 'SET_PLAYING', playing: false }); dispatch({ type: 'SET_CURRENT_TIME', time: 0 }); };
  const stepBack   = () => dispatch({ type: 'SET_CURRENT_TIME', time: state.currentTime - 1/30 });
  const stepForward= () => dispatch({ type: 'SET_CURRENT_TIME', time: state.currentTime + 1/30 });

  return (
    <div
      className="flex flex-col bg-slate-900 text-white"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <Toolbar />

      {/* ── Zone centrale : Aperçu + Propriétés ────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Aperçu vidéo */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 flex items-center justify-center bg-black overflow-hidden min-h-0 p-3">
            <Preview videoRefs={videoRefs} audioRefs={audioRefs} />
          </div>

          {/* Barre de transport */}
          <div className="flex items-center gap-3 px-6 py-3 bg-slate-800 border-t border-slate-700">
            <button onClick={goToStart} className="text-slate-400 hover:text-white transition-colors" title="Retour au début">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={stepBack} className="text-slate-400 hover:text-white transition-colors" title="Image précédente">
              <SkipBack className="w-3 h-3" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95"
            >
              {state.isPlaying
                ? <Pause className="w-4 h-4 text-white" />
                : <Play  className="w-4 h-4 text-white ml-0.5" />
              }
            </button>

            <button onClick={stepForward} className="text-slate-400 hover:text-white transition-colors" title="Image suivante">
              <SkipForward className="w-3 h-3" />
            </button>

            {/* Progress bar */}
            <div className="flex-1 mx-2">
              <input
                type="range"
                min="0"
                max={state.duration}
                step="0.01"
                value={state.currentTime}
                onChange={e => {
                  dispatch({ type: 'SET_PLAYING', playing: false });
                  dispatch({ type: 'SET_CURRENT_TIME', time: parseFloat(e.target.value) });
                }}
                className="w-full accent-primary-500 h-1.5"
              />
            </div>

            {/* Timecode */}
            <span className="text-xs font-mono text-slate-300 tabular-nums min-w-[90px] text-right">
              {formatTime(state.currentTime)} / {formatTime(state.duration)}
            </span>

            {/* Volume global */}
            <div className="flex items-center gap-1.5 ml-2">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="range" min="0" max="1" step="0.01"
                defaultValue="1"
                className="w-16 accent-primary-500 h-1.5"
                onChange={e => {
                  // Sync all video elements volume
                  Object.values(videoRefs.current).forEach(v => v.volume = parseFloat(e.target.value));
                  Object.values(audioRefs.current).forEach(a => a.volume = parseFloat(e.target.value));
                }}
              />
            </div>
          </div>
        </div>

        {/* Panneau propriétés */}
        <div className="w-56 border-l border-slate-700 bg-slate-900 overflow-hidden flex flex-col">
          <PropertiesPanel />
        </div>
      </div>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <div className="h-44 border-t-2 border-slate-700 flex-shrink-0">
        <Timeline />
      </div>
    </div>
  );
}

export default function VideoEditor() {
  return (
    <EditorProvider>
      <EditorInner />
    </EditorProvider>
  );
}
