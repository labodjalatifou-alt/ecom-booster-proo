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
  FR: 'Paris',
  US: 'Washington',
  NE: 'Niamey',
  GH: 'Accra'
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
    const pixelId = formData.get('pixelId') as string;
    const pageId = formData.get('pageId') as string;
    const targetingType = formData.get('targetingType') as string; // 'country' | 'city'
    const radiusKm = parseInt(formData.get('radiusKm') as string || '40');
    
    const targetingCountriesJson = formData.get('targetingCountries') as string;
    const targetingCountries: string[] = JSON.parse(targetingCountriesJson || '["TG"]');
    
    const adSetName = formData.get('adSetName') as string;
    const adSetsCount = parseInt(formData.get('adSetsCount') as string || '1');
    const productUrl = formData.get('productUrl') as string;

    const adsListJson = formData.get('adsList') as string;
    const adsList: any[] = JSON.parse(adsListJson || '[]');

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

    // --- STEP 2: PROCESS TARGETING ---
    const geoLocations: Record<string, any> = {};

    if (targetingType === 'city' && targetingCountries.length > 0) {
      const countryCode = targetingCountries[0];
      const cityName = CAPITALS[countryCode] || 'Lome';
      const cityKey = await getCityTargetingKey(cityName);

      if (cityKey) {
        geoLocations.cities = [{
          key: cityKey,
          radius: radiusKm,
          distance_unit: 'kilometer'
        }];
      } else {
        geoLocations.countries = targetingCountries;
      }
    } else {
      geoLocations.countries = targetingCountries.length > 0 ? targetingCountries : ['TG'];
    }

    // --- STEP 3: CREATE AD CREATIVES FOR EACH AD COPY ---
    const createdCreativeIds: string[] = [];

    for (let j = 0; j < adsList.length; j++) {
      const adItem = adsList[j];
      
      // Look for files uploaded in formData
      const imageFile = formData.get(`imageFile_${j}`) as File | null;
      const videoFile = formData.get(`videoFile_${j}`) as File | null;

      let imageHash = '';
      let videoId = '';

      // Direct local file uploads
      if (imageFile && imageFile.size > 0) {
        const uploadRes = await uploadToFacebook(adAccountId, 'images', imageFile);
        const imagesMap = uploadRes.images || {};
        const firstKey = Object.keys(imagesMap)[0];
        if (firstKey) {
          imageHash = imagesMap[firstKey].hash;
        }
      }

      if (videoFile && videoFile.size > 0) {
        const uploadRes = await uploadToFacebook(adAccountId, 'videos', videoFile);
        videoId = uploadRes.id;
      }

      let creativeParams: Record<string, any> = {
        name: `Creative - ${adItem.adName || 'Ad'}`,
        object_type: 'SHARE'
      };

      if (videoId || adItem.videoUrl) {
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
          videoData.video_id = adItem.videoUrl; // In case of ID pasted directly
        }

        creativeParams.object_story_spec = {
          page_id: pageId,
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
          page_id: pageId,
          link_data: linkData
        };
      }

      const creative = await fbFetch(`/${adAccountId}/adcreatives`, creativeParams, 'POST');
      createdCreativeIds.push(creative.id);
    }

    // --- STEP 4: CREATE AD SET(S) & ASSOCIATED ADS ---
    const createdAdSets: any[] = [];
    const createdAds: any[] = [];

    const iterations = Math.max(1, adSetsCount);

    for (let i = 0; i < iterations; i++) {
      const currentAdSetName = iterations > 1 ? `${adSetName} (Copie ${i + 1})` : adSetName;
      
      const adSetParams: Record<string, any> = {
        name: currentAdSetName,
        campaign_id: campaignId,
        status: 'PAUSED',
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'OFFSITE_CONVERSIONS',
        promoted_object: {
          pixel_id: pixelId,
          custom_event_type: 'PURCHASE'
        },
        targeting: {
          geo_locations: geoLocations,
          publisher_platforms: ['facebook', 'instagram']
        }
      };

      if (budgetType === 'ABO') {
        adSetParams.daily_budget = Math.round(parseFloat(campaignBudget) * 100);
      }

      const adSet = await fbFetch(`/${adAccountId}/adsets`, adSetParams, 'POST');
      createdAdSets.push(adSet.id);

      // Create all ads copies inside this adset
      for (let j = 0; j < adsList.length; j++) {
        const adItem = adsList[j];
        const creativeId = createdCreativeIds[j];
        
        const adParams: Record<string, any> = {
          name: `${adItem.adName || 'Ad'} - V${j + 1}`,
          adset_id: adSet.id,
          creative: { creative_id: creativeId },
          status: 'PAUSED'
        };

        const ad = await fbFetch(`/${adAccountId}/ads`, adParams, 'POST');
        createdAds.push(ad.id);
      }
    }

    return NextResponse.json({
      success: true,
      campaignId,
      creativeIds: createdCreativeIds,
      adSetIds: createdAdSets,
      adIds: createdAds
    });

  } catch (err: any) {
    console.error('[FB ADS LAUNCH ERROR]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
