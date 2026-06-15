import type { Metadata } from 'next'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/server'
import PublicStoreView from '@/components/store-builder/PublicStoreView'
import type { BuilderPage, StoreSettings } from '@/lib/store-builder/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createClient()
  const { data: store } = await supabase
    .from('stores')
    .select('name, slug')
    .eq('slug', slug)
    .maybeSingle()

  return {
    title: store?.name ? `${store.name} — Boutique` : 'Boutique',
    description: `Découvrez ${store?.name ?? 'notre boutique'} et passez votre commande en ligne.`,
    openGraph: {
      title: store?.name ?? slug,
      type: 'website',
    },
  }
}

export default async function PublicStorePage({ params }: Props) {
  const { slug } = await params
  const supabase = createClient()

  // Fetch store + settings + home page in parallel
  const [{ data: store, error: storeErr }, { data: pages }, { data: settingsArr }] =
    await Promise.all([
      supabase.from('stores').select('id, name, slug, status').eq('slug', slug).maybeSingle(),
      supabase.from('store_pages').select('*').eq('slug', 'home'),
      supabase.from('store_settings').select('*'),
    ])

  // 404 — store not found or not published
  if (storeErr || !store) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏪</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Boutique introuvable</h1>
          <p style={{ color: '#6b7280', fontSize: 16 }}>
            Cette boutique n&apos;existe pas ou n&apos;est pas encore disponible.
          </p>
        </div>
      </div>
    )
  }

  // Find the home page for this store
  const homePage = (pages ?? []).find((p: any) => p.store_id === store.id) ?? null
  const settings = (settingsArr ?? []).find((s: any) => s.store_id === store.id) as StoreSettings | null

  if (!homePage?.builder_json) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🚧</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Bientôt disponible</h1>
          <p style={{ color: '#6b7280' }}>{store.name} est en cours de construction.</p>
        </div>
      </div>
    )
  }

  const builderPage = homePage.builder_json as BuilderPage

  return (
    <>
      {/* ── Tracking pixels ──────────────────────────────── */}

      {settings?.pixels?.meta && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${settings.pixels.meta}');fbq('track','PageView');
        `}</Script>
      )}

      {settings?.pixels?.tiktok && (
        <Script id="tiktok-pixel" strategy="afterInteractive">{`
          !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._n=ttq._n||{},ttq._n[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${settings.pixels.tiktok}');ttq.page();}(window,document,'ttq');
        `}</Script>
      )}

      {settings?.pixels?.google && (
        <>
          <Script
            id="ga-gtag"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.pixels.google}`}
          />
          <Script id="ga-config" strategy="afterInteractive">{`
            window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
            gtag('js',new Date());gtag('config','${settings.pixels.google}');
          `}</Script>
        </>
      )}

      {/* ── Public store renderer ─────────────────────────── */}
      <PublicStoreView
        builderPage={builderPage}
        settings={settings}
        storeId={store.id}
        storeName={store.name}
      />
    </>
  )
}
