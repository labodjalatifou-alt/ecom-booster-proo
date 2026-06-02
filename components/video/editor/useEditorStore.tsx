"use client";

import React, { createContext, useContext, useReducer, Dispatch } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ClipType = 'video' | 'audio' | 'image' | 'text';

export interface TextStyle {
  text: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  bold: boolean;
  x: number; // 0–100 % du canvas
  y: number;
}

export interface Clip {
  id: string;
  type: ClipType;
  trackId: string;
  startTime: number;
  duration: number;
  sourceOffset: number;
  file?: File;
  url?: string;
  name?: string;
  volume: number;
  speed: number;
  textStyle?: TextStyle;
}

export interface Track {
  id: string;
  type: 'video' | 'audio' | 'text';
  name: string;
}

export interface EditorState {
  tracks: Track[];
  clips: Clip[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  zoom: number;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export type EditorAction =
  | { type: 'ADD_CLIP'; clip: Clip }
  | { type: 'REMOVE_CLIP'; clipId: string }
  | { type: 'UPDATE_CLIP'; clipId: string; changes: Partial<Clip> }
  | { type: 'SET_CURRENT_TIME'; time: number }
  | { type: 'SET_PLAYING'; playing: boolean }
  | { type: 'SELECT_CLIP'; clipId: string | null }
  | { type: 'SPLIT_CLIP'; clipId: string }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'ADD_TRACK'; track: Track }
  | { type: 'SET_DURATION'; duration: number };

// ─── Initial state ────────────────────────────────────────────────────────────

const DEFAULT_TRACKS: Track[] = [
  { id: 'video-1', type: 'video', name: 'Vidéo 1' },
  { id: 'audio-1', type: 'audio', name: 'Audio' },
  { id: 'text-1',  type: 'text',  name: 'Texte' },
];

export const initialEditorState: EditorState = {
  tracks: DEFAULT_TRACKS,
  clips: [],
  currentTime: 0,
  duration: 60,
  isPlaying: false,
  selectedClipId: null,
  zoom: 80,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {

    case 'ADD_CLIP': {
      const clips = [...state.clips, action.clip];
      const maxEnd = clips.reduce((m, c) => Math.max(m, c.startTime + c.duration), state.duration);
      return { ...state, clips, duration: maxEnd };
    }

    case 'REMOVE_CLIP':
      return {
        ...state,
        clips: state.clips.filter(c => c.id !== action.clipId),
        selectedClipId: state.selectedClipId === action.clipId ? null : state.selectedClipId,
      };

    case 'UPDATE_CLIP':
      return {
        ...state,
        clips: state.clips.map(c => c.id === action.clipId ? { ...c, ...action.changes } : c),
      };

    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: Math.max(0, Math.min(action.time, state.duration)) };

    case 'SET_PLAYING':
      return { ...state, isPlaying: action.playing };

    case 'SELECT_CLIP':
      return { ...state, selectedClipId: action.clipId };

    case 'SPLIT_CLIP': {
      const clip = state.clips.find(c => c.id === action.clipId);
      if (!clip) return state;
      const at = state.currentTime;
      if (at <= clip.startTime || at >= clip.startTime + clip.duration) return state;
      const before: Clip = { ...clip, id: `${clip.id}-A`, duration: at - clip.startTime };
      const after: Clip = {
        ...clip,
        id: `${clip.id}-B`,
        startTime: at,
        duration: clip.duration - (at - clip.startTime),
        sourceOffset: clip.sourceOffset + (at - clip.startTime),
      };
      return { ...state, clips: state.clips.filter(c => c.id !== action.clipId).concat(before, after) };
    }

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(20, Math.min(300, action.zoom)) };

    case 'ADD_TRACK':
      return { ...state, tracks: [...state.tracks, action.track] };

    case 'SET_DURATION':
      return { ...state, duration: Math.max(action.duration, 10) };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface EditorContextValue {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);
  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within EditorProvider');
  return ctx;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
export const uid = () => Math.random().toString(36).slice(2, 9);
