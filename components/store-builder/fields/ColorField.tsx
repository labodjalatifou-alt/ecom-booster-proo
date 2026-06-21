'use client'

interface ColorFieldProps {
  label: string
  value: string
  onChange: (val: string) => void
}

export default function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input 
          type="color" 
          value={value || '#000000'} 
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" 
        />
        <input 
          type="text" 
          value={value || '#000000'} 
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono uppercase" 
        />
      </div>
    </div>
  )
}