'use client'

interface SliderFieldProps {
  label: string
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
}

export default function SliderField({ label, value, onChange, min = 0, max = 100 }: SliderFieldProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
        <span className="text-xs font-mono text-gray-600">{value}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value ?? min}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-blue-600" 
      />
    </div>
  )
}