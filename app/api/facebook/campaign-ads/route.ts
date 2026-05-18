import { NextRequest, NextResponse } from 'next/server';

const FB_TOKEN = process.env.FACEBOOK_API;
const FB_API_BASE = 'https://graph.facebook.com/v19.0';

async function fbFetch(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${FB_API_BASE}${endpoint}`);
  url.searchParams.set('access_token', FB_TOKEN!);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json;
}

export async function GET(req: NextRequest) {
  if (!FB_TOKEN) return NextResponse.json({ error: 'Token manquant' }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get('campaignId');
  const since = searchParams.get('since') || getDateDaysAgo(7);
  const until = searchParams.get('until') || getDateDaysAgo(0);

  if (!campaignId) return NextResponse.json({ error: 'campaignId requis' }, { status: 400 });

  try {
    // 1. Fetch all ads in campaign
    const adsData = await fbFetch(`/${campaignId}/ads`, {
      fields: 'id,name,status,effective_status,adset_id,adset{name},creative{id,name,thumbnail_url,title,body}',
      limit: '50',
    });

    const ads = adsData.data || [];
    if (ads.length === 0) {
      return NextResponse.json({ ads: [] });
    }

    // 2. Fetch insights for each ad
    const adIds = ads.map((a: any) => a.id);

    // Batch insight request at ad level for this campaign
    const insightsData = await fbFetch(`/${campaignId}/insights`, {
      fields: 'ad_id,ad_name,spend,impressions,clicks,ctr,cpc,cpm,reach,frequency,actions,cost_per_action_type,action_values,purchase_roas,inline_link_click_ctr',
      time_range: JSON.stringify({ since, until }),
      level: 'ad',
      limit: '50',
    });

    // Map insights by ad_id
    const insightsMap: Record<string, any> = {};
    for (const row of insightsData.data || []) {
      insightsMap[row.ad_id] = row;
    }

    // Merge ads with insights
    const result = ads.map((ad: any) => {
      const m = insightsMap[ad.id] || {};
      const purchases = m.actions?.find((a: any) => a.action_type === 'purchase');
      const purchaseCost = m.cost_per_action_type?.find((a: any) => a.action_type === 'purchase');
      const purchaseValue = m.action_values?.find((a: any) => a.action_type === 'purchase');
      const roasEntry = m.purchase_roas?.find((a: any) => a.action_type === 'omni_purchase' || a.action_type === 'purchase');
      const linkClicks = m.actions?.find((a: any) => a.action_type === 'link_click');
      const landingPageViews = m.actions?.find((a: any) => a.action_type === 'landing_page_view');
      const addToCart = m.actions?.find((a: any) => a.action_type === 'add_to_cart' || a.action_type === 'omni_add_to_cart');
      const initiateCheckout = m.actions?.find((a: any) => a.action_type === 'initiate_checkout' || a.action_type === 'omni_initiated_checkout');

      const spend = parseFloat(m.spend || '0');
      const revenue = purchaseValue ? parseFloat(purchaseValue.value || '0') : 0;
      const roas = roasEntry
        ? parseFloat(roasEntry.value).toFixed(2)
        : (spend > 0 && revenue > 0 ? (revenue / spend).toFixed(2) : null);

      return {
        id: ad.id,
        name: ad.name,
        status: ad.effective_status,
        adset_name: ad.adset?.name || '—',
        thumbnail: ad.creative?.thumbnail_url || null,
        creative_title: ad.creative?.title || ad.name,
        creative_body: ad.creative?.body || null,
        // Core metrics
        spend,
        impressions: parseInt(m.impressions || '0'),
        clicks: parseInt(m.clicks || '0'),
        reach: parseInt(m.reach || '0'),
        ctr: parseFloat(m.ctr || '0').toFixed(2),
        cpc: parseFloat(m.cpc || '0').toFixed(2),
        cpm: parseFloat(m.cpm || '0').toFixed(2),
        frequency: parseFloat(m.frequency || '0').toFixed(2),
        // Conversion funnel
        link_clicks: linkClicks ? parseInt(linkClicks.value) : 0,
        landing_page_views: landingPageViews ? parseInt(landingPageViews.value) : 0,
        add_to_cart: addToCart ? parseInt(addToCart.value) : 0,
        initiate_checkout: initiateCheckout ? parseInt(initiateCheckout.value) : 0,
        purchases: purchases ? parseInt(purchases.value) : 0,
        revenue: revenue.toFixed(2),
        cpa: purchaseCost ? parseFloat(purchaseCost.value).toFixed(2) : null,
        roas,
        inline_ctr: parseFloat(m.inline_link_click_ctr || '0').toFixed(2),
      };
    });

    // Sort by spend desc
    result.sort((a: any, b: any) => b.spend - a.spend);

    return NextResponse.json({ ads: result, period: { since, until } });

  } catch (err: any) {
    console.error('[FB CAMPAIGN ADS ERROR]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}
