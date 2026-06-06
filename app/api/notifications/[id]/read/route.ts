import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { markNotificationRead } from '@/lib/dal';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const success = await markNotificationRead(params.id);
    return NextResponse.json({ success });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
