'use client'

import { useState } from 'react'

interface VariantOption {
  name: string
  values: string[]
}

interface VariantSelectorProps {
  options: VariantOption[]
  onChange: (selections: Record<string, string>) => void
  themeSettings?: Record<string, any>
}

export default function VariantSelector({ options, onChange, themeSettings }: VariantSelectorProps) {
  const [selections, setSelections] = useState<Record<string, string>>({})

  if (!options?.length) return null

  const accent = themeSettings?.primaryColor || '#6366f1'

  const select = (group: string, value: string) => {
    const next = { ...selections, [group]: value }
    setSelections(next)
    onChange(next)
  }

  return (
    <div className="space-y-3 px-1">
      {options.map(group => (
        <div key={group.name}>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            {group.name}
            {selections[group.name] && (
              <span className="text-gray-400 font-normal normal-case ml-1">: {selections[group.name]}</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {group.values.map(value => {
              const active = selections[group.name] === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => select(group.name, value)}
                  className="relative px-4 py-2 text-sm rounded-lg border transition-all duration-150"
                  style={{
                    borderColor: active ? accent : '#e5e7eb',
                    background: active ? `${accent}15` : '#ffffff',
                    color: active ? accent : '#374151',
                    fontWeight: active ? 600 : 400,
                    boxShadow: active ? `0 0 0 1px ${accent}` : 'none',
                  }}
                >
                  {value}
                  {active && (
                    <svg className="inline-block ml-1.5 -mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}