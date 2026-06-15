'use client'

import { Plus, Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react'
import { SECTIONS_CATALOG } from '@/lib/store-builder/defaults'
import type { BuilderSection, SectionType } from '@/lib/store-builder/types'

interface SectionPanelProps {
  sections: BuilderSection[]
  activeSectionId: string | null
  onSelectSection: (sectionId: string) => void
  onAddSection: (type: SectionType) => void
  onToggleVisibility: (sectionId: string) => void
  onRemoveSection: (sectionId: string) => void
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void
}

export default function SectionPanel({
  sections,
  activeSectionId,
  onSelectSection,
  onAddSection,
  onToggleVisibility,
  onRemoveSection,
  onMoveSection,
}: SectionPanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Structure de page</h3>
        <p className="mt-2 text-sm text-gray-500">Organisez les sections de votre boutique et ajoutez de nouveaux blocs.</p>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={`group w-full rounded-3xl border p-4 text-left transition ${activeSectionId === section.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 capitalize">{section.type.replace('_', ' ')}</p>
                <p className="text-xs text-gray-500">{section.visible ? 'Visible' : 'Masquée'}</p>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onToggleVisibility(section.id) }}
                  className="rounded-full p-2 hover:bg-gray-100"
                  aria-label="Basculer visibilité"
                >
                  {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onRemoveSection(section.id) }}
                  className="rounded-full p-2 hover:bg-gray-100 text-red-500"
                  aria-label="Supprimer section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>Position {index + 1}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onMoveSection(section.id, 'up') }}
                  className="rounded-full p-1 hover:bg-gray-100"
                  aria-label="Monter"
                >
                  <GripVertical className="w-4 h-4 rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onMoveSection(section.id, 'down') }}
                  className="rounded-full p-1 hover:bg-gray-100"
                  aria-label="Descendre"
                >
                  <GripVertical className="w-4 h-4 -rotate-90" />
                </button>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Ajouter un bloc</p>
            <p className="text-xs text-gray-500">Choisissez un bloc pour enrichir votre page.</p>
          </div>
          <Plus className="h-5 w-5 text-indigo-600" />
        </div>

        <div className="grid gap-3">
          {SECTIONS_CATALOG.map(item => (
            <button
              key={item.type}
              type="button"
              onClick={() => onAddSection(item.type)}
              className="rounded-2xl border border-gray-200 bg-white px-3 py-3 text-left text-sm text-gray-700 hover:border-gray-300 hover:bg-white/95"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700">+</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
