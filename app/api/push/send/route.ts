import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/push-helper';

export async function POST(req: Request) {
  try {
    const { userId, userIds, role, title, body, url, icon } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: "Missing title or body" }, { status: 400 });
    }

    const result = await sendPushNotification({
      userId,
      userIds,
      role,
      title,
      body,
      url,
      icon
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: result.count, message: result.message });
  } catch (error: any) {
    console.error('Push Send API Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
