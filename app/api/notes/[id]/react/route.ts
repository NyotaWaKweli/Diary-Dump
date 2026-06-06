import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { toggleReaction, getNoteById } from '@/lib/dal';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const result = await toggleReaction(params.id, user.userId);
    const note = await getNoteById(params.id);
    
    return NextResponse.json({
      liked: result.added,
      reaction_count: note?.reaction_count || 0,
    });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
