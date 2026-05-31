import { NextRequest, NextResponse } from 'next/server';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

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
  const mediaType = searchParams.get('media_type') || ''; // IMAGE | VIDEO | MULTI_MEDIA | ALL
  
  // Dans l'URL FB, le paramètre pays prend soit un code ISO soit 'ALL'
  const countryCode = (countriesRaw === 'ALL' || !countriesRaw) ? 'ALL' : countriesRaw.split(',')[0].toUpperCase();
  
  // Format media pour l'URL FB (all, image, video)
  let fbMediaType = 'all';
  if (mediaType === 'IMAGE') fbMediaType = 'image';
  if (mediaType === 'VIDEO') fbMediaType = 'video';

  // Construction de l'URL exacte de recherche Facebook
  const targetFbUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${countryCode}&q=${encodeURIComponent(searchTerms)}&media_type=${fbMediaType}`;

  try {
    // Appel direct (synchrone) au Scraper Apify
    // Attention: limitation à 30 pubs pour que ça réponde vite à l'écran
    const apifyReqBody = {
      urls: [{ url: targetFbUrl }],
      count: 30
    };

    const res = await fetch(`https://api.apify.com/v2/acts/curious_coder~facebook-ads-library-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apifyReqBody),
      // Mettre un timeout long si possible, Apify prend quelques secondes
    });

    const data = await res.json();

    if (data.error) {
      console.error('[APIFY ERROR]', data.error);
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    // Le scraper renvoie un array directement
    const items = Array.isArray(data) ? data : (data.items || []);

    const ads = items.map((ad: any) => {
      // Extraire l'ID de la pub de l'URL ad_library_url
      let adId = String(ad.ad_id || ad.position || Math.random());
      if (ad.ad_library_url) {
        const urlObj = new URL(ad.ad_library_url);
        adId = urlObj.searchParams.get('id') || adId;
      }

      const snap = ad.snapshot || {};
      const firstCard = snap.cards?.[0] || {};

      // Calcul des jours de diffusion
      let daysRunning = null;
      let startDateStr = ad.start_date_formatted || null;
      if (ad.start_date) {
        const startDate = new Date(ad.start_date * 1000);
        startDateStr = startDate.toISOString();
        daysRunning = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Format des médias
      // Apify extrait directement les images et les vidéos ! C'est génial pour ne plus dépendre des iFrames
      let snapshotUrl = null;
      let detectedMediaType = 'IMAGE';
      
      if (snap.display_format === 'VIDEO' || (snap.videos && snap.videos.length > 0) || firstCard.video_sd_url) {
        detectedMediaType = 'VIDEO';
        snapshotUrl = firstCard.video_sd_url || (snap.videos && snap.videos[0]?.video_sd_url) || null;
      } else if (snap.display_format === 'CAROUSEL' || snap.display_format === 'DPA') {
        detectedMediaType = 'MULTI_MEDIA';
        snapshotUrl = firstCard.resized_image_url || firstCard.original_image_url || null;
      } else {
        detectedMediaType = 'IMAGE';
        snapshotUrl = firstCard.resized_image_url || firstCard.original_image_url || (snap.images && snap.images[0]?.resized_image_url) || null;
      }

      return {
        id: adId,
        body: snap.body?.text || ad.body || null,
        linkTitle: snap.title || firstCard.title || null,
        linkDescription: snap.link_description || firstCard.link_description || null,
        linkCaption: snap.caption || firstCard.caption || null,
        mediaType: detectedMediaType,
        snapshotUrl: snapshotUrl, 
        pageName: ad.page_name || 'Page inconnue',
        pageId: null, // Apify ne donne pas le pageID facilement, pas très grave
        pageUrl: ad.page_profile_uri || null,
        startDate: startDateStr,
        daysRunning: daysRunning,
        impressions: null, // Apify gratuit ne scrap pas les impressions exactes
        spend: null,
        currency: ad.currency || null,
        originalUrl: ad.ad_library_url // Lien vers la bibliothèque Meta
      };
    });

    // Optionnel : on pourrait filtrer sur les jours (> 14 jours)
    const adsFiltered = ads.filter((ad: any) => ad.daysRunning !== null && ad.daysRunning >= 14);

    return NextResponse.json({ 
      ads: adsFiltered.length > 0 ? adsFiltered : ads, // Fallback si filtre trop restrictif
      nextCursor: null, // Le scraper Apify qu'on utilise n'a pas de pagination directe via ce endpoint synchronisé
      hasMore: false,
      cutoffDate: getDateDaysAgo(14)
    });
  } catch (err: any) {
    console.error('[APIFY FETCH ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
