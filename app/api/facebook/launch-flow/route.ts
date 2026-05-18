import { NextRequest, NextResponse } from 'next/server';

const FB_TOKEN = process.env.FACEBOOK_API;
const FB_API_BASE = 'https://graph.facebook.com/v19.0';

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
    const body = await req.json();
    const {
      campaignName,
      budgetType, // 'CBO' | 'ABO'
      campaignBudget, // amount in local currency (e.g. daily budget)
      pixelId,
      pageId,
      targetingCountries, // array of country codes, e.g. ['TG']
      adSetName,
      adSetsCount, // number of duplicates (e.g. 1 to 5)
      adName,
      adHeadline, // Hook
      adText, // explanation
      adCta, // e.g. 'SHOP_NOW'
      productUrl,
      imageUrl, // Image creative source
      videoUrl // Video creative source
    } = body;

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
      campaignParams.daily_budget = Math.round(parseFloat(campaignBudget) * 100); // FB requires budget in cents
    }

    const campaign = await fbFetch(`/${adAccountId}/campaigns`, campaignParams, 'POST');
    const campaignId = campaign.id;

    // --- STEP 2: CREATE AD CREATIVE ---
    // First, upload image if URL is provided, or link directly
    let creativeParams: Record<string, any> = {
      name: `Creative - ${adName}`,
      object_type: 'SHARE'
    };

    // Construct Ad Copy structure (link_data)
    const linkData: Record<string, any> = {
      link: productUrl,
      message: adText,
      name: adHeadline,
      call_to_action: {
        type: adCta || 'SHOP_NOW',
        value: { link: productUrl }
      }
    };

    // If an image URL is supplied, we can set picture, or upload it to FB library.
    // Standard link posts accept a direct picture URL parameter
    if (imageUrl) {
      linkData.picture = imageUrl;
    }

    creativeParams.object_story_spec = {
      page_id: pageId,
      link_data: linkData
    };

    const creative = await fbFetch(`/${adAccountId}/adcreatives`, creativeParams, 'POST');
    const creativeId = creative.id;

    // --- STEP 3: CREATE AD SET(S) & ADS ---
    const createdAdSets: any[] = [];
    const createdAds: any[] = [];

    const iterations = Math.max(1, parseInt(adSetsCount || '1'));

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
          geo_locations: {
            countries: targetingCountries && targetingCountries.length > 0 ? targetingCountries : ['TG']
          },
          publisher_platforms: ['facebook', 'instagram']
        }
      };

      if (budgetType === 'ABO') {
        adSetParams.daily_budget = Math.round(parseFloat(campaignBudget) * 100);
      }

      // Create Ad Set
      const adSet = await fbFetch(`/${adAccountId}/adsets`, adSetParams, 'POST');
      createdAdSets.push(adSet.id);

      // Create Ad for this Ad Set
      const adParams: Record<string, any> = {
        name: `${adName} - V${i + 1}`,
        adset_id: adSet.id,
        creative: { creative_id: creativeId },
        status: 'PAUSED'
      };

      const ad = await fbFetch(`/${adAccountId}/ads`, adParams, 'POST');
      createdAds.push(ad.id);
    }

    return NextResponse.json({
      success: true,
      campaignId,
      creativeId,
      adSetIds: createdAdSets,
      adIds: createdAds
    });

  } catch (err: any) {
    console.error('[FB ADS LAUNCH ERROR]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
