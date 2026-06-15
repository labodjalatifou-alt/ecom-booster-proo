'use client'
import dynamic from 'next/dynamic'
import type { BuilderSection, StoreColors } from '@/lib/store-builder/types'

// Dynamic imports — tous ssr:false pour éviter les erreurs hydration
const AnnouncementBarSection = dynamic(() => import('./sections/AnnouncementBarSection'), { ssr: false })
const HeroSection = dynamic(() => import('./sections/HeroSection'), { ssr: false })
const MarqueeSection = dynamic(() => import('./sections/MarqueeSection'), { ssr: false })
const ProductSection = dynamic(() => import('./sections/ProductSection'), { ssr: false })
const CountdownSection = dynamic(() => import('./sections/CountdownSection'), { ssr: false })
const TestimonialsSection = dynamic(() => import('./sections/TestimonialsSection'), { ssr: false })
const BenefitsSection = dynamic(() => import('./sections/BenefitsSection'), { ssr: false })
const BeforeAfterSection = dynamic(() => import('./sections/BeforeAfterSection'), { ssr: false })
const StatsSection = dynamic(() => import('./sections/StatsSection'), { ssr: false })
const GallerySection = dynamic(() => import('./sections/GallerySection'), { ssr: false })
const FaqSection = dynamic(() => import('./sections/FaqSection'), { ssr: false })
const ComparisonTableSection = dynamic(() => import('./sections/ComparisonTableSection'), { ssr: false })
const GuaranteesSection = dynamic(() => import('./sections/GuaranteesSection'), { ssr: false })
const VideoSection = dynamic(() => import('./sections/VideoSection'), { ssr: false })
const ImageWithTextSection = dynamic(() => import('./sections/ImageWithTextSection'), { ssr: false })
const OrderFormSection = dynamic(() => import('./sections/OrderFormSection'), { ssr: false })
const PricingTableSection = dynamic(() => import('./sections/PricingTableSection'), { ssr: false })
const NewsletterSection = dynamic(() => import('./sections/NewsletterSection'), { ssr: false })
const SlideshowSection = dynamic(() => import('./sections/SlideshowSection'), { ssr: false })
const IconGridSection = dynamic(() => import('./sections/IconGridSection'), { ssr: false })
const ProductGridSection = dynamic(() => import('./sections/ProductGridSection'), { ssr: false })
const TextBlockSection = dynamic(() => import('./sections/TextBlockSection'), { ssr: false })
const SpacerSection = dynamic(() => import('./sections/SpacerSection'), { ssr: false })
const PopupSection = dynamic(() => import('./sections/PopupSection'), { ssr: false })
const FooterSection = dynamic(() => import('./sections/FooterSection'), { ssr: false })

interface Props {
  section: BuilderSection
  colors: StoreColors
  storeId?: string
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function SectionRenderer({ section, colors, storeId, isEditing, isSelected, onClick }: Props) {
  if (!section.visible && !isEditing) return null

  const commonProps = { colors, isEditing, isSelected, onClick }

  switch (section.type) {
    case 'announcement_bar':
      return <AnnouncementBarSection props={section.props as any} {...commonProps} />
    case 'hero':
      return <HeroSection props={section.props as any} {...commonProps} />
    case 'marquee':
      return <MarqueeSection props={section.props as any} {...commonProps} />
    case 'product':
      return <ProductSection props={section.props as any} {...commonProps} />
    case 'countdown':
      return <CountdownSection props={section.props as any} {...commonProps} />
    case 'testimonials':
      return <TestimonialsSection props={section.props as any} {...commonProps} />
    case 'benefits':
      return <BenefitsSection props={section.props as any} {...commonProps} />
    case 'before_after':
      return <BeforeAfterSection props={section.props as any} {...commonProps} />
    case 'stats':
      return <StatsSection props={section.props as any} {...commonProps} />
    case 'gallery':
      return <GallerySection props={section.props as any} {...commonProps} />
    case 'faq':
      return <FaqSection props={section.props as any} {...commonProps} />
    case 'comparison_table':
      return <ComparisonTableSection props={section.props as any} {...commonProps} />
    case 'guarantees':
      return <GuaranteesSection props={section.props as any} {...commonProps} />
    case 'video':
      return <VideoSection props={section.props as any} {...commonProps} />
    case 'image_with_text':
      return <ImageWithTextSection props={section.props as any} {...commonProps} />
    case 'order_form':
      return <OrderFormSection props={section.props as any} storeId={storeId} {...commonProps} />
    case 'pricing_table':
      return <PricingTableSection props={section.props as any} {...commonProps} />
    case 'newsletter':
      return <NewsletterSection props={section.props as any} {...commonProps} />
    case 'slideshow':
      return <SlideshowSection props={section.props as any} {...commonProps} />
    case 'icon_grid':
      return <IconGridSection props={section.props as any} {...commonProps} />
    case 'product_grid':
      return <ProductGridSection props={section.props as any} {...commonProps} />
    case 'text_block':
      return <TextBlockSection props={section.props as any} {...commonProps} />
    case 'spacer':
      return <SpacerSection props={section.props as any} {...commonProps} />
    case 'popup':
      return <PopupSection props={section.props as any} {...commonProps} />
    case 'footer':
      return <FooterSection props={section.props as any} {...commonProps} />
    default:
      return null
  }
}
