'use client'
import SectionRenderer from '@/components/store-builder/SectionRenderer'
import type { BuilderPage, StoreColors, StoreFonts } from '@/lib/store-builder/types'

interface Props {
  storeId: string
  builderJson: BuilderPage
  colors: StoreColors
  fonts: StoreFonts
}

export default function PublicStoreClient({ storeId, builderJson, colors, fonts }: Props) {
  const sections = builderJson?.sections || []

  return (
    <main style={{ fontFamily: `'${fonts.body}', sans-serif`, backgroundColor: colors.bg }}>
      {sections.map(section => {
        if (!section.visible) return null
        return (
          <SectionRenderer
            key={section.id}
            section={section}
            colors={colors}
            storeId={storeId}
            isEditing={false}
            isSelected={false}
          />
        )
      })}
    </main>
  )
}
