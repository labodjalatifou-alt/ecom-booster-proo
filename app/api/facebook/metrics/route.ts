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
  if (!FB_TOKEN) {
    return NextResponse.json({ error: 'Token Facebook manquant dans .env.local' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const since = searchParams.get('since') || getDateDaysAgo(7);
  const until = searchParams.get('until') || getDateDaysAgo(0);

  try {
    // 1. Récupérer les comptes publicitaires
    const meData = await fbFetch('/me/adaccounts', {
      fields: 'id,name,currency,account_status',
    });

    if (!meData.data || meData.data.length === 0) {
      return NextResponse.json({ error: 'Aucun compte publicitaire trouvé.' }, { status: 404 });
    }

    // Utiliser le premier compte actif
    const adAccount = meData.data.find((a: any) => a.account_status === 1) || meData.data[0];
    const adAccountId = adAccount.id;
    const currency = adAccount.currency || 'XOF';

    // 2. Récupérer les métriques globales du compte
    const insightsData = await fbFetch(`/${adAccountId}/insights`, {
      fields: 'spend,impressions,clicks,ctr,cpc,cpm,actions,cost_per_action_type,reach,frequency,action_values,purchase_roas',
      time_range: JSON.stringify({ since, until }),
      level: 'account',
    });

    const insights = insightsData.data?.[0] || {};

    // Extract purchases and revenue
    const purchases = insights.actions?.find((a: any) => a.action_type === 'purchase');
    const purchaseCost = insights.cost_per_action_type?.find((a: any) => a.action_type === 'purchase');
    // Revenue from action_values (purchase conversion value)
    const purchaseValue = insights.action_values?.find((a: any) => a.action_type === 'purchase');
    // ROAS from purchase_roas field (array) or calculated manually
    const purchaseRoasEntry = insights.purchase_roas?.find((a: any) => a.action_type === 'omni_purchase' || a.action_type === 'purchase');

    const spend = parseFloat(insights.spend || '0');
    const revenue = purchaseValue ? parseFloat(purchaseValue.value || '0') : 0;
    const roas = purchaseRoasEntry
      ? parseFloat(purchaseRoasEntry.value).toFixed(2)
      : (spend > 0 && revenue > 0 ? (revenue / spend).toFixed(2) : null);

    // 3. Récupérer les campagnes actives
    const campaignsData = await fbFetch(`/${adAccountId}/campaigns`, {
      fields: 'id,name,status,objective,daily_budget,lifetime_budget,effective_status',
      effective_status: JSON.stringify(['ACTIVE', 'PAUSED']),
      limit: '20',
    });

    const campaignIds = (campaignsData.data || []).map((c: any) => c.id);

    // 4. Métriques par campagne
    let campaignMetrics: any[] = [];
    if (campaignIds.length > 0) {
      const campaignInsights = await fbFetch(`/${adAccountId}/insights`, {
        fields: 'campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,actions,reach',
        time_range: JSON.stringify({ since, until }),
        level: 'campaign',
        limit: '20',
      });

      const metricsMap: Record<string, any> = {};
      for (const row of campaignInsights.data || []) {
        metricsMap[row.campaign_id] = row;
      }

      campaignMetrics = (campaignsData.data || []).map((c: any) => {
        const m = metricsMap[c.id] || {};
        const purchases = m.actions?.find((a: any) => a.action_type === 'purchase');
        return {
          id: c.id,
          name: c.name,
          status: c.effective_status,
          objective: c.objective,
          daily_budget: c.daily_budget ? parseInt(c.daily_budget) / 100 : null,
          spend: parseFloat(m.spend || '0'),
          impressions: parseInt(m.impressions || '0'),
          clicks: parseInt(m.clicks || '0'),
          ctr: parseFloat(m.ctr || '0').toFixed(2),
          cpc: parseFloat(m.cpc || '0').toFixed(2),
          reach: parseInt(m.reach || '0'),
          purchases: purchases ? parseInt(purchases.value) : 0,
        };
      });
    }

    return NextResponse.json({
      account: {
        id: adAccountId,
        name: adAccount.name,
        currency,
      },
      period: { since, until },
      overview: {
        spend: spend.toFixed(2),
        impressions: parseInt(insights.impressions || '0'),
        clicks: parseInt(insights.clicks || '0'),
        reach: parseInt(insights.reach || '0'),
        ctr: parseFloat(insights.ctr || '0').toFixed(2),
        cpc: parseFloat(insights.cpc || '0').toFixed(2),
        cpm: parseFloat(insights.cpm || '0').toFixed(2),
        purchases: purchases ? parseInt(purchases.value) : 0,
        cpa: purchaseCost ? parseFloat(purchaseCost.value).toFixed(2) : null,
        revenue: revenue.toFixed(2),
        roas,
        frequency: parseFloat(insights.frequency || '0').toFixed(2),
      },
      campaigns: campaignMetrics,
    });

  } catch (err: any) {
    console.error('[FACEBOOK API ERROR]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Toggle campaign status
export async function PATCH(req: NextRequest) {
  if (!FB_TOKEN) return NextResponse.json({ error: 'Token manquant' }, { status: 500 });
  try {
    const { campaignId, status } = await req.json();
    const url = new URL(`${FB_API_BASE}/${campaignId}`);
    url.searchParams.set('access_token', FB_TOKEN!);
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}
