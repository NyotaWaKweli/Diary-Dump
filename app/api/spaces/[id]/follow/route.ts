import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { followSpace, unfollowSpace, isSpaceFollower } from '@/lib/dal';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const currentlyFollowing = await isSpaceFollower(params.id, user.userId);
    
    if (currentlyFollowing) {
      await unfollowSpace(params.id, user.userId);
      return NextResponse.json({ following: false });
    } else {
      await followSpace(params.id, user.userId);
      return NextResponse.json({ following: true });
    }
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
