import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/dal';

export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) return NextResponse.json({ user: null }, { status: 401 });
    const user = await getUserById(tokenUser.userId);
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user: { id: user.id, email: user.email, display_name: user.display_name } });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
