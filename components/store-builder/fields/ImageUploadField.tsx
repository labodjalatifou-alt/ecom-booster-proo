'use client'

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (val: string) => void
}

export default function ImageUploadField({ label, value, onChange }: ImageUploadFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        {value && (
          <img src={value} alt="Preview" className="w-10 h-10 object-cover rounded border border-gray-200 bg-gray-50" />
        )}
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="https://..."
          className="flex-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-1">Collez l'URL de votre image</p>
    </div>
  )
}
