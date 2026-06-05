import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { toggleReaction, getNoteById } from '@/lib/dal';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    const { type } = await request.json();
    if (!type || !['heart', 'laugh', 'sad', 'fire'].includes(type)) {
      return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 });
    }
    const success = await toggleReaction(params.id, user.userId, type);
    if (!success) return NextResponse.json({ error: 'Failed' }, { status: 500 });
    const note = await getNoteById(params.id);
    return NextResponse.json({
      reactions: { heart: note?.reactions_heart || 0, laugh: note?.reactions_laugh || 0, sad: note?.reactions_sad || 0, fire: note?.reactions_fire || 0 }
    });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
