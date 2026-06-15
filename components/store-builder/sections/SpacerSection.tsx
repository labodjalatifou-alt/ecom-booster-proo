'use client'
import type { SpacerProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: SpacerProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function SpacerSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        height: props.height || 48,
        backgroundColor: props.bg_color === 'transparent' ? 'transparent' : (props.bg_color || 'transparent'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Espaceur</span>}
      
      {isEditing && (
        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: colors.textLight }}>
          Espace : {props.height}px
        </span>
      )}

      {props.show_divider && !isEditing && (
        props.divider_style === 'wave' ? (
          <svg viewBox="0 0 1200 60" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <path d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z"
              fill={colors.border} opacity="0.5" />
          </svg>
        ) : props.divider_style === 'dots' ? (
          <div className="flex gap-2 items-center">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-full" style={{ width: i === 2 ? 10 : 6, height: i === 2 ? 10 : 6, backgroundColor: colors.border }} />
            ))}
          </div>
        ) : (
          <div className="w-full" style={{ height: 1, backgroundColor: colors.border }} />
        )
      )}
    </div>
  )
}
