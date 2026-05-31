import { NextRequest, NextResponse } from 'next/server';

const FB_GRAPH = 'https://graph.facebook.com/v19.0';

// Priorité 1 : App Access Token (ne expire jamais, idéal pour ads_archive)
// Format : APP_ID|APP_SECRET
// Priorité 2 : User Access Token classique (peut expirer)
function getToken(): string | null {
  const appId     = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (appId && appSecret) return `${appId}|${appSecret}`;
  return process.env.FACEBOOK_API || null;
}


function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

// Liste exhaustive de pays (ISO 3166-1 alpha-2)
const ALL_WORLD_COUNTRIES = [
  'AF','AL','DZ','AD','AO','AG','AR','AM','AU','AT','AZ','BS','BH','BD','BB',
  'BY','BE','BZ','BJ','BT','BO','BA','BW','BR','BN','BG','BF','BI','CV','KH',
  'CM','CA','CF','TD','CL','CN','CO','KM','CG','CD','CR','HR','CU','CY','CZ',
  'DK','DJ','DM','DO','EC','EG','SV','GQ','ER','EE','SZ','ET','FJ','FI','FR',
  'GA','GM','GE','DE','GH','GR','GD','GT','GN','GW','GY','HT','HN','HU','IS',
  'IN','ID','IR','IQ','IE','IL','IT','JM','JP','JO','KZ','KE','KI','KP','KR',
  'KW','KG','LA','LV','LB','LS','LR','LY','LI','LT','LU','MG','MW','MY','MV',
  'ML','MT','MH','MR','MU','MX','FM','MD','MC','MN','ME','MA','MZ','MM','NA',
  'NR','NP','NL','NZ','NI','NE','NG','MK','NO','OM','PK','PW','PA','PG','PY',
  'PE','PH','PL','PT','QA','RO','RU','RW','KN','LC','VC','WS','SM','ST','SA',
  'SN','RS','SC','SL','SG','SK','SI','SB','SO','ZA','SS','ES','LK','SD','SR',
  'SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TO','TT','TN','TR','TM','TV',
  'UG','UA','AE','GB','US','UY','UZ','VU','VE','VN','YE','ZM','ZW','CI','HK',
  'MO','PS','XK','RE','GP','MQ','GF','PM','NC','PF','WF','YT','MF','BL','AW',
  'CW','SX','TC','VG','VI','PR','GU','MP','AS','UM'
];

export async function GET(req: NextRequest) {
  const FB_TOKEN = getToken();
  if (!FB_TOKEN) {
    return NextResponse.json(
      { error: 'Token Facebook manquant. Ajoutez FACEBOOK_APP_ID + FACEBOOK_APP_SECRET (ou FACEBOOK_API) dans .env.local' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const searchTerms = searchParams.get('search_terms') || 'livraison gratuite';
  const countriesRaw = searchParams.get('countries') || 'ALL';
  const mediaType = searchParams.get('media_type') || ''; // IMAGE | VIDEO | MULTI_MEDIA | ''
  const after = searchParams.get('after') || null;

  // Filtre "2 semaines minimum"
  const cutoffDate = getDateDaysAgo(14);

  // Résolution des pays
  let countriesArray: string[];
  if (countriesRaw === 'ALL' || !countriesRaw) {
    countriesArray = ALL_WORLD_COUNTRIES;
  } else {
    countriesArray = countriesRaw.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
  }

  const fields = [
    'id',
    'ad_creative_bodies',
    'ad_creative_link_captions',
    'ad_creative_link_descriptions',
    'ad_creative_link_titles',
    'ad_delivery_start_time',
    'ad_snapshot_url',
    'page_name',
    'page_id',
    'impressions',
    'spend',
    'currency',
    'ad_creative_media_type',
  ].join(',');

  const url = new URL(`${FB_GRAPH}/ads_archive`);
  url.searchParams.set('access_token', FB_TOKEN);
  url.searchParams.set('search_terms', searchTerms);
  url.searchParams.set('ad_active_status', 'ACTIVE');
  url.searchParams.set('ad_reached_countries', JSON.stringify(countriesArray));
  url.searchParams.set('ad_delivery_date_max', cutoffDate);
  url.searchParams.set('fields', fields);
  url.searchParams.set('limit', '30');
  if (after) url.searchParams.set('after', after);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    const json = await res.json();

    if (json.error) {
      console.error('[AD LIBRARY ERROR]', json.error);
      return NextResponse.json({ error: json.error.message }, { status: 400 });
    }

    let ads = (json.data || []).map((ad: any) => {
      const startDate = ad.ad_delivery_start_time
        ? new Date(ad.ad_delivery_start_time)
        : null;
      const daysRunning = startDate
        ? Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      const detectedMediaType = ad.ad_creative_media_type || 'IMAGE';

      return {
        id: ad.id,
        body: ad.ad_creative_bodies?.[0] || null,
        linkTitle: ad.ad_creative_link_titles?.[0] || null,
        linkDescription: ad.ad_creative_link_descriptions?.[0] || null,
        linkCaption: ad.ad_creative_link_captions?.[0] || null,
        mediaType: detectedMediaType,
        snapshotUrl: ad.ad_snapshot_url || null,
        pageName: ad.page_name || 'Page inconnue',
        pageId: ad.page_id || null,
        pageUrl: ad.page_id ? `https://www.facebook.com/${ad.page_id}` : null,
        startDate: ad.ad_delivery_start_time || null,
        daysRunning,
        impressions: ad.impressions || null,
        spend: ad.spend || null,
        currency: ad.currency || null,
      };
    });

    // Filtre média côté serveur si demandé
    if (mediaType && mediaType !== 'ALL') {
      ads = ads.filter((ad: any) => ad.mediaType === mediaType);
    }

    const nextCursor = json.paging?.cursors?.after || null;
    const hasMore = !!json.paging?.next;

    return NextResponse.json({ ads, nextCursor, hasMore, cutoffDate });
  } catch (err: any) {
    console.error('[AD LIBRARY FETCH ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
