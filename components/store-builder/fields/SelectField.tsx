'use client'

interface SelectFieldProps {
  label: string
  value: string
  onChange: (val: string) => void
  options: string[]
}

export default function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}