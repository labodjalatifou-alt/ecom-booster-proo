"use client";

import React, { useState } from 'react';
import { Trash2, Scissors, Type } from 'lucide-react';
import { useEditor } from './useEditorStore';
import type { Clip, TextStyle } from './useEditorStore';

export function PropertiesPanel() {
  const { state, dispatch } = useEditor();
  const selectedClip: Clip | undefined = state.clips.find(c => c.id === state.selectedClipId);

  if (!selectedClip) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
          <Type className="w-5 h-5 text-slate-500" />
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Sélectionnez un clip<br />pour modifier ses propriétés
        </p>
      </div>
    );
  }

  const update = (changes: Partial<Clip>) =>
    dispatch({ type: 'UPDATE_CLIP', clipId: selectedClip.id, changes });

  const updateText = (changes: Partial<TextStyle>) =>
    update({ textStyle: { ...selectedClip.textStyle!, ...changes } });

  const deleteClip = () => dispatch({ type: 'REMOVE_CLIP', clipId: selectedClip.id });
  const splitClip  = () => dispatch({ type: 'SPLIT_CLIP',  clipId: selectedClip.id });

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Propriétés</span>
        <span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded-full text-slate-300 font-semibold capitalize">
          {selectedClip.type}
        </span>
      </div>

      {/* Nom */}
      <div className="space-y-1">
        <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Nom</label>
        <p className="text-xs text-slate-300 font-medium truncate">
          {selectedClip.type === 'text' ? selectedClip.textStyle?.text || '(vide)' : selectedClip.name || selectedClip.id}
        </p>
      </div>

      {/* Timing */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Début</label>
          <input
            type="number" step="0.1" min="0"
            value={+selectedClip.startTime.toFixed(1)}
            onChange={e => update({ startTime: parseFloat(e.target.value) || 0 })}
            className="w-full bg-slate-800 text-slate-200 text-xs px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-primary-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Durée</label>
          <input
            type="number" step="0.1" min="0.1"
            value={+selectedClip.duration.toFixed(1)}
            onChange={e => update({ duration: parseFloat(e.target.value) || 1 })}
            className="w-full bg-slate-800 text-slate-200 text-xs px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Volume */}
      {(selectedClip.type === 'video' || selectedClip.type === 'audio') && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Volume</label>
            <span className="text-[10px] text-primary-400 font-mono">{Math.round(selectedClip.volume * 100)}%</span>
          </div>
          <input
            type="range" min="0" max="1" step="0.01"
            value={selectedClip.volume}
            onChange={e => update({ volume: parseFloat(e.target.value) })}
            className="w-full accent-primary-500"
          />
        </div>
      )}

      {/* Vitesse */}
      {(selectedClip.type === 'video' || selectedClip.type === 'audio') && (
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Vitesse</label>
          <div className="flex gap-1.5 flex-wrap">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
              <button
                key={s}
                onClick={() => update({ speed: s })}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                  selectedClip.speed === s
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Propriétés texte */}
      {selectedClip.type === 'text' && selectedClip.textStyle && (
        <div className="space-y-3 border-t border-slate-700 pt-3">
          <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold block">Texte</label>

          <textarea
            value={selectedClip.textStyle.text}
            onChange={e => updateText({ text: e.target.value })}
            rows={2}
            className="w-full bg-slate-800 text-slate-200 text-xs px-2 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-primary-500 resize-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Taille</label>
              <input
                type="number" min="12" max="120" step="2"
                value={selectedClip.textStyle.fontSize}
                onChange={e => updateText({ fontSize: parseInt(e.target.value) })}
                className="w-full bg-slate-800 text-slate-200 text-xs px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Gras</label>
              <button
                onClick={() => updateText({ bold: !selectedClip.textStyle!.bold })}
                className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedClip.textStyle.bold ? 'bg-primary-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                B
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Couleur texte</label>
              <input
                type="color"
                value={selectedClip.textStyle.color}
                onChange={e => updateText({ color: e.target.value })}
                className="w-full h-8 rounded-lg cursor-pointer border border-slate-700 bg-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Fond</label>
              <input
                type="color"
                value={selectedClip.textStyle.backgroundColor === 'transparent' ? '#000000' : selectedClip.textStyle.backgroundColor}
                onChange={e => updateText({ backgroundColor: e.target.value })}
                className="w-full h-8 rounded-lg cursor-pointer border border-slate-700 bg-slate-800"
              />
            </div>
          </div>

          {/* Position X/Y */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Position X</label>
              <span className="text-[10px] text-primary-400 font-mono">{Math.round(selectedClip.textStyle.x)}%</span>
            </div>
            <input
              type="range" min="0" max="100"
              value={selectedClip.textStyle.x}
              onChange={e => updateText({ x: parseInt(e.target.value) })}
              className="w-full accent-primary-500"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Position Y</label>
              <span className="text-[10px] text-primary-400 font-mono">{Math.round(selectedClip.textStyle.y)}%</span>
            </div>
            <input
              type="range" min="0" max="100"
              value={selectedClip.textStyle.y}
              onChange={e => updateText({ y: parseInt(e.target.value) })}
              className="w-full accent-primary-500"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => updateText({ backgroundColor: 'transparent' })}
              className="text-[10px] px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Fond transparent
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 border-t border-slate-700 pt-3 mt-auto">
        {selectedClip.type !== 'text' && (
          <button
            onClick={splitClip}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold text-slate-200 transition-colors"
          >
            <Scissors className="w-3.5 h-3.5" /> Couper à la tête de lecture
          </button>
        )}
        <button
          onClick={deleteClip}
          className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-xs font-bold text-red-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Supprimer
        </button>
      </div>
    </div>
  );
}
