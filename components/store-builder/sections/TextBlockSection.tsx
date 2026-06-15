'use client'

import type { TextBlockProps, StoreColors, StoreFonts } from '@/lib/store-builder/types'

interface Props {
  data: TextBlockProps
  colors: StoreColors
  fonts: StoreFonts
}

export default function TextBlockSection({ data, colors, fonts }: Props) {
  return (
    <section style={{ backgroundColor: data.bg_color || colors.bg, padding: '64px 24px', textAlign: data.text_align }}>
      <div
        className="mx-auto"
        style={{
          maxWidth: data.max_width || 720,
          color: data.text_color || colors.text,
          fontFamily: fonts.body,
          fontSize: 18,
          lineHeight: 1.85,
        }}
        dangerouslySetInnerHTML={{ __html: (data.content || '').replace(/\n/g, '<br/>') }}
      />
    </section>
  )
}
