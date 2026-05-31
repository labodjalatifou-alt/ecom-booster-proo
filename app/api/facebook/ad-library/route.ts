import { NextRequest, NextResponse } from 'next/server';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

// Force Next.js à ne JAMAIS mettre en cache cette route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!APIFY_TOKEN) {
    return NextResponse.json(
      { error: 'Clé Apify manquante. Ajoutez APIFY_API_TOKEN dans .env.local' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const searchTerms = searchParams.get('search_terms') || 'livraison gratuite';
  const countriesRaw = searchParams.get('countries') || 'ALL';
  const mediaType = searchParams.get('media_type') || '';

  const countryCode = (countriesRaw === 'ALL' || !countriesRaw)
    ? 'ALL'
    : countriesRaw.split(',')[0].toUpperCase();

  let fbMediaType = 'all';
  if (mediaType === 'IMAGE') fbMediaType = 'image';
  if (mediaType === 'VIDEO') fbMediaType = 'video';

  // URL optimisée :
  // - active_status=active → uniquement les pubs actives EN CE MOMENT
  // - search_type=keyword_unordered → cherche le mot-clé dans le contenu de la pub (plus précis)
  // - country=XX → filtre strict par pays
  const targetFbUrl = [
    'https://www.facebook.com/ads/library/',
    `?active_status=active`,
    `&ad_type=all`,
    `&country=${countryCode}`,
    `&q=${encodeURIComponent(searchTerms)}`,
    `&search_type=keyword_unordered`,
    `&media_type=${fbMediaType}`,
  ].join('');

  console.log(`[AD LIBRARY] country=${countryCode} | keyword="${searchTerms}" | url=${targetFbUrl}`);

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/curious_coder~facebook-ads-library-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: [{ url: targetFbUrl }],
          count: 40,
        }),
        cache: 'no-store',
      }
    );

    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: String(data.error) }, { status: 400 });
    }

    const items: any[] = Array.isArray(data) ? data : (data.items || []);

    // Le champ "total" dans le 1er item indique le nombre réel de pubs dans ce pays
    const totalInCountry: number = items[0]?.total || items.length;

    const ads = items.map((ad: any) => {
      const adId = String(ad.ad_archive_id || ad.ad_id || Math.random());
      const snap = ad.snapshot || {};
      const firstCard = snap.cards?.[0] || {};

      // Durée de diffusion
      let daysRunning: number | null = null;
      let startDateStr: string | null = ad.start_date_formatted || null;
      if (ad.start_date) {
        const startDate = new Date(ad.start_date * 1000);
        startDateStr = startDate.toISOString();
        daysRunning = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Type de média + URL
      let snapshotUrl: string | null = null;
      let detectedMediaType = 'IMAGE';

      if (snap.display_format === 'VIDEO' || snap.videos?.length > 0 || firstCard.video_sd_url) {
        detectedMediaType = 'VIDEO';
        snapshotUrl = firstCard.video_sd_url || snap.videos?.[0]?.video_sd_url || null;
      } else if (snap.display_format === 'CAROUSEL' || snap.display_format === 'DPA') {
        detectedMediaType = 'MULTI_MEDIA';
        snapshotUrl = firstCard.resized_image_url || firstCard.original_image_url || null;
      } else {
        snapshotUrl = firstCard.resized_image_url
          || firstCard.original_image_url
          || snap.images?.[0]?.resized_image_url
          || null;
      }

      // Pays ciblés (si disponibles)
      const targetedCountries: string[] = ad.targeted_or_reached_countries || [];

      return {
        id: adId,
        body: snap.body?.text || firstCard.body || null,
        linkTitle: snap.title || firstCard.title || null,
        linkDescription: snap.link_description || firstCard.link_description || null,
        linkCaption: snap.caption || firstCard.caption || null,
        ctaText: snap.cta_text || firstCard.cta_text || null,
        mediaType: detectedMediaType,
        snapshotUrl,
        pageName: ad.page_name || snap.page_name || 'Page inconnue',
        pageUrl: snap.page_profile_uri || null,
        profileImage: snap.page_profile_picture_url || null,
        siteUrl: firstCard.link_url || snap.link_url || null,
        targetedCountries,
        startDate: startDateStr,
        daysRunning,
        impressions: null,
        originalUrl: ad.ad_library_url || null,
      };
    });

    // Filtre 14 jours minimum (les pubs qui tournent depuis au moins 2 semaines)
    const adsFiltered = ads.filter((ad) => ad.daysRunning === null || ad.daysRunning >= 14);

    const response = NextResponse.json({
      ads: adsFiltered.length > 0 ? adsFiltered : ads,
      hasMore: false,
      totalInCountry,   // Nombre total de pubs dans ce pays pour ce mot-clé
      cutoffDate: getDateDaysAgo(14),
      country: countryCode,
      keyword: searchTerms,
    });

    // Désactiver TOUS les caches
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;

  } catch (err: any) {
    console.error('[APIFY FETCH ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
