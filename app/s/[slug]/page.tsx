import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { BuilderPage, StoreColors, StoreFonts, StorePixels } from '@/lib/store-builder/types'
import PublicStoreClient from './PublicStoreClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createClient()
  const { data: store } = await supabase.from('stores').select('name').eq('slug', slug).single()
  return {
    title: store?.name || slug,
    description: `Boutique ${store?.name || slug}`,
  }
}

export default async function PublicStorePage({ params }: Props) {
  const { slug } = await params
  const supabase = createClient()

  // 1. Boutique
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!store) notFound()

  // 2. Paramètres
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .eq('store_id', store.id)
    .single()

  // 3. Page home publiée
  const { data: page } = await supabase
    .from('store_pages')
    .select('*')
    .eq('store_id', store.id)
    .eq('slug', 'home')
    .eq('is_published', true)
    .single()

  if (!page) notFound()

  const colors: StoreColors = settings?.colors || {
    primary: '#6366f1', secondary: '#f8fafc', accent: '#f59e0b',
    text: '#111827', textLight: '#6b7280', bg: '#ffffff',
    bgSection: '#f9fafb', border: '#e5e7eb', success: '#10b981', danger: '#ef4444',
  }
  const fonts: StoreFonts = settings?.fonts || { heading: 'Inter', body: 'Inter' }
  const pixels: StorePixels = settings?.pixels || { meta: '', tiktok: '', google: '' }
  const builderJson = page.builder_json as BuilderPage

  return (
    <>
      {/* Google Fonts */}
      <link href={`https://fonts.googleapis.com/css2?family=${fonts.heading.replace(' ', '+')}:wght@400;500;600;700;800;900&display=swap`} rel="stylesheet" />

      {/* Meta Pixel */}
      {pixels.meta && (
        <script dangerouslySetInnerHTML={{ __html: `
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${pixels.meta}');fbq('track','PageView');
        `}} />
      )}

      {/* TikTok Pixel */}
      {pixels.tiktok && (
        <script dangerouslySetInnerHTML={{ __html: `
          !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
          ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
          ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
          for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
          ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
          ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
          ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
          n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src=i+"?sdkid="+e+"&lib="+t;
          e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
          ttq.load('${pixels.tiktok}');ttq.page();}(window,document,'ttq');
        `}} />
      )}

      <PublicStoreClient
        storeId={store.id}
        builderJson={builderJson}
        colors={colors}
        fonts={fonts}
      />
    </>
  )
}
