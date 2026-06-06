import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSavedNotes } from '@/lib/dal';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const notes = await getSavedNotes(user.userId);
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
