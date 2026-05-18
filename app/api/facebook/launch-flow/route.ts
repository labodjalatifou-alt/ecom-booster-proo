import { NextRequest, NextResponse } from 'next/server';

const FB_TOKEN = process.env.FACEBOOK_API;
const FB_API_BASE = 'https://graph.facebook.com/v19.0';

const CAPITALS: Record<string, string> = {
  TG: 'Lome',
  CI: 'Abidjan',
  SN: 'Dakar',
  BJ: 'Cotonou',
  ML: 'Bamako',
  BF: 'Ouagadougou',
  NE: 'Niamey',
  GH: 'Accra',
  FR: 'Paris',
  US: 'Washington',
  CM: 'Douala',
  GA: 'Libreville',
  CG: 'Brazzaville',
  CD: 'Kinshasa'
};

async function fbFetch(endpoint: string, params: Record<string, any> = {}, method = 'GET') {
  const url = new URL(`${FB_API_BASE}${endpoint}`);
  url.searchParams.set('access_token', FB_TOKEN!);
  
  const options: RequestInit = { method };
  
  if (method === 'GET') {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
  } else {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(params);
  }

  const res = await fetch(url.toString(), options);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json;
}

// Upload file directly to Meta Ads Library
async function uploadToFacebook(adAccountId: string, type: 'images' | 'videos', file: File) {
  const url = `${FB_API_BASE}/${adAccountId}/${type === 'images' ? 'adimages' : 'advideos'}`;
  
  const fbFormData = new FormData();
  fbFormData.append('access_token', FB_TOKEN!);
  
  if (type === 'images') {
    fbFormData.append('filename', file);
  } else {
    fbFormData.append('source', file);
  }

  const res = await fetch(url, {
    method: 'POST',
    body: fbFormData
  });
  
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json;
}

// Find City Key from Facebook
async function getCityTargetingKey(cityName: string) {
  try {
    const data = await fbFetch('/search', {
      type: 'adgeolocation',
      q: cityName,
      location_types: ['city']
    });
    if (data.data && data.data.length > 0) {
      return data.data[0].key;
    }
  } catch (e: any) {
    console.error('Error fetching city targeting key:', e.message);
  }
  return null;
}

export async function GET(req: NextRequest) {
  if (!FB_TOKEN) return NextResponse.json({ error: 'Token manquant' }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  try {
    // 1. Get Ad Account to extract ID
    const meData = await fbFetch('/me/adaccounts', { fields: 'id,name,currency,account_status' });
    if (!meData.data || meData.data.length === 0) {
      return NextResponse.json({ error: 'Aucun compte publicitaire trouvé.' }, { status: 404 });
    }
    const adAccount = meData.data.find((a: any) => a.account_status === 1) || meData.data[0];
    const adAccountId = adAccount.id;

    if (action === 'assets') {
      // Fetch Pages
      let pages: any[] = [];
      try {
        const pagesData = await fbFetch('/me/accounts', { fields: 'id,name,access_token,picture{url}' });
        pages = pagesData.data || [];
      } catch (e: any) {
        console.error('Error fetching pages:', e.message);
      }

      // Fetch Pixels
      let pixels: any[] = [];
      try {
        const pixelsData = await fbFetch(`/${adAccountId}/adspixels`, { fields: 'id,name' });
        pixels = pixelsData.data || [];
      } catch (e: any) {
        console.error('Error fetching pixels:', e.message);
      }

      return NextResponse.json({
        account: { id: adAccountId, name: adAccount.name, currency: adAccount.currency },
        pages,
        pixels
      });
    }

    return NextResponse.json({ error: 'Action non supportée' }, { status: 400 });

  } catch (err: any) {
    console.error('[FB LAUNCH ASSETS ERROR]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!FB_TOKEN) return NextResponse.json({ error: 'Token manquant' }, { status: 500 });

  try {
    const formData = await req.formData();
    
    const campaignName = formData.get('campaignName') as string;
    const budgetType = formData.get('budgetType') as string; // 'CBO' | 'ABO'
    const campaignBudget = formData.get('campaignBudget') as string;
    const productUrl = formData.get('productUrl') as string;

    const adsetsJson = formData.get('adsets') as string;
    const adsetsList: any[] = JSON.parse(adsetsJson || '[]');

    // Get Ad Account Id
    const meData = await fbFetch('/me/adaccounts', { fields: 'id,account_status' });
    const adAccount = meData.data.find((a: any) => a.account_status === 1) || meData.data[0];
    const adAccountId = adAccount.id;

    // --- STEP 1: CREATE CAMPAIGN ---
    const campaignParams: Record<string, any> = {
      name: campaignName,
      objective: 'OUTCOME_SALES',
      status: 'PAUSED',
      special_ad_categories: []
    };

    if (budgetType === 'CBO') {
      campaignParams.daily_budget = Math.round(parseFloat(campaignBudget) * 100);
    }

    const campaign = await fbFetch(`/${adAccountId}/campaigns`, campaignParams, 'POST');
    const campaignId = campaign.id;

    const createdAdSets: any[] = [];
    const createdAds: any[] = [];

    // --- STEP 2: LOOP OVER EACH DESIGNED ADSET ---
    for (const adset of adsetsList) {
      // Compile AdSet targeting geolocations
      const geoLocations: Record<string, any> = {};
      const targetingCountries = adset.targetingCountries || ['TG'];

      if (adset.targetingType === 'city' && targetingCountries.length > 0) {
        const countryCode = targetingCountries[0];
        const cityName = CAPITALS[countryCode] || 'Lome';
        const cityKey = await getCityTargetingKey(cityName);

        if (cityKey) {
          geoLocations.cities = [{
            key: cityKey,
            radius: adset.radiusKm || 40,
            distance_unit: 'kilometer'
          }];
        } else {
          geoLocations.countries = targetingCountries;
        }
      } else {
        geoLocations.countries = targetingCountries;
      }

      const activePixel = adset.useManualAssets ? adset.manualPixelId : adset.pixelId;
      const activePage = adset.useManualAssets ? adset.manualPageId : adset.pageId;

      // Create AdSet Params
      const adSetParams: Record<string, any> = {
        name: adset.name || 'AdSet',
        campaign_id: campaignId,
        status: 'PAUSED',
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'OFFSITE_CONVERSIONS',
        promoted_object: {
          pixel_id: activePixel,
          custom_event_type: 'PURCHASE'
        },
        targeting: {
          geo_locations: geoLocations,
          min_age: adset.minAge || 18,
          max_age: adset.maxAge || 65,
          publisher_platforms: ['facebook', 'instagram']
        }
      };

      if (budgetType === 'ABO') {
        adSetParams.daily_budget = Math.round(parseFloat(campaignBudget) * 100);
      }

      // Create the AdSet inside this campaign
      const createdAdSet = await fbFetch(`/${adAccountId}/adsets`, adSetParams, 'POST');
      createdAdSets.push(createdAdSet.id);

      // --- STEP 3: CREATE CREATIVES & ADS FOR THIS SPECIFIC ADSET ---
      for (const adItem of adset.ads) {
        // Look for file uploads matching this specific adset + ad id
        const imageFile = formData.get(`imageFile_${adset.id}_${adItem.id}`) as File | null;
        const videoFile = formData.get(`videoFile_${adset.id}_${adItem.id}`) as File | null;

        let imageHash = '';
        let videoId = '';

        if (adItem.mediaType === 'image') {
          if (imageFile && imageFile.size > 0) {
            const uploadRes = await uploadToFacebook(adAccountId, 'images', imageFile);
            const imagesMap = uploadRes.images || {};
            const firstKey = Object.keys(imagesMap)[0];
            if (firstKey) {
              imageHash = imagesMap[firstKey].hash;
            }
          }
        } else {
          if (videoFile && videoFile.size > 0) {
            const uploadRes = await uploadToFacebook(adAccountId, 'videos', videoFile);
            videoId = uploadRes.id;
          }
        }

        let creativeParams: Record<string, any> = {
          name: `Creative - ${adItem.adName || 'Ad'}`,
          object_type: 'SHARE'
        };

        if (adItem.mediaType === 'video') {
          // VIDEO CREATIVE
          const videoData: Record<string, any> = {
            message: adItem.adText,
            title: adItem.adHeadline,
            call_to_action: {
              type: adItem.adCta || 'SHOP_NOW',
              value: { link: productUrl }
            }
          };

          if (videoId) {
            videoData.video_id = videoId;
          } else {
            videoData.video_id = adItem.videoUrl;
          }

          creativeParams.object_story_spec = {
            page_id: activePage,
            video_data: videoData
          };
        } else {
          // IMAGE/LINK CREATIVE
          const linkData: Record<string, any> = {
            link: productUrl,
            message: adItem.adText,
            name: adItem.adHeadline,
            call_to_action: {
              type: adItem.adCta || 'SHOP_NOW',
              value: { link: productUrl }
            }
          };

          if (imageHash) {
            linkData.image_hash = imageHash;
          } else if (adItem.imageUrl) {
            linkData.picture = adItem.imageUrl;
          }

          creativeParams.object_story_spec = {
            page_id: activePage,
            link_data: linkData
          };
        }

        // Create Ad Creative
        const creative = await fbFetch(`/${adAccountId}/adcreatives`, creativeParams, 'POST');

        // Create Ad pointing to this creative and parent Adset
        const adParams: Record<string, any> = {
          name: adItem.adName || 'Ad',
          adset_id: createdAdSet.id,
          creative: { creative_id: creative.id },
          status: 'PAUSED'
        };

        const ad = await fbFetch(`/${adAccountId}/ads`, adParams, 'POST');
        createdAds.push(ad.id);
      }
    }

    return NextResponse.json({
      success: true,
      campaignId,
      adSetIds: createdAdSets,
      adIds: createdAds
    });

  } catch (err: any) {
    console.error('[FB ADS LAUNCH ERROR]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
