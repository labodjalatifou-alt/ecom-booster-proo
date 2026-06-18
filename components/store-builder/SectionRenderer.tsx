import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Chargement dynamique des 25 sections avec SSR désactivé (recommandation stricte)
const AnnouncementBarSection = dynamic(() => import('./sections/AnnouncementBarSection'), { ssr: false, loading: () => <SectionLoader /> });
const HeroSection = dynamic(() => import('./sections/HeroSection'), { ssr: false, loading: () => <SectionLoader /> });
const MarqueeSection = dynamic(() => import('./sections/MarqueeSection'), { ssr: false, loading: () => <SectionLoader /> });
const ProductSection = dynamic(() => import('./sections/ProductSection'), { ssr: false, loading: () => <SectionLoader /> });
const CountdownSection = dynamic(() => import('./sections/CountdownSection'), { ssr: false, loading: () => <SectionLoader /> });
const TestimonialsSection = dynamic(() => import('./sections/TestimonialsSection'), { ssr: false, loading: () => <SectionLoader /> });
const BenefitsSection = dynamic(() => import('./sections/BenefitsSection'), { ssr: false, loading: () => <SectionLoader /> });
const BeforeAfterSection = dynamic(() => import('./sections/BeforeAfterSection'), { ssr: false, loading: () => <SectionLoader /> });
const StatsSection = dynamic(() => import('./sections/StatsSection'), { ssr: false, loading: () => <SectionLoader /> });
const GallerySection = dynamic(() => import('./sections/GallerySection'), { ssr: false, loading: () => <SectionLoader /> });
const FaqSection = dynamic(() => import('./sections/FaqSection'), { ssr: false, loading: () => <SectionLoader /> });
const ComparisonTableSection = dynamic(() => import('./sections/ComparisonTableSection'), { ssr: false, loading: () => <SectionLoader /> });
const GuaranteesSection = dynamic(() => import('./sections/GuaranteesSection'), { ssr: false, loading: () => <SectionLoader /> });
const VideoSection = dynamic(() => import('./sections/VideoSection'), { ssr: false, loading: () => <SectionLoader /> });
const ImageWithTextSection = dynamic(() => import('./sections/ImageWithTextSection'), { ssr: false, loading: () => <SectionLoader /> });
const OrderFormSection = dynamic(() => import('./sections/OrderFormSection'), { ssr: false, loading: () => <SectionLoader /> });
const ProductGridSection = dynamic(() => import('./sections/ProductGridSection'), { ssr: false, loading: () => <SectionLoader /> });
const PricingTableSection = dynamic(() => import('./sections/PricingTableSection'), { ssr: false, loading: () => <SectionLoader /> });
const NewsletterSection = dynamic(() => import('./sections/NewsletterSection'), { ssr: false, loading: () => <SectionLoader /> });
const SlideshowSection = dynamic(() => import('./sections/SlideshowSection'), { ssr: false, loading: () => <SectionLoader /> });
const IconGridSection = dynamic(() => import('./sections/IconGridSection'), { ssr: false, loading: () => <SectionLoader /> });
const TextBlockSection = dynamic(() => import('./sections/TextBlockSection'), { ssr: false, loading: () => <SectionLoader /> });
const SpacerSection = dynamic(() => import('./sections/SpacerSection'), { ssr: false, loading: () => <SectionLoader /> });
const PopupSection = dynamic(() => import('./sections/PopupSection'), { ssr: false, loading: () => <SectionLoader /> });
const FooterSection = dynamic(() => import('./sections/FooterSection'), { ssr: false, loading: () => <SectionLoader /> });

function SectionLoader() {
  return (
    <div className="w-full py-12 flex items-center justify-center bg-gray-50/50">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
    </div>
  );
}

const sectionComponents: Record<string, React.ComponentType<any>> = {
  AnnouncementBar: AnnouncementBarSection,
  Hero: HeroSection,
  Marquee: MarqueeSection,
  Product: ProductSection,
  Countdown: CountdownSection,
  Testimonials: TestimonialsSection,
  Benefits: BenefitsSection,
  BeforeAfter: BeforeAfterSection,
  Stats: StatsSection,
  Gallery: GallerySection,
  Faq: FaqSection,
  ComparisonTable: ComparisonTableSection,
  Guarantees: GuaranteesSection,
  Video: VideoSection,
  ImageWithText: ImageWithTextSection,
  OrderForm: OrderFormSection,
  ProductGrid: ProductGridSection,
  PricingTable: PricingTableSection,
  Newsletter: NewsletterSection,
  Slideshow: SlideshowSection,
  IconGrid: IconGridSection,
  TextBlock: TextBlockSection,
  Spacer: SpacerSection,
  Popup: PopupSection,
  Footer: FooterSection,
};

interface SectionRendererProps {
  type: string;
  settings: any;
  isSelected?: boolean;
}

export default function SectionRenderer({ type, settings, isSelected }: SectionRendererProps) {
  const Component = sectionComponents[type];

  if (!Component) {
    console.warn(`Section type "${type}" introuvable.`);
    return (
      <div className="w-full p-8 text-center bg-red-50 text-red-600 border border-red-200">
        Composant <b>{type}</b> non défini.
      </div>
    );
  }

  return (
    <div className={`relative w-full group transition-all ${isSelected ? 'ring-2 ring-blue-500 z-10' : 'hover:ring-2 hover:ring-blue-500/50'}`}>
      
      {/* Overlay bleu au survol ou sélection (style Shopify) */}
      <div className={`absolute top-0 left-0 w-full h-8 bg-blue-500 text-white text-xs font-bold flex items-center px-3 gap-2 opacity-0 -translate-y-full transition-all z-20 ${isSelected ? 'opacity-100 translate-y-0' : 'group-hover:opacity-100 group-hover:translate-y-0'}`}>
        <span className="truncate">{type}</span>
      </div>

      <Component settings={settings} />
    </div>
  );
}
