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

// Liste EXACTE des pays acceptés par l'API Facebook Ad Library
// Source : message d'erreur officiel de l'API Meta
const FB_SUPPORTED_COUNTRIES = [
  'BR','IN','GB','US','CA','AR','AU','AT','BE','CL','CN','CO','HR','DK','DO',
  'EG','FI','FR','DE','GR','HK','ID','IE','IL','IT','JP','JO','KW','LB','MY',
  'MX','NL','NZ','NG','NO','PK','PA','PE','PH','PL','RU','SA','RS','SG','ZA',
  'KR','ES','SE','CH','TW','TH','TR','AE','VE','PT','LU','BG','CZ','SI','IS',
  'SK','LT','TT','BD','LK','KE','HU','MA','CY','JM','EC','RO','BO','GT','CR',
  'QA','SV','HN','NI','PY','UY','PR','BA','PS','TN','BH','VN','GH','MU','UA',
  'MT','BS','MV','OM','MK','LV','EE','IQ','DZ','AL','NP','MO','ME','SN','GE',
  'BN','UG','GP','BB','AZ','TZ','LY','MQ','CM','BW','ET','KZ','NA','MG','NC',
  'MD','FJ','BY','JE','GU','YE','ZM','IM','HT','KH','AW','PF','AF','BM','GY',
  'AM','MW','AG','RW','GG','GM','FO','LC','KY','BJ','AD','GD','VI','BZ','VC',
  'MN','MZ','ML','AO','GF','UZ','DJ','BF','MC','TG','GL','GA','GI','CD','KG',
  'PG','BT','KN','SZ','LS','LA','LI','MP','SR','SC','VG','TC','DM','MR','AX',
  'SM','SL','NE','CG','AI','YT','CV','GN','TM','BI','TJ','VU','SB','ER','WS',
  'AS','FK','GQ','TO','KM','PW','FM','CF','SO','MH','VA','TD','KI','ST','TV',
  'NR','RE','LR','ZW','CI','MM','AN','AQ','BQ','BV','IO','CX','CC','CK','CW',
  'TF','GW','HM','XK','MS','NU','NF','PN','BL','SH','MF','PM','SX','GS','SS',
  'SJ','TL','TK','UM','WF','EH','SY',
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
  // "ALL" est une valeur officielle acceptée par l'API Facebook Ad Library
  let countriesArray: string[];
  if (countriesRaw === 'ALL' || !countriesRaw) {
    countriesArray = ['ALL']; // valeur officielle Meta = tous les pays supportés
  } else {
    const requested = countriesRaw.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
    // Filtrer uniquement les pays acceptés par Facebook
    countriesArray = requested.filter((c) => FB_SUPPORTED_COUNTRIES.includes(c));
    if (countriesArray.length === 0) countriesArray = ['ALL'];
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
