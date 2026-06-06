import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { joinSpace, leaveSpace, isSpaceMember } from '@/lib/dal';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const currentlyMember = await isSpaceMember(params.id, user.userId);
    
    if (currentlyMember) {
      await leaveSpace(params.id, user.userId);
      return NextResponse.json({ member: false });
    } else {
      await joinSpace(params.id, user.userId);
      return NextResponse.json({ member: true });
    }
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
