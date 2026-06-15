'use client'

import type { SpacerProps, StoreColors, StoreFonts } from '@/lib/store-builder/types'

interface Props {
  data: SpacerProps
  colors: StoreColors
  fonts: StoreFonts
}

export default function SpacerSection({ data }: Props) {
  return (
    <div
      style={{
        height: data.height || 48,
        backgroundColor: data.bg_color === 'transparent' ? 'transparent' : (data.bg_color || 'transparent'),
      }}
    />
  )
}
