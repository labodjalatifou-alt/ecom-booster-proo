'use client'

import Link from 'next/link'
import { ArrowLeft, Monitor, Smartphone, Save } from 'lucide-react'

interface ToolbarProps {
  storeName: string
  storeId: string
  previewMode: 'desktop' | 'mobile'
  onPreviewModeChange: (mode: 'desktop' | 'mobile') => void
  onSave: () => void
  saving: boolean
  saved: boolean
}

export default function Toolbar({
  storeName,
  storeId,
  previewMode,
  onPreviewModeChange,
  onSave,
  saving,
  saved
}: ToolbarProps) {
  return (
    <div className="h-[52px] w-full bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-20">
      
      {/* Left */}
      <div className="flex items-center gap-4">
        <Link 
          href="/boutiques"
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Boutiques</span>
        </Link>
        <div className="w-px h-4 bg-gray-300"></div>
        <span className="text-sm font-semibold text-gray-500 truncate max-w-[200px]">
          {storeName}
        </span>
      </div>

      {/* Center - View Toggles */}
      <div className="flex items-center bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => onPreviewModeChange('desktop')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            previewMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Monitor size={16} />
        </button>
        <button
          onClick={() => onPreviewModeChange('mobile')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            previewMode === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Smartphone size={16} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className={`w-2 h-2 rounded-full ${saved ? 'bg-green-500' : 'bg-orange-500'}`}></span>
          <span className={saved ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
            {saved ? '✓ Sauvegardé' : '● Non sauvegardé'}
          </span>
        </div>
        <button
          onClick={onSave}
          disabled={saving || saved}
          className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save size={16} />
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

    </div>
  )
}
