'use client'
import { useState } from 'react'

interface ColorFieldProps {
  label: string
  value: string
  onChange: (val: string) => void
}

// Palette de couleurs prédéfinies (utilisable pour n'importe quel champ couleur).
// L'utilisateur peut soit cliquer une pastille, soit utiliser le sélecteur natif,
// soit taper un code hex directement.
const PALETTE = [
  '#000000', '#1f2937', '#374151', '#6b7280', '#9ca3af', '#ffffff',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#facc15', '#fde047',
  '#84cc16', '#22c55e', '#16a34a', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#2563eb', '#4f46e5', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#e11d48', '#be123c',
  '#7c2d12', '#92400e', '#854d0e', '#365314', '#064e3b', '#0c4a6e',
]

export default function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [showPalette, setShowPalette] = useState(false)

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        {/* Sélecteur natif (clic = ouvre palette OS) */}
        <div className="relative">
          <input
            type="color"
            value={value || '#000000'}
            onChange={e => onChange(e.target.value)}
            className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
          />
        </div>
        {/* Champ hex */}
        <input
          type="text"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
          className="flex-1 min-w-0 px-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono uppercase"
        />
        {/* Bouton palette */}
        <button
          type="button"
          onClick={() => setShowPalette(!showPalette)}
          className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${showPalette ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
          title="Palette de couleurs"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
          </svg>
        </button>
      </div>

      {/* Palette dépliable */}
      {showPalette && (
        <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-6 gap-1.5">
            {PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => { onChange(color); setShowPalette(false) }}
                className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 ${value?.toLowerCase() === color ? 'border-blue-500 ring-1 ring-blue-300' : 'border-white shadow-sm'}`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
