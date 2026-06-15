'use client'

import type { BuilderSection, StoreColors, StoreFonts } from '@/lib/store-builder/types'
import type {
  HeroProps,
  CountdownProps,
  OrderFormProps,
  TestimonialsProps,
  BenefitsProps,
  GalleryProps,
  FaqProps,
  BadgeTrustProps,
  VideoProps,
  TextBlockProps,
  SpacerProps,
  FooterProps,
} from '@/lib/store-builder/types'

import HeroSection from './sections/HeroSection'
import CountdownSection from './sections/CountdownSection'
import OrderFormSection from './sections/OrderFormSection'
import TestimonialsSection from './sections/TestimonialsSection'
import BenefitsSection from './sections/BenefitsSection'
import GallerySection from './sections/GallerySection'
import FaqSection from './sections/FaqSection'
import BadgeTrustSection from './sections/BadgeTrustSection'
import VideoSection from './sections/VideoSection'
import TextBlockSection from './sections/TextBlockSection'
import SpacerSection from './sections/SpacerSection'
import FooterSection from './sections/FooterSection'

interface Props {
  section: BuilderSection
  colors: StoreColors
  fonts: StoreFonts
  storeId?: string
}

export default function SectionRenderer({ section, colors, fonts, storeId }: Props) {
  if (!section.visible) return null

  switch (section.type) {
    case 'hero':
      return <HeroSection data={section.props as HeroProps} colors={colors} fonts={fonts} />
    case 'countdown':
      return <CountdownSection data={section.props as CountdownProps} colors={colors} fonts={fonts} />
    case 'order_form':
      return <OrderFormSection data={section.props as OrderFormProps} colors={colors} fonts={fonts} storeId={storeId} />
    case 'testimonials':
      return <TestimonialsSection data={section.props as TestimonialsProps} colors={colors} fonts={fonts} />
    case 'benefits':
      return <BenefitsSection data={section.props as BenefitsProps} colors={colors} fonts={fonts} />
    case 'gallery':
      return <GallerySection data={section.props as GalleryProps} colors={colors} fonts={fonts} />
    case 'faq':
      return <FaqSection data={section.props as FaqProps} colors={colors} fonts={fonts} />
    case 'badge_trust':
      return <BadgeTrustSection data={section.props as BadgeTrustProps} colors={colors} fonts={fonts} />
    case 'video':
      return <VideoSection data={section.props as VideoProps} colors={colors} fonts={fonts} />
    case 'text_block':
      return <TextBlockSection data={section.props as TextBlockProps} colors={colors} fonts={fonts} />
    case 'spacer':
      return <SpacerSection data={section.props as SpacerProps} colors={colors} fonts={fonts} />
    case 'footer':
      return <FooterSection data={section.props as FooterProps} colors={colors} fonts={fonts} />
    default:
      return (
        <div style={{ padding: '32px 24px', textAlign: 'center', backgroundColor: '#f9fafb' }}>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Section «{section.type}» non supportée</p>
        </div>
      )
  }
}
