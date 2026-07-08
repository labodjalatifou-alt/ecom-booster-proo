'use client'

import type { CSSProperties } from 'react'
import { Check, Gift, Zap } from 'lucide-react'
import { calcBundleTotal } from '@/lib/store-builder/form-presets'

export interface BundleItem {
  id: string
  qty: number
  label: string
  sublabel?: string
  badge?: string
  discount_pct?: number
  discount_fixed?: number
  popular?: boolean
  hidden?: boolean
  image?: string
  free_gift?: string
}

interface BundleOffersProps {
  bundles: BundleItem[]
  selectedId: string
  onSelect: (id: string) => void
  unitPrice: number
  currency: string
  colors: {
    selectedBg: string
    selectedBorder: string
    bg: string
    border: string
    badgeBg: string
    badgeText: string
    title: string
    subtitle: string
    price: string
    savings: string
    accent?: string
  }
  borderWidth?: number
  borderRadius?: number
  borderStyle?: string
  selectedBorderWidth?: number
  layout?: 'deals' | 'columns' | 'list' | 'premium' | 'compact'
  productImage?: string
}

function calcPrice(unit: number, qty: number, bundle: BundleItem) {
  return calcBundleTotal(unit, qty, bundle)
}

export default function BundleOffers({
  bundles,
  selectedId,
  onSelect,
  unitPrice,
  currency,
  colors,
  borderWidth = 2,
  borderRadius = 16,
  borderStyle = 'solid',
  selectedBorderWidth = 3,
  layout = 'deals',
  productImage,
}: BundleOffersProps) {
  const visible = bundles.filter(b => !b.hidden)
  if (!visible.length) return null

  const resolvedLayout = layout === 'premium' ? 'deals' : layout === 'compact' ? 'list' : layout
  const accent = colors.accent || colors.selectedBorder

  const cardStyle = (isSelected: boolean, extra?: CSSProperties): CSSProperties => ({
    background: isSelected
      ? `linear-gradient(135deg, ${colors.selectedBg} 0%, ${colors.bg} 100%)`
      : colors.bg,
    borderColor: isSelected ? colors.selectedBorder : colors.border,
    borderWidth: isSelected ? selectedBorderWidth : borderWidth,
    borderStyle: borderStyle as CSSProperties['borderStyle'],
    borderRadius,
    transform: isSelected ? 'scale(1.01)' : 'scale(1)',
    boxShadow: isSelected
      ? `0 8px 28px ${colors.selectedBorder}35, inset 0 0 0 1px ${colors.selectedBorder}25`
      : '0 2px 10px rgba(0,0,0,0.05)',
    transition: 'all 0.25s cubic-bezier(.2,.8,.2,1)',
    ...extra,
  })

  const Radio = ({ active }: { active: boolean }) => (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bundle-radio"
      style={{
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: active ? colors.selectedBorder : colors.border,
        background: active ? colors.selectedBorder : 'transparent',
        boxShadow: active ? `0 0 0 4px ${colors.selectedBorder}22` : 'none',
      }}
    >
      {active && <Check size={13} strokeWidth={3} color="#fff" />}
    </div>
  )

  const renderDeals = () => (
    <div className="flex flex-col gap-3">
      {visible.map((bundle, idx) => {
        const isSelected = selectedId === bundle.id
        const total = calcPrice(unitPrice, bundle.qty, bundle)
        const compare = unitPrice * bundle.qty
        const saved = compare - total
        const hasBadge = Boolean(bundle.badge?.trim())
        const img = bundle.image || productImage

        return (
          <div
            key={bundle.id}
            className="bundle-card-enter"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <button
              type="button"
              onClick={() => onSelect(bundle.id)}
              className="w-full text-left relative overflow-hidden"
              style={cardStyle(isSelected, { padding: hasBadge ? '18px 16px 16px' : '16px' })}
            >
              {isSelected && (
                <div
                  className="absolute inset-0 opacity-[0.07] pointer-events-none"
                  style={{ background: `linear-gradient(120deg, ${accent}, transparent 60%)` }}
                />
              )}
              {hasBadge && (
                <div
                  className="absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-wide rounded-bl-xl"
                  style={{ background: colors.badgeBg, color: colors.badgeText }}
                >
                  {bundle.badge}
                </div>
              )}
              <div className="flex items-center gap-3 relative">
                <Radio active={isSelected} />
                {img && (
                  <img src={img} alt="" className="w-14 h-14 rounded-xl object-cover border-2 flex-shrink-0 shadow-sm" style={{ borderColor: isSelected ? colors.selectedBorder : colors.border }} />
                )}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="font-black text-[15px]" style={{ color: colors.title }}>{bundle.label}</div>
                  {bundle.sublabel && (
                    <p className="text-[12px] mt-0.5 leading-snug" style={{ color: colors.subtitle }}>{bundle.sublabel}</p>
                  )}
                  {bundle.free_gift && (
                    <p className="text-[11px] mt-1 font-bold flex items-center gap-1" style={{ color: accent }}>
                      <Gift size={11} /> {bundle.free_gift}
                    </p>
                  )}
                  {saved > 0 && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: `${colors.savings}18`, color: colors.savings }}>
                      <Zap size={10} /> −{saved.toLocaleString('fr-FR')} {currency}
                    </span>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {saved > 0 && (
                    <div className="text-[11px] line-through mb-0.5" style={{ color: colors.subtitle }}>
                      {compare.toLocaleString('fr-FR')}
                    </div>
                  )}
                  <div className="font-black text-lg leading-none" style={{ color: colors.price }}>
                    {total.toLocaleString('fr-FR')}
                  </div>
                  <div className="text-[9px] font-bold mt-0.5 uppercase" style={{ color: colors.subtitle }}>{currency}</div>
                </div>
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )

  const renderList = () => (
    <div className="flex flex-col gap-2">
      {visible.map((bundle) => {
        const isSelected = selectedId === bundle.id
        const total = calcPrice(unitPrice, bundle.qty, bundle)
        return (
          <button key={bundle.id} type="button" onClick={() => onSelect(bundle.id)} className="w-full text-left" style={cardStyle(isSelected, { padding: '14px 16px' })}>
            <div className="flex items-center gap-3">
              <Radio active={isSelected} />
              <span className="font-bold text-sm flex-1" style={{ color: colors.title }}>{bundle.label}</span>
              <span className="font-black" style={{ color: colors.price }}>{total.toLocaleString('fr-FR')} {currency}</span>
            </div>
          </button>
        )
      })}
    </div>
  )

  const renderColumns = () => (
    <div className={`grid gap-3 ${visible.length >= 3 ? 'grid-cols-1 @sm:grid-cols-3' : 'grid-cols-2'}`}>
      {visible.map((bundle) => {
        const isSelected = selectedId === bundle.id
        const total = calcPrice(unitPrice, bundle.qty, bundle)
        const compare = unitPrice * bundle.qty
        const saved = compare - total
        const img = bundle.image || productImage
        return (
          <button key={bundle.id} type="button" onClick={() => onSelect(bundle.id)} className="w-full text-left flex flex-col" style={cardStyle(isSelected, { padding: 14, minHeight: 160 })}>
            {img && <img src={img} alt="" className="w-full h-16 object-cover rounded-lg mb-2 border" style={{ borderColor: colors.border }} />}
            <div className="font-black text-sm text-center mb-1" style={{ color: colors.title }}>{bundle.label}</div>
            {saved > 0 && <div className="text-[10px] font-bold text-center text-green-600 mb-1">Promo active</div>}
            <div className="mt-auto text-center font-black text-lg" style={{ color: colors.price }}>{total.toLocaleString('fr-FR')} {currency}</div>
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="mb-4">
      {resolvedLayout === 'columns' ? renderColumns() : resolvedLayout === 'list' ? renderList() : renderDeals()}
      <style>{`
        @keyframes bundleSlideIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .bundle-card-enter { animation: bundleSlideIn 0.4s ease both; }
        .bundle-radio { transition: box-shadow 0.2s, transform 0.2s; }
      `}</style>
    </div>
  )
}
