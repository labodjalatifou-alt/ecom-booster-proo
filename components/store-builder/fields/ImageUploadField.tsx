'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react'

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (val: string) => void
}

export default function ImageUploadField({ label, value, onChange }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) {
        return
      }

      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('store-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from('store-images').getPublicUrl(fileName)
      
      onChange(data.publicUrl)
    } catch (error: any) {
      console.error('Erreur upload:', error)
      alert('Erreur lors du téléchargement de l\'image: ' + error.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</label>
      
      <div className="space-y-3">
        {/* Preview Area */}
        {value ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
            <img src={value} alt="Aperçu" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                title="Remplacer"
              >
                <Upload size={16} />
              </button>
              <button 
                onClick={() => onChange('')}
                className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-sm"
                title="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-500 transition-colors"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin text-blue-500" />
                <span className="text-sm font-medium text-gray-500">Téléchargement...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon size={28} />
                <span className="text-sm font-medium">Cliquez pour ajouter une image</span>
              </div>
            )}
          </div>
        )}

        {/* Hidden Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*"
          disabled={uploading}
          className="hidden"
        />

        {/* Manual URL Input fallback */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder="Ou collez l'URL de l'image..."
            className="flex-1 w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  )
}
