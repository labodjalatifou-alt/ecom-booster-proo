import { NextRequest, NextResponse } from 'next/server';

const FB_TOKEN = process.env.FACEBOOK_API;
const FB_API_BASE = 'https://graph.facebook.com/v19.0';

export async function GET(req: NextRequest) {
  if (!FB_TOKEN) return NextResponse.json({ error: 'Token manquant' }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const adId = searchParams.get('adId');

  if (!adId) return NextResponse.json({ error: 'adId requis' }, { status: 400 });

  try {
    const url = new URL(`${FB_API_BASE}/${adId}/previews`);
    url.searchParams.set('access_token', FB_TOKEN);
    url.searchParams.set('ad_format', 'DESKTOP_FEED_STANDARD');

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.error) throw new Error(data.error.message);

    const html = data.data?.[0]?.body || '';

    return NextResponse.json({ html });
  } catch (err: any) {
    console.error('[FB AD PREVIEW ERROR]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
