'use client'

interface TextareaFieldProps {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  rows?: number
}

export default function TextareaField({ label, value, onChange, placeholder, rows = 3 }: TextareaFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-y"
      />
    </div>
  )
}