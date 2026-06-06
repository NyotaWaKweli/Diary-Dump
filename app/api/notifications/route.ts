import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getNotifications, markAllNotificationsRead } from '@/lib/dal';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const notifications = await getNotifications(user.userId);
    return NextResponse.json(notifications);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    await markAllNotificationsRead(user.userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
