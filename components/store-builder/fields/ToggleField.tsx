'use client'

interface ToggleFieldProps {
  label: string
  value: boolean
  onChange: (val: boolean) => void
}

export default function ToggleField({ label, value, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <button 
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}