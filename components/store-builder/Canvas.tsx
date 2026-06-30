'use client'

import React from 'react'
import type { EditorData, EditorBlock } from './Editor'
import { renderBlock } from '@/lib/store-builder/renderBlock'
import { getLandingPageStyles } from '@/lib/store-builder/landing-theme'
import ThemeLogoBar from '@/components/store-builder/sections/ThemeLogoBar'

interface CanvasProps {
  data: EditorData
  selectedBlockId: string | null
  previewMode: 'desktop' | 'mobile'
  onSelectBlock: (id: string) => void
  products?: any[]
  selectedProductId?: string | null
  onProductChange?: (id: string) => void
  themeSettings?: Record<string, any>
}

export default function Canvas({
  data,
  selectedBlockId,
  previewMode,
  onSelectBlock,
  products,
  selectedProductId,
  onProductChange,
  themeSettings,
}: CanvasProps) {
  const product = selectedProductId
    ? products?.find((p) => p.id === selectedProductId) || products?.[0]
    : products?.[0] || null

  const ts = themeSettings || {}
  const styles = getLandingPageStyles(ts)
  const cardBg = ts.surface || '#ffffff'

  const BlockWrapper = ({ block, children }: { block: EditorBlock; children: React.ReactNode }) => {
    if (block.hidden) return null
    const isSelected = selectedBlockId === block.id
    return (
      <div
        className={`relative group cursor-pointer transition-all ${
          isSelected
            ? 'outline outline-2 outline-indigo-500 outline-offset-[-2px] z-10'
            : 'hover:outline hover:outline-1 hover:outline-indigo-300 hover:outline-offset-[-1px]'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          onSelectBlock(block.id)
        }}
      >
        <div
          className={`absolute top-0 left-0 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-md z-50 transition-opacity pointer-events-none ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {block.title}
        </div>
        {children}
      </div>
    )
  }

  const renderWrapped = (block: EditorBlock) => (
    <BlockWrapper key={block.id} block={block}>
      {renderBlock(block, product, undefined, ts)}
    </BlockWrapper>
  )

  if (!product) {
    return (
      <div className="flex-1 min-h-0 min-w-0 bg-[#eceef1] flex items-center justify-center p-8" onClick={() => onSelectBlock('')}>
        <div className="bg-white p-10 rounded-3xl shadow-sm text-center max-w-md w-full" onClick={(e) => e.stopPropagation()}>
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Aucun produit trouvé</h2>
          <p className="text-gray-500 text-sm mb-6">Créez d&apos;abord un produit pour prévisualiser votre boutique.</p>
          <a href="/produits/ajouter" className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition">
            + Créer un produit
          </a>
        </div>
      </div>
    )
  }

  const landingPreview = (
    <div style={{ ...styles.outer, ...styles.cssVars, minHeight: '100%' }}>
      <div style={styles.card}>
        {!data.header.some(b => b.type === 'Header' || b.type === 'header') && ts.logo_url?.trim() && (
          <ThemeLogoBar logoUrl={ts.logo_url} logoHeight={ts.logo_height} bgColor={ts.surface} />
        )}
        {data.header.map((block) => renderWrapped(block))}
        <main style={{ maxWidth: 720, width: '100%', margin: '0 auto', background: cardBg }}>
          {data.template.map((block) => renderWrapped(block))}
        </main>
        {data.footer.map((block) => renderWrapped(block))}
      </div>
    </div>
  )

  return (
    <div
      className="flex-1 min-h-0 min-w-0 bg-[#e9ebef] overflow-y-auto overflow-x-hidden"
      onClick={() => onSelectBlock('')}
    >
      <div className="sticky top-0 z-20 bg-[#e9ebef]/90 backdrop-blur px-4 py-3 border-b border-gray-200/60 flex justify-center">
        {products && products.length > 0 && onProductChange && (
          <div
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Produit affiché :</span>
            <div className="relative">
              <select
                value={selectedProductId || products[0]?.id || ''}
                onChange={(e) => onProductChange(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-lg pl-3 pr-8 py-1.5 outline-none hover:bg-gray-100 cursor-pointer focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              >
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.title || p.name || 'Produit sans titre'}
                  </option>
                ))}
              </select>
              <svg className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center items-start px-4 py-6 min-h-0" onClick={(e) => e.stopPropagation()}>
        {previewMode === 'mobile' ? (
          <div
            className="relative flex-shrink-0 mx-auto shadow-xl"
            style={{
              width: 393,
              height: 'min(852px, calc(100vh - 100px))',
              borderRadius: 20,
              border: '3px solid #1a1a1a',
              overflow: 'hidden',
              background: styles.outer.background,
            }}
          >
            <div className="h-full overflow-y-auto overflow-x-hidden">{landingPreview}</div>
          </div>
        ) : (
          <div className="w-full max-w-[1100px]">{landingPreview}</div>
        )}
      </div>
    </div>
  )
}
