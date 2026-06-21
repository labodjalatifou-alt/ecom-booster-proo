'use client'

interface TextFieldProps {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export default function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  )
}