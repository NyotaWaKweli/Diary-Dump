import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { saveNote, unsaveNote, isNoteSaved } from '@/lib/dal';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const currentlySaved = await isNoteSaved(params.id, user.userId);
    
    if (currentlySaved) {
      await unsaveNote(params.id, user.userId);
      return NextResponse.json({ saved: false });
    } else {
      await saveNote(params.id, user.userId);
      return NextResponse.json({ saved: true });
    }
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
